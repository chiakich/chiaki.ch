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
  /** What the user confirmed they are called. */
  userName: string | null
  /** Name she has read off the input but not yet had confirmed. */
  nameGuess: string | null
}

export const createSession = (): Session => ({
  flags: new Set(),
  used: new Set(),
  history: [],
  signal: 62,
  pending: null,
  userName: null,
  nameGuess: null,
})

// Run against the raw input, not the normalised text, so capitalisation and
// spacing in a latin name survive.
const NAME_BODY =
  /([A-Za-z][A-Za-z.'\- ]{0,15}|[㐀-䶿一-鿿豈-﫿]{1,4}|[ぁ-んァ-ヶー]{1,6})/.source
const NAME_EXPLICIT = new RegExp(
  `(?:我(?:的)?名字(?:是|叫做|叫)|我叫做|我叫|(?:可以|你可以|請)?叫我)\\s*${NAME_BODY}`
)
// "我是" is also the start of half the sentences in the language, so it only
// counts as an introduction when the name is the last thing in the input.
const NAME_COPULA = new RegExp(
  `我是\\s*${NAME_BODY}(?=[的了啦喔唷囉呀耶嘛哦嗎呢吧啊，。！？!?.\\s]*$)`
)

// Trailing particles get swept up by the greedy character class above.
const NAME_TAIL = /[的了啦喔唷囉囍呀耶嘛哦嗎呢吧啊，。！？!?.\s]+$/
// "我是" also introduces professions, states and species. Confirming would look
// worse than staying quiet, so the obvious ones never reach the question.
const NON_NAMES = new Set(
  ('人類 人 活人 男人 女人 男的 女的 男生 女生 學生 老師 工程師 設計師 醫生 軍人 士兵 ' +
    '倖存者 幸存者 生存者 難民 旅人 玩家 使用者 使用者本人 你 我 他 她 誰 千秋 涼風千秋 ' +
    '真的 假的 認真的 開玩笑的 新來的 一個人 沒有人 機器人 ai 人工智慧 神 巫女 狐狸 ' +
    // Question words, or the sentence was a question about the name, not one.
    '什麼 甚麼 什麼名字 誰 哪 哪個 名字 這樣 那樣 怎樣 好 不好 對 不對 真 假')
    .split(' ')
    .filter(Boolean)
)

// "我是X" without a naming verb is only an introduction if X could be a name.
// A possessive 的 rules out "你的粉絲", and a leading function word rules out
// "不是很吵" and "喜歡雪的" — those are predicates, not people.
const NOT_NAME_LIKE =
  /的|^[不沒很好太想要會能在有喜愛覺應可就只才又再從跟和對被把給用來去說看知真假第每那這哪誰什]/

/** The name in the input, or null if nothing plausible is being introduced. */
const readName = (raw: string): string | null => {
  let hit = NAME_EXPLICIT.exec(raw)
  if (!hit) {
    const copula = NAME_COPULA.exec(raw.trim())
    if (copula && !NOT_NAME_LIKE.test(copula[1].trim())) hit = copula
  }
  if (!hit) return null
  const raw1 = hit[1].trim()
  const name = raw1.replace(NAME_TAIL, '').trim()
  if (name.length === 0) return null
  // Both forms, because stripping 「的」 off 「真的」 would otherwise smuggle it past.
  if (NON_NAMES.has(name.toLowerCase()) || NON_NAMES.has(raw1.toLowerCase()))
    return null
  return name
}

const fill = (text: string, session: Session) =>
  text
    .replace(/\{guess\}/g, session.nameGuess ?? '你')
    .replace(/\{you\}/g, session.userName ?? '你')

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

const isEligible = (rule: Rule, session: Session, nameHit: string | null) => {
  if (rule.capturesName && nameHit === null) return false
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
  session: Session,
  nameHit: string | null
): Candidate | null => {
  let best: Candidate | null = null

  for (const rule of rules) {
    if (!isEligible(rule, session, nameHit)) continue
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
    if (!rule.keywords || !isEligible(rule, session, nameHit)) continue
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

  const nameHit = readName(raw)
  const match = findRule(input.clauses, input.text, tokens, session, nameHit)
  // An unanswered question only stays open for the turn right after it.
  session.pending = null
  if (match?.rule.capturesName) session.nameGuess = nameHit

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
    if (reply.naming === 'confirm') {
      session.userName = session.nameGuess
      session.flags.add('knowsYou')
    }
    if (reply.naming === 'reject') session.nameGuess = null
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

  // Placeholders expand after `used` has been written, so the dedup key stays
  // the template rather than one session's name.
  return {
    text: degrade(fill(text, session), session.signal, seed * 1000),
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
    text: degrade(fill(line.text, session), session.signal, seed * 1000),
    emotion: line.emotion ?? 'neutral',
    ruleId: 'idle',
    tokens: [],
    signal: session.signal,
  }
}
