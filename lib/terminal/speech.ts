import { segmentAll, type Lexicon } from './lexicon'
import { CHAR_READINGS, WORD_READINGS } from './readings.generated'

// Compiled in rather than fetched: readings are only ever needed for her own
// lines, and the dictionary download used to lose the race against her opening
// line, which then animated on a single flat vowel.
const CHARS = new Map<string, string>()
for (let i = 0; i + 1 < CHAR_READINGS.length; i += 2) {
  CHARS.set(CHAR_READINGS[i], CHAR_READINGS[i + 1])
}

const WORDS = new Map<string, string>()
for (const line of WORD_READINGS.split('\n')) {
  const tab = line.indexOf('\t')
  if (tab !== -1) WORDS.set(line.slice(0, tab), line.slice(tab + 1))
}

/** A mouth pose the avatar interpolates through, in model parameter space. */
export type MouthKey = { at: number; open: number; form: number }

/**
 * Everything above the mouth. People read intent off brows and head far more
 * than off lips, so punctuation drives these rather than only the jaw.
 * All five are added on top of the emotion and the idle pose.
 */
export type GestureKey = {
  at: number
  /** PARAM_BROW_L_Y / PARAM_BROW_R_Y. */
  brow: number
  /** PARAM_ANGLE_Z, degrees. */
  tilt: number
  /** PARAM_ANGLE_Y, degrees — negative dips the chin. */
  nod: number
  /** PARAM_EYE_BALL_X — looking away while she trails off. */
  gaze: number
  /** PARAM_BREATH — the intake before a long clause. */
  breath: number
}

/** When each character joins the transcript. */
export type CharCue = { char: string; at: number }

export type Utterance = {
  keys: MouthKey[]
  gestures: GestureKey[]
  chars: CharCue[]
  duration: number
}

const LONG_PAUSE = /[。！？!?…]/
const EMPHATIC = /[！!]/
const QUERY = /[？?]/
const TRAILING = /[…]/
const SHORT_PAUSE = /[，、；;：:]/
const SILENT = /[\s「」『』（）()[\]—─]/
const CJK_OR_KANA = /[㐀-䶿一-鿿豈-﫿ぁ-ゖァ-ヺー]/

// Faster than conversational Mandarin — the transcript is revealed on this same
// clock, so this is the one number that trades reading pace against how much
// room each syllable gets for its closure → peak → decay.
const SYLLABLE = 128
const LENGTH_SCALE = [0.72, 1, 1.22]

const LONG_PAUSE_MS = 300
const SHORT_PAUSE_MS = 170
const SILENT_MS = 80
/** Word boundaries get a sliver of air so the segmentation is audible. */
const WORD_GAP_MS = 20

// Where the vowel settles. Open is PARAM_MOUTH_OPEN_Y, form is PARAM_MOUTH_FORM;
// both stay short of the parameter limits so an emotion's mouth shape can still
// add on top without clipping.
const VOWELS = [
  { open: 0.78, form: 0 }, // A
  { open: 0.26, form: 0.55 }, // I
  { open: 0.3, form: -0.55 }, // U
  { open: 0.5, form: 0.3 }, // E
  { open: 0.6, form: -0.38 }, // O
] as const

// How far the lips close to start the syllable, and how much of it that takes.
const ONSETS = [
  { open: 0, form: 0, share: 0 }, // V — vowel onset, glides in from the last syllable
  { open: 0, form: 0, share: 0.3 }, // M — ㄅㄆㄇ, lips fully together
  { open: 0.08, form: -0.2, share: 0.26 }, // F — ㄈ, lower lip to teeth
  { open: 0.14, form: 0, share: 0.22 }, // D — ㄉㄊㄋㄌㄍㄎ, jaw closed, lips relaxed
  { open: 0.18, form: 0.28, share: 0.24 }, // S — ㄏㄐ..ㄙ, narrow slit
] as const

/** Inverse of packSyllable in scripts/generateChatLexicon.js. */
const unpackSyllable = (packed: string) => {
  const code = packed.charCodeAt(0) - 48
  const shape = Math.floor(code / 3)
  return {
    vowel: VOWELS[Math.floor(shape / 5)] ?? VOWELS[3],
    onset: ONSETS[shape % 5] ?? ONSETS[0],
    length: LENGTH_SCALE[code % 3] ?? 1,
  }
}

// Latin runs have no reading in the lexicon, so approximate: vowels open the
// mouth, everything else is a consonant that closes it a little.
const latinSyllable = (char: string) => {
  const vowel = 'aiueo'.indexOf(char.toLowerCase())
  return vowel === -1
    ? { vowel: VOWELS[3], onset: ONSETS[3], length: 0.72 }
    : { vowel: VOWELS[vowel], onset: ONSETS[0], length: 1 }
}

type Syllable = ReturnType<typeof unpackSyllable>
type Beat =
  | { kind: 'syllable'; char: string; ms: number; syllable: Syllable }
  | { kind: 'pause'; char: string; ms: number }

/**
 * Builds a mouth and gesture timeline from the same ChiaKey segmentation the
 * terminal uses to understand input. Each syllable is three keyframes — a
 * consonant closure, the vowel peak, and a decay the next closure cuts into —
 * which is what makes it read as articulation rather than a mouth held open for
 * the whole line. Runs in two passes so each vowel can see its neighbour.
 */
export const createUtterance = (
  text: string,
  lexicon: Lexicon | null
): Utterance => {
  const tokens = segmentAll(text, lexicon)
  const beats: Beat[] = []

  tokens.forEach((token, tokenIndex) => {
    // Her own multi-character words first, so polyphones get the reading the
    // segmenter chose; anything else falls back per character.
    const reading = WORDS.get(token.text)

    Array.from(token.text).forEach((char, charIndex) => {
      const pause = LONG_PAUSE.test(char)
        ? LONG_PAUSE_MS
        : SHORT_PAUSE.test(char)
          ? SHORT_PAUSE_MS
          : SILENT.test(char)
            ? SILENT_MS
            : 0
      if (pause > 0) {
        beats.push({ kind: 'pause', char, ms: pause })
        return
      }

      const packed = reading?.[charIndex] ?? CHARS.get(char)
      const syllable = packed
        ? unpackSyllable(packed)
        : CJK_OR_KANA.test(char)
          ? { vowel: VOWELS[3], onset: ONSETS[3], length: 1 }
          : latinSyllable(char)
      beats.push({
        kind: 'syllable',
        char,
        ms: SYLLABLE * syllable.length,
        syllable,
      })
    })

    // A sliver of air at word boundaries, so the segmentation is audible.
    if (tokenIndex < tokens.length - 1 && beats.length > 0) {
      beats[beats.length - 1].ms += WORD_GAP_MS
    }
  })

  const keys: MouthKey[] = []
  const gestures: GestureKey[] = []
  const chars: CharCue[] = []
  let at = 0

  const gesture = (
    offset: number,
    next: Partial<Omit<GestureKey, 'at'>>
  ) => {
    gestures.push({
      at: Math.max(0, at + offset),
      brow: 0,
      tilt: 0,
      nod: 0,
      gaze: 0,
      breath: 0,
      ...next,
    })
  }

  /** Syllables left before the next pause — how long a run she is about to say. */
  const runLength = (from: number) => {
    let n = 0
    while (from + n < beats.length && beats[from + n].kind === 'syllable') n += 1
    return n
  }

  gesture(0, {})

  beats.forEach((beat, index) => {
    chars.push({ char: beat.char, at })

    if (beat.kind === 'pause') {
      keys.push({ at, open: 0, form: 0 })
      keys.push({ at: at + beat.ms * 0.8, open: 0, form: 0 })

      if (EMPHATIC.test(beat.char)) {
        // Anticipation: the brow and the chin lead the exclamation.
        gesture(-140, { brow: 0.34, nod: -2.6 })
        gesture(60, { brow: 0.3, nod: -1.4 })
      } else if (QUERY.test(beat.char)) {
        gesture(-160, { brow: 0.28, tilt: 2.4 })
        gesture(beat.ms * 0.7, { brow: 0.22, tilt: 2.2 })
      } else if (TRAILING.test(beat.char)) {
        // Trailing off: she looks away and stops driving the line.
        gesture(40, { gaze: -0.3, brow: -0.1 })
        gesture(beat.ms * 0.9, { gaze: -0.34, brow: -0.12 })
      }

      // The intake before a long run. Only worth showing when there is enough
      // ahead of it to need the air.
      if (beat.ms >= SHORT_PAUSE_MS && runLength(index + 1) >= 8) {
        gesture(beat.ms * 0.25, { breath: 0.34 })
        gesture(beat.ms * 0.95, { breath: 0.1 })
      }
      gesture(beat.ms, {})
      at += beat.ms
      return
    }

    const { syllable, ms } = beat
    // Coarticulation: a mouth on its way to the next shape never fully reaches
    // this one. Without it every vowel hits its ideal target and the result
    // reads as over-enunciated.
    const following = beats[index + 1]
    const blend =
      following?.kind === 'syllable' ? following.syllable.vowel : syllable.vowel
    const open = syllable.vowel.open * 0.8 + blend.open * 0.2
    const form = syllable.vowel.form * 0.8 + blend.form * 0.2

    const closure = ms * syllable.onset.share
    if (closure > 0) {
      keys.push({ at, open: syllable.onset.open, form: syllable.onset.form })
    }
    keys.push({
      at: at + closure + (ms - closure) * 0.4,
      open,
      form,
    })
    // Trailing decay, not a full close — the next onset does the closing, and
    // running all the way shut between syllables reads as chewing.
    keys.push({ at: at + ms, open: open * 0.55, form: form * 0.7 })
    at += ms
  })

  keys.push({ at: at + 90, open: 0, form: 0 })
  gesture(90, {})
  gestures.sort((a, b) => a.at - b.at)
  return { keys, gestures, chars, duration: at + 90 }
}
