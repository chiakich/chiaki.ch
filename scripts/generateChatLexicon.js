/* eslint-disable no-console */
const fs = require('fs')
const os = require('os')
const path = require('path')
const zlib = require('zlib')

// Builds the browser word list for /story/terminal from the ChiaKey Lexicon repo.
// That repo is not a dependency of this site — run this by hand when the lexicon
// ships a new release, and commit the generated file.
//
//   node scripts/generateChatLexicon.js [--lexicon <path>] [--min-frequency 0.5]
//
// Output format is documented in lib/terminal/lexicon.ts, which parses it.

const OUT = path.join(
  __dirname,
  '..',
  'public',
  'assets',
  'story',
  'terminal',
  'lexicon.txt'
)
// Readings are only ever used to pronounce Chiaki's own lines, which are a
// fixed 180-line corpus — so they are compiled into the bundle instead of
// shipped as a 296 KB dictionary the page has to download before she can speak.
const READINGS_OUT = path.join(__dirname, '..', 'lib', 'terminal', 'readings.generated.ts')
const RULES_SOURCE = path.join(__dirname, '..', 'lib', 'terminal', 'rules.ts')

const MAX_WORD_LENGTH = 6 // the segmenter's DAG window never looks further
const CJK_ONLY = /^[㐀-䶿一-鿿豈-﫿]+$/
const CJK_ANY = /[㐀-䶿一-鿿豈-﫿]/

const readArg = (flag, fallback) => {
  const index = process.argv.indexOf(flag)
  return index !== -1 ? process.argv[index + 1] : fallback
}

// Print-era NAER entries below this per-million rate are mostly rare compounds
// that a chat segmenter never needs, and they dominate the payload.
const MIN_FREQUENCY = Number(readArg('--min-frequency', '0.5'))
// What an overlay-only word is worth: rarer than anything NAER kept, but still
// preferred over splitting into single characters.
const OVERLAY_FREQUENCY = 0.3

const resolveLexiconRoot = () => {
  const candidates = [
    readArg('--lexicon', null),
    process.env.CHIAKEY_LEXICON,
    path.join(__dirname, '..', '..', 'ChiaKey-Lexicon'),
    path.join(os.homedir(), 'work', 'ChiaKey-Lexicon'),
  ].filter(Boolean)

  const found = candidates.find((dir) =>
    fs.existsSync(path.join(dir, 'sources', 'naer-word-frequency', 'frequency.tsv'))
  )
  if (!found) {
    throw new Error(
      `ChiaKey-Lexicon not found. Tried:\n  ${candidates.join('\n  ')}\n` +
        'Pass --lexicon <path> or set CHIAKEY_LEXICON.'
    )
  }
  return found
}

const readTsv = (file, onRow) => {
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue
    onRow(line.split('\t'))
  }
}

const root = resolveLexiconRoot()
console.log(`lexicon: ${root}`)

const words = new Map() // word -> per-million frequency
const overlayWords = new Set()

const addWord = (word, frequency, { minLength = 1, onlyIfNew = false } = {}) => {
  if (!word || word.length < minLength || word.length > MAX_WORD_LENGTH) return false
  if (!CJK_ONLY.test(word)) return false
  const existing = words.get(word)
  if (existing !== undefined && (onlyIfNew || existing >= frequency)) return false
  words.set(word, frequency)
  return existing === undefined
}

readTsv(
  path.join(root, 'sources', 'naer-word-frequency', 'frequency.tsv'),
  (cols) => {
    const perMillion = Number(cols[1])
    if (Number.isFinite(perMillion) && perMillion >= MIN_FREQUENCY) {
      addWord(cols[0], perMillion)
    }
  }
)
console.log(`naer-word-frequency (>= ${MIN_FREQUENCY}/M): ${words.size} words`)

// An input method's phrase table also holds things people merely type together
// — "我愛你", "很喜歡", "好累". Segmenting those as single units glues pronouns
// and adverbs onto their neighbours, which reads wrong in the HUD and hides the
// content word the terminal wants to echo back. Lexical items don't start or
// end on a function word, so that boundary test throws the collocations out.
const FUNCTION_EDGE = new Set(
  (
    '我 你 妳 他 她 它 們 這 那 很 好 想 要 會 能 該 的 了 是 在 有 都 就 也 不 沒 最 太 ' +
    '超 還 又 再 才 但 而 並 把 被 讓 給 對 從 跟 和 與 之 所 以 為 用 到 去 來 說 看 個 ' +
    '們 呢 嗎 吧 啊 喔 耶 呀 嘛 哦 們 一 兩 每 各 多 少 幾 什 麼 怎 樣 真 好像 覺得'
  )
    .split(' ')
    .filter(Boolean)
)
const isCollocation = (word) =>
  FUNCTION_EDGE.has(word[0]) || FUNCTION_EDGE.has(word[word.length - 1])

// NAER is a print corpus, so it under-weights everyday computing and Taiwanese
// colloquial vocabulary ("輸入法" sits at 0.3/M there, 20/M in libchewing). Fill
// those gaps from the input method's own phrase table, but never let its
// keyboard-biased counts override NAER for a word both corpora already have.
{
  const file = path.join(
    root,
    'sources',
    'libchewing-data',
    'raw',
    'dict',
    'chewing',
    'tsi.csv'
  )
  if (fs.existsSync(file)) {
    const rows = []
    let total = 0
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      if (!line || line.startsWith('#')) continue
      const [word, count] = line.split(',')
      const n = Number(count)
      if (!Number.isFinite(n)) continue
      total += n
      rows.push([word, n])
    }
    const scale = 1e6 / total
    let added = 0
    let rejected = 0
    for (const [word, count] of rows) {
      const perMillion = count * scale
      if (perMillion < MIN_FREQUENCY) continue
      if (word.length > 4) continue
      if (isCollocation(word)) {
        rejected += 1
        continue
      }
      if (addWord(word, perMillion, { minLength: 2, onlyIfNew: true })) added += 1
    }
    console.log(
      `libchewing-data tsi (>= ${MIN_FREQUENCY}/M, new only): +${added} words, ` +
        `${rejected} collocations rejected`
    )
  } else {
    console.warn('skipped missing libchewing-data')
  }
}

// Modern Taiwan / Japan-travel vocabulary and reviewed web-corpus terms — the
// part NAER's print-era table misses ("少子化", "迷因", "台鐵"). These also mark
// which words the terminal treats as "post-war vocabulary" in its replies.
for (const source of ['chiaki-modern-overlay', 'chiaki-web-overlay']) {
  const file = path.join(root, 'sources', source, 'unigrams.tsv')
  if (!fs.existsSync(file)) {
    console.warn(`skipped missing ${source}`)
    continue
  }
  let added = 0
  readTsv(file, (cols) => {
    const word = cols[1]
    // Single characters from the overlays carry no segmentation signal, and
    // marking them "modern" would tag half of ordinary Chinese as post-war.
    if (addWord(word, OVERLAY_FREQUENCY, { minLength: 2 })) added += 1
    if (
      word &&
      word.length >= 2 &&
      word.length <= MAX_WORD_LENGTH &&
      CJK_ONLY.test(word)
    )
      overlayWords.add(word)
  })
  console.log(`${source}: +${added} words`)
}

// The normalized ChiaKey language model stores every Mandarin syllable as a
// two-byte absolute-order qstring, a mixed radix over bopomofo:
//   order = tone * 1232 + final * 88 + medial * 22 + initial
// Reduce each syllable to the three things the terminal's mouth needs, keeping
// the highest-probability reading for polyphonic words. This lets the browser
// animate pronunciation without shipping the 100+ MB SQLite language model.
const decodeSyllable = (encoded) => {
  const order = (encoded.charCodeAt(1) - 48) * 79 + (encoded.charCodeAt(0) - 48)
  return {
    initial: order % 22, // none, ㄅ..ㄙ
    medial: Math.floor(order / 22) % 4, // none, ㄧ, ㄨ, ㄩ
    final: Math.floor(order / (22 * 4)) % 14, // none, ㄚ..ㄦ
    tone: Math.floor(order / (22 * 4 * 14)) % 5, // 0..3 = tones 1-4, 4 = neutral
  }
}

// Which of the five mouth shapes the vowel settles into.
const visemeOfSyllable = ({ medial, final }) => {
  if ([1, 5, 9, 11].includes(final)) return 0 // ㄚ ㄞ ㄢ ㄤ → A
  if ([2, 7, 8].includes(final)) return 4 // ㄛ ㄠ ㄡ → O
  if (medial === 2 || medial === 3) return 2 // ㄨ / ㄩ retain rounding → U
  if (medial === 1 && final === 0) return 1 // I
  return 3 // ㄜ ㄝ ㄟ ㄣ ㄥ ㄦ and apical vowels → E
}

// How far the mouth has to close to *start* the syllable. Without this the
// portrait holds a half-open mouth for the whole line instead of articulating,
// because vowels alone never bring the lips back together.
const onsetOfSyllable = ({ initial }) => {
  if (initial === 0) return 0 // vowel onset, nothing to close
  if (initial <= 3) return 1 // ㄅ ㄆ ㄇ — lips fully together
  if (initial === 4) return 2 // ㄈ — lower lip to teeth
  if (initial <= 10) return 3 // ㄉ ㄊ ㄋ ㄌ ㄍ ㄎ — jaw closes, lips relaxed
  return 4 // ㄏ ㄐ..ㄙ — narrow slit
}

// Neutral-tone syllables are audibly clipped and third tone is the longest, so
// a three-level class is enough to keep the mouth off a metronome.
const lengthOfSyllable = ({ tone }) => (tone === 4 ? 0 : tone === 2 ? 2 : 1)

// One printable ASCII character per syllable, '0'..'z'. Shipping the three
// fields as separate columns instead costs ~80 KB more over the wire.
const packSyllable = (syllable) =>
  String.fromCharCode(
    48 +
      (visemeOfSyllable(syllable) * 5 + onsetOfSyllable(syllable)) * 3 +
      lengthOfSyllable(syllable)
  )

const readings = new Map()
const normalized = path.join(root, 'normalized', 'smart-mandarin.tsv')
if (fs.existsSync(normalized)) {
  readTsv(normalized, (cols) => {
    const [qstring, word, scoreText] = cols
    const length = Array.from(word || '').length
    if (!words.has(word) || qstring.length !== length * 2) return
    const score = Number(scoreText)
    const existing = readings.get(word)
    if (existing && existing.score >= score) return
    let packed = ''
    for (let index = 0; index < qstring.length; index += 2) {
      packed += packSyllable(decodeSyllable(qstring.slice(index, index + 2)))
    }
    readings.set(word, { score, packed })
  })
}

// Log-scale weight buckets. Viterbi only compares sums of these, so ~0.08 of a
// decade per bucket is far finer than the decision needs.
const BUCKETS = 64
const WEIGHT_BASE = 48 // '0'..'o'; deliberately excludes the '*' modern marker
const MIN_LOG = Math.log10(OVERLAY_FREQUENCY)
const MAX_LOG = Math.log10(60000)
const bucketOf = (frequency) => {
  const t = (Math.log10(frequency) - MIN_LOG) / (MAX_LOG - MIN_LOG)
  return Math.min(BUCKETS - 1, Math.max(0, Math.round(t * (BUCKETS - 1))))
}

const sorted = [...words.keys()].sort()

// Front-coded: each line is `<shared prefix length as one digit><suffix><weight
// char>` plus `*` when the modern overlays contributed the word. Sorting makes
// the shared prefixes long, and dropping the delimiters saves ~4 bytes a line.
let previous = ''
const lines = sorted.map((word) => {
  let shared = 0
  const limit = Math.min(previous.length, word.length - 1)
  while (shared < limit && previous[shared] === word[shared]) shared += 1
  previous = word
  const weight = String.fromCharCode(WEIGHT_BASE + bucketOf(words.get(word)))
  return `${shared}${word.slice(shared)}${weight}${overlayWords.has(word) ? '*' : ''}`
})

const body = lines.join('\n')
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, `${body}\n`)

// Everything Chiaki can say lives in single-quoted literals in rules.ts. Pull
// them out so the readings table can be narrowed to just her vocabulary.
const spokenCorpus = (
  fs.readFileSync(RULES_SOURCE, 'utf8').match(/'[^'\n]*'/g) ?? []
)
  .map((literal) => literal.slice(1, -1))
  .filter((line) => CJK_ANY.test(line))
if (spokenCorpus.length === 0) {
  throw new Error(`Extracted no dialogue from ${RULES_SOURCE}; the literal shape must have changed.`)
}
const spokenJoined = spokenCorpus.join(' ')

// Single characters cover any word, including the ones echoed back from user
// input; her own multi-character words are kept as well so polyphones like
// 還/行/了 get the reading the segmenter actually chose.
const charTable = []
const wordTable = []
for (const [word, reading] of [...readings.entries()].sort(([a], [b]) =>
  a.localeCompare(b, 'zh-Hant')
)) {
  if (word.length === 1) charTable.push(word + reading.packed)
  else if (spokenJoined.includes(word)) wordTable.push(`${word}\t${reading.packed}`)
}
const charBody = charTable.join('')
const wordBody = wordTable.join('\n')

fs.writeFileSync(
  READINGS_OUT,
  `// Generated by scripts/generateChatLexicon.js — do not edit.
//
// One packed character per Mandarin syllable, decoded by unpackSyllable in
// lib/terminal/speech.ts. CHARS alternates character and reading; WORDS is
// tab-separated, and covers only the vocabulary Chiaki's own lines use.

export const CHAR_READINGS = ${JSON.stringify(charBody)}

export const WORD_READINGS = ${JSON.stringify(wordBody)}
`
)

console.log(
  `wrote ${sorted.length} words → ${path.relative(path.join(__dirname, '..'), OUT)} ` +
    `(${(Buffer.byteLength(body) / 1024).toFixed(0)} KB raw, ` +
    `~${(zlib.gzipSync(Buffer.from(body), { level: 9 }).length / 1024).toFixed(
      0
    )} KB gzipped)`
)
console.log(
  `wrote readings → ${path.relative(path.join(__dirname, '..'), READINGS_OUT)} ` +
    `(${charTable.length} chars + ${wordTable.length} words from ${spokenCorpus.length} spoken lines, ` +
    `${((Buffer.byteLength(charBody) + Buffer.byteLength(wordBody)) / 1024).toFixed(1)} KB raw, ` +
    `~${(
      zlib.gzipSync(Buffer.from(charBody + wordBody), { level: 9 }).length / 1024
    ).toFixed(1)} KB gzipped)`
)
