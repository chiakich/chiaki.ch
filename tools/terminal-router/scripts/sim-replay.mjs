// Replays the visitor side of recorded simulations, through the embedding router or regex alone.
//   node scripts/sim-replay.mjs <model|regex> <tau> <tag> <id>...   -> build/sim/<id>.<tag>.jsonl
// Strategy is "embedding first, regex fallback": the engine has no hook yet to force a
// fallback, so input under the threshold still goes through the regex matcher.
import { readFileSync, writeFileSync } from 'node:fs'
import * as engine from '../build/engine.mjs'
import { loadRouter } from './router.mjs'
import { SIM, boot } from './sim.mjs'

const { createSession, isAfterDarkActive, jumpTo, opening, respond, rules } = engine

const [modelArg, tauArg, tag, ...ids] = process.argv.slice(2)
const tau = Number(tauArg)
const lexicon = await boot()
const route = modelArg === 'regex' ? null : await loadRouter(modelArg)
const byId = new Map(rules.map((r) => [r.id, r]))

// Seeded per visit, so two engine builds replaying the same input draw the same lines
// and any difference between them is the code, not the dice.
const seeded = (text) => {
  let seed = [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7) || 1
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647
}

for (const id of ids) {
  const live = readFileSync(`${SIM}${id}.jsonl`, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  Math.random = seeded(id)
  const session = createSession()
  const out = [{ turn: 0, input: null, text: opening(session, false), ruleId: 'opening' }]

  for (const rec of live.filter((r) => r.turn > 0 && r.input && r.input !== '#give')) {
    const before = { lastTopic: session.lastTopic, pending: session.pending }
    if (engine.submitName && (rec.input === '#noname' || rec.input.startsWith('#name '))) {
      const turn = engine.submitName(rec.input === '#noname' ? null : rec.input.slice(6), session)
      out.push({ turn: rec.turn, input: rec.input, text: turn.text, ruleId: turn.ruleId, via: 'box', router: null, ...before })
      continue
    }
    // Dry run on a copy to see what regex alone would do with this turn.
    const probe = structuredClone(session)
    const dry = respond(rec.input, probe, lexicon)
    const dryRule = byId.get(dry.ruleId)
    // Turn context beats the router: answers to her question, the explicit
    // branch, and follow-ups that stay on the current topic all keep the regex result.
    const contextual =
      isAfterDarkActive(probe) ||
      dry.ruleId === session.lastTopic ||
      (dryRule !== undefined && dryRule.continues !== undefined)
    const top = contextual || !route ? null : await route(rec.input, session.flags)

    let turn = null, via = 'regex'
    if (top && top.score >= tau) {
      turn = jumpTo(top.rule, session)
      if (turn) via = 'router'
    }
    turn ??= respond(rec.input, session, lexicon)

    const afterDark = isAfterDarkActive(session)
    out.push({
      turn: rec.turn,
      input: rec.input,
      text: afterDark ? '[after-dark]' : turn.text,
      ruleId: turn.ruleId,
      via,
      router: top ? { rule: top.rule, score: +top.score.toFixed(3) } : null,
      ...before,
    })
    if (afterDark) break
  }
  writeFileSync(`${SIM}${id}.${tag}.jsonl`, out.map((r) => JSON.stringify(r)).join('\n') + '\n')
  const n = out.length - 1
  console.log(`${id}: ${n} turns, router took ${out.filter((r) => r.via === 'router').length}`)
}
