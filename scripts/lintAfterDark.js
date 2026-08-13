#!/usr/bin/env node

// Structural check over content/after-dark.json — the branch is a graph whose
// edges are spread across `offers`, `opens`/`continues` and the `needs`/`done`
// flag handshake, so the ways it breaks are invisible in the file itself: a
// card that reaches no rule, a tier gated behind a flag nobody sets, a scene
// with no exit. Content and prose are never judged here, only wiring.
//
// Usage: yarn lint-after-dark [path/to/after-dark.json]

const fs = require('fs')
const path = require('path')

const sourcePath =
  process.argv[2] ?? path.resolve(__dirname, '../content/after-dark.json')
if (!fs.existsSync(sourcePath)) {
  console.error(`Missing after-dark source: ${sourcePath}`)
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
const rules = Array.isArray(payload.rules) ? payload.rules : []
const suggestions = Array.isArray(payload.suggestions) ? payload.suggestions : []

// The main story tables are TypeScript, so they can't be required from here.
// Scanned as text purely to answer "does this flag exist anywhere else?" —
// deliberately coarse, because a false alarm about a shared flag is worse than
// a miss: `toldNoTouch` and friends live in rules.ts and smalltalk.ts.
const mainSource = ['rules.ts', 'smalltalk.ts']
  .map((file) => path.resolve(__dirname, '../lib/terminal', file))
  .filter((file) => fs.existsSync(file))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n')

const inMainTable = (token) => mainSource.includes(`'${token}'`)

const errors = []
const warnings = []
const fail = (message) => errors.push(message)
const warn = (message) => warnings.push(message)

const replies = (rule) => (Array.isArray(rule.replies) ? rule.replies : [])
const label = (item, index) =>
  item.id ?? `#${index} 「${(item.text ?? '').slice(0, 8)}…」`

// ---------------------------------------------------------------- flag graph

const flagsSet = new Set()
for (const rule of rules)
  for (const reply of replies(rule))
    for (const flag of reply.remember ?? []) flagsSet.add(flag)

const isReachableFlag = (flag) => flagsSet.has(flag) || inMainTable(flag)

for (const rule of rules) {
  for (const flag of rule.requires ?? [])
    if (!isReachableFlag(flag))
      fail(`rule ${rule.id}: requires '${flag}', which nothing ever sets`)
  for (const [index, reply] of replies(rule).entries())
    for (const flag of reply.needs ?? [])
      if (!isReachableFlag(flag))
        fail(
          `rule ${rule.id} reply #${index}: needs '${flag}', which nothing ever sets`
        )
}

// The trap documented in lib/terminal/dirty.ts: with every reply gated and no
// `requires` on the rule, a stray pattern hit before the prerequisite exists
// falls through pickReply's fallback and lands on the deepest line in the rule.
for (const rule of rules) {
  const list = replies(rule)
  const ungated = list.filter(
    (reply) => (reply.needs?.length ?? 0) === 0 && reply.minSignal === undefined
  )
  if (list.length > 0 && ungated.length === 0 && (rule.requires?.length ?? 0) === 0)
    fail(
      `rule ${rule.id}: every reply is gated but the rule has no 'requires' — ` +
        `an early pattern hit will jump straight to the deepest line`
    )
}

// ------------------------------------------------------------ follow-up edges

const opened = new Set()
const continued = new Set()
for (const rule of rules) {
  if (rule.continues) continued.add(rule.continues)
  for (const reply of replies(rule)) if (reply.opens) opened.add(reply.opens)
}
for (const id of opened)
  if (!continued.has(id) && !inMainTable(id))
    fail(`opens '${id}' is armed but no rule continues it`)
for (const id of continued)
  if (!opened.has(id) && !inMainTable(id))
    warn(`rule continuing '${id}': nothing in this payload ever opens it`)

// ------------------------------------------------------------------- choices

const byId = new Map()
for (const [index, item] of suggestions.entries()) {
  if (!item.id) continue
  if (byId.has(item.id)) fail(`duplicate suggestion id '${item.id}' (at #${index})`)
  byId.set(item.id, item)
}

for (const rule of rules)
  for (const [index, reply] of replies(rule).entries())
    for (const id of reply.offers ?? [])
      if (!byId.has(id))
        fail(
          `rule ${rule.id} reply #${index}: offers '${id}', which is not a suggestion id`
        )

for (const [index, item] of suggestions.entries()) {
  if (item.done && !isReachableFlag(item.done))
    warn(
      `suggestion ${label(item, index)}: done flag '${item.done}' is never set, ` +
        `so it only retires by hitting ASK_LIMIT`
    )
  for (const flag of item.needs ?? [])
    if (!isReachableFlag(flag))
      fail(
        `suggestion ${label(item, index)}: needs '${flag}', which nothing ever sets`
      )
}

// -------------------------------------------------------- card reachability

// A faithful-enough stand-in for lib/terminal/normalize.ts: the simplified →
// traditional pass is skipped because these strings are authored in
// traditional, and everything else patterns rely on is the punctuation strip.
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
      fail(`rule ${rule.id}: pattern does not compile — /${source}/`)
      return []
    }
  }),
  keywords: rule.keywords ?? [],
}))

for (const [index, item] of suggestions.entries()) {
  const text = normalize(item.text ?? '')
  const hit = compiled.find(
    (rule) =>
      rule.patterns.some((pattern) => pattern.test(text)) ||
      rule.keywords.some((word) => text.includes(word))
  )
  if (!hit)
    warn(
      `suggestion ${label(item, index)}: no after-dark rule matches it ` +
        `(may still reach a main-table rule)`
    )
}

// --------------------------------------------------------------- scene exits

// With the input box gone inside the branch, a line that names its exits and
// has none left standing is a hard dead end rather than a nudge to type.
for (const rule of rules)
  for (const [index, reply] of replies(rule).entries())
    if (Array.isArray(reply.offers) && reply.offers.length === 0)
      fail(`rule ${rule.id} reply #${index}: offers an empty choice list`)

// -------------------------------------------------------------------- report

const orphanIds = suggestions.filter((item) => !item.id).length
if (orphanIds > 0)
  console.log(
    `note: ${orphanIds}/${suggestions.length} suggestions have no id, so no ` +
      `reply can offer them — they are pool-only.`
  )

for (const message of warnings) console.log(`warn  ${message}`)
for (const message of errors) console.log(`ERROR ${message}`)

console.log(
  `\n${rules.length} rules · ${suggestions.length} suggestions · ` +
    `${flagsSet.size} flags set here · ${errors.length} errors · ${warnings.length} warnings`
)

process.exit(errors.length > 0 ? 1 : 0)
