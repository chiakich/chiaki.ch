const path = require('path')
const sharp = require('sharp')

// Cubism uploads the decoded atlas plus its mip chain to the GPU. Keeping the
// 8192 master there costs roughly 341 MB, so the mobile viewer uses this 2048
// derivative instead (about 21 MB on the GPU).
const ROOT = path.join(
  __dirname,
  '..',
  'public',
  'assets',
  'story',
  'character',
  'live2d',
  'r5',
  'Resources',
  'chiaki'
)
const SRC = path.join(
  ROOT,
  'chiakiL2Dv2-cubism5-target.8192',
  'texture_00.png'
)
const OUT = path.join(
  ROOT,
  'chiakiL2Dv2-cubism5-target.2048',
  'texture_00.webp'
)
const SIZE = 2048

async function main() {
  const info = await sharp(SRC)
    .resize(SIZE, SIZE)
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(OUT)
  console.log(`${path.relative(process.cwd(), OUT)}: ${SIZE}x${SIZE}, ${(info.size / 1024).toFixed(0)}KB`)
}

if (require.main === module) {
  main()
}
