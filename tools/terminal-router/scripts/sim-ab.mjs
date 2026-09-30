// Blind A/B between two replays of the same visits (see sim-replay.mjs and bundle:head).
//   node scripts/sim-ab.mjs pack <tagA> <tagB> <id>...   -> build/sim/ab/<tagA>-<tagB>/items.md + key.json
//   node scripts/sim-ab.mjs score <tagA> <tagB>          -> unblinds labels.json in that folder
// Only turns whose reply differs are packed. Each side is shown with its own last few turns,
// because once two replays diverge a shared history would make one side look repetitive.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { SIM } from './sim.mjs'

const abDir = (tagA, tagB) => `${SIM}ab/${tagA}-${tagB}/`
const CONTEXT = 3
const read = (path) => readFileSync(path, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const bad = (v) => ['off_topic', 'missed', 'repetitive'].includes(v)

const history = (rows, turn) =>
  rows
    .filter((r) => r.turn < turn && r.turn >= turn - CONTEXT)
    .map((r) => (r.turn === 0 ? `秋狐：${r.text}` : `訪客：${r.input}\n秋狐：${r.text}`))
    .join('\n')

const pack = (tagA, tagB, ids) => {
  const AB = abDir(tagA, tagB)
  mkdirSync(AB, { recursive: true })
  const items = [], key = []
  for (const id of ids) {
    const a = read(`${SIM}${id}.${tagA}.jsonl`), b = read(`${SIM}${id}.${tagB}.jsonl`)
    const byTurn = new Map(a.map((r) => [r.turn, r]))
    for (const rb of b) {
      const ra = byTurn.get(rb.turn)
      if (rb.turn === 0 || !ra || (ra.ruleId === rb.ruleId && ra.text === rb.text)) continue
      // A recorded visitor typed their name into the chat; a replay can't reproduce them using
      // the name box, so those turns would only measure the replay, not the engine.
      if ([ra.pending, rb.pending].some((p) => p === 'name.ask' || p === 'name.check')) continue
      const flip = Math.random() < 0.5
      const [first, second] = flip ? [[b, rb], [a, ra]] : [[a, ra], [b, rb]]
      const n = items.length + 1
      key.push({ item: n, id, turn: rb.turn, input: rb.input, A: flip ? tagB : tagA, rules: { [tagA]: ra.ruleId, [tagB]: rb.ruleId } })
      const side = (label, [rows, r]) => {
        const ctx = history(rows, r.turn)
        return `【${label}】\n${ctx ? `${ctx}\n` : ''}訪客：${r.input}\n→ 秋狐：${r.text}`
      }
      items.push(`### item ${n}\n${side('A', first)}\n\n${side('B', second)}\n`)
    }
  }
  writeFileSync(`${AB}items.md`, items.join('\n'))
  writeFileSync(`${AB}key.json`, JSON.stringify({ tags: [tagA, tagB], items: key }, null, 1))
  console.log(`${items.length} differing turns packed`)
}

// Turns the router answered on either side are scored apart from turns that only differ because
// an earlier router turn changed what she had already said.
const score = (AB) => {
  const { tags, items } = JSON.parse(readFileSync(`${AB}key.json`, 'utf8'))
  const labels = new Map(JSON.parse(readFileSync(`${AB}labels.json`, 'utf8')).map((l) => [l.item, l]))
  const tally = () => ({ wins: Object.fromEntries([...tags, 'tie'].map((t) => [t, 0])), bad: Object.fromEntries(tags.map((t) => [t, 0])) })
  const groups = { direct: tally(), downstream: tally() }
  const viaRouter = new Set()
  for (const id of new Set(items.map((k) => k.id)))
    for (const t of tags) for (const r of read(`${SIM}${id}.${t}.jsonl`)) if (r.via === 'router') viaRouter.add(`${id}#${r.turn}`)
  for (const k of items) {
    const l = labels.get(k.item)
    if (!l) continue
    const sideOf = (tag) => (k.A === tag ? 'A' : 'B')
    const winner = l.better === 'tie' ? 'tie' : l.better === 'A' ? k.A : tags.find((t) => t !== k.A)
    const g = groups[viaRouter.has(`${k.id}#${k.turn}`) ? 'direct' : 'downstream']
    g.wins[winner] += 1
    for (const t of tags) if (bad(l[sideOf(t)])) g.bad[t] += 1
    if (winner !== tags[1])
      console.log(
        `${winner.padEnd(5)} ${`${k.id}#${k.turn}`.padEnd(18)} ${tags.map((t) => `${t}:${k.rules[t]}=${l[sideOf(t)]}`).join('  ')}  ${l.note ?? ''}`
      )
  }
  console.log('')
  for (const [name, g] of Object.entries(groups))
    console.log(`${name.padEnd(10)} wins ${JSON.stringify(g.wins)}  off_topic/missed/repetitive: ${JSON.stringify(g.bad)}`)
}

const [cmd, ...rest] = process.argv.slice(2)
if (cmd === 'pack') pack(rest[0], rest[1], rest.slice(2))
else if (cmd === 'score') score(abDir(rest[0], rest[1]))
else console.error('usage: sim-ab.mjs pack <tagA> <tagB> <id>... | score <tagA> <tagB>')
