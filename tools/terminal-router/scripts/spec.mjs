// Writes data/gen/spec-N.json: one batch of rules per paraphrase-generation prompt (see data/gen/PROMPT.md).
import { writeFileSync } from 'node:fs'
import { GEN } from './paths.mjs'
import { prototypes, routable } from './protos.mjs'

const BATCHES = 4
const protos = prototypes()
const specs = routable.map((r) => ({
  id: r.id,
  requires: r.requires ?? [],
  pattern_fragments: protos.filter((p) => p.rule === r.id && p.kind !== 'reply').map((p) => p.text),
  her_replies: r.replies.map((x) => x.text),
}))
const size = Math.ceil(specs.length / BATCHES)
for (let i = 0; i < BATCHES; i++)
  writeFileSync(`${GEN}spec-${i + 1}.json`, JSON.stringify(specs.slice(i * size, (i + 1) * size), null, 1))
console.log(`${specs.length} rules -> ${BATCHES} batches of ${size}`)
