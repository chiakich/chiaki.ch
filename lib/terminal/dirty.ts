import type { Emotion, Reply, Rule, Suggestion } from './types'
import { decodeAfterDarkPayload } from './after-dark'

// The explicit branch. Same voice, same flag
// vocabulary (`toldNoTouch`, `toldCannotRefuse`, `toldNeeded`, `toldBodyReacts`
// are shared with fox.touch / st.poke in lib/terminal/rules.ts and
// lib/terminal/smalltalk.ts — reuse them rather than inventing new ones, or a
// tier written here will never unlock). The content is kept in the locally
// obfuscated `after-dark.ts` payload and merged into the live rule table (and
// suggestion pool) — see `setDirtyContent` in ./engine, called from
// TerminalChat on mount.
//
// This is why the file is a loader, not a table: rules.ts and smalltalk.ts are
// the story as written; this module compiles the separate payload into the
// same runtime shape without putting its prose in the main source files.

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
  /** Arms a follow-up: the very next turn can answer this via a rule with matching `continues`. */
  opens?: string
}

export type DirtyRuleJSON = {
  id: string
  priority?: number
  patterns: string[]
  keywords?: string[]
  /**
   * Gates the whole rule out of matching until these flags are set — not just
   * which reply is picked, but whether the rule is even a candidate. Any rule
   * whose replies are *all* gated behind `needs` (no zero-needs base reply)
   * should set the matching `requires` here, or a stray pattern hit before the
   * prerequisite flag exists will fall through `pickReply`'s no-unlocked-reply
   * fallback and jump straight to the deepest, most advanced line instead of
   * being skipped.
   */
  requires?: string[]
  /** Stops the rule from matching once any of these flags are set. */
  blockedBy?: string[]
  /**
   * Only fires as the direct answer to the `opens` a reply armed last turn —
   * gated to that one turn (`session.pending`), scored +500 over everything
   * else. Safe to use much broader/shorter patterns here than a normal rule
   * would risk, since the rule is not even a candidate outside that window.
   */
  continues?: string
  replies: DirtyReplyJSON[]
}

// Identical to `Suggestion` — listed here rather than reused directly so the
// wire type stays independent of engine internals.
export type DirtySuggestionJSON = {
  text: string
  needs?: string[]
  done?: string
}

/** The whole local payload. `suggestions` is optional —
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
    opens: isString(reply.opens) ? reply.opens : undefined,
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
      // A malformed pattern drops only itself, not the whole payload — one
      // bad entry shouldn't sink the rest of the branch.
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
    requires: Array.isArray(rule.requires)
      ? rule.requires.filter(isString)
      : undefined,
    blockedBy: Array.isArray(rule.blockedBy)
      ? rule.blockedBy.filter(isString)
      : undefined,
    continues: isString(rule.continues) ? rule.continues : undefined,
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

/** Decodes and compiles the local payload once; later calls reuse the result. */
export const loadDirtyContent = (): Promise<DirtyContent> => {
  if (!pending) {
    pending = Promise.resolve()
      .then(() => decodeAfterDarkPayload())
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
