// Turns data/gen/ into train/data/{train,dev}.jsonl + offtopic_dev.json for train/train.py.
import { mkdirSync, writeFileSync } from 'node:fs'
import { loadDirtyContent, normalize, rules } from '../build/engine.mjs'
import { GEN, TEST, TOOL, TRAIN_DATA, readJson } from './paths.mjs'
import { paraphrases as generated } from './gen.mjs'
import { routable } from './protos.mjs'

// The after-dark table is merged into the same id space at runtime, so a base rule that shares
// an id with it gets that rule's lines (st.care did). Only ids are compared, nothing else read.
const dirtyIds = new Set(((await loadDirtyContent().catch(() => null))?.rules ?? []).map((r) => r.id))
const clashes = rules.filter((r) => dirtyIds.has(r.id)).map((r) => r.id)
if (clashes.length) throw new Error(`rule ids also used by the after-dark table: ${clashes.join(', ')}`)
mkdirSync(TRAIN_DATA, { recursive: true })

// Anything identical to a held-out sentence is dropped, or the test set stops measuring anything.
const test = new Set(readJson(`${TEST}cases.json`).flatMap((c) => c.texts).map((t) => normalize(t).text))
const negTest = new Set(readJson(`${TEST}negatives.json`).map((t) => normalize(t).text))

// Freeze the original split: cleaning anchors must not turn a model's old
// training examples into its new validation set. Add new dev utterances here
// explicitly when authoring a new intent.
const devSplit = readJson(`${TOOL}data/dev/split.json`)
const devTexts = new Set(devSplit.map((r) => normalize(r.text).text))
const train = [], dev = [], seen = new Set()
let leaked = 0
const push = (rows, text, label) => {
  const t = normalize(text).text
  if (!t || seen.has(`${label}\u0000${t}`)) return
  if (test.has(t) || negTest.has(t)) return void leaked++
  seen.add(`${label}\u0000${t}`)
  rows.push({ text: t, label })
}

const paraphrases = generated().lines
// A bare input cannot teach two mutually exclusive labels. Keep these conflicts
// visible for authoring instead of training contradictory pairs or leaking the
// same sentence across train/dev under different labels.
const labelsByText = new Map()
for (const r of routable) for (const raw of paraphrases[r.id] ?? []) {
  const text = normalize(raw).text
  if (!text) continue
  if (!labelsByText.has(text)) labelsByText.set(text, new Set())
  labelsByText.get(text).add(r.id)
}
const conflicts = [...labelsByText].filter(([, labels]) => labels.size > 1)
const ambiguous = new Set(conflicts.map(([text]) => text))
const missing = []
for (const r of routable) {
  const lines = paraphrases[r.id]
  if (!lines) {
    missing.push(r.id)
    continue
  }
  for (const raw of lines) {
    const text = normalize(raw).text
    if (!ambiguous.has(text) && !devTexts.has(text)) push(train, text, r.id)
  }
}
const routableIds = new Set(routable.map((r) => r.id))
for (const r of devSplit) {
  if (routableIds.has(r.label) && !ambiguous.has(normalize(r.text).text)) push(dev, r.text, r.label)
}
// Only authored utterances are semantic anchors. Regex fragments have lost their
// conditions (e.g. 煮飯 extracted from a farewell) and must never become labels.

const offtopic = [...new Set(readJson(`${GEN}offtopic.json`).map((t) => normalize(t).text))]
  .filter((t) => t && !negTest.has(t) && !test.has(t))
const positives = new Set([...train, ...dev].map((r) => r.text))
if (offtopic.some((t) => positives.has(t))) throw new Error('offtopic calibration overlaps a positive utterance')
writeFileSync(`${TRAIN_DATA}train.jsonl`, train.map((r) => JSON.stringify(r)).join('\n'))
writeFileSync(`${TRAIN_DATA}dev.jsonl`, dev.map((r) => JSON.stringify(r)).join('\n'))
writeFileSync(`${TRAIN_DATA}offtopic_dev.json`, JSON.stringify(offtopic))
writeFileSync(`${TRAIN_DATA}conflicts.json`, JSON.stringify(conflicts.map(([text, labels]) => ({ text, labels: [...labels] })), null, 2))
console.log(
  `train ${train.length}  dev ${dev.length}  offtopic ${offtopic.length}  ambiguous texts excluded ${conflicts.length}  test duplicates excluded ${leaked}` +
    (missing.length ? `  no paraphrases for: ${missing.join(', ')}` : '')
)
