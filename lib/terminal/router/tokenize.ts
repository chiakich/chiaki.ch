// bge-small-zh's BertTokenizer, cut down to what normalize() leaves behind: no
// casing, accents, punctuation or whitespace. Every CJK character is a word of
// its own and every other run goes through WordPiece.
export type Vocab = Map<string, number>

export const parseVocab = (text: string): Vocab =>
  new Map(text.split('\n').map((token, id) => [token, id]))

const UNK = 100
const CLS = 101
const SEP = 102
// Visitors type a sentence or two; the model's own limit is 512.
const MAX_TOKENS = 128
const MAX_WORD = 100

// BERT's own ranges, so a character splits here exactly when it splits there.
const isCjk = (cp: number) =>
  (cp >= 0x4e00 && cp <= 0x9fff) ||
  (cp >= 0x3400 && cp <= 0x4dbf) ||
  (cp >= 0x20000 && cp <= 0x2a6df) ||
  (cp >= 0x2a700 && cp <= 0x2b73f) ||
  (cp >= 0x2b740 && cp <= 0x2b81f) ||
  (cp >= 0x2b820 && cp <= 0x2ceaf) ||
  (cp >= 0xf900 && cp <= 0xfaff) ||
  (cp >= 0x2f800 && cp <= 0x2fa1f)

const wordPiece = (chars: string[], vocab: Vocab, out: number[]) => {
  if (chars.length > MAX_WORD) return void out.push(UNK)
  const pieces: number[] = []
  let start = 0
  while (start < chars.length) {
    let end = chars.length
    let id: number | undefined
    for (; end > start; end--) {
      id = vocab.get((start > 0 ? '##' : '') + chars.slice(start, end).join(''))
      if (id !== undefined) break
    }
    if (id === undefined) return void out.push(UNK)
    pieces.push(id)
    start = end
  }
  out.push(...pieces)
}

export const tokenize = (text: string, vocab: Vocab): number[] => {
  const ids: number[] = []
  let word: string[] = []
  for (const char of text) {
    if (isCjk(char.codePointAt(0)!)) {
      if (word.length > 0) wordPiece(word, vocab, ids)
      word = []
      ids.push(vocab.get(char) ?? UNK)
    } else word.push(char)
  }
  if (word.length > 0) wordPiece(word, vocab, ids)
  return [CLS, ...ids.slice(0, MAX_TOKENS - 2), SEP]
}
