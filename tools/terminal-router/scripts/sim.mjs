// One turn of a simulated visit, driven the way TerminalChat.tsx drives the engine.
//   node scripts/sim.mjs new <id>          opening line + chips
//   node scripts/sim.mjs say <id> <text>   a typed message; "#N" clicks chip N, "#give" presses the ending button
// stdout is only what the visitor would see. The full turn record (rule ids, state) goes to
// build/sim/<id>.jsonl, which the visitor must not read.
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs'
import {
  createSession,
  endingHandover,
  isAfterDarkActive,
  jumpTo,
  loadDirtyContent,
  opening,
  parseLexicon,
  respond,
  setDirtyContent,
  suggestionsFor,
} from '../build/engine.mjs'
import { LEXICON, TOOL } from './paths.mjs'

export const SIM = `${TOOL}build/sim/`
mkdirSync(SIM, { recursive: true })

export const saveSession = (id, state) =>
  writeFileSync(
    `${SIM}${id}.state.json`,
    JSON.stringify({ ...state, session: { ...state.session, flags: [...state.session.flags], used: [...state.session.used] } })
  )

export const loadSession = (id) => {
  const state = JSON.parse(readFileSync(`${SIM}${id}.state.json`, 'utf8'))
  state.session.flags = new Set(state.session.flags)
  state.session.used = new Set(state.session.used)
  state.asked = new Map(state.asked)
  return state
}

export const boot = async () => {
  setDirtyContent(await loadDirtyContent())
  return parseLexicon(readFileSync(LEXICON, 'utf8'))
}

const show = (text, chips, ending) => {
  console.log(`秋狐：${text}`)
  if (ending === 'offer') console.log('〔畫面上出現一個按鈕：「交給她」（輸入 #give 按下）〕')
  if (chips.length) console.log(`〔建議選項〕 ${chips.map((c, i) => `#${i + 1} ${c.text}`).join('  ')}`)
}

const log = (id, record) => appendFileSync(`${SIM}${id}.jsonl`, `${JSON.stringify(record)}\n`)

const main = async () => {
  const [cmd, id, ...rest] = process.argv.slice(2)
  const lexicon = await boot()

  if (cmd === 'new') {
    const session = createSession()
    const text = opening(session, false)
    const state = { session, asked: [], turn: 0, ended: false }
    writeFileSync(`${SIM}${id}.jsonl`, '')
    log(id, { turn: 0, input: null, text, ruleId: 'opening' })
    saveSession(id, state)
    show(text, suggestionsFor(session, new Map()))
    return
  }

  if (cmd !== 'say' || !existsSync(`${SIM}${id}.state.json`)) {
    console.error('usage: sim.mjs new <id> | say <id> <text>')
    process.exit(2)
  }
  const state = loadSession(id)
  if (state.ended) return console.log('〔這段對話已經結束了〕')
  const { session, asked } = state
  const raw = rest.join(' ')
  const before = { lastTopic: session.lastTopic, pending: session.pending }

  let turn, input = raw, chip = null
  if (raw === '#give') {
    turn = endingHandover(session)
  } else if (/^#\d+$/.test(raw)) {
    chip = suggestionsFor(session, asked)[Number(raw.slice(1)) - 1]
    if (!chip) return console.log('〔沒有這個選項〕')
    asked.set(chip.text, (asked.get(chip.text) ?? 0) + 1)
    input = chip.text
    turn = (chip.ruleId ? jumpTo(chip.ruleId, session) : null) ?? respond(chip.text, session, lexicon)
  } else {
    turn = respond(raw, session, lexicon)
  }

  state.turn += 1
  // The explicit branch is out of scope for the simulation: stop before showing any of it.
  const afterDark = isAfterDarkActive(session)
  log(id, {
    turn: state.turn,
    input,
    chip: chip ? chip.text : undefined,
    text: afterDark ? '[after-dark]' : turn.text,
    ruleId: turn.ruleId,
    emotion: turn.emotion,
    signal: Math.round(turn.signal),
    ...before,
  })
  if (afterDark || turn.ending === 'leaving') state.ended = true
  saveSession(id, { ...state, asked: [...asked] })

  if (afterDark) return console.log('〔對話在這裡中斷了。模擬結束。〕')
  show(turn.text, state.ended ? [] : suggestionsFor(session, asked), turn.ending)
  if (turn.ending === 'leaving') console.log('〔她離開了畫面。模擬結束。〕')
}

if (process.argv[1]?.endsWith('sim.mjs')) await main()
