// What survives between visits.
//
// Deliberately not the whole session. She keeps what she learned about the
// visitor and drops every record of what she said — which is both the useful
// shape and the in-world one: what flows between individuals is fragments
// about a person, never the transcript.
//
// Mechanically this is what makes a return visit work. Reply tiers gate on a
// mix of visitor facts and topic flags (`needs: ['knowsPeace', 'talkedMaker']`),
// so dropping the topic flags sends every subject back to its opening line,
// while the lines that were *about you* unlock immediately and read as callbacks.

import { type Session, topicTrail } from './engine'

const KEY = 'chiaki.terminal.v1'
const MISS_KEY = 'chiaki.terminal.miss.v1'

/** Facts about the visitor. Everything else is bookkeeping about her own lines. */
const RESUMABLE = new Set([
  'knowsYou',
  // A declined name is a fact about the visitor too: without it she re-asks
  // every visit, and the returning opener claims she never asked at all.
  'refusedName',
  'knowsAlive',
  'knowsPeace',
  'talkedClearSky',
  'heardModern',
  'talkedYear',
  'talkedElsewhen',
  'talkedHope',
  'endingSeen',
])

export type Saved = {
  flags: string[]
  userName: string | null
  /** Words she couldn't place. A fact about the visitor, so it survives too. */
  recalled: string[]
  /**
   * Rule ids of the last topics discussed, most recent last. Topic flags are
   * deliberately dropped so subjects replay from the top; this trail is what
   * lets her still say 「上次聊到○○」 on the next visit — a callback about the
   * conversation, not a save of it. Validated against TOPIC_LABELS on restore.
   */
  topics: string[]
  visits: number
}

/** Long enough to be a word, short enough that a pasted sentence can't get in. */
const isWord = (value: unknown): value is string =>
  typeof value === 'string' && value.length >= 2 && value.length <= 8

export const load = (): Saved | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Saved>
    if (!Array.isArray(parsed.flags)) return null
    return {
      flags: parsed.flags.filter(
        (flag): flag is string => typeof flag === 'string' && RESUMABLE.has(flag)
      ),
      userName: typeof parsed.userName === 'string' ? parsed.userName : null,
      recalled: Array.isArray(parsed.recalled)
        ? parsed.recalled.filter(isWord)
        : [],
      topics: Array.isArray(parsed.topics)
        ? parsed.topics.filter((id): id is string => typeof id === 'string')
        : [],
      visits: typeof parsed.visits === 'number' ? parsed.visits : 0,
    }
  } catch {
    // A corrupt or unavailable store is a first visit, not an error worth
    // surfacing — private browsing hits this path routinely.
    return null
  }
}

// ── miss log ─────────────────────────────────────────────────────────────────
// Inputs that fell through to a fallback layer, kept locally so pattern gaps
// can be diagnosed from real usage instead of guessed at. Read it back with
// `misses()` from a devtools console, or via
// JSON.parse(localStorage['chiaki.terminal.miss.v1']).

export type Miss = {
  /** What the visitor typed, verbatim. */
  text: string
  /** Which fallback layer answered it — `fallback.*` or `resume.*`. */
  ruleId: string
  /** Unix ms. */
  at: number
}

const MISS_LIMIT = 100

export const misses = (): Miss[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MISS_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? (parsed as Miss[]) : []
  } catch {
    return []
  }
}

export const recordMiss = (text: string, ruleId: string) => {
  if (typeof window === 'undefined') return
  try {
    const log = [...misses(), { text, ruleId, at: Date.now() }]
    window.localStorage.setItem(
      MISS_KEY,
      JSON.stringify(log.slice(-MISS_LIMIT))
    )
  } catch {
    // Same policy as `save`: losing diagnostics is fine, throwing is not.
  }
}

export const save = (session: Session, visits: number) => {
  if (typeof window === 'undefined') return
  try {
    const flags = [...session.flags].filter((flag) => RESUMABLE.has(flag))
    const payload: Saved = {
      flags,
      userName: session.userName,
      recalled: session.recalled,
      topics: topicTrail(session),
      visits,
    }
    window.localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    // Quota or a blocked store. Losing continuity is survivable; throwing
    // mid-conversation is not.
  }
}
