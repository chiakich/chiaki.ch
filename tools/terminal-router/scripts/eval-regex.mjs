// How often the shipped regex engine lands paraphrases on the right rule. Details go to build/regex-results.json.
import { readFileSync, writeFileSync } from 'node:fs'
import { createSession, parseLexicon, respond, rules } from '../build/engine.mjs'
import { LEXICON, TEST, TOOL, readJson } from './paths.mjs'

const lexicon = parseLexicon(readFileSync(LEXICON, 'utf8'))
const ruleIds = new Set(rules.map((r) => r.id))

const rows = []
for (const c of readJson(`${TEST}cases.json`)) {
  for (const text of c.texts) {
    const session = createSession()
    for (const f of c.flags ?? []) session.flags.add(f)
    const turn = respond(text, session, lexicon)
    const outcome = c.accept.includes(turn.ruleId) ? 'hit' : ruleIds.has(turn.ruleId) ? 'wrong' : 'fallback'
    rows.push({ target: c.accept[0], text, got: turn.ruleId, outcome })
  }
}
writeFileSync(`${TOOL}build/regex-results.json`, JSON.stringify(rows, null, 1))

const count = (o) => rows.filter((r) => r.outcome === o).length
const pct = (n) => `${((n / rows.length) * 100).toFixed(1)}%`
console.log(`total ${rows.length}  hit ${pct(count('hit'))}  wrong ${pct(count('wrong'))}  fallback ${pct(count('fallback'))}`)

const perRule = {}
for (const r of rows) (perRule[r.target] ??= []).push(r.outcome === 'hit')
console.log('\nweakest rules:')
Object.entries(perRule)
  .map(([id, hits]) => [id, hits.filter(Boolean).length, hits.length])
  .sort((a, b) => a[1] / a[2] - b[1] / b[2])
  .slice(0, 15)
  .forEach(([id, n, of]) => console.log(`  ${id}: ${n}/${of}`))
console.log('\nwrong rule:')
for (const r of rows.filter((r) => r.outcome === 'wrong')) console.log(`  [${r.target}] ${r.text} -> ${r.got}`)
