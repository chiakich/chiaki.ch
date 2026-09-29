// Joins blind judge labels back to transcripts and reports per-mode rates plus every failure.
//   node scripts/sim-score.mjs            (reads build/sim/judge/key.json and *.labels.json)
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { SIM } from './sim.mjs'

const JUDGE = `${SIM}judge/`
const VERDICTS = ['good', 'ok', 'off_topic', 'missed', 'uncovered', 'repetitive']
const read = (path) => readFileSync(path, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const key = JSON.parse(readFileSync(`${JUDGE}key.json`, 'utf8'))

const rows = []
for (const [code, { id, mode }] of Object.entries(key)) {
  const labelPath = `${JUDGE}${code}.labels.json`
  if (!existsSync(labelPath)) {
    console.log(`(no labels for ${code})`)
    continue
  }
  const labels = new Map(JSON.parse(readFileSync(labelPath, 'utf8')).map((l) => [l.turn, l]))
  for (const t of read(`${SIM}${id}${mode === 'router' ? '.router' : ''}.jsonl`)) {
    if (t.turn === 0) continue
    const l = labels.get(t.turn) ?? { verdict: 'unlabelled' }
    rows.push({ id, mode, turn: t.turn, input: t.input, ruleId: t.ruleId, via: t.via, text: t.text, ...l })
  }
}
writeFileSync(`${SIM}scored.json`, JSON.stringify(rows, null, 1))

const pct = (n, d) => `${((n / d) * 100).toFixed(1)}%`.padStart(6)
for (const mode of ['regex', 'router']) {
  const m = rows.filter((r) => r.mode === mode)
  if (!m.length) continue
  console.log(`\n== ${mode}: ${m.length} replies over ${new Set(m.map((r) => r.id)).size} visits`)
  console.log('  ' + VERDICTS.map((v) => `${v} ${pct(m.filter((r) => r.verdict === v).length, m.length)}`).join('  '))
  const bad = m.filter((r) => ['off_topic', 'missed', 'repetitive'].includes(r.verdict))
  for (const r of bad)
    console.log(`  ${r.verdict.padEnd(10)} ${r.id}#${r.turn} 「${r.input}」 -> ${r.ruleId}${r.better_rule ? ` (should be ${r.better_rule})` : ''}${r.note ? `  ${r.note}` : ''}`)
}

const gaps = {}
for (const r of rows.filter((r) => r.verdict === 'uncovered' && r.mode === 'regex')) (gaps[r.better_rule ?? '?'] ??= []).push(`${r.id}#${r.turn} 「${r.input}」`)
console.log('\n== uncovered topics (regex transcripts)')
Object.entries(gaps)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([topic, where]) => console.log(`  ${topic} ×${where.length}: ${where.join('  ')}`))
