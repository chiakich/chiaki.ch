// node scripts/eval-router.mjs [model] [patterns|train]
// model: a Hub id (default: the zero-shot base) or a directory exported by train/export.py.
// Thresholds are picked on the dev split and only then applied to the held-out test set.
import { existsSync, readFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { env, pipeline } from '@huggingface/transformers'
import { createSession, normalize, parseLexicon, respond, rules } from '../build/engine.mjs'
import { LEXICON, MODELS, TEST, TRAIN_DATA, readJson, readJsonl } from './paths.mjs'
import { prototypes, routable } from './protos.mjs'

const [modelArg = 'Xenova/bge-small-zh-v1.5', protoArg = 'train'] = process.argv.slice(2)
const local = [modelArg, `${MODELS}${modelArg}`].find((p) => existsSync(p))
let modelId = modelArg
if (local) {
  env.localModelPath = `${dirname(resolve(local))}/`
  env.allowRemoteModels = false
  modelId = basename(local)
}
const extractor = await pipeline('feature-extraction', modelId, { dtype: 'int8' })
const embed = async (texts) => {
  const out = []
  for (let i = 0; i < texts.length; i += 64)
    out.push(...(await extractor(texts.slice(i, i + 64), { pooling: 'cls', normalize: true })).tolist())
  return out
}

const lexicon = parseLexicon(readFileSync(LEXICON, 'utf8'))
const ruleIds = new Set(rules.map((r) => r.id))
const byId = new Map(rules.map((r) => [r.id, r]))

const protos =
  protoArg === 'train'
    ? readJsonl(`${TRAIN_DATA}train.jsonl`).map((r) => ({ rule: r.label, text: r.text }))
    : prototypes().filter((p) => p.kind !== 'reply')
const pv = await embed(protos.map((p) => normalize(p.text).text))

const sets = {
  test: [
    ...readJson(`${TEST}cases.json`).flatMap((c) => c.texts.map((text) => ({ text, accept: c.accept, flags: c.flags ?? [] }))),
    ...readJson(`${TEST}negatives.json`).map((text) => ({ text, accept: null, flags: [] })),
  ],
  dev: [
    // Dev rows carry one label; rules gated on flags get them so the regex baseline can reach them too.
    ...readJsonl(`${TRAIN_DATA}dev.jsonl`).map((r) => ({ text: r.text, accept: [r.label], flags: byId.get(r.label).requires ?? [] })),
    ...readJson(`${TRAIN_DATA}offtopic_dev.json`).map((text) => ({ text, accept: null, flags: [] })),
  ],
}

const eligible = (r, flags) =>
  !(r.requires ?? []).some((f) => !flags.includes(f)) && !(r.blockedBy ?? []).some((f) => flags.includes(f))
for (const set of Object.values(sets)) {
  const qv = await embed(set.map((c) => normalize(c.text).text))
  set.forEach((c, qi) => {
    const session = createSession()
    c.flags.forEach((f) => session.flags.add(f))
    const id = respond(c.text, session, lexicon).ruleId
    c.regex = ruleIds.has(id) ? id : null
    const best = new Map()
    protos.forEach((p, i) => {
      let d = 0
      for (let k = 0; k < qv[qi].length; k++) d += qv[qi][k] * pv[i][k]
      if (d > (best.get(p.rule) ?? -1)) best.set(p.rule, d)
    })
    const [top] = routable
      .filter((r) => eligible(r, c.flags) && best.has(r.id))
      .map((r) => [r.id, best.get(r.id)])
      .sort((a, b) => b[1] - a[1])
    ;[c.emb, c.score] = top
  })
}

const strategies = {
  'emb-only': (c, t) => (c.score >= t ? c.emb : null),
  'regex, emb fills misses': (c, t) => c.regex ?? (c.score >= t ? c.emb : null),
  'emb first, regex fallback': (c, t) => (c.score >= t ? c.emb : c.regex),
}
const measure = (set, pick) => {
  const pos = set.filter((c) => c.accept), neg = set.filter((c) => !c.accept)
  const hit = pos.filter((c) => c.accept.includes(pick(c))).length / pos.length
  const wrong = pos.filter((c) => pick(c) && !c.accept.includes(pick(c))).length / pos.length
  return { hit, wrong, fallback: 1 - hit - wrong, routed: neg.filter((c) => pick(c)).length, nNeg: neg.length }
}
const pct = (x) => `${(x * 100).toFixed(1).padStart(5)}%`
const fmt = (m) => `hit ${pct(m.hit)}  wrong ${pct(m.wrong)}  fallback ${pct(m.fallback)}  off-topic routed ${String(m.routed).padStart(3)}/${m.nNeg}`

console.log(`model ${modelArg}  protos ${protoArg} (${protos.length})`)
console.log(`  ${'regex only'.padEnd(26)} τ=  -   test: ${fmt(measure(sets.test, (c) => c.regex))}`)
for (const [name, pick] of Object.entries(strategies)) {
  // A wrong rule reads worse than a fallback, so it costs double.
  let bestT = 0, bestObj = -Infinity
  for (let t = 0.5; t <= 0.96; t += 0.01) {
    const m = measure(sets.dev, (c) => pick(c, t))
    const obj = m.hit - 2 * m.wrong - m.routed / m.nNeg
    if (obj > bestObj) [bestObj, bestT] = [obj, t]
  }
  console.log(`  ${name.padEnd(26)} τ=${bestT.toFixed(2)} test: ${fmt(measure(sets.test, (c) => pick(c, bestT)))}`)
}
