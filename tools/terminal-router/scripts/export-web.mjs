// Writes the router the site loads into public/assets/story/terminal/router/<version>/:
//   node scripts/export-web.mjs [model]   (default v2/onnx-mnrl-e10; version is its first folder)
// Assets there are cached for days, so a retrained model ships under a new version, never over
// the old one: a new model read against old prototypes would score nonsense. Bump ROUTER_VERSION
// in lib/terminal/router/client.ts to match.
// Prototypes are embedded with the same tokenizer and int8 model the browser runs, and the
// tokenizer is checked against transformers.js on every training and test sentence first.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { AutoTokenizer, env, pipeline } from '@huggingface/transformers'
import * as ort from 'onnxruntime-node'
import { normalize } from '../build/engine.mjs'
import { parseVocab, poolCls, tokenize } from '../build/router.mjs'
import { MODELS, TEST, TOOL, TRAIN_DATA, readJson, readJsonl } from './paths.mjs'

const modelArg = process.argv[2] ?? 'v2/onnx-mnrl-e10'
const modelDir = resolve(MODELS, modelArg)
const OUT = resolve(TOOL, `../../public/assets/story/terminal/router/${modelArg.split('/')[0]}`)
mkdirSync(OUT, { recursive: true })

const tokenizerJson = JSON.parse(readFileSync(`${modelDir}/tokenizer.json`, 'utf8'))
const vocabText = Object.entries(tokenizerJson.model.vocab).sort((a, b) => a[1] - b[1]).map(([t]) => t).join('\n')
const vocab = parseVocab(vocabText)

const protos = readJsonl(`${TRAIN_DATA}train.jsonl`)
const tests = readJson(`${TEST}cases.json`).flatMap((c) => c.texts).concat(readJson(`${TEST}negatives.json`))
const texts = [...protos.map((p) => p.text), ...tests.map((t) => normalize(t).text)].filter(Boolean)

env.localModelPath = `${dirname(modelDir)}/`
env.allowRemoteModels = false
const reference = await AutoTokenizer.from_pretrained(basename(modelDir))
let mismatched = 0
for (const text of texts) {
  const ours = tokenize(text, vocab).join(' ')
  const theirs = reference(text).input_ids.tolist()[0].map(Number).join(' ')
  if (ours !== theirs && mismatched++ < 5) console.log(`tokenizer mismatch: ${text}\n  ours   ${ours}\n  theirs ${theirs}`)
}
if (mismatched) throw new Error(`${mismatched}/${texts.length} sentences tokenize differently`)

const modelPath = `${modelDir}/onnx/model_int8.onnx`
const session = await ort.InferenceSession.create(modelPath)
const embed = async (text) => {
  const ids = tokenize(text, vocab)
  const t = (f) => new ort.Tensor('int64', BigInt64Array.from(ids, (_, i) => BigInt(f(i))), [1, ids.length])
  const out = await session.run({ input_ids: t((i) => ids[i]), attention_mask: t(() => 1), token_type_ids: t(() => 0) })
  return poolCls(out.last_hidden_state.data, 512)
}

// The browser path has to agree with the pipeline every evaluation used.
const extractor = await pipeline('feature-extraction', basename(modelDir), { dtype: 'int8' })
for (const text of texts.slice(0, 50)) {
  const [ref] = (await extractor([text], { pooling: 'cls', normalize: true })).tolist()
  const ours = await embed(text)
  const dot = ref.reduce((d, v, k) => d + v * ours[k], 0)
  if (dot < 0.9999) throw new Error(`embedding differs from transformers.js (${dot.toFixed(5)}): ${text}`)
}

const labels = [...new Set(protos.map((p) => p.label))]
const values = new Int8Array(protos.length * 512)
const scales = []
for (const [row, p] of protos.entries()) {
  const v = await embed(p.text)
  const scale = Math.max(...v.map(Math.abs)) / 127
  v.forEach((x, k) => (values[row * 512 + k] = Math.round(x / scale)))
  scales.push(+scale.toPrecision(6))
}
writeFileSync(`${OUT}/protos.bin`, values)
writeFileSync(`${OUT}/protos.json`, JSON.stringify({ labels, rows: protos.map((p) => labels.indexOf(p.label)), scales }))
writeFileSync(`${OUT}/vocab.txt`, vocabText)
copyFileSync(modelPath, `${OUT}/model.onnx`)
console.log(`${texts.length} sentences tokenize identically; ${protos.length} prototypes over ${labels.length} rules -> ${OUT}`)
