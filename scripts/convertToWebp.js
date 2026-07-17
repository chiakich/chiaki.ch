const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// Converts png/jpg/jpeg assets to webp, skipping public/assets/story
// (large portfolio images handled separately via cf image resizing) and
// public/assets/works (already webp-first, some PNGs are intentional
// <picture> fallbacks for browsers without webp support).
const ROOT = path.join(__dirname, '../public/assets')
const CONVERTIBLE_EXTENSIONS = ['.png', '.jpg', '.jpeg']
const EXCLUDE_DIRS = [path.join(ROOT, 'story'), path.join(ROOT, 'works')]

function isExcluded(fullPath) {
  return EXCLUDE_DIRS.some((dir) => fullPath.startsWith(dir))
}

function walkDir(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (isExcluded(fullPath)) return
    if (entry.isDirectory()) {
      walkDir(fullPath, callback)
    } else if (entry.isFile()) {
      callback(fullPath)
    }
  })
}

async function convert(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (!CONVERTIBLE_EXTENSIONS.includes(ext)) return null

  const webpPath = filePath.slice(0, -ext.length) + '.webp'
  const buffer = fs.readFileSync(filePath)
  const output = await sharp(buffer).webp({ quality: 82 }).toBuffer()
  fs.writeFileSync(webpPath, output)
  fs.unlinkSync(filePath)

  const originalSize = buffer.length
  const newSize = output.length
  console.log(
    `${path.relative(ROOT, filePath)} -> ${path.relative(ROOT, webpPath)} ` +
      `(${(originalSize / 1024).toFixed(0)}KB -> ${(newSize / 1024).toFixed(0)}KB)`
  )
  return { from: filePath, to: webpPath }
}

async function main() {
  const files = []
  walkDir(ROOT, (file) => files.push(file))
  const results = []
  for (const file of files) {
    const result = await convert(file)
    if (result) results.push(result)
  }
  console.log(`\nConverted ${results.length} files.`)
}

if (require.main === module) {
  main()
}
