// Authored, inspectable pilot scenarios; these are regression checks, not a blind benchmark.
// Optional baseline: node scripts/eval-conversations.mjs build/answer-pilot/before.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, basename, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { env, pipeline } from '@huggingface/transformers'
import * as current from '../build/engine.mjs'
import { loadProtos, scoreRules } from '../build/router.mjs'
import { LEXICON, MODELS, TOOL, readJson } from './paths.mjs'

const scenarios = readJson(`${TOOL}data/test/conversations.json`)
const asset = resolve(TOOL, '../../public/assets/story/terminal/router/v4')
const bytes = readFileSync(`${asset}/protos.bin`)
const protos = loadProtos(readJson(`${asset}/protos.json`), bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
const model = resolve(MODELS, 'v2/onnx-mnrl-e10')
const sha = b => createHash('sha256').update(b).digest('hex')
const modelHash = sha(readFileSync(`${model}/onnx/model_int8.onnx`))
if (modelHash !== sha(readFileSync(`${asset}/model.onnx`))) throw new Error('model/asset mismatch')
const cache = `${TOOL}build/embeddings/${modelHash}/`
mkdirSync(cache, { recursive: true })
env.localModelPath = `${dirname(model)}/`; env.allowRemoteModels = false
let extractor
const score = async text => {
  const path = `${cache}${sha(text)}.json`
  let v
  if (existsSync(path)) v = readJson(path)
  else {
    extractor ??= await pipeline('feature-extraction', basename(model), { dtype: 'int8' })
    ;[v] = (await extractor([text], { pooling: 'cls', normalize: true })).tolist()
    writeFileSync(path, JSON.stringify(v))
  }
  return scoreRules(Float32Array.from(v), protos)
}
const engines = { current }
if (process.argv[2]) engines.before = await import(pathToFileURL(resolve(process.argv[2])))
const results = {}
for (const [name, engine] of Object.entries(engines)) {
  const lexicon = engine.parseLexicon(readFileSync(LEXICON, 'utf8'))
  const rows = []
  for (const seed of [.05, .42, .85]) for (const scenario of scenarios) {
    const session = engine.createSession(); session.flags.add('knowsPeace')
    for (const [index, check] of scenario.turns.entries()) {
      const input = engine.normalize(engine.focusUtterance?.(check.text) ?? check.text).text
      const scores = await score(input)
      const random = Math.random; Math.random = () => seed
      let turn
      try { turn = engine.respond(check.text, session, lexicon, scores) }
      finally { Math.random = random }
      const failures = []
      if (check.accept && !check.accept.includes(turn.ruleId)) failures.push('topic')
      if (check.contains && !new RegExp(check.contains).test(turn.text)) failures.push('answer')
      if (check.absent && new RegExp(check.absent).test(turn.text)) failures.push('unwanted answer')
      if (check.noIntent && turn.intentId) failures.push('visitor subject overwritten')
      rows.push({ scenario: scenario.id, seed, index, input: check.text, rule: turn.ruleId, intent: turn.intentId, reply: turn.text, failures })
    }
  }
  results[name] = { passed: rows.filter(r => !r.failures.length).length, total: rows.length, rows }
}
const report = { note: 'Authored pilot regression scenarios, 3 deterministic reply seeds; not a blind naturalness evaluation. Discovery suppressed equally in both engines.', modelHash, fixtureHash: sha(readFileSync(`${TOOL}data/test/conversations.json`)), results }
writeFileSync(`${TOOL}build/eval-conversations.json`, JSON.stringify(report, null, 2))
for (const [name, result] of Object.entries(results)) {
  console.log(`${name}: ${result.passed}/${result.total}`)
  console.log(JSON.stringify(result.rows.filter(r => r.failures.length), null, 2))
}
if (results.current.passed !== results.current.total) process.exitCode = 1
