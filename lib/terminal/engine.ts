import { type Lexicon, segmentAll, type Token } from './lexicon'
import { normalize, STOP_WORDS } from './normalize'
import { DEGRADED, ECHO_TEMPLATES, INITIATIVE, rules } from './rules'
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
}

export const createSession = (): Session => ({
  flags: new Set(),
  used: new Set(),
  history: [],
  signal: 62,
})

// Below this the archive starts showing through instead of a normal fallback.
const DEGRADED_THRESHOLD = 22
const SIGNAL_FLOOR = 8
const SIGNAL_CEILING = 99

const pick = <T>(options: readonly T[], seed: number) =>
  options[Math.floor(seed * options.length) % options.length]

/** Prefers a reply she hasn't used yet; falls back to any once they run out. */
const pickReply = (replies: Reply[], session: Session, seed: number): Reply => {
  const fresh = replies.filter((reply) => !session.used.has(reply.text))
  return pick(fresh.length > 0 ? fresh : replies, seed)
}

const isEligible = (rule: Rule, session: Session) => {
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
      const score = 100 + priority * 10 + (inClause ? 5 : 0)
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

  let text: string
  let emotion: Emotion = 'neutral'
  let ruleId: string
  let delta: number

  if (match) {
    const reply = pickReply(match.rule.replies, session, seed)
    text = reply.text
    emotion = reply.emotion ?? 'neutral'
    ruleId = match.rule.id
    delta = reply.signal ?? 2
    session.used.add(reply.text)
    reply.remember?.forEach((flag) => session.flags.add(flag))
    if (match.rule.id.startsWith('greeting')) session.flags.add('greeted')
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

  session.signal = clamp(session.signal + delta)
  session.history.push(ruleId)

  return {
    text: degrade(text, session.signal, seed * 1000),
    emotion,
    ruleId,
    tokens,
    signal: session.signal,
  }
}
