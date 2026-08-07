const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const sharp = require('sharp')

// One-off (re-runnable) asset pass: re-encode everything under public/assets to
// webp at a sane display size, and emit a 400w `-thumb` next to anything big
// enough to be shown as a thumbnail. Run it after dropping new art in, then
// commit the result — the site serves these files as-is, with no CDN transform.

const ROOT = path.join(__dirname, '..', 'public', 'assets')
const CACHE_FILE = path.join(__dirname, 'optimizeAssets.cache.json')
const REWRITE_DIRS = ['components', 'pages', 'lib', 'content', 'i18n', 'scripts']

const SOURCE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']
const MAX_EDGE = 1920
const QUALITY = 78
const THUMB_WIDTH = 400
const THUMB_QUALITY = 75
const THUMB_SUFFIX = '-thumb'

// Paths whose bytes other code depends on verbatim.
const SKIP = [
  'fonts', // not images
  'story/character/live2d', // pixi loads these through model3.json
  'works/split-flap', // the PNGs are deliberate <picture> fallbacks
  'story/character/minecraft-skin.png', // skinview3d needs the exact skin bitmap
]

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/')
const hash = (buf) => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16)
const isSkipped = (p) => SKIP.some((s) => rel(p) === s || rel(p).startsWith(`${s}/`))

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (isSkipped(full)) continue
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile()) out.push(full)
  }
  return out
}

const loadCache = () => {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

async function processFile(filePath, cache) {
  const ext = path.extname(filePath).toLowerCase()
  if (!SOURCE_EXTENSIONS.includes(ext)) return null
  if (path.basename(filePath, ext).endsWith(THUMB_SUFFIX)) return null

  const source = fs.readFileSync(filePath)
  const key = rel(filePath)
  const webpPath = filePath.slice(0, -ext.length) + '.webp'

  // Re-encoding an already-optimized webp just loses quality, so skip anything
  // whose bytes we recognise from a previous run.
  if (cache[rel(webpPath)] && cache[rel(webpPath)].hash === hash(source)) return null

  const meta = await sharp(source).metadata()
  const output = await sharp(source)
    .resize({
      width: Math.min(meta.width, MAX_EDGE),
      height: Math.min(meta.height, MAX_EDGE),
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY })
    .toBuffer()

  // A webp source that is already smaller than what we would produce stays put.
  const keepOriginal = ext === '.webp' && output.length >= source.length
  const finalBuffer = keepOriginal ? source : output
  if (!keepOriginal) fs.writeFileSync(webpPath, output)
  if (webpPath !== filePath) fs.unlinkSync(filePath)

  const finalMeta = await sharp(finalBuffer).metadata()
  let thumb = null
  if (finalMeta.width > THUMB_WIDTH * 1.2) {
    const thumbPath = webpPath.slice(0, -'.webp'.length) + THUMB_SUFFIX + '.webp'
    const thumbBuffer = await sharp(source)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer()
    fs.writeFileSync(thumbPath, thumbBuffer)
    thumb = { path: rel(thumbPath), bytes: thumbBuffer.length }
  }

  cache[rel(webpPath)] = {
    hash: hash(finalBuffer),
    width: finalMeta.width,
    height: finalMeta.height,
  }

  return {
    from: key,
    to: rel(webpPath),
    before: source.length,
    after: finalBuffer.length,
    thumb,
    renamed: webpPath !== filePath,
  }
}

// Renaming .png/.jpg to .webp breaks every hardcoded path, so fix them in the
// same pass rather than leaving a trail of 404s to chase.
function rewriteReferences(renames) {
  if (renames.length === 0) return []
  const touched = []
  for (const dir of REWRITE_DIRS) {
    const abs = path.join(__dirname, '..', dir)
    if (!fs.existsSync(abs)) continue
    for (const file of walk2(abs)) {
      let text = fs.readFileSync(file, 'utf-8')
      const original = text
      for (const { from, to } of renames) {
        text = text.split(`/assets/${from}`).join(`/assets/${to}`)
      }
      if (text !== original) {
        fs.writeFileSync(file, text)
        touched.push(path.relative(path.join(__dirname, '..'), file))
      }
    }
  }
  return touched
}

const TEXT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css']
const walk2 = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk2(full, out)
    else if (TEXT_EXTENSIONS.includes(path.extname(entry.name))) out.push(full)
  }
  return out
}

const kb = (n) => `${(n / 1024).toFixed(0)}KB`

async function main() {
  const cache = loadCache()
  const files = walk(ROOT)
  const results = []

  for (const file of files) {
    const result = await processFile(file, cache)
    if (!result) continue
    results.push(result)
    const thumbNote = result.thumb ? ` +thumb ${kb(result.thumb.bytes)}` : ''
    console.log(`${result.to}: ${kb(result.before)} -> ${kb(result.after)}${thumbNote}`)
  }

  fs.writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`)

  const renames = results.filter((r) => r.renamed).map(({ from, to }) => ({ from, to }))
  const touched = rewriteReferences(renames)

  const before = results.reduce((sum, r) => sum + r.before, 0)
  const after = results.reduce(
    (sum, r) => sum + r.after + (r.thumb ? r.thumb.bytes : 0),
    0
  )
  console.log(`\n${results.length} images: ${kb(before)} -> ${kb(after)}`)
  if (touched.length) console.log(`Rewrote paths in:\n  ${touched.join('\n  ')}`)
}

if (require.main === module) {
  main()
}
