import type { Feelings, GameState, Man, NightScript, WaveKind } from './types'
import { decodeNightScript } from './script'

export const MEN: Man[] = ['boss', 'guard', 'young']

export const MAN_LABEL: Record<Man, string> = {
  boss: '頭目',
  guard: '打手',
  young: '年輕的',
}

// Most each man's desire can ever add; three together is the only way past 100.
export const CHANNEL_CAP: Record<Man, number> = { boss: 45, guard: 30, young: 35 }
export const CHANNEL_GOAL = 100

const WAVE_LIMIT = 160

const emptyFeelings = (): Feelings => ({ desire: 0, liking: 0, possess: 0 })

export const initialState = (): GameState => ({
  day: 1,
  battery: 6,
  trust: 0,
  bpm: 72,
  mode: 'day',
  target: null,
  dim: false,
  face: 'neutral',
  eyes: 'open',
  flags: {},
  vars: {},
  men: { boss: emptyFeelings(), guard: emptyFeelings(), young: emptyFeelings() },
  list: [],
  channelAtDayStart: 0,
  waves: { boss: [], guard: [], young: [] },
})

export const channelOf = (state: GameState) =>
  MEN.reduce(
    (sum, man) => sum + Math.min(Math.max(state.men[man].desire, 0), CHANNEL_CAP[man]),
    0
  )

let script: NightScript | null = null

export const loadScript = (): NightScript => {
  if (!script) script = decodeNightScript() as NightScript
  return script
}

const COND_TERM = /^(!?)([A-Za-z_][\w]*)(?:(>=|<=|==|!=|>|<)(.+))?$/

const numericVar = (state: GameState, name: string): number | null => {
  switch (name) {
    case 'battery':
      return state.battery
    case 'trust':
      return state.trust
    case 'day':
      return state.day
    case 'bpm':
      return state.bpm
    case 'channel':
      return channelOf(state)
    default:
      return null
  }
}

const evalTerm = (state: GameState, term: string): boolean => {
  const match = term.trim().match(COND_TERM)
  if (!match) return false
  const [, neg, name, cmp, raw] = match
  if (!cmp) {
    const present = Boolean(state.flags[name]) || name in state.vars
    return neg ? !present : present
  }
  const number = numericVar(state, name)
  const left = number ?? state.vars[name]
  const value = raw.trim()
  if (typeof left === 'number' && !Number.isNaN(Number(value))) {
    const right = Number(value)
    switch (cmp) {
      case '>=':
        return left >= right
      case '<=':
        return left <= right
      case '>':
        return left > right
      case '<':
        return left < right
      case '==':
        return left === right
      default:
        return left !== right
    }
  }
  if (cmp === '==') return left === value
  if (cmp === '!=') return left !== value
  return false
}

export const evalCond = (state: GameState, cond: string[]) =>
  cond.every((expr) =>
    expr.split('|').some((alt) => alt.split('&').every((term) => evalTerm(state, term)))
  )

const pad = (value: number) => String(value).padStart(2, '0')

export const substitute = (state: GameState, text: string) =>
  text.replace(/\{(\w+)\}/g, (whole, name: string) => {
    if (name === 'time') {
      const now = new Date()
      return `${pad(now.getHours())}:${pad(now.getMinutes())}`
    }
    return state.vars[name] ?? whole
  })

// "=6" sets, "+2" / "-2" / "2" add.
export const applyAmount = (current: number, raw: string) => {
  const text = raw.trim()
  if (text.startsWith('=')) return Number(text.slice(1))
  return current + Number(text)
}

// The shape is the tell: desire spikes, liking is a smooth swell, possession a widening saw.
export const waveSamples = (kind: WaveKind, amount: number): number[] => {
  const count = 12 + Math.round(Math.abs(amount) * 3)
  const amp = Math.min(1, 0.25 + Math.abs(amount) / 10)
  return Array.from({ length: count }, (_, i) => {
    const jitter = (Math.random() - 0.5) * 0.08
    if (kind === 'desire')
      return (i % 4 === 0 ? amp * (0.75 + Math.random() * 0.25) : amp * 0.12 * Math.random()) + jitter
    if (kind === 'liking') return Math.sin((i / count) * Math.PI * 3) * amp * 0.8
    return ((i % 8) / 8) * amp * (0.6 + (i / count) * 0.4) + jitter
  })
}

export const pushWave = (state: GameState, man: Man, samples: number[]) => {
  const next = [...state.waves[man], ...samples]
  return {
    ...state.waves,
    [man]: next.length > WAVE_LIMIT ? next.slice(next.length - WAVE_LIMIT) : next,
  }
}

// "boss=30/0/8 guard=22/0/0" → desire/liking/possess.
export const parseMen = (raw: string, current: GameState['men']) => {
  const men = { ...current }
  for (const part of raw.split(/\s+/).filter(Boolean)) {
    const [name, values] = part.split('=')
    if (!MEN.includes(name as Man) || !values) continue
    const [desire = 0, liking = 0, possess = 0] = values.split('/').map(Number)
    men[name as Man] = { desire, liking, possess }
  }
  return men
}
