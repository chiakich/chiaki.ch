import { type Lexicon, segmentAll, type Token } from './lexicon'
import { normalize, STOP_WORDS } from './normalize'
import {
  CURIOSITY,
  DEGRADED,
  ECHO_TEMPLATES,
  ENDING_LEAVE,
  ENDING_OFFER,
  ENDING_RETURN,
  ENDING_TRIGGERS,
  EXHAUSTED,
  IDLE,
  INITIATIVE,
  NAME_ASK,
  NO_ANSWER,
  OPENING_LINES,
  PEACE_DISCOVERY,
  RESUME,
  rules,
  SUGGESTIONS,
  TOPIC_LABELS,
} from './rules'
import { classify, SHAPE_ECHO } from './shapes'
import type { Emotion, Reply, Rule, Suggestion } from './types'

export type Turn = {
  text: string
  emotion: Emotion
  /** Rule id, or the fallback layer that produced the line. */
  ruleId: string
  tokens: Token[]
  signal: number
  /**
   * `offer` — she has asked to see the thing, and the caller should surface the
   * button. `leaving` — she has it and has gone up to look.
   */
  ending?: 'offer' | 'leaving'
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
  /** Open question the next few turns are allowed to answer — see PENDING_TTL. */
  pending: string | null
  /** Turns the open question has gone unanswered. */
  pendingAge: number
  /**
   * Suggestion ids the last line put on the table — see `Reply.offers`. Null
   * means no line has named its exits, so the flag-gated pool stands in.
   * Deliberately not persisted: a restored session re-enters through the pool.
   */
  offered: string[] | null
  /** What the user confirmed they are called. */
  userName: string | null
  /** Name she has read off the input but not yet had confirmed. */
  nameGuess: string | null
  /** How much present-day vocabulary she has heard — see `scoreModern`. */
  modernScore: number
  /** Last substantive topic, so a bare 「為什麼」 has something to attach to. */
  lastTopic: string | null
  /** Topic trail carried over from earlier visits — see `topicTrail`. */
  inheritedTopics: string[]
  /** What she calls the last visit's subject out loud — expands `{lastTopic}`. */
  lastVisitTopic: string | null
  /**
   * Words the visitor used that she had no answer for, oldest first. Spent by
   * `needsWord` replies, which is what turns a miss into a callback later on.
   */
  recalled: string[]
}

/** A link she has held before comes up stronger, but still has to be earned. */
const RETURNING_SIGNAL = 70

export const createSession = (restored?: {
  flags: string[]
  userName: string | null
  recalled?: string[]
  topics?: string[]
} | null): Session => {
  const inherited = (restored?.topics ?? []).filter((id) => id in TOPIC_LABELS)
  const lastVisitTopic =
    inherited.length > 0 ? TOPIC_LABELS[inherited[inherited.length - 1]] : null
  const flags = new Set(restored?.flags ?? [])
  // Session-local, never persisted: the callback lines gate on it, and it is
  // recomputed from the trail every time she comes back up.
  if (lastVisitTopic !== null) flags.add('hasLastTopic')
  return {
    flags,
    used: new Set(),
    history: [],
    signal: restored ? RETURNING_SIGNAL : 62,
    pending: null,
    pendingAge: 0,
    offered: null,
    userName: restored?.userName ?? null,
    nameGuess: null,
    modernScore: 0,
    lastTopic: null,
    inheritedTopics: inherited,
    lastVisitTopic,
    recalled: restored?.recalled ?? [],
  }
}

/** How many topics survive a visit. Enough for a callback, not a transcript. */
const TOPIC_TRAIL_LIMIT = 3

/**
 * The labelled topics this session has touched, oldest first, most recent
 * last — seeded with what earlier visits left behind, so a short return visit
 * doesn't erase the trail. This is what `persist.save` writes back.
 */
export const topicTrail = (session: Session): string[] => {
  const trail = [...session.inheritedTopics]
  for (const id of session.history) {
    if (!(id in TOPIC_LABELS)) continue
    const at = trail.indexOf(id)
    if (at !== -1) trail.splice(at, 1)
    trail.push(id)
  }
  return trail.slice(-TOPIC_TRAIL_LIMIT)
}

/**
 * How many turns an open question stays answerable. One detour mid-answer is
 * normal conversation — she asks about the snow, the visitor says something
 * else first, then answers — so the question has to survive it. By the second
 * unanswered turn the visitor has plainly moved on.
 */
const PENDING_TTL = 2

const armPending = (session: Session, id: string | null) => {
  session.pending = id
  session.pendingAge = 0
}

/** How many unplaceable words she carries. Old ones fall off the front. */
const RECALL_LIMIT = 6

const rememberWord = (session: Session, word: string) => {
  if (session.recalled.includes(word)) return
  session.recalled.push(word)
  if (session.recalled.length > RECALL_LIMIT) session.recalled.shift()
}

/**
 * Never the most recent one: quoting back the word from the turn she is
 * currently answering reads as a parrot, whereas one from earlier reads as her
 * having carried it around.
 */
const recallWord = (session: Session): string | null => {
  const pool = session.recalled.slice(0, -1)
  return pool.length === 0 ? null : pick(pool, Math.random())
}

// A turn that is nothing but a prompt to keep going. Anchored at both ends on
// purpose: 「為什麼」 continues the last topic, but 「為什麼會下雪」 is a question
// about snow and has to reach the snow rule on its own merits.
const FOLLOW_UP =
  /^(為什麼|為何|怎麼會|然後|後來|還有|再說|多說|再多說|說下去|繼續|詳細|舉例|例如|怎麼說|什麼意思|所以|真的|真的假的|是喔|是嗎|那|它|那個|嗯哼)(呢|嗎|啊|喔|吧|咧|了|一點|一些|下去)*$/

// Rules and suggestion chips decoded from the local after-dark payload — see
// lib/terminal/dirty.ts. Empty until `setDirtyContent` resolves, so the table
// works identically before decoding lands; the explicit branch just isn't
// reachable yet.
let dirtyRules: Rule[] = []
let dirtySuggestions: Suggestion[] = []
let dirtySceneFlags = new Set<string>()
let dirtyReplyTexts = new Set<string>()
let dirtyById = new Map<string, Suggestion>()
const RULES_BY_ID = new Map(rules.map((rule) => [rule.id, rule]))

/** All rules currently live: the static table plus the decoded after-dark table. */
const allRules = (): Rule[] => (dirtyRules.length === 0 ? rules : [...rules, ...dirtyRules])

/** Installs decoded rules and suggestions, replacing any set installed earlier. */
export const setDirtyContent = ({ rules: extra, suggestions }: {
  rules: Rule[]
  suggestions: Suggestion[]
}) => {
  for (const rule of dirtyRules) RULES_BY_ID.delete(rule.id)
  dirtyRules = extra
  dirtySceneFlags = new Set(
    extra.flatMap((rule) => rule.replies.flatMap((reply) => reply.remember ?? []))
  )
  dirtyReplyTexts = new Set(
    extra.flatMap((rule) => rule.replies.map((reply) => reply.text))
  )
  for (const rule of dirtyRules) RULES_BY_ID.set(rule.id, rule)
  dirtySuggestions = suggestions
  dirtyById = new Map(
    suggestions.flatMap((item) => (item.id ? [[item.id, item] as const] : []))
  )
}

/** Whether the terminal is currently presenting the explicit branch as its topic. */
export const isAfterDarkActive = (session: Session) =>
  session.flags.has('enteredAfterDark') && !session.flags.has('leftAfterDark')

// Rules that are conversational glue rather than subject matter. Sticking to
// one of these would let 「為什麼」 re-answer 「你好」, which is worse than falling
// through — the follow-up would look like she had lost the thread entirely.
const NON_TOPIC = new Set([
  'player.name',
  'player.name.recall',
  'player.name.unknown',
  'player.ask',
])

const isTopical = (rule: Rule) =>
  !rule.repeatable && rule.continues === undefined && !NON_TOPIC.has(rule.id)

/**
 * The topic a follow-up branch belongs to: `peace.check.no` continues `peace`,
 * `relics.offer.yes` continues `relics`. Without this a 「為什麼」 after a yes/no
 * exchange would reach back past it to whatever was being discussed before.
 */
const baseTopic = (id: string): string | null => {
  const parts = id.split('.')
  for (let i = parts.length - 1; i > 0; i -= 1) {
    const candidate = parts.slice(0, i).join('.')
    const rule = RULES_BY_ID.get(candidate)
    if (rule && isTopical(rule)) return candidate
  }
  return null
}

// Words that only exist in a world where the bomb never went off. The lexicon's
// own `modern` flag catches a lot of this, but it also flags post-war coinage
// she would know perfectly well, so the real giveaways are listed by hand.
const PRESENT_DAY =
  /(手機|智慧型|網路|網際|wifi|上網|google|youtube|instagram|facebook|tiktok|臉書|推特|滑手機|app|應用程式|外送|網購|宅配|捷運|高鐵|公車|電梯|冷氣|冰箱|微波|筆電|平板|螢幕|滑鼠|遊戲機|電視|直播|演唱會|電影院|便利商店|超商|超市|咖啡廳|上班|下班|加班|開會|老闆|同事|上課|考試|大學|打工|薪水|房租|信用卡|疫情|口罩|疫苗|西元|世紀|20\d\d)/

/**
 * How strongly this turn smells of a world that never had the war. Explicit
 * giveaways count double; anything the modern overlays contributed counts once,
 * because those are suggestive rather than conclusive on their own.
 */
const scoreModern = (text: string, tokens: Token[]) => {
  let score = PRESENT_DAY.test(text) ? 2 : 0
  for (const token of tokens)
    if (token.modern && token.text.length >= 2 && !STOP_WORDS.has(token.text))
      score += 1
  return score
}

/** Enough accumulated giveaways that she stops the conversation and asks. */
const PEACE_THRESHOLD = 3

/** Link strength at which asking someone's name stops being a form field. */
const NAME_THRESHOLD = 76

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
  // 千秋 is deliberately absent: sharing her name is handled by the name.same
  // rule, which is a better answer than pretending not to have heard it.
  ('人類 人 活人 男人 女人 男的 女的 男生 女生 學生 老師 工程師 設計師 醫生 軍人 士兵 ' +
    '倖存者 幸存者 生存者 難民 旅人 玩家 使用者 使用者本人 你 我 他 她 誰 ' +
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

/**
 * Extraction for the one turn after she has asked for a name outright. The
 * turn is known to be the answer, so this only has to strip the lead-in —
 * unlike `readName`, which has to prove an arbitrary sentence contains an
 * introduction and therefore refuses anything it cannot vouch for.
 *
 * That difference is the whole point: 「小明」 alone is unreadable in general,
 * and 「我叫千秋」 is rejected out of context because claiming her name is more
 * likely to be a visitor being funny. As a direct answer both are just answers.
 */
const NAME_BARE = new RegExp(`^${NAME_BODY}$`)
const ANSWER_LEAD =
  /^(?:那?我(?:的)?名字(?:是|叫做|叫)|我叫做|我叫|我是|(?:你)?可以叫我|請叫我|叫我)/
// Checked against the whole turn, so a refusal falls through to name.ask.refuse
// instead of being filed as somebody called 「不想」.
const ANSWER_REFUSAL = /^(不|沒|秘密|算了|免|別問|no)|不想|不用|不方便|不告訴/

const readAnswerName = (raw: string): string | null => {
  const trimmed = raw.trim()
  if (ANSWER_REFUSAL.test(trimmed)) return null
  const name = trimmed.replace(ANSWER_LEAD, '').replace(NAME_TAIL, '').trim()
  if (!NAME_BARE.test(name)) return null
  // Still worth screening: 「我是人類」 is an evasion, not an introduction, and
  // filing it as a name would be worse than letting it fall through.
  return NON_NAMES.has(name.toLowerCase()) ? null : name
}

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
    // Only reachable from a `needsWord` reply, which the picker already gated
    // on there being one — the fallback is belt and braces.
    .replace(/\{recall\}/g, () => recallWord(session) ?? '那個東西')
    // Gated behind `hasLastTopic` the same way — the fallback is for safety.
    .replace(/\{lastTopic\}/g, session.lastVisitTopic ?? '上次那件事')

// Below this the archive starts showing through instead of a normal fallback.
const DEGRADED_THRESHOLD = 22
const SIGNAL_FLOOR = 8
const SIGNAL_CEILING = 99

const pick = <T>(options: readonly T[], seed: number) =>
  options[Math.floor(seed * options.length) % options.length]

const isUnlocked = (reply: Reply, session: Session) =>
  (reply.minSignal === undefined || session.signal >= reply.minSignal) &&
  // Two, not one: with a single word the only thing she could quote back is
  // whatever she just heard, which `recallWord` deliberately refuses to use.
  (!reply.needsWord || session.recalled.length >= 2) &&
  (reply.needs === undefined ||
    reply.needs.every((flag) => session.flags.has(flag)))

/**
 * Whether the topic on the table still has an unlocked line she hasn't said.
 * Powers both the resume fallback and the follow-up chip. Quiet while she has
 * a question open — deepening a topic over her own unanswered question would
 * bury it.
 */
const canDeepen = (session: Session): boolean => {
  if (session.pending !== null || session.lastTopic === null) return false
  const rule = RULES_BY_ID.get(session.lastTopic)
  if (!rule || rule.repeatable) return false
  return rule.replies.some(
    (reply) => !session.used.has(reply.text) && isUnlocked(reply, session)
  )
}

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
  // A line that quotes a word she has not heard is broken rather than merely
  // premature, so it is excluded from the relaxed pool too.
  const usable = replies.filter(
    (reply) => !reply.needsWord || session.recalled.length >= 2
  )
  const unlocked = usable.filter((reply) => isUnlocked(reply, session))
  const pool =
    unlocked.length > 0 ? unlocked : usable.length > 0 ? usable : replies
  const fresh = pool.filter((reply) => !session.used.has(reply.text))
  if (fresh.length === 0) return repeatable ? pick(pool, seed) : null
  // Deepest tier first, but only among lines she can still say. `needsWord`
  // counts as a tier of its own: it is unlocked by the conversation having
  // gone somewhere, exactly like a flag, and at tier zero it would be buried
  // under every line the flags have already opened up.
  const depth = (reply: Reply) =>
    (reply.needs?.length ?? 0) + (reply.needsWord ? 1 : 0)
  const deepest = Math.max(...fresh.map(depth))
  return pick(
    fresh.filter((reply) => depth(reply) === deepest),
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
 * A `continues` rule outranks everything else by 500 points, so it must not be
 * satisfied by a stray 「好」 from the middle of an unrelated sentence — that is
 * how 「你覺得羽球好玩嗎」 ends up being read as a yes. An answer to a yes/no
 * question is either short, or it leads with the answer.
 */
const answersQuestion = (pattern: RegExp, clauses: string[], whole: string) => {
  if (whole.length <= 6) return true
  return clauses.some((clause) => pattern.exec(clause)?.index === 0)
}

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

  for (const rule of allRules()) {
    if (!isEligible(rule, session, nameHit)) continue
    const priority = rule.priority ?? 0

    for (const pattern of rule.patterns) {
      // A clause hit beats a whole-string hit: matching inside one clause means
      // the rule covers a self-contained thought, not a stray word two commas away.
      const inClause = clauses.some((clause) => pattern.test(clause))
      if (!inClause && !pattern.test(whole)) continue
      if (rule.continues && !answersQuestion(pattern, clauses, whole)) continue
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
  for (const rule of allRules()) {
    if (!rule.keywords || !isEligible(rule, session, nameHit)) continue
    const hits = rule.keywords.filter((keyword) => words.has(keyword)).length
    if (hits === 0) continue
    // Only the soft pass gets the stickiness bonus. This is where genuine
    // ambiguity lives — a literal pattern hit is evidence about *this* turn and
    // shouldn't be overturned by what was being discussed a moment ago.
    const score =
      hits * 10 +
      (rule.priority ?? 0) +
      (rule.id === session.lastTopic ? 5 : 0)
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

  // Expire before matching, not after — an expired question must not be
  // answerable on the very turn it expires.
  if (session.pending !== null && session.pendingAge >= PENDING_TTL)
    armPending(session, null)

  const nameHit =
    readName(raw) ??
    (session.pending === 'name.ask' ? readAnswerName(raw) : null)
  const match = findRule(input.clauses, input.text, tokens, session, nameHit)

  // Suspicion accumulates across the whole session rather than firing on one
  // word: a single "手機" could be her mishearing, four of them could not.
  // She never interrupts a turn that is answering something she just asked —
  // cutting off her own question would read as a bug, not as a discovery.
  session.modernScore += scoreModern(input.text, tokens)
  const discovering =
    !session.flags.has('askedPeace') &&
    !session.flags.has('knowsPeace') &&
    session.modernScore >= PEACE_THRESHOLD &&
    match?.rule.continues === undefined

  // A `continues` match consumed the open question. Otherwise it stays open
  // and ages toward PENDING_TTL: a question survives a short detour, so the
  // visitor can answer 「有啊」 one turn late and still land on the follow-up.
  if (match?.rule.continues !== undefined) armPending(session, null)
  else if (session.pending !== null) session.pendingAge += 1
  if (match?.rule.capturesName && !discovering) session.nameGuess = nameHit

  // 「為什麼」「然後呢」 carry no topic of their own, so they inherit the last one.
  // An answer to a question she just asked always wins: that is a continuation
  // too, and a more specific one.
  const sticky =
    !discovering &&
    match?.rule.continues === undefined &&
    session.lastTopic !== null &&
    FOLLOW_UP.test(input.text)
      ? (RULES_BY_ID.get(session.lastTopic) ?? null)
      : null

  let text: string
  let emotion: Emotion = 'neutral'
  let ruleId: string
  let delta: number

  let source: Rule | null = null
  let reply: Reply | null = null

  if (discovering) {
    reply = pickReply(PEACE_DISCOVERY, session, seed, true)
  } else {
    if (sticky) {
      reply = pickReply(sticky.replies, session, seed, sticky.repeatable)
      if (reply) source = sticky
    }
    if (!reply && match) {
      reply = pickReply(match.rule.replies, session, seed, match.rule.repeatable)
      if (reply) source = match.rule
    }
  }
  // Whether she recognised the subject at all, even if she has run dry on it.
  const topical = sticky ?? match?.rule ?? null

  if (reply) {
    text = reply.text
    emotion = reply.emotion ?? 'neutral'
    ruleId = discovering ? 'discovery.peacetime' : source!.id
    delta = reply.signal ?? 2
    session.used.add(reply.text)
    if (reply.clearsAfterDark) {
      dirtySceneFlags.forEach((flag) => session.flags.delete(flag))
      dirtyReplyTexts.forEach((text) => session.used.delete(text))
    }
    reply.forget?.forEach((flag) => session.flags.delete(flag))
    reply.remember?.forEach((flag) => session.flags.add(flag))
    if (reply.clearsPending) armPending(session, null)
    if (reply.opens) armPending(session, reply.opens)
    // A line that names its exits replaces the standing set; one that doesn't
    // hands the scene back to the flag-gated pool. Only touched when a reply
    // actually fires, so an EXHAUSTED turn can't strand a chips-only scene
    // with nothing on the table.
    session.offered = reply.offers ?? null
    if (discovering) session.lastTopic = 'peace'
    if (source) {
      if (source.id.startsWith('greeting')) session.flags.add('greeted')
      const topic = isTopical(source) ? source.id : baseTopic(source.id)
      if (topic) session.lastTopic = topic
    }
    if (reply.naming === 'confirm') {
      session.userName = session.nameGuess
      session.flags.add('knowsYou')
      // A volunteered name supersedes an earlier refusal — otherwise the
      // stale flag persists and keeps serving refused-flavoured lines.
      session.flags.delete('refusedName')
    }
    if (reply.naming === 'reject') session.nameGuess = null
  } else if (topical) {
    // She matched the topic but has already said everything she has on it.
    // Admitting that suits a finite lookup table better than repeating a line.
    // Routed through the picker too, so she works through all of these before
    // any of them comes round again.
    const spent = pickReply(EXHAUSTED, session, seed, true)!
    text = spent.text
    emotion = spent.emotion ?? 'neutral'
    ruleId = `exhausted.${topical.id}`
    delta = spent.signal ?? -1
    session.used.add(spent.text)
    if (spent.opens) armPending(session, spent.opens)
  } else if (session.signal < DEGRADED_THRESHOLD) {
    text = pick(DEGRADED, seed)
    emotion = 'sad'
    ruleId = 'fallback.degraded'
    delta = 1
  } else {
    const found = topicToken(tokens)
    // Bounded at both ends. The upper bound matters because the lexicon is
    // fetched and can fail to arrive: without it the segmenter hands back whole
    // sentences, and quoting the visitor's entire sentence back at them is a
    // much worse failure than not naming the subject at all.
    const topic =
      found && found.text.length >= 2 && found.text.length <= 6 ? found : null
    // A word she had no answer for is worth carrying even when this turn is
    // about to answer the shape rather than the subject — that is what makes it
    // come back later as a callback instead of vanishing. Being in the
    // dictionary is not the test: the dictionary has four hundred million
    // characters behind it and knows 「腳踏車」 perfectly well. What matters is
    // that she could not say anything about it. The length floor is there to
    // keep 「天空」-grade filler out of a line that presents the word as the one
    // thing she has been turning over since.
    if (topic && (!topic.known || topic.modern || topic.text.length >= 3))
      rememberWord(session, topic.text)

    // The story hangs on her noticing present-day vocabulary, so those words
    // always get the reaction written for them; the shape layer only handles
    // what would otherwise have been a shrug.
    const shape = classify(input.text)

    // A statement she cannot place, while the topic on the table still has
    // unsaid tiers: she concedes the miss and continues the topic instead of
    // dropping out of it. Only for plain statements — a question deserves at
    // least its shape answered — and never twice in a row, or she turns into
    // a monologue machine. The word above was still remembered, so the miss
    // can pay off later either way.
    const resumable =
      shape === 'plain' &&
      !session.history[session.history.length - 1]?.startsWith('resume.') &&
      canDeepen(session)
        ? (RULES_BY_ID.get(session.lastTopic!) ?? null)
        : null
    const resumeReply = resumable
      ? pickReply(resumable.replies, session, seed)
      : null

    if (topic && topic.modern) {
      // Once she knows where the visitor is from, a word she doesn't have
      // stops being something wrong with her and becomes something to ask
      // about — so the same miss reads as curiosity instead of an apology.
      const bucket = session.flags.has('knowsPeace')
        ? ECHO_TEMPLATES.peace
        : ECHO_TEMPLATES.modern
      text = pick(bucket, seed).replace(/\{word\}/g, topic.text)
      emotion = 'surprised'
      ruleId = 'fallback.echo.modern'
      delta = -2
    } else if (resumable && resumeReply) {
      text = pick(RESUME, seed) + resumeReply.text
      emotion = resumeReply.emotion ?? 'thinking'
      ruleId = `resume.${resumable.id}`
      delta = resumeReply.signal ?? 0
      session.used.add(resumeReply.text)
      resumeReply.remember?.forEach((flag) => session.flags.add(flag))
      if (resumeReply.opens) armPending(session, resumeReply.opens)
    } else if (topic && shape !== 'plain') {
      // She could not answer what was asked, but she can answer the kind of
      // question it was — which is the difference between a reply and a shrug.
      text = pick(SHAPE_ECHO[shape].withWord, seed).replace(
        /\{word\}/g,
        topic.text
      )
      emotion = shape === 'request' ? 'sad' : 'thinking'
      ruleId = `fallback.shape.${shape}`
      delta = -1
    } else if (topic) {
      const bucket = topic.known
        ? ECHO_TEMPLATES.known
        : ECHO_TEMPLATES.unknown
      text = pick(bucket, seed).replace(/\{word\}/g, topic.text)
      emotion = topic.known ? 'thinking' : 'surprised'
      ruleId = `fallback.echo.${topic.known ? 'known' : 'unknown'}`
      delta = -2
    } else {
      // Nothing to name at all. She concedes in one clause — sized to the kind
      // of question, when there was one — and then takes her turn, because a
      // research terminal with an open question is not failing to reply. That
      // is why the concession costs her almost nothing.
      const lead =
        shape !== 'plain'
          ? pick(SHAPE_ECHO[shape].bare, seed)
          : input.hasQuestionMark
            ? pick(NO_ANSWER, seed)
            : ''
      const question = pickReply(CURIOSITY, session, seed)
      if (question) {
        text = lead + question.text
        emotion = question.emotion ?? 'thinking'
        ruleId = 'fallback.curiosity'
        delta = lead ? -1 : (question.signal ?? 0)
        session.used.add(question.text)
        question.remember?.forEach((flag) => session.flags.add(flag))
        if (question.opens) armPending(session, question.opens)
      } else if (shape !== 'plain') {
        // Her questions are spent, but the shape of this one still has an
        // answer — better than opening a topic she has already opened.
        text = lead
        emotion = shape === 'request' ? 'sad' : 'thinking'
        ruleId = `fallback.shape.${shape}`
        delta = -1
      } else {
        text = pick(INITIATIVE, seed)
        emotion = 'thinking'
        ruleId = 'fallback.initiative'
        delta = -3
      }
    }
  }

  // The ending. Not a rule, because the trigger is a conjunction no single
  // pattern could express: she has to know the visitor comes from a world the
  // war never reached, she has to have admitted the hypothesis out loud, and
  // the visitor has to then describe something they made by hand. That is the
  // hypothesis confirming itself, from the one source she could never reach.
  // She asks; what happens next is the visitor's move, not the table's.
  let ending: Turn['ending']
  if (
    source &&
    ENDING_TRIGGERS.has(source.id) &&
    session.flags.has('knowsPeace') &&
    session.flags.has('talkedHypothesis') &&
    !session.flags.has('endingSeen') &&
    !session.flags.has('offeredEnding')
  ) {
    text += ENDING_OFFER
    emotion = 'shy'
    ruleId = 'ending.offer'
    session.flags.add('offeredEnding')
    ending = 'offer'
  }

  // She asks for the visitor's name once the link is strong enough that the
  // question is not intake. Appended rather than substituted: she answers what
  // was asked and *then* asks, which is the order a person does it in. Skipped
  // when she already has a question open, or when she is on her way out.
  // Also skipped in after-dark: that flow is chip-only (no text input), and
  // name.ask.tell needs genuinely typed text to resolve.
  if (
    reply &&
    ending === undefined &&
    session.pending === null &&
    session.signal >= NAME_THRESHOLD &&
    !session.flags.has('knowsYou') &&
    !session.flags.has('askedName') &&
    !session.flags.has('refusedName') &&
    !isAfterDarkActive(session)
  ) {
    text += NAME_ASK
    session.flags.add('askedName')
    armPending(session, 'name.ask')
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
    ending,
  }
}

/** The visitor hands it over. Fired by the button, not by anything they type. */
export const endingHandover = (session: Session): Turn => {
  session.flags.add('endingSeen')
  session.signal = clamp(session.signal + 6)
  return {
    text: fill(ENDING_LEAVE, session),
    emotion: 'surprised',
    ruleId: 'ending.leave',
    tokens: [],
    signal: session.signal,
    ending: 'leaving',
  }
}

/**
 * Fired by a chip, not by anything typed: after-dark's `[[label->target]]`
 * links already know exactly which passage they mean, so this applies that
 * passage's rule directly rather than sending the label text back through
 * `findRule`'s pattern matching. Pattern matching is what a chip click
 * *used* to go through — but two different scenes can have chips whose
 * labels both happen to satisfy some other rule's regex (an unanchored
 * alternative meant for a different passage), and a click landing on the
 * wrong scene there is a bug the visitor can't work around, since after-dark
 * offers no free-text box to correct it with. A direct jump can't mismatch:
 * there is no pattern to accidentally share.
 */
export const jumpTo = (ruleId: string, session: Session): Turn | null => {
  const rule = RULES_BY_ID.get(ruleId)
  if (!rule) return null
  const seed = Math.random()
  const reply = pickReply(rule.replies, session, seed, rule.repeatable)
  if (!reply) return null

  const emotion: Emotion = reply.emotion ?? 'neutral'
  const delta = reply.signal ?? 2
  session.used.add(reply.text)
  if (reply.clearsAfterDark) {
    dirtySceneFlags.forEach((flag) => session.flags.delete(flag))
    dirtyReplyTexts.forEach((usedText) => session.used.delete(usedText))
  }
  reply.forget?.forEach((flag) => session.flags.delete(flag))
  reply.remember?.forEach((flag) => session.flags.add(flag))
  if (reply.clearsPending) armPending(session, null)
  if (reply.opens) armPending(session, reply.opens)
  session.offered = reply.offers ?? null
  if (rule.id.startsWith('greeting')) session.flags.add('greeted')
  const topic = isTopical(rule) ? rule.id : baseTopic(rule.id)
  if (topic) session.lastTopic = topic
  if (reply.naming === 'confirm') {
    session.userName = session.nameGuess
    session.flags.add('knowsYou')
    session.flags.delete('refusedName')
  }
  if (reply.naming === 'reject') session.nameGuess = null

  const headroom = Math.min(1, Math.max(0, (SIGNAL_CEILING - session.signal) / 40))
  session.signal = clamp(
    session.signal + (delta > 0 ? delta * headroom : delta)
  )
  session.history.push(rule.id)

  return {
    text: degrade(fill(reply.text, session), session.signal, seed * 1000),
    emotion,
    ruleId: rule.id,
    tokens: [],
    signal: session.signal,
    ending: undefined,
  }
}

/**
 * The three shallowest main-story prompts still open. SUGGESTIONS is ordered
 * the way the story reads, so taking from the front hands a newcomer the
 * openers and lets the deeper rungs surface as the ones above them retire.
 *
 * `asked` counts how often each was taken, and is a backstop rather than the
 * main mechanism: a prompt normally retires because its `done` flag got set.
 * Taking one more than twice means it is not advancing anything — either it
 * stopped reaching its rule, or the flag it waits on is unreachable — so it
 * steps aside. The allowance is deliberately more than one: several prompts
 * aim at a rule's second or third tier, and those need asking twice.
 */
export const ASK_LIMIT = 3

const eligible = (
  items: Suggestion[],
  session: Session,
  asked: ReadonlyMap<string, number>
) =>
  items.filter(
    (item) =>
      (asked.get(item.text) ?? 0) < ASK_LIMIT &&
      !(item.done !== undefined && session.flags.has(item.done)) &&
      (item.needs === undefined ||
        item.needs.every((flag) => session.flags.has(flag)))
  )

export type SuggestionChip = {
  text: string
  /**
  * `story` — a rung of the SUGGESTIONS ladder. `dirty` — an after-dark option.
  * `follow` — the current topic has unlocked lines she hasn't
   * said, and this chip goes back for them.
   */
  kind: 'story' | 'dirty' | 'follow'
  /**
   * Set on `dirty` chips whose target passage is known: lets the caller jump
   * straight there with `jumpTo` instead of sending `text` through `respond`.
   * Absent on pool-only cards, which have no single fixed destination.
   */
  ruleId?: string
}

// Deliberately a FOLLOW_UP-shaped phrase: it goes through `respond` like any
// typed text and rides the sticky-topic path, so the chip needs no plumbing of
// its own and typing the same words works identically.
export const FOLLOW_CHIP = '再多說一點'

// What the branch's exit control sends. Routed through `respond` like any
// other text so the rule that answers it — and the flags it clears — stay in
// the payload rather than being special-cased in the UI.
export const EXIT_PHRASE = '結束'

/**
 * The exits the last line named, or null when it named none and the pool
 * stands in. `needs` still applies — a conditional exit is worth keeping — but
 * ASK_LIMIT does not: these were chosen by the author for this scene, so they
 * cannot run away the way an ungated pool entry can.
 */
const offeredChoices = (session: Session): Suggestion[] | null => {
  if (session.offered === null) return null
  const resolved = session.offered.flatMap((id) => {
    const item = dirtyById.get(id)
    return item ? [item] : []
  })
  const open = resolved.filter(
    (item) =>
      !(item.done !== undefined && session.flags.has(item.done)) &&
      (item.needs === undefined ||
        item.needs.every((flag) => session.flags.has(flag)))
  )
  // A typo'd id or a scene whose exits are all spent must not leave the
  // visitor staring at an empty row — with no input box there is no way out.
  return open.length > 0 ? open : null
}

export const suggestionsFor = (
  session: Session,
  asked: ReadonlyMap<string, number> = new Map()
): SuggestionChip[] => {
  const chips: SuggestionChip[] = []
  // Tier unlocks are otherwise invisible — nothing tells the visitor that
  // asking again would get a new answer, so the deeper lines mostly go
  // unread. The chip only exists while taking it actually yields one.
  // Kept out of the explicit branch on purpose: it is a deliberately vague
  // prompt that rides the sticky-topic path, and where every other option
  // names a definite destination, one card that lands somewhere unpredictable
  // is exactly what makes a branching scene hard to author against.
  if (canDeepen(session) && !isAfterDarkActive(session))
    chips.push({ text: FOLLOW_CHIP, kind: 'follow' })
  // The explicit branch is entered by an explicit typed message, never by a
  // card on a fresh conversation. From then on, every card must carry a real
  // prerequisite flag. This prevents a malformed or newly edited payload from
  // advertising the branch before its opening rule has actually fired.
  const dirty = eligible(dirtySuggestions, session, asked).filter(
    (item) => (item.needs?.length ?? 0) > 0
  )
  // Once the visitor has explicitly opened this branch, it becomes the active
  // topic: show every currently viable direction and keep the ordinary story
  // ladder out of the same row. The main story cannot use this treatment —
  // several ungated openers deliberately coexist and would overwhelm a new
  // visitor if they all appeared at once.
  if (isAfterDarkActive(session))
    return [
      ...chips,
      ...(offeredChoices(session) ?? dirty).map(
        (item): SuggestionChip => ({
          text: item.text,
          kind: 'dirty',
          ruleId: item.ruleId,
        })
      ),
    ]

  return [
    ...chips,
    ...eligible(SUGGESTIONS, session, asked).map(
      (item): SuggestionChip => ({ text: item.text, kind: 'story' })
    ),
  ].slice(0, chips.length + 3)
}

const address = (
  variants: { named: string; unnamed: string; refused?: string },
  session: Session
) =>
  fill(
    session.userName
      ? variants.named
      : session.flags.has('refusedName')
        ? (variants.refused ?? variants.unnamed)
        : variants.unnamed,
    session
  )

/** The other half of the ending — she comes back, and does not stay. */
export const endingReturn = (session: Session): Turn => ({
  text: address(ENDING_RETURN, session),
  emotion: 'happy',
  ruleId: 'ending.return',
  tokens: [],
  signal: session.signal,
})

/** How she opens, which depends entirely on whether this has happened before. */
export const opening = (session: Session, returning: boolean): string => {
  const afterEnding = session.flags.has('endingSeen')
  // The returning opener ends on 「還好嗎」, so the visitor's first message is
  // allowed to be the answer — see the wellbeing rules in rules.ts.
  if (returning && !afterEnding) armPending(session, 'wellbeing.check')
  return address(
    afterEnding
      ? OPENING_LINES.afterEnding
      : returning
        ? OPENING_LINES.returning
        : OPENING_LINES.fresh,
    session
  )
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
  armPending(session, line.opens ?? null)
  session.history.push('idle')

  return {
    text: degrade(fill(line.text, session), session.signal, seed * 1000),
    emotion: line.emotion ?? 'neutral',
    ruleId: 'idle',
    tokens: [],
    signal: session.signal,
  }
}
