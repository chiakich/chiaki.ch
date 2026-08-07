export type Emotion =
  | 'neutral'
  | 'happy'
  | 'shy'
  | 'surprised'
  | 'sad'
  | 'thinking'
  | 'proud'

export type Reply = {
  text: string
  emotion?: Emotion
  /** Link-strength delta, in percentage points. Defaults to +2 on a hit. */
  signal?: number
  /** Topic flags written to the session when this reply fires. */
  remember?: string[]
  /**
   * Only offered once every one of these flags is set. This is how a topic
   * gets deeper the second and third time it comes up instead of repeating:
   * the engine always prefers the deepest reply currently unlocked.
   */
  needs?: string[]
  /** Only offered once the link is at least this strong. */
  minSignal?: number
  /** Arms a follow-up: the next turn can answer this instead of restarting. */
  opens?: string
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
  replies: Reply[]
}

export type Message = {
  id: number
  role: 'user' | 'chiaki' | 'system'
  text: string
  emotion?: Emotion
  /** Which rule produced it — surfaced in the HUD. */
  ruleId?: string
}
