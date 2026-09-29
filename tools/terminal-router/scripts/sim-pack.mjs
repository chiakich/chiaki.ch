// Packs simulated transcripts for blind judging: build/sim/judge/<code>.txt without rule ids or
// mode, a key mapping codes back, and a catalogue of what she can say per rule.
//   node scripts/sim-pack.mjs <id>...     (packs <id>.jsonl and <id>.router.jsonl when present)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { SIM } from './sim.mjs'
import { routable } from './protos.mjs'

const JUDGE = `${SIM}judge/`
mkdirSync(JUDGE, { recursive: true })

const read = (path) => readFileSync(path, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const entries = process.argv.slice(2).flatMap((id) =>
  [
    { id, mode: 'regex', path: `${SIM}${id}.jsonl` },
    { id, mode: 'router', path: `${SIM}${id}.router.jsonl` },
  ].filter((e) => existsSync(e.path))
)
// Shuffled codes so a judge can't tell the two modes of one visit apart by order.
const codes = entries.map((_, i) => `t${String(i + 1).padStart(2, '0')}`).sort(() => Math.random() - 0.5)

const key = {}
entries.forEach((e, i) => {
  const code = codes[i]
  key[code] = { id: e.id, mode: e.mode }
  const lines = read(e.path).map((r) =>
    r.turn === 0 ? `[0] 秋狐：${r.text}` : `[${r.turn}] 訪客${r.chip ? '（點了建議選項）' : ''}：${r.input}\n[${r.turn}] 秋狐：${r.text}`
  )
  writeFileSync(`${JUDGE}${code}.txt`, `${lines.join('\n')}\n`)
})
writeFileSync(`${JUDGE}key.json`, JSON.stringify(key, null, 1))

const catalog = routable.map((r) => `## ${r.id}\n${r.replies.map((x) => `- ${x.text}`).join('\n')}`).join('\n\n')
writeFileSync(`${JUDGE}catalog.md`, `# What she can say, by rule\n\n${catalog}\n`)
console.log(`packed ${entries.length} transcripts: ${Object.keys(key).sort().join(' ')}`)
