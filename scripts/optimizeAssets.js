const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const sharp = require('sharp')

// Re-encodes art to webp at a sane display size and emits a 400w `-thumb`
// alongside anything big enough to be shown as one. The site serves the results
// as-is, with no CDN transform.
//
// Sources are read from assets-src/ when a matching file is there, otherwise
// from public/assets/ itself. Keeping the untouched originals out of public/
// matters twice over: `output: 'export'` copies public/ into out/ verbatim, so
// anything left there ships to the CDN; and re-encoding an already-lossy webp
// at new settings would stack generation loss instead of starting clean.

const SRC_ROOT = path.join(__dirname, '..', 'assets-src')
const OUT_ROOT = path.join(__dirname, '..', 'public', 'assets')
const CACHE_FILE = path.join(__dirname, 'optimizeAssets.cache.json')
const REWRITE_DIRS = ['components', 'pages', 'lib', 'content', 'i18n', 'scripts']

const SOURCE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']
const MAX_EDGE = 1920
const QUALITY = 78
const THUMB_WIDTH = 400
const THUMB_QUALITY = 75
const THUMB_SUFFIX = '-thumb'
// Files this pipeline produces itself. Feeding them back in would re-encode an
// already-lossy webp on every run.
const DERIVED_SUFFIXES = [THUMB_SUFFIX, '-poster']

// Paths whose bytes other code depends on verbatim.
const SKIP = [
  'fonts', // not images
  'story/character/live2d', // pixi loads these through model3.json
  'works/split-flap', // the PNGs are deliberate <picture> fallbacks
  'story/character/minecraft-skin.png', // skinview3d needs the exact skin bitmap
]

const hash = (buf) => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16)
const kb = (n) => `${(n / 1024).toFixed(0)}KB`
const posix = (p) => p.split(path.sep).join('/')
// Keys carry no extension, so a SKIP entry naming a single file has to lose its
// own before the two can be compared.
const dropExt = (s) => (SOURCE_EXTENSIONS.includes(path.extname(s).toLowerCase()) ? s.slice(0, -path.extname(s).length) : s)
const isSkipped = (key) => SKIP.some((s) => key === dropExt(s) || key.startsWith(`${dropExt(s)}/`))

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile()) out.push(full)
  }
  return out
}

// "blog/foo/01.png" under either root collapses to the key "blog/foo/01", which
// is what pairs a source with the .webp it produces.
const keyOf = (root, file) => {
  const r = posix(path.relative(root, file))
  return r.slice(0, r.length - path.extname(r).length)
}

const collectWork = () => {
  const work = new Map()
  const add = (root, file, isSource) => {
    const ext = path.extname(file).toLowerCase()
    if (!SOURCE_EXTENSIONS.includes(ext)) return
    const key = keyOf(root, file)
    if (isSkipped(key) || DERIVED_SUFFIXES.some((s) => key.endsWith(s))) return
    const entry = work.get(key) ?? { key, source: null, existing: null }
    if (isSource) entry.source = file
    else entry.existing = file
    work.set(key, entry)
  }
  walk(OUT_ROOT).forEach((f) => add(OUT_ROOT, f, false))
  // assets-src wins, so it is applied second
  walk(SRC_ROOT).forEach((f) => add(SRC_ROOT, f, true))
  return [...work.values()]
}

const loadCache = () => {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

async function process(item, cache) {
  const sourcePath = item.source ?? item.existing
  if (!sourcePath) return null

  const source = fs.readFileSync(sourcePath)
  const sourceHash = hash(source)
  const outPath = path.join(OUT_ROOT, `${item.key}.webp`)

  const cached = cache[item.key]
  if (cached && cached.sourceHash === sourceHash && fs.existsSync(outPath)) return null

  const meta = await sharp(source).metadata()
  const encoded = await sharp(source)
    .resize({
      width: Math.min(meta.width, MAX_EDGE),
      height: Math.min(meta.height, MAX_EDGE),
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY })
    .toBuffer()

  // A webp source already smaller than our output is passed through untouched.
  const isWebpSource = path.extname(sourcePath).toLowerCase() === '.webp'
  const output = isWebpSource && encoded.length >= source.length ? source : encoded

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, output)

  // The pre-webp file under public/ is now dead weight, and its path is stale
  // in every component that referenced it.
  let renamed = null
  if (item.existing && path.resolve(item.existing) !== path.resolve(outPath)) {
    fs.unlinkSync(item.existing)
    renamed = { from: posix(path.relative(OUT_ROOT, item.existing)), to: `${item.key}.webp` }
  }

  const outMeta = await sharp(output).metadata()
  let thumb = null
  if (outMeta.width > THUMB_WIDTH * 1.2) {
    const thumbPath = path.join(OUT_ROOT, `${item.key}${THUMB_SUFFIX}.webp`)
    const thumbBuffer = await sharp(source)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer()
    fs.writeFileSync(thumbPath, thumbBuffer)
    thumb = thumbBuffer.length
  }

  cache[item.key] = { sourceHash, width: outMeta.width, height: outMeta.height }

  return { key: item.key, before: source.length, after: output.length, thumb, renamed }
}

// Renaming .png/.jpg to .webp breaks every hardcoded path, so fix them in the
// same pass rather than leaving a trail of 404s to chase.
const TEXT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css']

function rewriteReferences(renames) {
  if (renames.length === 0) return []
  const touched = []
  for (const dir of REWRITE_DIRS) {
    const abs = path.join(__dirname, '..', dir)
    if (!fs.existsSync(abs)) continue
    for (const file of walk(abs)) {
      if (!TEXT_EXTENSIONS.includes(path.extname(file))) continue
      const original = fs.readFileSync(file, 'utf-8')
      let text = original
      for (const { from, to } of renames) {
        text = text.split(`/assets/${from}`).join(`/assets/${to}`)
      }
      if (text !== original) {
        fs.writeFileSync(file, text)
        touched.push(posix(path.relative(path.join(__dirname, '..'), file)))
      }
    }
  }
  return touched
}

async function main() {
  const cache = loadCache()
  const work = collectWork()
  const results = []

  for (const item of work) {
    const result = await process(item, cache)
    if (!result) continue
    results.push(result)
    console.log(
      `${result.key}.webp: ${kb(result.before)} -> ${kb(result.after)}` +
        (result.thumb ? ` +thumb ${kb(result.thumb)}` : '')
    )
  }

  // Drop entries for art that no longer exists, so the cache cannot outlive it.
  const live = new Set(work.map((item) => item.key))
  const pruned = Object.fromEntries(
    Object.keys(cache)
      .filter((k) => live.has(k))
      .sort()
      .map((k) => [k, cache[k]])
  )
  fs.writeFileSync(CACHE_FILE, `${JSON.stringify(pruned, null, 2)}\n`)

  const touched = rewriteReferences(results.map((r) => r.renamed).filter(Boolean))

  if (results.length === 0) {
    console.log(`Nothing to do — all ${work.length} images are up to date.`)
    return
  }
  const before = results.reduce((sum, r) => sum + r.before, 0)
  const after = results.reduce((sum, r) => sum + r.after + (r.thumb ?? 0), 0)
  console.log(`\n${results.length} images: ${kb(before)} -> ${kb(after)}`)
  if (touched.length) console.log(`Rewrote paths in:\n  ${touched.join('\n  ')}`)
}

if (require.main === module) {
  main()
}
