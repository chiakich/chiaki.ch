export type Emotion =
  | 'neutral'
  | 'happy'
  | 'shy'
  | 'surprised'
  | 'sad'
  | 'thinking'
  | 'proud'

export type Reply = {
  /**
   * `{guess}` expands to the name she is currently checking, `{you}` to the
   * confirmed one — both fall back to 「你」, so a line with a placeholder is
   * still safe to say before she knows who she is talking to.
   */
  text: string
  emotion?: Emotion
  /** Link-strength delta, in percentage points. Defaults to +2 on a hit. */
  signal?: number
  /** Topic flags written to the session when this reply fires. */
  remember?: string[]
  /** Topic flags removed from the session when this reply fires. */
  forget?: string[]
  /**
   * Only offered once every one of these flags is set. This is how a topic
   * gets deeper the second and third time it comes up instead of repeating:
   * the engine always prefers the deepest reply currently unlocked.
   */
  needs?: string[]
  /** Only offered once the link is at least this strong. */
  minSignal?: number
  /**
   * Only offered once she has heard at least two words she couldn't place, and
   * expands `{recall}` to one of them. This is how a miss pays off later: the
   * word the visitor used and she had no answer for comes back in a silence, or
   * when a topic runs out, as something she is still turning over.
   */
  needsWord?: boolean
  /** Arms a follow-up: the next turn can answer this instead of restarting. */
  opens?: string
  /** Drops an outstanding follow-up when this reply changes the scene. */
  clearsPending?: boolean
  /** Clears flags created by the after-dark payload before applying this reply. */
  clearsAfterDark?: boolean
  /** Commits or discards the pending name guess. */
  naming?: 'confirm' | 'reject'
}

export type Rule = {
  id: string
  /** Any match fires the rule. Written against normalised text — never use \b. */
  patterns: RegExp[]
  /**
   * Soft match: scored against the segmenter's tokens when no pattern hits.
   * Lets "最近都在收集一些老照片" reach the relics rule without a pattern for it.
   */
  keywords?: string[]
  /** Higher wins when several rules match. Defaults to 0. */
  priority?: number
  /** Only fires once these flags are set. */
  requires?: string[]
  /** Stops firing once any of these flags are set. */
  blockedBy?: string[]
  /** Only fires as the answer to the question `opens` armed last turn. */
  continues?: string
  /**
   * Pulls the user's name out of the raw input into `session.nameGuess`. The
   * rule only becomes a candidate if the extraction survives its plausibility
   * check, so "我是人類" falls through to the survivor rule instead of being
   * read as an introduction.
   */
  capturesName?: boolean
  /**
   * Conversational glue — greetings, thanks, yes/no. Saying these twice is
   * natural, so they are exempt from the no-verbatim-repeat rule that sends
   * exhausted topics to EXHAUSTED instead.
   */
  repeatable?: boolean
  replies: Reply[]
}

/**
 * A prompt offered as a chip under the transcript. Gated on flags like a reply
 * is, so clicking through them alone walks a coherent path: each one retires
 * when its topic has been covered, and the ones it unlocks take its place.
 */
export type Suggestion = {
  text: string
  /** Only offered once every one of these flags is set. */
  needs?: string[]
  /** Retired once this flag is set — she has already covered it. */
  done?: string
}

export type Message = {
  id: number
  role: 'user' | 'chiaki' | 'system'
  text: string
  emotion?: Emotion
  /** Which rule produced it — surfaced in the HUD. */
  ruleId?: string
}
