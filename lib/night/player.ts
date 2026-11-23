import {
  applyAmount,
  channelOf,
  evalCond,
  initialState,
  loadScript,
  parseMen,
  pushWave,
  substitute,
  waveSamples,
} from './engine'
import type {
  Choice,
  Eyes,
  Face,
  GameState,
  HotSpot,
  LogEntry,
  Man,
  Mode,
  NightScript,
  Part,
  PlayerStatus,
  Snapshot,
  Summary,
  VisibleChoice,
  WaveKind,
} from './types'

export const STOP_INDEX = -1

const LOG_LIMIT = 400
// Fade to black, then hold long enough for the stage to glide to its new slot unseen.
const SCENE_FADE = 550
const SCENE_HOLD = 700

class Cancelled extends Error {}

export class NightPlayer {
  private script: NightScript
  private state: GameState = initialState()
  private log: LogEntry[] = []
  private status: PlayerStatus = 'idle'
  private choices: VisibleChoice[] = []
  private pending: Choice[] = []
  private input: Snapshot['input'] = null
  private timeout: Snapshot['timeout'] = null
  private summary: Summary | null = null
  private ending: string | null = null
  private gate: Snapshot['gate'] = null
  private shake = 0
  private tremble = 0
  private nod = 0
  private thrust = 0
  private blackout = false
  private hots: HotSpot[] = []
  private hotTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private hotWaiters: (() => void)[] = []
  private nextId = 1
  private run = 0
  private listeners = new Set<() => void>()
  private snapshot: Snapshot
  private wake: (() => void) | null = null
  private hurry = false
  private answer: ((value: number | string) => void) | null = null
  private armedTimeout: { seconds: number; target: string } | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  speed = 1
  // Confirmed once per tab; the script asks again only if this is false.
  adult = false

  constructor() {
    this.script = loadScript()
    this.snapshot = this.build()
  }

  has(id: string) {
    return id in this.script.passages
  }

  get starts() {
    return this.script.starts
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = () => this.snapshot

  private build(): Snapshot {
    return {
      status: this.status,
      state: this.state,
      log: this.log,
      choices: this.choices,
      input: this.input,
      timeout: this.timeout,
      summary: this.summary,
      gate: this.gate,
      shake: this.shake,
      tremble: this.tremble,
      nod: this.nod,
      thrust: this.thrust,
      blackout: this.blackout,
      hots: this.hots,
    }
  }

  private emit() {
    this.snapshot = this.build()
    this.listeners.forEach((listener) => listener())
  }

  private setState(patch: Partial<GameState>) {
    this.state = { ...this.state, ...patch }
  }

  private push(entry: Omit<LogEntry, 'id'>) {
    const chat =
      entry.kind === 'type' || entry.kind === 'unsent' || entry.kind === 'typing'
    const next = {
      ...entry,
      id: this.nextId++,
      ...(chat && this.state.mode === 'perf' && { aside: true }),
    }
    const log = [...this.log, next]
    this.log = log.length > LOG_LIMIT ? log.slice(log.length - LOG_LIMIT) : log
    this.emit()
    return next.id
  }

  private patchEntry(id: number, patch: Partial<LogEntry>) {
    this.log = this.log.map((entry) =>
      entry.id === id ? { ...entry, ...patch } : entry
    )
    this.emit()
  }

  private removeEntry(id: number) {
    this.log = this.log.filter((entry) => entry.id !== id)
    this.emit()
  }

  private guard(token: number) {
    if (token !== this.run) throw new Cancelled()
  }

  private hold(ms: number, token: number) {
    this.guard(token)
    return new Promise<void>((resolve) => setTimeout(resolve, ms)).then(() =>
      this.guard(token)
    )
  }

  private delay(ms: number, token: number) {
    this.guard(token)
    if (this.hurry) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const id = setTimeout(done, ms / this.speed)
      function done() {
        clearTimeout(id)
        resolve()
      }
      this.wake = done
    }).then(() => {
      this.wake = null
      this.guard(token)
    })
  }

  // Taps fast-forward the current beat only; the next line plays at normal speed.
  skip = () => {
    if (this.status !== 'running') return
    this.hurry = true
    this.wake?.()
  }

  stop = () => {
    this.run += 1
    this.clearTimer()
    this.clearHots()
    this.wake?.()
    this.answer = null
    this.status = 'idle'
    this.choices = []
    this.input = null
    this.gate = null
    this.emit()
  }

  reset = () => {
    this.stop()
    this.state = initialState()
    this.log = []
    this.summary = null
    this.thrust = 0
    this.blackout = false
    this.emit()
  }

  start = (id: string) => {
    this.stop()
    this.state = initialState()
    this.log = []
    this.summary = null
    this.ending = null
    this.thrust = 0
    this.blackout = false
    this.armedTimeout = null
    const token = this.run
    this.status = 'running'
    this.emit()
    this.loop(id, token).catch((error) => {
      if (!(error instanceof Cancelled)) throw error
    })
  }

  choose = (index: number) => {
    if (this.status !== 'choosing' || !this.answer) return
    this.answer(index)
  }

  confirmGate = (yes: boolean) => {
    if (this.status !== 'gate' || !this.answer) return
    if (yes) this.adult = true
    this.answer(yes ? 1 : 0)
  }

  submitInput = (text: string) => {
    if (this.status !== 'input' || !this.answer || !text.trim()) return
    this.answer(text.trim())
  }

  private clearHots() {
    this.hotTimers.forEach((timer) => clearTimeout(timer))
    this.hotTimers.clear()
    this.hots = []
    this.flushHotWaiters()
  }

  private flushHotWaiters() {
    if (this.hots.length) return
    const waiters = this.hotWaiters
    this.hotWaiters = []
    waiters.forEach((resolve) => resolve())
  }

  private closeHot(flag: string) {
    const timer = this.hotTimers.get(flag)
    if (timer) clearTimeout(timer)
    this.hotTimers.delete(flag)
    this.hots = this.hots.filter((hot) => hot.flag !== flag)
    this.flushHotWaiters()
  }

  pressHot = (flag: string) => {
    const hot = this.hots.find((item) => item.flag === flag)
    if (!hot) return
    this.closeHot(flag)
    this.setState({
      flags: { ...this.state.flags, [flag]: true },
      // Her body answers the panel at once; the script reacts to the flag later.
      ...(hot.part === 'eyes' ? { eyes: 'closed' as const } : {}),
    })
    this.nod += 1
    this.push({ kind: 'panel', text: hot.label })
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.timeout = null
  }

  // Her typing tracks her pulse: calm lines come out slow, panicked ones in a rush.
  private charMs() {
    const bpm = Math.max(50, this.state.bpm)
    return Math.max(18, 70 - (bpm - 64) * 0.45)
  }

  private async typeOut(id: number, text: string, token: number) {
    const step = this.charMs()
    for (let shown = 1; shown <= text.length; shown += 1) {
      if (this.hurry) break
      this.patchEntry(id, { shown })
      await this.delay(step, token)
    }
    this.patchEntry(id, { shown: text.length })
  }

  private async loop(start: string, token: number) {
    let current: string | null = start
    while (current) {
      this.guard(token)
      current = await this.play(current, token)
    }
  }

  private async play(id: string, token: number): Promise<string | null> {
    const passage = this.script.passages[id]
    if (!passage) {
      this.push({ kind: 'sys', text: `missing passage ${id}` })
      return null
    }
    const { ops } = passage
    let index = 0
    while (index < ops.length) {
      const op = ops[index]
      index += 1
      this.hurry = false
      this.status = 'running'

      switch (op.t) {
        case 'if':
          if (!evalCond(this.state, op.cond)) index = op.skip
          continue
        case 'jump':
          index = op.to
          continue
        case 'pause': {
          const typing = this.push({ kind: 'typing', text: '輸入中…' })
          await this.delay(op.s * 1000, token)
          this.removeEntry(typing)
          continue
        }
        case 'narr':
        case 'say': {
          const text = substitute(this.state, op.text)
          this.push({ kind: op.t, text })
          await this.delay(500 + text.length * 32, token)
          continue
        }
        case 'sys':
          this.push({ kind: 'sys', text: substitute(this.state, op.text) })
          await this.delay(600, token)
          continue
        case 'type': {
          const text = substitute(this.state, op.text)
          const entry = this.push({ kind: 'type', text, shown: 0 })
          await this.typeOut(entry, text, token)
          await this.delay(380, token)
          continue
        }
        case 'unsent': {
          const text = substitute(this.state, op.text)
          const entry = this.push({ kind: 'unsent', text, shown: 0 })
          await this.typeOut(entry, text, token)
          this.hurry = false
          await this.delay(900, token)
          this.patchEntry(entry, { deleting: true })
          for (let shown = text.length - 1; shown >= 0; shown -= 1) {
            if (this.hurry) break
            this.patchEntry(entry, { shown })
            await this.delay(45, token)
          }
          this.patchEntry(entry, { shown: 0, deleting: true })
          await this.delay(500, token)
          continue
        }
        case 'op': {
          const result = await this.applyOp(op.op, op.args, token)
          if (result !== undefined) return result
          continue
        }
      }
    }
    return this.offer(passage.choices, token)
  }

  // Returns a passage id to jump, null to halt, undefined to keep going.
  private async applyOp(
    op: string,
    args: string[],
    token: number
  ): Promise<string | null | undefined> {
    const [arg = ''] = args
    const state = this.state
    switch (op) {
      case 'goto':
        return arg
      case 'end':
        this.status = 'idle'
        this.emit()
        return null
      case 'summary':
        this.showSummary()
        return null
      case 'ending':
        this.ending = args.join(' ')
        this.showSummary()
        return null
      case 'adult': {
        if (this.adult) break
        const yes = await this.ask(() => {
          this.status = 'gate'
          this.gate = { fallback: Boolean(arg) }
        }, token)
        this.gate = null
        this.status = 'running'
        if (yes) break
        if (arg) return arg
        this.reset()
        return null
      }
      case 'warm':
        this.setState({ warmth: Math.max(0, applyAmount(state.warmth, arg)) })
        break
      case 'bpm':
        this.setState({
          bpm: /^[+-]/.test(arg) ? state.bpm + Number(arg) : Number(arg),
        })
        break
      case 'battery':
        this.setState({ battery: Math.max(0, applyAmount(state.battery, arg)) })
        break
      case 'trust':
        this.setState({ trust: applyAmount(state.trust, arg) })
        break
      case 'list': {
        const item = substitute(state, arg)
        if (!state.list.includes(item)) {
          this.setState({ list: [...state.list, item] })
          this.push({ kind: 'sys', text: `千亞紀對你的了解 ＋ ${item}` })
          await this.delay(500, token)
        }
        break
      }
      case 'set':
        this.setState({ flags: { ...state.flags, [arg]: true } })
        break
      case 'unset': {
        const flags = { ...state.flags }
        delete flags[arg]
        this.setState({ flags })
        break
      }
      case 'var': {
        const vars = { ...state.vars }
        if (args[1] === 'none' || args[1] === undefined) delete vars[args[0]]
        else vars[args[0]] = args.slice(1).join(' ')
        this.setState({ vars })
        break
      }
      case 'wave': {
        const man = args[0] as Man
        const kind = args[1] as WaveKind
        const amount = Number(args[2])
        const feelings = { ...state.men[man], [kind]: state.men[man][kind] + amount }
        this.setState({
          men: { ...state.men, [man]: feelings },
          waves: pushWave(state, man, waveSamples(kind, amount)),
        })
        break
      }
      case 'men': {
        this.setState({ men: parseMen(arg, state.men) })
        // Seeded values stand for earlier days, so today's delta starts here.
        this.setState({ channelAtDayStart: channelOf(this.state) })
        break
      }
      case 'target':
        this.setState({ target: arg === 'none' ? null : (arg as Man) })
        break
      case 'mode': {
        if (arg === state.mode) break
        // Scene changes cut through black; taps must not skip the fade.
        this.blackout = true
        this.emit()
        await this.hold(SCENE_FADE, token)
        this.thrust = 0
        this.setState({ mode: arg as Mode, eyes: 'open' })
        this.emit()
        await this.hold(SCENE_HOLD, token)
        this.blackout = false
        break
      }
      case 'thrust':
        this.thrust = arg === 'off' ? 0 : Number(arg) || 0
        break
      case 'day':
        this.setState({
          day: Number(arg),
          channelAtDayStart: channelOf(state),
          waves: { boss: [], guard: [], young: [] },
        })
        break
      case 'dim':
        this.setState({ dim: arg === 'on' })
        break
      case 'shake':
        this.shake += 1
        break
      case 'tremble':
        this.tremble += 1
        break
      case 'face':
        this.setState({ face: arg as Face })
        break
      case 'eyes':
        this.setState({ eyes: arg as Eyes })
        break
      case 'hot': {
        const [part, flag, label, seconds = '6'] = args
        const total = (Number(seconds) * 1000) / this.speed
        this.closeHot(flag)
        this.hots = [
          ...this.hots,
          { flag, part: part as Part, label, deadline: Date.now() + total, total },
        ]
        this.hotTimers.set(
          flag,
          setTimeout(() => {
            this.closeHot(flag)
            this.emit()
          }, total)
        )
        break
      }
      case 'hotwait':
        if (this.hots.length) {
          await new Promise<void>((resolve) => this.hotWaiters.push(resolve))
          this.guard(token)
        }
        break
      case 'timeout':
        this.armedTimeout = { seconds: Number(args[0]), target: args[1] }
        break
      case 'input': {
        const [name, ...prompt] = arg.split(/\s+/)
        const value = await this.ask(() => {
          this.status = 'input'
          this.input = { prompt: prompt.join(' ') }
        }, token)
        this.input = null
        this.status = 'running'
        this.push({ kind: 'you', text: String(value) })
        this.setState({ vars: { ...this.state.vars, [name]: String(value) } })
        break
      }
    }
    this.emit()
    return undefined
  }

  private ask(open: () => void, token: number) {
    this.guard(token)
    return new Promise<number | string>((resolve) => {
      this.answer = (value) => {
        this.answer = null
        resolve(value)
      }
      open()
      this.emit()
    }).then((value) => {
      this.guard(token)
      return value
    })
  }

  private async offer(all: Choice[], token: number): Promise<string | null> {
    const shown = all
      .map((choice, index) => ({ choice, index }))
      .filter(({ choice }) => evalCond(this.state, choice.cond))
    const stop = this.state.mode === 'private' ? this.state.vars.stop : undefined

    if (!shown.length) {
      this.status = 'idle'
      this.emit()
      return null
    }

    const armed = this.armedTimeout
    this.armedTimeout = null

    const value = await this.ask(() => {
      this.status = 'choosing'
      this.choices = shown.map(({ choice, index }) => ({
        index,
        label: substitute(this.state, choice.label),
        group: choice.group,
      }))
      if (stop)
        this.choices.push({ index: STOP_INDEX, label: '先停在這裡', group: null })
      if (armed) {
        const total = (armed.seconds * 1000) / this.speed
        this.timeout = { deadline: Date.now() + total, total }
        this.timer = setTimeout(
          () => this.answer?.(`timeout:${armed.target}`),
          total
        )
      }
    }, token)

    this.clearTimer()
    this.choices = []
    this.status = 'running'

    if (typeof value === 'string') return value.slice('timeout:'.length)
    if (value === STOP_INDEX && stop) {
      this.push({ kind: 'you', text: '先停在這裡' })
      return stop
    }

    const choice = all[value]
    const label = substitute(this.state, choice.label)
    this.push({ kind: choice.group ? 'panel' : 'you', text: label })
    this.applySets(choice)
    return choice.target
  }

  private applySets(choice: Choice) {
    const flags = { ...this.state.flags }
    const vars = { ...this.state.vars }
    for (const set of choice.sets) {
      if (set.flag) flags[set.flag] = true
      if (set.unset) delete flags[set.unset]
      if (set.key) vars[set.key] = set.value ?? ''
    }
    this.setState({ flags, vars })
  }

  private showSummary() {
    const channel = channelOf(this.state)
    this.summary = {
      day: this.state.day,
      ending: this.ending,
      channel,
      delta: channel - this.state.channelAtDayStart,
      battery: this.state.battery,
      trust: this.state.trust,
      list: this.state.list,
      men: this.state.men,
    }
    this.status = 'summary'
    this.emit()
  }
}
