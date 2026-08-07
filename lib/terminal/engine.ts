import { type Lexicon, segmentAll, type Token } from './lexicon'
import { normalize, STOP_WORDS } from './normalize'
import { DEGRADED, ECHO_TEMPLATES, EXHAUSTED, IDLE, INITIATIVE, rules } from './rules'
import type { Emotion, Reply, Rule } from './types'

export type Turn = {
  text: string
  emotion: Emotion
  /** Rule id, or the fallback layer that produced the line. */
  ruleId: string
  tokens: Token[]
  signal: number
}

export type Session = {
  /** Topic flags written by rules that fired. */
  flags: Set<string>
  /** Reply texts already used, so she doesn't repeat herself verbatim. */
  used: Set<string>
  /** Rule ids in order, most recent last. */
  history: string[]
  /** Link strength shown in the HUD, 0–100. */
  signal: number
  /** Question she just asked, which the next turn is allowed to answer. */
  pending: string | null
}

export const createSession = (): Session => ({
  flags: new Set(),
  used: new Set(),
  history: [],
  signal: 62,
  pending: null,
})

// Below this the archive starts showing through instead of a normal fallback.
const DEGRADED_THRESHOLD = 22
const SIGNAL_FLOOR = 8
const SIGNAL_CEILING = 99

const pick = <T>(options: readonly T[], seed: number) =>
  options[Math.floor(seed * options.length) % options.length]

const isUnlocked = (reply: Reply, session: Session) =>
  (reply.minSignal === undefined || session.signal >= reply.minSignal) &&
  (reply.needs === undefined ||
    reply.needs.every((flag) => session.flags.has(flag)))

/**
 * Prefers the deepest reply the session has unlocked, and among those the ones
 * she hasn't said yet. Topics therefore open up as they are revisited instead
 * of cycling through the same two lines.
 *
 * Returns null once everything unlocked has been said, so the caller can admit
 * as much rather than repeat a line verbatim. `repeatable` rules opt out.
 */
const pickReply = (
  replies: Reply[],
  session: Session,
  seed: number,
  repeatable = false
): Reply | null => {
  const unlocked = replies.filter((reply) => isUnlocked(reply, session))
  const pool = unlocked.length > 0 ? unlocked : replies
  const fresh = pool.filter((reply) => !session.used.has(reply.text))
  if (fresh.length === 0) return repeatable ? pick(pool, seed) : null
  // Deepest tier first, but only among lines she can still say.
  const deepest = Math.max(...fresh.map((reply) => reply.needs?.length ?? 0))
  return pick(
    fresh.filter((reply) => (reply.needs?.length ?? 0) === deepest),
    seed
  )
}

const isEligible = (rule: Rule, session: Session) => {
  if (rule.continues !== undefined && rule.continues !== session.pending)
    return false
  if (rule.requires?.some((flag) => !session.flags.has(flag))) return false
  if (rule.blockedBy?.some((flag) => session.flags.has(flag))) return false
  return true
}

type Candidate = { rule: Rule; score: number }

/**
 * Two-pass match: literal patterns first, then a soft pass that scores rule
 * keywords against the segmenter's tokens. The soft pass is what lets
 * "最近都在收集一些老照片" reach the relics rule without a pattern for it.
 */
const findRule = (
  clauses: string[],
  whole: string,
  tokens: Token[],
  session: Session
): Candidate | null => {
  let best: Candidate | null = null

  for (const rule of rules) {
    if (!isEligible(rule, session)) continue
    const priority = rule.priority ?? 0

    for (const pattern of rule.patterns) {
      // A clause hit beats a whole-string hit: matching inside one clause means
      // the rule covers a self-contained thought, not a stray word two commas away.
      const inClause = clauses.some((clause) => pattern.test(clause))
      if (!inClause && !pattern.test(whole)) continue
      // A rule answering the question she just asked outranks everything, so
      // "好啊" lands on the offer instead of the generic affirmation.
      const score =
        100 + priority * 10 + (inClause ? 5 : 0) + (rule.continues ? 500 : 0)
      if (!best || score > best.score) best = { rule, score }
      break
    }
  }
  if (best) return best

  const words = new Set(tokens.map((token) => token.text))
  for (const rule of rules) {
    if (!rule.keywords || !isEligible(rule, session)) continue
    const hits = rule.keywords.filter((keyword) => words.has(keyword)).length
    if (hits === 0) continue
    const score = hits * 10 + (rule.priority ?? 0)
    if (!best || score > best.score) best = { rule, score }
  }
  return best
}

/** The token most worth echoing back: content-bearing, and the longer the better. */
const topicToken = (tokens: Token[]): Token | null => {
  let best: Token | null = null
  let bestScore = 0
  for (const token of tokens) {
    if (STOP_WORDS.has(token.text)) continue
    if (!/[㐀-䶿一-鿿豈-﫿]/.test(token.text)) continue
    // Single characters are almost always grammatical filler once stop words are
    // gone, so they only win when nothing else is available.
    const score =
      token.text.length * 10 + (token.modern ? 6 : 0) + (token.known ? 3 : 0)
    if (score > bestScore) {
      bestScore = score
      best = token
    }
  }
  return best
}

const clamp = (value: number) =>
  Math.min(SIGNAL_CEILING, Math.max(SIGNAL_FLOOR, value))

/** Punches holes in a line when the link is failing. Cosmetic only. */
const degrade = (text: string, signal: number, seed: number) => {
  if (signal >= DEGRADED_THRESHOLD) return text
  const rate = (DEGRADED_THRESHOLD - signal) / DEGRADED_THRESHOLD
  let out = ''
  for (let i = 0; i < text.length; i += 1) {
    // A cheap deterministic hash keeps the same line stable across re-renders.
    const noise = ((Math.sin((seed + i) * 12.9898) * 43758.5453) % 1 + 1) % 1
    out += noise < rate * 0.28 ? '▓' : text[i]
  }
  return out
}

export const respond = (
  raw: string,
  session: Session,
  lexicon: Lexicon | null
): Turn => {
  const input = normalize(raw)
  const tokens = segmentAll(input.text, lexicon)
  const seed = Math.random()

  const match = findRule(input.clauses, input.text, tokens, session)
  // An unanswered question only stays open for the turn right after it.
  session.pending = null

  let text: string
  let emotion: Emotion = 'neutral'
  let ruleId: string
  let delta: number

  const reply = match
    ? pickReply(match.rule.replies, session, seed, match.rule.repeatable)
    : null

  if (match && reply) {
    text = reply.text
    emotion = reply.emotion ?? 'neutral'
    ruleId = match.rule.id
    delta = reply.signal ?? 2
    session.used.add(reply.text)
    reply.remember?.forEach((flag) => session.flags.add(flag))
    if (reply.opens) session.pending = reply.opens
    if (match.rule.id.startsWith('greeting')) session.flags.add('greeted')
  } else if (match) {
    // She matched the topic but has already said everything she has on it.
    // Admitting that suits a finite lookup table better than repeating a line.
    // Routed through the picker too, so she works through all of these before
    // any of them comes round again.
    const spent = pickReply(EXHAUSTED, session, seed, true)!
    text = spent.text
    emotion = spent.emotion ?? 'neutral'
    ruleId = `exhausted.${match.rule.id}`
    delta = spent.signal ?? -1
    session.used.add(spent.text)
    if (spent.opens) session.pending = spent.opens
  } else if (session.signal < DEGRADED_THRESHOLD) {
    text = pick(DEGRADED, seed)
    emotion = 'sad'
    ruleId = 'fallback.degraded'
    delta = 1
  } else {
    const topic = topicToken(tokens)
    if (topic && topic.text.length >= 2) {
      const bucket = topic.modern
        ? ECHO_TEMPLATES.modern
        : topic.known
          ? ECHO_TEMPLATES.known
          : ECHO_TEMPLATES.unknown
      text = pick(bucket, seed).replace(/\{word\}/g, topic.text)
      emotion = topic.known ? 'thinking' : 'surprised'
      ruleId = `fallback.echo.${topic.modern ? 'modern' : topic.known ? 'known' : 'unknown'}`
      delta = -3
    } else if (input.hasQuestionMark) {
      text = '唔……問題我聽到了，可是這邊沒有存對應的答案。抱歉。'
      emotion = 'sad'
      ruleId = 'fallback.question'
      delta = -4
    } else {
      text = pick(INITIATIVE, seed)
      emotion = 'thinking'
      ruleId = 'fallback.initiative'
      delta = -4
    }
  }

  // Repeated ！ or ？ is a raised voice, so it lands harder in both directions —
  // shouted praise counts for more, and so does being shouted at.
  const weighted = input.emphatic ? delta * 1.5 : delta
  // Diminishing returns on the way up, full weight on the way down. A flat
  // gain pinned the link at the ceiling within twenty turns, which made every
  // minSignal gate open for free and left nothing to lose.
  const headroom = Math.min(1, Math.max(0, (SIGNAL_CEILING - session.signal) / 40))
  session.signal = clamp(
    session.signal + (weighted > 0 ? weighted * headroom : weighted)
  )
  session.history.push(ruleId)

  return {
    text: degrade(text, session.signal, seed * 1000),
    emotion,
    ruleId,
    tokens,
    signal: session.signal,
  }
}

/**
 * What she says into a silence. Runs through the same picker as a reply, so
 * idle lines can open up as the conversation deepens, can arm a follow-up, and
 * never repeat while she still has something new.
 */
export const idle = (session: Session): Turn => {
  const seed = Math.random()
  const line =
    pickReply(IDLE, session, seed) ?? pickReply(IDLE, session, seed, true)!

  session.used.add(line.text)
  line.remember?.forEach((flag) => session.flags.add(flag))
  session.pending = line.opens ?? null
  session.history.push('idle')

  return {
    text: degrade(line.text, session.signal, seed * 1000),
    emotion: line.emotion ?? 'neutral',
    ruleId: 'idle',
    tokens: [],
    signal: session.signal,
  }
}
