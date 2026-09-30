// Writes data/gen/spec-N.json: one batch of rules per paraphrase-generation prompt (see data/gen/PROMPT.md).
// With --missing, only rules that no train-N.json covers yet, as one batch numbered after them.
import { writeFileSync } from 'node:fs'
import { GEN } from './paths.mjs'
import { paraphrases } from './gen.mjs'
import { prototypes, routable } from './protos.mjs'

const missingOnly = process.argv.includes('--missing')
const { lines, files } = paraphrases()
const BATCHES = missingOnly ? 1 : 4
const first = missingOnly ? files + 1 : 1
const protos = prototypes()
const specs = routable.filter((r) => !missingOnly || !lines[r.id]).map((r) => ({
  id: r.id,
  requires: r.requires ?? [],
  pattern_fragments: protos.filter((p) => p.rule === r.id && p.kind !== 'reply').map((p) => p.text),
  her_replies: r.replies.map((x) => x.text),
}))
const size = Math.ceil(specs.length / BATCHES)
for (let i = 0; i < BATCHES; i++)
  writeFileSync(`${GEN}spec-${first + i}.json`, JSON.stringify(specs.slice(i * size, (i + 1) * size), null, 1))
console.log(`${specs.length} rules -> spec-${first}..${first + BATCHES - 1}.json`)
