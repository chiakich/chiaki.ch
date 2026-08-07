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

import type { Session } from './engine'

const KEY = 'chiaki.terminal.v1'

/** Facts about the visitor. Everything else is bookkeeping about her own lines. */
const RESUMABLE = new Set([
  'knowsYou',
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
  visits: number
}

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
      visits: typeof parsed.visits === 'number' ? parsed.visits : 0,
    }
  } catch {
    // A corrupt or unavailable store is a first visit, not an error worth
    // surfacing — private browsing hits this path routinely.
    return null
  }
}

export const save = (session: Session, visits: number) => {
  if (typeof window === 'undefined') return
  try {
    const flags = [...session.flags].filter((flag) => RESUMABLE.has(flag))
    const payload: Saved = { flags, userName: session.userName, visits }
    window.localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    // Quota or a blocked store. Losing continuity is survivable; throwing
    // mid-conversation is not.
  }
}
