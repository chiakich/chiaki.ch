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
const PRONUNCIATION_OUT = path.join(
  __dirname,
  '..',
  'public',
  'assets',
  'story',
  'terminal',
  'pronunciation.txt'
)

const MAX_WORD_LENGTH = 6 // the segmenter's DAG window never looks further
const CJK_ONLY = /^[㐀-䶿一-鿿豈-﫿]+$/

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
// two-byte absolute-order qstring. Reduce those readings to the five mouth
// shapes used by the terminal, keeping the highest-probability reading for
// polyphonic words. This lets the browser animate pronunciation without
// shipping the 100+ MB SQLite language model.
const visemeOfSyllable = (encoded) => {
  if (encoded.length !== 2) return 'E'
  const order = (encoded.charCodeAt(1) - 48) * 79 + (encoded.charCodeAt(0) - 48)
  const middle = Math.floor(order / 22) % 4 // none, ㄧ, ㄨ, ㄩ
  const vowel = Math.floor(order / (22 * 4)) % 14

  if ([1, 5, 9, 11].includes(vowel)) return 'A' // ㄚ ㄞ ㄢ ㄤ
  if ([2, 7, 8].includes(vowel)) return 'O' // ㄛ ㄠ ㄡ
  if (middle === 2 || middle === 3) return 'U' // ㄨ / ㄩ retain rounding
  if (middle === 1 && vowel === 0) return 'I'
  return 'E' // ㄜ ㄝ ㄟ ㄣ ㄥ ㄦ and apical vowels
}

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
    let visemes = ''
    for (let index = 0; index < qstring.length; index += 2) {
      visemes += visemeOfSyllable(qstring.slice(index, index + 2))
    }
    readings.set(word, { score, visemes })
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

const pronunciationBody = [...readings.entries()]
  .sort(([a], [b]) => a.localeCompare(b, 'zh-Hant'))
  .map(([word, reading]) => `${word}\t${reading.visemes}`)
  .join('\n')
fs.writeFileSync(PRONUNCIATION_OUT, `${pronunciationBody}\n`)

console.log(
  `wrote ${sorted.length} words → ${path.relative(path.join(__dirname, '..'), OUT)} ` +
    `(${(Buffer.byteLength(body) / 1024).toFixed(0)} KB raw, ` +
    `~${(zlib.gzipSync(Buffer.from(body), { level: 9 }).length / 1024).toFixed(
      0
    )} KB gzipped)`
)
console.log(
  `wrote ${readings.size} pronunciations → ${path.relative(
    path.join(__dirname, '..'),
    PRONUNCIATION_OUT
  )} (${(Buffer.byteLength(pronunciationBody) / 1024).toFixed(0)} KB raw, ` +
    `~${(
      zlib.gzipSync(Buffer.from(pronunciationBody), { level: 9 }).length / 1024
    ).toFixed(0)} KB gzipped)`
)
