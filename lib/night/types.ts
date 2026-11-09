export type Man = 'boss' | 'guard' | 'young'
export type WaveKind = 'desire' | 'liking' | 'possess'
export type Mode = 'day' | 'perf' | 'private'
export type Part =
  | 'eyes'
  | 'mouth'
  | 'chest'
  | 'hands'
  | 'waist'
  | 'crotch'
  | 'thighs'
export type Face =
  | 'neutral'
  | 'happy'
  | 'shy'
  | 'surprised'
  | 'sad'
  | 'thinking'
  | 'proud'
export type Eyes = 'open' | 'half' | 'closed'

export type Op =
  | { t: 'narr' | 'type' | 'say' | 'sys' | 'unsent'; text: string }
  | { t: 'pause'; s: number }
  | { t: 'if'; cond: string[]; skip: number }
  | { t: 'jump'; to: number }
  | { t: 'op'; op: string; args: string[] }

export type ChoiceSet = {
  flag?: string
  unset?: string
  key?: string
  value?: string
}

export type Choice = {
  label: string
  target: string
  cond: string[]
  sets: ChoiceSet[]
  group: string | null
}

export type Passage = { tags: string[]; ops: Op[]; choices: Choice[] }

export type NightScript = { passages: Record<string, Passage>; starts: string[] }

export type Feelings = Record<WaveKind, number>

export type GameState = {
  day: number
  battery: number
  trust: number
  bpm: number
  mode: Mode
  target: Man | null
  dim: boolean
  face: Face
  eyes: Eyes
  flags: Record<string, true>
  vars: Record<string, string>
  men: Record<Man, Feelings>
  list: string[]
  channelAtDayStart: number
  waves: Record<Man, number[]>
}

export type LogEntry = {
  id: number
  kind: 'narr' | 'type' | 'say' | 'sys' | 'typing' | 'unsent' | 'you' | 'panel'
  text: string
  shown?: number
  deleting?: boolean
  // Typed to the player while a scene is playing, not spoken in it.
  aside?: boolean
}

export type HotSpot = {
  flag: string
  part: Part
  label: string
  deadline: number
  total: number
}

export type VisibleChoice = { index: number; label: string; group: string | null }

export type Summary = {
  day: number
  channel: number
  delta: number
  battery: number
  trust: number
  list: string[]
  men: Record<Man, Feelings>
}

export type PlayerStatus = 'idle' | 'running' | 'choosing' | 'input' | 'summary'

export type Snapshot = {
  status: PlayerStatus
  state: GameState
  log: LogEntry[]
  choices: VisibleChoice[]
  input: { prompt: string } | null
  timeout: { deadline: number; total: number } | null
  summary: Summary | null
  shake: number
  tremble: number
  nod: number
  // Thrusts per minute while she is being taken; 0 when still.
  thrust: number
  blackout: boolean
  hots: HotSpot[]
}
