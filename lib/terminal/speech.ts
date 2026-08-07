import { segmentAll, type Lexicon } from './lexicon'

export type SpeechBeat = {
  char: string
  delay: number
  open: number
  form: number
}

const LONG_PAUSE = /[。！？!?…]/
const SHORT_PAUSE = /[，、；;：:]/
const SILENT = /[\s「」『』（）()[\]—─]/
const CJK_OR_KANA = /[㐀-䶿一-鿿豈-﫿ぁ-ゖァ-ヺー]/

const amplitude = (char: string, index: number) => {
  if (LONG_PAUSE.test(char) || SHORT_PAUSE.test(char) || SILENT.test(char)) return 0
  if (CJK_OR_KANA.test(char)) {
    const seed = (char.codePointAt(0) ?? 0) + index * 17
    return 0.24 + (seed % 5) * 0.055
  }
  if (/[aeiou]/i.test(char)) return 0.42
  if (/[0-9a-z]/i.test(char)) return 0.24
  return 0.12
}

const VISEMES: Record<string, { open: number; form: number }> = {
  A: { open: 0.58, form: 0 },
  I: { open: 0.3, form: 0.72 },
  U: { open: 0.32, form: -0.7 },
  E: { open: 0.42, form: 0.42 },
  O: { open: 0.54, form: -0.46 },
}

const latinViseme = (char: string) =>
  VISEMES[char.toUpperCase()] ?? { open: amplitude(char, 0), form: 0 }

/**
 * Builds a restrained viseme timeline from the same ChiaKey lexical
 * segmentation used by the terminal. Its pronunciation table is distilled
 * from the lexicon's qstrings, so polyphonic words use the selected word
 * reading instead of a per-character guess.
 */
export const createSpeechBeats = (
  text: string,
  lexicon: Lexicon | null
): SpeechBeat[] => {
  const beats: SpeechBeat[] = []
  const tokens = segmentAll(text, lexicon)

  tokens.forEach((token, tokenIndex) => {
    const reading = lexicon?.readings.get(token.text)
    Array.from(token.text).forEach((char, charIndex) => {
      const pause = LONG_PAUSE.test(char)
        ? 210
        : SHORT_PAUSE.test(char)
          ? 115
          : SILENT.test(char)
            ? 56
            : CJK_OR_KANA.test(char)
              ? 72
              : 48
      const viseme = reading
        ? VISEMES[reading[charIndex]]
        : /[aeiou]/i.test(char)
          ? latinViseme(char)
          : null
      beats.push({
        char,
        delay:
          pause +
          (charIndex === token.text.length - 1 && tokenIndex < tokens.length - 1
            ? 18
            : 0),
        open: viseme?.open ?? amplitude(char, beats.length),
        form: viseme?.form ?? 0,
      })
    })
  })

  return beats
}
