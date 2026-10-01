// Calibrate on dev, then evaluate actual respond() on held-out inputs.
// node scripts/eval-engine.mjs [model] [report-tag]
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { env, pipeline } from '@huggingface/transformers'
import { createSession, focusUtterance, normalize, parseLexicon, respond, rules, LEGACY_ROUTER_POLICY, DEFAULT_ROUTER_POLICY } from '../build/engine.mjs'
import { LEXICON, MODELS, TEST, TOOL, TRAIN_DATA, readJson, readJsonl } from './paths.mjs'

const devOnly = process.argv.includes('--dev-only')
const [modelArg = 'v2/onnx-mnrl-e10', tag = 'clean'] = process.argv.slice(2).filter(a => a !== '--dev-only')
if (!/^[a-z0-9-]+$/i.test(tag)) throw new Error('invalid report tag')
const dir = resolve(MODELS, modelArg)
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const hash = sha(readFileSync(`${dir}/onnx/model_int8.onnx`))
const cacheDir = `${TOOL}build/embeddings/${hash}/`
mkdirSync(cacheDir, { recursive: true })
env.localModelPath = `${dirname(dir)}/`
env.allowRemoteModels = false
let extractor
const embed = async texts => {
  const out = []
  for (const raw of texts) {
    const text = normalize(raw).text, path = `${cacheDir}${sha(normalize(raw).text)}.json`
    if (existsSync(path)) out.push(readJson(path))
    else {
      extractor ??= await pipeline('feature-extraction', basename(dir), { dtype: 'int8' })
      const [v] = (await extractor([text], { pooling: 'cls', normalize: true })).tolist()
      writeFileSync(path, JSON.stringify(v)); out.push(v)
    }
  }
  return out
}
const train = readJsonl(`${TRAIN_DATA}train.jsonl`)
const trainTexts = new Set(train.map(r => r.text)), devRows = readJsonl(`${TRAIN_DATA}dev.jsonl`)
if (devRows.some(r => trainTexts.has(r.text))) throw new Error('train/dev text overlap')
// Same per-row int8 quantization as export-web.mjs.
const vectors = (await embed(train.map(r => r.text))).map(v => {
  const rawScale = Math.max(...v.map(Math.abs)) / 127, scale = +rawScale.toPrecision(6)
  return v.map(x => Math.round(x / rawScale) * scale)
})
const byId = new Map(rules.map(r => [r.id, r]))
const sets = {
  dev: [...devRows.map(r => ({ text: r.text, accept: [r.label], flags: byId.get(r.label).requires ?? [] })), ...readJson(`${TRAIN_DATA}offtopic_dev.json`).map(text => ({ text, accept: null, flags: [] }))],
  test: [...readJson(`${TEST}cases.json`).flatMap(c => c.texts.map(text => ({ text, accept: c.accept, flags: c.flags ?? [] }))), ...readJson(`${TEST}negatives.json`).map(text => ({ text, accept: null, flags: [] }))],
}
if (devOnly) delete sets.test
for (const [name, rows] of Object.entries(sets)) {
  const qs = await embed(rows.map(r => focusUtterance(r.text)))
  rows.forEach((r, i) => {
    r.scores = new Map()
    train.forEach((p, j) => {
      let dot = 0
      for (let k = 0; k < qs[i].length; k++) dot += qs[i][k] * vectors[j][k]
      if (dot > (r.scores.get(p.label) ?? -1)) r.scores.set(p.label, dot)
    })
  })
  console.log(`${name}: scored ${rows.length} inputs against ${train.length} clean prototypes`)
}
const lexicon = parseLexicon(readFileSync(LEXICON, 'utf8'))
const run = (r, policy, scores = r.scores) => {
  const session = createSession(); r.flags.forEach(f => session.flags.add(f))
  const random = Math.random; Math.random = () => .42
  try { return respond(r.text, session, lexicon, scores, policy) }
  finally { Math.random = random }
}
const measure = (rows, policy, scoresFor = r => r.scores) => {
  const m = { positive: 0, hit: 0, wrong: 0, fallback: 0, negative: 0, offTopicRouted: 0, routerTurns: 0, overrideTurns: 0, overrideErrors: 0, regressions: 0 }
  for (const r of rows) {
    const turn = run(r, policy, scoresFor(r)); m.routerTurns += !!turn.routed
    r.regexTurn ??= run(r, policy, null)
    if (turn.routed && byId.has(r.regexTurn.ruleId) && turn.ruleId !== r.regexTurn.ruleId) {
      m.overrideTurns++
      m.overrideErrors += !r.accept?.includes(turn.ruleId)
    }
    m.regressions += !!r.accept?.includes(r.regexTurn.ruleId) && !r.accept.includes(turn.ruleId)
    if (r.accept) { m.positive++; m[r.accept.includes(turn.ruleId) ? 'hit' : byId.has(turn.ruleId) ? 'wrong' : 'fallback']++ }
    else { m.negative++; m.offTopicRouted += byId.has(turn.ruleId) }
  }
  return m
}
const objective = m => (m.hit - 2 * m.wrong) / m.positive - m.offTopicRouted / m.negative
// Fill and correction use separate branches in routeFor. No test rows enter tuning.
const sweep = []
let selected = { fillMin: 1.01, fillMargin: 0, overrideMin: 1.01, overrideMargin: 0 }
for (const stage of ['fill', 'override']) {
  let best = -Infinity, next = selected
  for (const min of [1.01, .9, .85, .8, .75, .7, .65]) for (const margin of [.15, .1, .05, 0]) {
    const policy = { ...selected, [`${stage}Min`]: min, [`${stage}Margin`]: margin }, metrics = measure(sets.dev, policy)
    const score = objective(metrics); sweep.push({ stage, policy, metrics, objective: score })
    // Correcting an existing answer needs stronger evidence than filling a miss.
    // Enforce >=90% observed correction precision on dev, even if a looser policy
    // would raise aggregate accuracy. No test labels enter this decision.
    const acceptable = stage !== 'override' || metrics.overrideErrors <= metrics.overrideTurns * .1
    if (acceptable && score > best) { best = score; next = policy }
  }
  selected = next
}
const summary = {}
for (const [name, rows] of Object.entries(sets)) summary[name] = {
  regex: measure(rows, selected, () => null), cleanLegacy: measure(rows, LEGACY_ROUTER_POLICY),
  cleanDefault: measure(rows, DEFAULT_ROUTER_POLICY), cleanCalibrated: measure(rows, selected),
}
// Shipped prototypes are a TEST-only baseline: their training data may overlap new dev.
const shipped = resolve(TOOL, '../../public/assets/story/terminal/router/v3')
if (sets.test && existsSync(`${shipped}/protos.bin`) && sha(readFileSync(`${shipped}/model.onnx`)) === hash) {
  const index = readJson(`${shipped}/protos.json`), values = new Int8Array(readFileSync(`${shipped}/protos.bin`)), dim = values.length / index.rows.length
  const qs = await embed(sets.test.map(r => focusUtterance(r.text)))
  const oldScores = new Map(sets.test.map((r, qi) => {
    const scores = new Map()
    index.rows.forEach((li, row) => {
      let dot = 0
      for (let k = 0; k < dim; k++) dot += qs[qi][k] * values[row * dim + k]
      dot *= index.scales[row]
      const id = index.labels[li]
      if (dot > (scores.get(id) ?? -1)) scores.set(id, dot)
    })
    return [r, scores]
  }))
  summary.test.shippedLegacy = measure(sets.test, LEGACY_ROUTER_POLICY, r => oldScores.get(r))
}
const details = (sets.test ?? []).map(r => {
  const rx = run(r, selected, null), legacy = run(r, LEGACY_ROUTER_POLICY), turn = run(r, selected)
  return { text: r.text, accept: r.accept, flags: r.flags, regex: rx.ruleId, legacy: legacy.ruleId, calibrated: turn.ruleId, reply: turn.text, routed: !!turn.routed, top: [...r.scores].sort((a,b) => b[1]-a[1]).slice(0,3) }
})
const dataHashes = Object.fromEntries(['train.jsonl', 'dev.jsonl', 'offtopic_dev.json'].map(name => [name, sha(readFileSync(`${TRAIN_DATA}${name}`))]))
writeFileSync(`${TOOL}build/eval-engine-${tag}.json`, JSON.stringify({ model: modelArg, modelSha256: hash, dataHashes, prototypes: train.length, selected, summary, sweep, details }, null, 2))
console.log(JSON.stringify({ selected, summary }, null, 2))
