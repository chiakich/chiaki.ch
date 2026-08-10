import type { Emotion, Reply, Rule, Suggestion } from './types'

// The explicit branch, kept off the bundle entirely. Same voice, same flag
// vocabulary (`toldNoTouch`, `toldCannotRefuse`, `toldNeeded`, `toldBodyReacts`
// are shared with fox.touch / st.poke in lib/terminal/rules.ts and
// lib/terminal/smalltalk.ts — reuse them rather than inventing new ones, or a
// tier written here will never unlock), but the content itself never ships in
// the repo or the client bundle. It is fetched once from the CDN and merged
// into the live rule table (and suggestion pool) — see `setDirtyContent` in
// ./engine, called from TerminalChat on mount.
//
// This is why the file is a loader, not a table: rules.ts and smalltalk.ts are
// the story as written; this is the story as served, which can be revised,
// geo-restricted, or pulled without a deploy.

const CDN_URL = 'https://cdn.chiaki.ch/story/dirty.json'

// Wire shape: identical to `Rule`/`Reply`, except a pattern is the *source* of
// a RegExp (no slashes, no flags — compiled with 'u' to match every other
// pattern in the table) because JSON cannot carry a RegExp literal.
export type DirtyReplyJSON = {
  text: string
  emotion?: Emotion
  signal?: number
  remember?: string[]
  needs?: string[]
  minSignal?: number
}

export type DirtyRuleJSON = {
  id: string
  priority?: number
  patterns: string[]
  keywords?: string[]
  replies: DirtyReplyJSON[]
}

// Identical to `Suggestion` — listed here rather than reused directly so the
// wire type stays independent of engine internals.
export type DirtySuggestionJSON = {
  text: string
  needs?: string[]
  done?: string
}

/** The whole payload at cdn.chiaki.ch/dirty.json. `suggestions` is optional —
 * a rule reachable only by typing still works with no entry there. */
export type DirtyPayloadJSON = {
  rules: DirtyRuleJSON[]
  suggestions?: DirtySuggestionJSON[]
}

export type DirtyContent = { rules: Rule[]; suggestions: Suggestion[] }

const isString = (value: unknown): value is string => typeof value === 'string'

const compileReply = (raw: unknown): Reply | null => {
  if (typeof raw !== 'object' || raw === null) return null
  const reply = raw as Record<string, unknown>
  if (!isString(reply.text)) return null
  return {
    text: reply.text,
    emotion: isString(reply.emotion) ? (reply.emotion as Emotion) : undefined,
    signal: typeof reply.signal === 'number' ? reply.signal : undefined,
    remember: Array.isArray(reply.remember)
      ? reply.remember.filter(isString)
      : undefined,
    needs: Array.isArray(reply.needs) ? reply.needs.filter(isString) : undefined,
    minSignal: typeof reply.minSignal === 'number' ? reply.minSignal : undefined,
  }
}

const compileRule = (raw: unknown): Rule | null => {
  if (typeof raw !== 'object' || raw === null) return null
  const rule = raw as Record<string, unknown>
  if (
    !isString(rule.id) ||
    !Array.isArray(rule.patterns) ||
    !Array.isArray(rule.replies)
  )
    return null

  const patterns = rule.patterns.filter(isString).flatMap((source) => {
    try {
      return [new RegExp(source, 'u')]
    } catch {
      // A malformed pattern drops only itself, not the whole rule — the CDN
      // payload is untrusted input and one bad entry shouldn't sink the rest.
      return []
    }
  })
  const replies = rule.replies
    .map(compileReply)
    .filter((r): r is Reply => r !== null)
  if (patterns.length === 0 || replies.length === 0) return null

  return {
    id: rule.id,
    priority: typeof rule.priority === 'number' ? rule.priority : undefined,
    patterns,
    keywords: Array.isArray(rule.keywords)
      ? rule.keywords.filter(isString)
      : undefined,
    replies,
  }
}

const compileSuggestion = (raw: unknown): Suggestion | null => {
  if (typeof raw !== 'object' || raw === null) return null
  const suggestion = raw as Record<string, unknown>
  if (!isString(suggestion.text)) return null
  return {
    text: suggestion.text,
    needs: Array.isArray(suggestion.needs)
      ? suggestion.needs.filter(isString)
      : undefined,
    done: isString(suggestion.done) ? suggestion.done : undefined,
  }
}

let pending: Promise<DirtyContent> | null = null

/** Fetches and compiles the CDN payload once; later calls reuse the result. */
export const loadDirtyContent = (): Promise<DirtyContent> => {
  if (!pending) {
    pending = fetch(CDN_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`dirty ${response.status}`)
        return response.json()
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null)
          return { rules: [], suggestions: [] }
        const payload = data as Record<string, unknown>
        const rules = Array.isArray(payload.rules)
          ? payload.rules.map(compileRule).filter((r): r is Rule => r !== null)
          : []
        const suggestions = Array.isArray(payload.suggestions)
          ? payload.suggestions
              .map(compileSuggestion)
              .filter((s): s is Suggestion => s !== null)
          : []
        return { rules, suggestions }
      })
      .catch((error) => {
        pending = null
        throw error
      })
  }
  return pending
}
