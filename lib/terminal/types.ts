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
