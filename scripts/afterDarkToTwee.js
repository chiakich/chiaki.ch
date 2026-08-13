#!/usr/bin/env node

// One-way diagnostic view of the after-dark payload as a Twine story: the
// spine gets its own row, detours get their own lane, dead ends and hubs are
// tagged. This is a *viewer*, not the authoring file — nothing here reads
// back, and it writes `after-dark.graph.twee` / `.graph.twine.html` so it can
// never be confused with `content/after-dark.source.twee`, which
// scripts/afterDarkTwee.js reads and writes and which Twine edits actually
// belong in.
//
// A node is one reply — one thing she says — and a card is a link, because
// that is what they are. A rule is not a node: a rule like st.position.doggy
// is a twelve-rung ladder, and drawing it as one box hides the whole story
// inside it. Cards are not nodes either; a choice is an edge.
//
// Usage: yarn graph-after-dark [--html] [path/to/payload.json]

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const wantHtml = args.includes('--html')
const sourcePath =
  args.find((arg) => !arg.startsWith('--')) ??
  path.resolve(__dirname, '../content/after-dark.json')

if (!fs.existsSync(sourcePath)) {
  console.error(`Missing after-dark source: ${sourcePath}`)
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
const rules = payload.rules ?? []
const suggestions = payload.suggestions ?? []
const replies = (rule) => rule.replies ?? []

const ENTRY = '⌂ 進入分支'
const ORPHAN = '⚠ 接不上的卡'

// Same stand-in for lib/terminal/normalize.ts as the linter uses: the
// simplified → traditional pass is skipped because cards are authored in
// traditional, and the rest of what patterns rely on is the punctuation strip.
const KEEP = /[㐀-䶿一-鿿豈-﫿ぁ-んァ-ヶー0-9a-z]/i
const normalize = (raw) => {
  let out = ''
  for (const char of raw.normalize('NFKC').toLowerCase())
    if (KEEP.test(char)) out += char
  return out
}

const compiled = rules.map((rule) => ({
  id: rule.id,
  patterns: (rule.patterns ?? []).flatMap((source) => {
    try {
      return [new RegExp(source, 'u')]
    } catch {
      return []
    }
  }),
  keywords: rule.keywords ?? [],
}))

const matchRule = (text) => {
  const normalized = normalize(text ?? '')
  const hit = compiled.find(
    (rule) =>
      rule.patterns.some((pattern) => pattern.test(normalized)) ||
      rule.keywords.some((word) => normalized.includes(word))
  )
  return hit ? hit.id : null
}

// ───────────────────────────────────────────────────────────────────── nodes

const nodeOf = new Map() // `${ruleId}#${index}` → passage name
const tiers = []
for (const rule of rules)
  replies(rule).forEach((reply, index) => {
    const name = `${rule.id} ▸${index}`
    nodeOf.set(`${rule.id}#${index}`, name)
    tiers.push({ name, rule, reply, index })
  })

// Which tier a flag arrives at. A card's `done` is the flag its target sets,
// so this is what turns a card into an exact tier→tier arrow rather than a
// vague gesture at a whole rule.
const setAt = new Map()
for (const tier of tiers)
  for (const flag of tier.reply.remember ?? [])
    if (!setAt.has(flag)) setAt.set(flag, tier.name)

const byId = new Map(suggestions.map((item) => [item.id, item]))

// ───────────────────────────────────────────────────────────────────── edges

const exits = new Map()
const addExit = (from, to, label, note) => {
  if (!exits.has(from)) exits.set(from, new Map())
  if (!exits.get(from).has(to)) exits.get(from).set(to, [])
  exits.get(from).get(to).push({ label, note })
}

const cardTarget = (item) => {
  // Where the card lands: the tier that sets what it accomplishes. Falling
  // back to pattern matching covers cards written before `done` was wired.
  if (item.done && setAt.has(item.done)) return setAt.get(item.done)
  const rule = matchRule(item.text ?? '')
  return rule ? nodeOf.get(`${rule}#0`) ?? ORPHAN : ORPHAN
}

const unplaceable = []
let authored = 0
let derived = 0

// Cards the payload hands out without a line naming them — the flag pool.
const waitingOn = new Map()
for (const item of suggestions)
  for (const flag of item.needs ?? [])
    waitingOn.set(flag, (waitingOn.get(flag) ?? 0) + 1)

const placed = new Set()
for (const tier of tiers)
  for (const id of tier.reply.offers ?? []) placed.add(id)

// The branch is entered by typing, never by a card, so its opening rules have
// no incoming edge and the entry node floats free of everything else. Drawn
// explicitly: an ungated rule is a way in, and a reader of the graph needs to
// see where the story can start.
for (const tier of tiers)
  if (tier.index === 0 && (tier.rule.requires ?? []).length === 0)
    addExit(ENTRY, tier.name, `打字進入：${tier.rule.id}`, 'typed')

for (const tier of tiers) {
  for (const id of tier.reply.offers ?? []) {
    const item = byId.get(id)
    if (!item) continue
    authored += 1
    addExit(tier.name, cardTarget(item), item.text, null)
  }
  // The ladder itself: this tier sets the flag the next one waits on. Drawn
  // so a track reads as a chain even where no card branches off it.
  const next = replies(tier.rule)[tier.index + 1]
  if (
    next &&
    (next.needs ?? []).some((flag) => (tier.reply.remember ?? []).includes(flag))
  )
    addExit(tier.name, nodeOf.get(`${tier.rule.id}#${tier.index + 1}`), '↓', null)
}

// Anything still living in the pool, drawn from its most specific gate so the
// picture shows what the visitor would actually be offered.
for (const item of suggestions) {
  if (item.id !== undefined && placed.has(item.id)) continue
  const needs = item.needs ?? []
  const flag =
    needs.length === 0
      ? null
      : needs.reduce((best, current) =>
          (waitingOn.get(current) ?? 0) < (waitingOn.get(best) ?? 0) ? current : best
        )
  const from = flag === null ? ENTRY : setAt.get(flag)
  if (from === undefined) {
    unplaceable.push({ text: item.text ?? '', flag })
    continue
  }
  derived += 1
  addExit(from, cardTarget(item), item.text, 'pool')
}

// ─────────────────────────────────────────────────────────────────── layout

const nodes = [ENTRY, ...tiers.map((tier) => tier.name)]
if (unplaceable.length > 0) nodes.push(ORPHAN)
const known = new Set(nodes)

const outgoing = new Map(nodes.map((name) => [name, new Set()]))
const undirected = new Map(nodes.map((name) => [name, new Set()]))
const indegree = new Map(nodes.map((name) => [name, 0]))
for (const [from, bucket] of exits)
  for (const to of bucket.keys()) {
    if (!known.has(from) || !known.has(to) || from === to) continue
    outgoing.get(from).add(to)
    undirected.get(from).add(to)
    undirected.get(to).add(from)
    indegree.set(to, indegree.get(to) + 1)
  }

const componentOf = new Map()
let components = 0
for (const start of nodes) {
  if (componentOf.has(start)) continue
  const queue = [start]
  componentOf.set(start, components)
  while (queue.length > 0)
    for (const next of undirected.get(queue.shift()))
      if (!componentOf.has(next)) {
        componentOf.set(next, components)
        queue.push(next)
      }
  components += 1
}

const COLUMN = 240
const ROW = 150
const position = new Map()

const depth = new Map()
{
  const roots = nodes.filter((name) => indegree.get(name) === 0)
  const queue = roots.length > 0 ? [...roots] : [nodes[0]]
  for (const name of queue) depth.set(name, 0)
  while (queue.length > 0) {
    const current = queue.shift()
    for (const next of outgoing.get(current))
      if (!depth.has(next)) {
        depth.set(next, depth.get(current) + 1)
        queue.push(next)
      }
  }
  for (const name of nodes) if (!depth.has(name)) depth.set(name, 0)
}

// The spine gets a row of its own at a fixed height so it reads as one line
// across the picture. Letting the layered layout place it among the detours
// is what buried it: every column held a mix of both, and the eye had nothing
// to follow. The chain comes from the sidecar scripts/wireAfterDark.js emits
// — derived from the graph it picks whichever detour happens to be longest.
const spinePath = path.resolve(__dirname, '../content/after-dark.spine.json')
const sidecar = fs.existsSync(spinePath)
  ? JSON.parse(fs.readFileSync(spinePath, 'utf8'))
  : {}
const chain = sidecar.chain ?? []
// Without the rule list a detour's merge rung looks exactly like a spine rung
// — both set the same beat — and the detour ends up split, body in a spur and
// tail on the line.
const spineRules = new Set(sidecar.rules ?? [])

// One column per beat; the two registers of a beat stack in that column, so
// the spine reads as a single line whichever voice the visitor is hearing.
const SPINE_Y = 600
const onSpine = new Set()
chain.forEach((beat, step) => {
  const rungs = tiers.filter(
    (tier) =>
      (spineRules.size === 0 || spineRules.has(tier.rule.id)) &&
      (tier.reply.remember ?? []).includes(beat)
  )
  rungs.forEach((tier, lane) => {
    onSpine.add(tier.name)
    position.set(tier.name, [100 + step * COLUMN, SPINE_Y + lane * 110])
  })
})

// Everything else hangs off the column of whichever spine node it belongs to,
// stacked away from the line — detours that branch early sit above it, later
// ones below, so an arrow leaving the spine and returning to it stays short.
// A detour's column is the column of the spine beat it hangs off, found by
// walking out from the spine — so an arrow that leaves the line and comes
// back stays short instead of crossing the whole picture.
const column = new Map()
{
  const queue = [...onSpine]
  for (const name of onSpine)
    column.set(name, Math.round(((position.get(name) ?? [100])[0] - 100) / COLUMN))
  while (queue.length > 0) {
    const current = queue.shift()
    for (const next of outgoing.get(current))
      if (!column.has(next)) {
        column.set(next, column.get(current) + 1)
        queue.push(next)
      }
  }
}

// Each detour gets a horizontal lane to itself and runs left to right in it,
// so it reads as a short spur beside the spine. Packing detours by column
// instead — several of them stacked in whichever column they branch from —
// is what turned the opening into a wall: almost everything hangs off the
// first three beats, so the first three columns held the entire payload.
const spurs = new Map()
for (const tier of tiers) {
  if (onSpine.has(tier.name)) continue
  if (!spurs.has(tier.rule.id)) spurs.set(tier.rule.id, [])
  spurs.get(tier.rule.id).push(tier)
}

const spans = [...spurs.entries()].map(([id, members]) => {
  const ordered = members.sort((a, b) => a.index - b.index)
  const start = Math.min(
    ...ordered.map((tier) => column.get(tier.name) ?? depth.get(tier.name))
  )
  return { id, ordered, start, end: start + ordered.length - 1 }
})
spans.sort((a, b) => a.start - b.start)

// Lanes fill outward from the line, and two spurs share a lane whenever their
// columns do not overlap — otherwise a dozen short detours would each claim a
// full row and push the picture taller than it is wide.
const lanes = []
for (const span of spans) {
  let index = lanes.findIndex((lane) =>
    lane.every((other) => other.end < span.start - 1 || other.start > span.end + 1)
  )
  if (index === -1) index = lanes.push([]) - 1
  lanes[index].push(span)

  const rung = Math.floor(index / 2) + 1
  const offset = (index % 2 === 0 ? -1 : 1) * (rung * ROW + 80)
  span.ordered.forEach((tier, step) => {
    position.set(tier.name, [100 + (span.start + step) * COLUMN, SPINE_Y + offset])
  })
}

for (const name of nodes)
  if (!position.has(name))
    position.set(name, [100 + (column.get(name) ?? 0) * COLUMN, SPINE_Y - 3 * ROW])

// ─────────────────────────────────────────────────────────────────  passages

const clip = (text, max) => (text.length > max ? `${text.slice(0, max)}…` : text)
const list = (values) => (values && values.length > 0 ? values.join(', ') : '—')
const safe = (text) => text.replace(/->/g, '→').replace(/[[\]|]/g, '')

const exitLines = (from) => {
  const bucket = exits.get(from)
  if (!bucket) return ['(沒有出口)']
  return [...bucket.entries()].map(([to, cards]) => {
    const labels = cards
      .map((card) => `${clip(safe(card.label), 16)}${card.note ? ` ⟨${card.note}⟩` : ''}`)
      .join(' / ')
    return `[[${clip(labels, 56)}->${to}]]`
  })
}

const passages = [
  {
    name: ENTRY,
    tags: ['entry'],
    body: ['分支入口 —— 沒有 needs 的卡。', '', ...exitLines(ENTRY)].join('\n'),
  },
]

for (const tier of tiers) {
  const count = (tier.reply.offers ?? []).length
  const tags = ['tier']
  if (count > 0) tags.push('wired')
  if (exits.get(tier.name) === undefined) tags.push('dead-end')

  passages.push({
    name: tier.name,
    tags,
    body: [
      clip((tier.reply.text ?? '').replace(/[[\]]/g, ''), 60),
      '',
      `needs: ${list(tier.reply.needs)}`,
      `sets: ${list(tier.reply.remember)}`,
      `offers: ${list(tier.reply.offers)}`,
      '',
      ...exitLines(tier.name),
    ].join('\n'),
  })
}

if (known.has(ORPHAN))
  passages.push({
    name: ORPHAN,
    tags: ['broken'],
    body: [
      `${unplaceable.length} 張卡等的 flag 沒有任何 reply 會設定：`,
      ...unplaceable.map((card) => `  · ${clip(card.text, 20)}  ← ${card.flag}`),
      '',
      ...exitLines(ORPHAN),
    ].join('\n'),
  })

// ────────────────────────────────────────────────────────────────────  emit

const outDir = path.resolve(__dirname, '../content')
const at = (name) => position.get(name) ?? [100, 100]

if (wantHtml) {
  const escapeText = (raw) =>
    raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const escapeAttr = (raw) => escapeText(raw).replace(/"/g, '&quot;')

  const body = passages
    .map((passage, index) => {
      const [x, y] = at(passage.name)
      return (
        `<tw-passagedata pid="${index + 1}" name="${escapeAttr(passage.name)}" ` +
        `tags="${escapeAttr(passage.tags.join(' '))}" position="${x},${y}" ` +
        `size="100,100">${escapeText(passage.body)}</tw-passagedata>`
      )
    })
    .join('\n')

  // A fixed IFID keeps re-imports pointing at the same story instead of
  // piling up copies in the Twine library.
  const html = `<tw-storydata name="after-dark" startnode="1" creator="afterDarkToTwee" creator-version="3.0.0" ifid="8B7F2C14-0A6D-4E51-9C3B-5D2E7A1F6048" zoom="1" format="Harlowe" format-version="3.3.9" options="" hidden>
<style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style>
<script role="script" id="twine-user-script" type="text/twine-javascript"></script>
${body}
</tw-storydata>
`
  const target = path.join(outDir, 'after-dark.graph.twine.html')
  fs.writeFileSync(target, html)
  console.log(`Wrote ${path.relative(process.cwd(), target)}`)
} else {
  const twee = passages
    .map((passage) => {
      const tags = passage.tags.length > 0 ? ` [${passage.tags.join(' ')}]` : ''
      return `:: ${passage.name}${tags} {"position":"${at(passage.name).join(',')}","size":"100,100"}\n${passage.body}\n`
    })
    .join('\n')

  // Named `.graph.twee` rather than `.twee` on purpose: this is a lossy,
  // one-way diagnostic view (synthetic ENTRY/ORPHAN nodes, curated layout),
  // not the lossless authoring source scripts/afterDarkTwee.js reads and
  // writes. The two used to share a name, which made it easy to edit the
  // wrong one in Twine and lose the edit on the next --check.
  const target = path.join(outDir, 'after-dark.graph.twee')
  fs.writeFileSync(target, twee)
  console.log(`Wrote ${path.relative(process.cwd(), target)}`)
}

const arrows = [...exits.values()].reduce((total, bucket) => total + bucket.size, 0)
const deadEnds = tiers.filter((tier) => exits.get(tier.name) === undefined)

console.log(
  `${passages.length} passages · ${arrows} arrows · ${authored} authored exits · ` +
    `${derived} still from the pool · ${components} components · ` +
    `${unplaceable.length} unplaceable cards · ${deadEnds.length} dead ends`
)
if (deadEnds.length > 0)
  console.log(
    `\ndead ends (沒有出口的 tier):\n${deadEnds
      .map((tier) => `  ${tier.name}`)
      .join('\n')}`
  )
