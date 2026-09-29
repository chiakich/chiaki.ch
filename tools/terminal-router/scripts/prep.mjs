// Turns data/gen/ into train/data/{train,dev}.jsonl + offtopic_dev.json for train/train.py.
import { mkdirSync, writeFileSync } from 'node:fs'
import { normalize } from '../build/engine.mjs'
import { GEN, TEST, TRAIN_DATA, readJson } from './paths.mjs'
import { prototypes, routable } from './protos.mjs'

const DEV_SHARE = 0.15
mkdirSync(TRAIN_DATA, { recursive: true })

// Anything identical to a held-out sentence is dropped, or the test set stops measuring anything.
const test = new Set(readJson(`${TEST}cases.json`).flatMap((c) => c.texts).map((t) => normalize(t).text))
const negTest = new Set(readJson(`${TEST}negatives.json`).map((t) => normalize(t).text))

let seed = 1
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const train = [], dev = [], seen = new Set()
let leaked = 0
const push = (rows, text, label) => {
  const t = normalize(text).text
  if (!t || seen.has(`${label}\u0000${t}`)) return
  if (test.has(t) || negTest.has(t)) return void leaked++
  seen.add(`${label}\u0000${t}`)
  rows.push({ text: t, label })
}

const paraphrases = Object.assign({}, ...[1, 2, 3, 4].map((i) => readJson(`${GEN}train-${i}.json`)))
const missing = []
for (const r of routable) {
  const lines = paraphrases[r.id]
  if (!lines) {
    missing.push(r.id)
    continue
  }
  const shuffled = [...lines].sort(() => rand() - 0.5)
  const nDev = Math.max(2, Math.round(shuffled.length * DEV_SHARE))
  shuffled.slice(0, nDev).forEach((t) => push(dev, t, r.id))
  shuffled.slice(nDev).forEach((t) => push(train, t, r.id))
}
// Regex literals double as short anchors, always on the train side.
for (const p of prototypes()) if (p.kind !== 'reply') push(train, p.text, p.rule)

const offtopic = readJson(`${GEN}offtopic.json`).map((t) => normalize(t).text).filter((t) => t && !negTest.has(t))
writeFileSync(`${TRAIN_DATA}train.jsonl`, train.map((r) => JSON.stringify(r)).join('\n'))
writeFileSync(`${TRAIN_DATA}dev.jsonl`, dev.map((r) => JSON.stringify(r)).join('\n'))
writeFileSync(`${TRAIN_DATA}offtopic_dev.json`, JSON.stringify(offtopic))
console.log(
  `train ${train.length}  dev ${dev.length}  offtopic ${offtopic.length}  dropped as test duplicates ${leaked}` +
    (missing.length ? `  no paraphrases for: ${missing.join(', ')}` : '')
)
