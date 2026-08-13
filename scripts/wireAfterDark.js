#!/usr/bin/env node

// Wires the after-dark branch into an explicit choice graph without touching a
// word of the prose. Everything here is structure: ids, milestone flags, and
// the `offers` lists that let a line name its own exits.
//
// Why a script and not a hand-edited JSON: the interesting part is the TABLE
// below, not the 40K of output. Re-run it after editing prose and the wiring
// is rebuilt; disagree with a decision and you edit one line here rather than
// hunting through the payload.
//
// Usage: yarn wire-after-dark [--write]   (without --write, emits *.wired.json)

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const inPlace = args.includes('--write')
const sourcePath = path.resolve(__dirname, '../content/after-dark.json')
const payload = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))

// ───────────────────────────────────────────────────────────────── the table
//
// Each track is the same story told in a different register, and each was
// written with its own private flag vocabulary. Cards 4–10 were written
// against a *shared* one that nothing ever set — this is the mapping that
// connects them, so the generic escalation questions work on every track.
//
// Left: the track's own flag. Right: the shared milestone it also stands for.
// Read it as "when this tier is reached, the story has also reached ___".

const MILESTONES = {
  startedFeeling: [
    'gentleHeat1', 'toolHeat1', 'doggyHeat1', 'cowgirlHeat1',
    'filmHeat1', 'dogMoving', 'thrustFaster', 'selfFeeling', 'oralHeat',
  ],
  startedBegging: [
    'gentleNear', 'toolNear', 'doggyNear', 'cowgirlHeat4',
    'filmNear', 'dogNear', 'thrustNear', 'squirtingWarn',
  ],
  orgasmedAgainstWill: [
    'gentleOrgasmed1', 'toolOrgasmed1', 'doggyOrgasmed1', 'cowgirlOrgasmed1',
    'filmOrgasmed', 'dogOrgasmed', 'thrustOrgasmed', 'selfOrgasmed',
    'squirted', 'creampieOrgasmed',
  ],
  criedDuring: [
    'gentleAfter1', 'toolOverload1', 'doggyAfter1', 'cowgirlAfter1',
    'filmWilling', 'dogWilling', 'thrustOverload', 'incontinent',
  ],
  repeatedOverload: [
    'gentleOrgasmed2', 'toolOverload2', 'doggyOrgasmed2', 'cowgirlOrgasmed2',
    'filmOrgasmed2', 'dogOrgasmed2', 'squirtedAgain',
  ],
  // The convergence point. gentle and tool already set it; every other track
  // ran to its own private ending and stranded `st.after.collapse`, which is
  // the one scene written to close the branch.
  fullyCollapsed: [
    'doggyCollapse', 'cowgirlCollapse', 'filmCollapse', 'dogCollapse',
    'stillLeaking', 'toolFinal', 'sinkingDegrade',
  ],
  // Card 15「在外面做。」waits on this and nothing set it.
  exposureStarted: ['filmStarted', 'dogSeen1'],
}

// Scene openings — the two places where a flag hands over a wall of cards
// rather than a next step, so the choice has to be authored instead of
// derived. Keyed `ruleId#replyIndex`; values are card ids (see slugs below).
const SCENE_OFFERS = {
  // Consent has just landed. This is the fork between registers, not a menu
  // of every act in the payload: pick the tone first, the acts follow from it.
  'st.ask.sex.accept#0': ['calledToy', 'feltHeat', 'startedOral'],
  'st.ask.sex.accept#1': ['gentlePath', 'feltHeat', 'startedOral'],
  // Inside and moving. Now the positions and the framing devices open up.
  'st.enter.2#0': [
    'doggyStarted', 'cowgirlStarted', 'thrustContinue', 'thrustHard',
  ],
  // Tracks that ran off the end of their own ladder and stopped. Each is
  // handed back to the convergence scene rather than left as a dead end —
  // with no input box, a dead end is a dead end.
  'st.command.self#2': ['startedFeeling', 'squirtingWarn'],
  // Both position tracks ran to a private ending (`doggyFinal`, `cowgirlOver`)
  // that nothing consumed, so they stopped one step short of the scene written
  // to close the branch.
  'st.position.doggy#11': ['postCollapse1'],
  'st.position.cowgirl#11': ['postCollapse1'],
  'st.thrust.continue#2': ['thrustHard', 'creampied'],
  'st.oral#3': ['feltHeat', 'calledToy'],
  'st.degrade#3': ['startedFeeling'],
}

// ─────────────────────────────────────────────────────────── the spine (B)
//
// One story, told in two registers, with everything else hanging off it as a
// detour that merges back. The registers are `gentlePath` and `toolPath`,
// which the payload already forks on at st.after.collapse — this just extends
// that fork over the whole middle, where st.during.sex.gentle and
// st.during.sex.tool were already writing the same beats twice.
//
// So the spine needs no new prose: every beat below already has both a gentle
// and a tool line written for it. What it needs is to stop being two parallel
// rules and start being one ladder with two voices.

const SPINE = [
  // The consent ladder is the most linear stretch in the whole branch and was
  // already written as spine-with-detour — it belongs on the line, not beside
  // it. These rungs are not rebuilt by --apply (only the two register rules
  // are); they are here so the beat order is complete.
  { beat: 'askedSex', both: 'st.ask.sex#0' },
  { beat: 'hesitatedSex', both: 'st.ask.sex.hesitate#0' },
  { beat: 'pushedAgain', both: 'st.ask.sex.push#0' },
  { beat: 'acceptedSex', gentle: 'st.ask.sex.accept#1', tool: 'st.ask.sex.accept#0' },
  { beat: 'feltHeat', both: 'st.enter.1#0' },
  { beat: 'startedMoving', both: 'st.enter.2#0' },
  { beat: 'startedFeeling', gentle: 'st.during.sex.gentle#0', tool: 'st.during.sex.tool#0' },
  { beat: 'startedBegging', gentle: 'st.during.sex.gentle#5', tool: 'st.during.sex.tool#4' },
  { beat: 'orgasmedAgainstWill', gentle: 'st.during.sex.gentle#6', tool: 'st.during.sex.tool#5' },
  { beat: 'criedDuring', gentle: 'st.during.sex.gentle#7', tool: 'st.during.sex.tool#6' },
  { beat: 'repeatedOverload', gentle: 'st.during.sex.gentle#9', tool: 'st.during.sex.tool#7' },
  { beat: 'fullyCollapsed', gentle: 'st.during.sex.gentle#10', tool: 'st.during.sex.tool#9' },
  { beat: 'postCollapse1', both: 'st.after.collapse#0' },
  { beat: 'postCollapse2', both: 'st.after.collapse#1' },
  { beat: 'postCollapse3', both: 'st.after.collapse#2' },
  { beat: 'postCollapse4', both: 'st.after.collapse#3' },
  { beat: 'postCollapse5', both: 'st.after.collapse#4' },
]

// Everything else. `from` is the spine beat it can be taken at, `keep` how
// many of its tiers stay once the generic escalation tail is cut, and `back`
// where it rejoins. A detour is meant to be a couple of beats — a twelve-rung
// detour is a second story, which is what made the graph unreadable.
const DETOURS = {
  'st.oral': { from: 'acceptedSex', keep: 4, back: 'feltHeat' },
  'st.degrade': { from: 'acceptedSex', keep: 4, back: 'startedFeeling' },
  'st.command.self': { from: 'acceptedSex', keep: 3, back: 'startedFeeling' },
  'st.position.doggy': { from: 'startedMoving', keep: 3, back: 'startedFeeling' },
  'st.position.cowgirl': { from: 'startedMoving', keep: 3, back: 'startedFeeling' },
  'st.exposure.film': { from: 'acceptedSex', keep: 4, back: 'startedFeeling' },
  'st.exposure.dog': { from: 'acceptedSex', keep: 3, back: 'startedFeeling' },
  'st.thrust.continue': { from: 'feltHeat', keep: 3, back: 'startedBegging' },
  'st.thrust.hard': { from: 'feltHeat', keep: 4, back: 'orgasmedAgainstWill' },
  'st.squirting': { from: 'startedBegging', keep: 5, back: 'repeatedOverload' },
  'st.creampie.continue': { from: 'orgasmedAgainstWill', keep: 3, back: 'fullyCollapsed' },
}

// Leaving is not a story choice and no longer rides in the card row — the UI
// carries it as its own control, so nothing here offers it. Its rule still
// has to answer what that control sends, which is what EXIT_PATTERN fixes:
// the card's own text never matched (「算了，先停在這裡。」 normalises to
// 算了先停在這裡, and the pattern only allowed 算了停在這裡), so the one card
// that must always work was the one card that did not.
const EXIT_RULE = 'st.afterdark.exit'
const EXIT_PATTERN =
  '^(?:算了(?:先?停在這裡)?|先不要(?:了)?|不要(?:了)?|停(?:一下|在這裡)?|不想(?:繼續|要了)|結束)$'

// How many exits a single line may name. Past this it is a scene, not a step.
const MAX_OFFERS = 4

// ──────────────────────────────────────────────────────────────────── wiring

const rules = payload.rules ?? []
const suggestions = payload.suggestions ?? []
const replies = (rule) => rule.replies ?? []

// A card's id is its `done` flag: that flag *is* what taking the card
// accomplishes, so the name stays meaningful when the prose is rewritten.
// Collisions get a suffix — several cards can advance the same beat.
// ────────────────────────────────────────────────────────── the surgery plan

if (args.includes('--plan')) {
  const at = (ref) => {
    const [id, index] = ref.split('#')
    return replies(rules.find((rule) => rule.id === id) ?? {})[Number(index)]
  }
  const excerpt = (reply, max = 18) =>
    reply ? `「${(reply.text ?? '').slice(0, max)}…」` : '⚠ 找不到'

  console.log('主線 —— 一條階梯，兩種語氣。新散文需求：0 句\n')
  for (const [step, node] of SPINE.entries()) {
    const label = `${String(step + 1).padStart(2)}. ${node.beat}`
    if (node.both) {
      console.log(`${label}\n      共用  ${node.both.padEnd(26)} ${excerpt(at(node.both))}`)
    } else {
      console.log(
        `${label}\n` +
          `      gentle ${node.gentle.padEnd(26)} ${excerpt(at(node.gentle))}\n` +
          `      tool   ${node.tool.padEnd(26)} ${excerpt(at(node.tool))}`
      )
    }
  }

  // The cards were written in one order and the prose reached the same beats
  // in another. Worth surfacing rather than silently picking a side: the
  // prose is usually right, but which line she cries on is a writing call.
  const spineOrder = SPINE.map((node) => node.beat)
  const cardOrder = []
  for (const item of payload.suggestions ?? [])
    if (item.done && spineOrder.includes(item.done) && !cardOrder.includes(item.done))
      cardOrder.push(item.done)
  const conflicts = []
  for (const beat of cardOrder)
    for (const other of cardOrder)
      if (
        cardOrder.indexOf(beat) < cardOrder.indexOf(other) &&
        spineOrder.indexOf(beat) > spineOrder.indexOf(other)
      )
        conflicts.push([beat, other])
  if (conflicts.length > 0) {
    console.log('\n⚠ 卡片順序與散文順序不一致：')
    for (const [first, second] of conflicts)
      console.log(`   卡片說 ${first} 在 ${second} 之前，散文寫的是相反`)
  }

  console.log('\n支線 —— 保留開頭的獨特段落，砍掉與主線重複的升級尾巴\n')
  const onSpine = new Set(
    SPINE.flatMap((node) => [node.both, node.gentle, node.tool]).filter(Boolean)
  )
  let kept = 0
  let cut = 0
  let promoted = 0

  for (const [id, plan] of Object.entries(DETOURS)) {
    const rule = rules.find((entry) => entry.id === id)
    if (!rule) {
      console.log(`⚠ ${id} 不存在`)
      continue
    }
    const all = replies(rule)
    console.log(`◆ ${id}   從「${plan.from}」岔出 → 回到「${plan.back}」`)
    all.forEach((reply, index) => {
      const ref = `${id}#${index}`
      if (onSpine.has(ref)) {
        promoted += 1
        console.log(`   ▸${String(index).padStart(2)} ↑ 升格為主線   ${excerpt(reply)}`)
      } else if (index < plan.keep) {
        kept += 1
        console.log(`   ▸${String(index).padStart(2)} ✓ 保留         ${excerpt(reply)}`)
      } else {
        cut += 1
        console.log(`   ▸${String(index).padStart(2)} ✕ 砍           ${excerpt(reply)}`)
      }
    })
    console.log('')
  }

  const total = rules.reduce((sum, rule) => sum + replies(rule).length, 0)
  const spineLines = SPINE.reduce(
    (sum, node) => sum + (node.both ? 1 : 2),
    0
  )
  console.log(
    `總計 ${total} 句 · 主線用 ${spineLines} 句（全部既有）· 支線保留 ${kept} 句 · ` +
      `建議砍 ${cut} 句（${Math.round((cut / total) * 100)}%）· 主線升格 ${promoted} 句`
  )
  process.exit(0)
}

// ─────────────────────────────────────────────────────────────── the surgery

// The spine reads as one ladder: each rung waits on the beat before it and
// sets its own. `pickReply` scores depth by `needs.length` and advances by
// retiring what has been said, so a rung gated on [previous beat, register]
// keeps the chain moving while the two registers stay mutually exclusive —
// the same shape st.after.collapse already used for its two endings.
const CHAIN = SPINE.map((node) => node.beat)

if (args.includes('--apply')) {
  const ruleById = new Map(rules.map((rule) => [rule.id, rule]))

  // Spine: keep only the rungs named in SPINE, re-gated on the shared chain
  // instead of each track's private one. The private flags go with the tiers
  // they belonged to — nothing outside these two rules ever referenced them.
  for (const register of ['gentle', 'tool']) {
    const ruleId = `st.during.sex.${register}`
    const rule = ruleById.get(ruleId)
    if (!rule) continue
    const path = `${register}Path`
    const rungs = []
    for (const [step, node] of SPINE.entries()) {
      const ref = node[register]
      if (!ref || !ref.startsWith(ruleId)) continue
      const reply = replies(rule)[Number(ref.split('#')[1])]
      if (!reply) continue
      rungs.push({
        ...reply,
        needs: [CHAIN[step - 1], path],
        remember: [node.beat],
      })
    }
    rule.replies = rungs
  }

  // Detours: cut the escalation tail, then move the merge to the last rung
  // that survives. A detour that rejoins the spine halfway through itself is
  // not a detour — the beats after the merge would be unreachable.
  for (const [id, plan] of Object.entries(DETOURS)) {
    const rule = ruleById.get(id)
    if (!rule) continue
    rule.replies = replies(rule).slice(0, plan.keep)
    // Only the escalation beats are stripped. A scene marker like
    // `exposureStarted` is not a rung — it says where we are, not how far in.
    const escalation = new Set(CHAIN)
    replies(rule).forEach((reply, index) => {
      reply.remember = (reply.remember ?? []).filter(
        (flag) => !escalation.has(flag)
      )
      if (index === replies(rule).length - 1 && !reply.remember.includes(plan.back))
        reply.remember.push(plan.back)
    })
  }

  // Leaving becomes a control, not a line of dialogue: the card comes out of
  // the pool so it can never surface mid-scene, and the rule it answers is
  // widened to accept what the button sends.
  const exit = ruleById.get(EXIT_RULE)
  if (exit) exit.patterns = [EXIT_PATTERN]
  // Spliced rather than reassigned: everything downstream holds a reference to
  // this array, and a fresh one would leave the wiring working from a card
  // list the output no longer contains.
  const list = payload.suggestions ?? []
  for (let index = list.length - 1; index >= 0; index -= 1)
    if (list[index].done === 'leftAfterDark') list.splice(index, 1)

  // Cards whose `done` was set by a tier the surgery removed are advertising
  // prose that no longer exists: they can never retire, and they lead nowhere.
  // Dropped here rather than left for the author to trip over later.
  const reachable = new Set()
  for (const rule of rules)
    for (const reply of replies(rule))
      for (const flag of reply.remember ?? []) reachable.add(flag)
  const stranded = list.filter(
    (item) => item.done !== undefined && !reachable.has(item.done)
  )
  for (const item of stranded) {
    console.log(`  ✕ 砍掉指向已刪內容的卡：「${item.text}」(done: ${item.done})`)
    list.splice(list.indexOf(item), 1)
  }

  // The cards were written in one order and the prose reached the same beats
  // in another. The prose wins: which line she cries on is written, whereas a
  // card's gate is bookkeeping. Every ladder card is re-gated on the beat
  // before whatever it accomplishes.
  for (const item of payload.suggestions ?? []) {
    const step = CHAIN.indexOf(item.done)
    if (step <= 0) continue
    const register = (item.needs ?? []).find((flag) => flag.endsWith('Path'))
    item.needs = register ? [CHAIN[step - 1], register] : [CHAIN[step - 1]]
  }
}

const used = new Map()
for (const item of suggestions) {
  const base = item.done ?? 'card'
  const count = (used.get(base) ?? 0) + 1
  used.set(base, count)
  item.id = count === 1 ? base : `${base}.${count}`
}
const byId = new Map(suggestions.map((item) => [item.id, item]))

// Apply the milestone table. This is the bridge for the *unoperated* payload:
// it teaches nine parallel tracks to report where they are on a shared ladder.
// After --apply there is only one ladder and the detours merge explicitly, so
// the table has nothing left to bridge and its source flags are gone with the
// tiers that carried them.
const reverse = new Map()
if (!args.includes('--apply'))
  for (const [milestone, sources] of Object.entries(MILESTONES))
    for (const flag of sources) {
      if (!reverse.has(flag)) reverse.set(flag, [])
      reverse.get(flag).push(milestone)
    }

let added = 0
const unmatched = new Set(reverse.keys())
for (const rule of rules)
  for (const reply of replies(rule)) {
    const extra = new Set()
    for (const flag of reply.remember ?? []) {
      unmatched.delete(flag)
      for (const milestone of reverse.get(flag) ?? [])
        if (!(reply.remember ?? []).includes(milestone)) extra.add(milestone)
    }
    if (extra.size === 0) continue
    reply.remember = [...(reply.remember ?? []), ...extra]
    added += extra.size
  }

// Which flag actually put a card on the table — the most specific of its
// needs, matching how scripts/afterDarkToTwee.js reads the same graph.
const waitingOn = new Map()
for (const item of suggestions)
  for (const flag of item.needs ?? [])
    waitingOn.set(flag, (waitingOn.get(flag) ?? 0) + 1)

const triggerOf = new Map()
for (const item of suggestions) {
  const needs = item.needs ?? []
  if (needs.length === 0) continue
  triggerOf.set(
    item.id,
    needs.reduce((best, flag) =>
      (waitingOn.get(flag) ?? 0) < (waitingOn.get(best) ?? 0) ? flag : best
    )
  )
}

const cardsTriggeredBy = new Map()
for (const [id, flag] of triggerOf) {
  if (!cardsTriggeredBy.has(flag)) cardsTriggeredBy.set(flag, [])
  cardsTriggeredBy.get(flag).push(id)
}

// Derive `offers`: a line puts on the table exactly the cards its own flags
// just unlocked. This is the graph the payload already described through the
// needs/done handshake — made explicit, and capped so no single line turns
// back into a pool.
let wired = 0
for (const rule of rules)
  replies(rule).forEach((reply, index) => {
    const key = `${rule.id}#${index}`
    const authored = SCENE_OFFERS[key]
    const derived = (reply.remember ?? []).flatMap(
      (flag) => cardsTriggeredBy.get(flag) ?? []
    )

    const picked = []
    for (const id of authored ?? derived)
      if (byId.has(id) && !picked.includes(id) && picked.length < MAX_OFFERS)
        picked.push(id)

    // A line that unlocked nothing is mid-scene, not a choice point: leave it
    // to the pool rather than pinning it to a stale set.
    if (picked.length === 0) return
    reply.offers = picked
    wired += 1
  })

// ───────────────────────────────────────────────────────────────────  report

const target = inPlace
  ? sourcePath
  : path.resolve(__dirname, '../content/after-dark.wired.json')
fs.writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`)

// A sidecar rather than a key in the payload: the spine is authoring
// metadata, and the encoded payload should carry only what the engine reads.
// scripts/afterDarkToTwee.js picks this up to lay the spine out as one row —
// guessing it from the graph picks whichever detour happens to be longest.
// The rule ids matter as much as the beats: a detour's last rung also sets a
// beat — that is what merging back means — so a viewer that goes by beats
// alone pulls every detour's tail onto the spine and leaves its body behind.
const spinePath = path.resolve(__dirname, '../content/after-dark.spine.json')
const spineRules = [
  ...new Set(
    SPINE.flatMap((node) => [node.both, node.gentle, node.tool])
      .filter(Boolean)
      .map((ref) => ref.split('#')[0])
  ),
]
fs.writeFileSync(
  spinePath,
  `${JSON.stringify({ chain: CHAIN, rules: spineRules }, null, 2)}\n`
)

console.log(`Wrote ${path.relative(process.cwd(), target)}`)
console.log(
  `${suggestions.length} cards given ids · ${added} milestone flags added · ` +
    `${wired} replies now name their exits`
)
if (unmatched.size > 0)
  console.log(
    `\n⚠ 對照表裡這些 flag 在 payload 中不存在（打錯字或內容已改）:\n  ${[
      ...unmatched,
    ].join(', ')}`
  )
