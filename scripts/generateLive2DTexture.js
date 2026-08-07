const path = require('path')
const sharp = require('sharp')

// The shipped Live2D atlas, derived from the 8192² master in assets-src/.
//
// 2048 is not arbitrary: Live2DModelClient caps the model at `maxScale` 0.25,
// so a quarter of the master is the most that ever reaches the screen.
// alphaQuality 100 keeps the alpha channel lossless — Live2D masks and the soft
// edges on hair and cloth read straight off it, and a lossy alpha fringes them.

const SRC = path.join(
  __dirname, '..', 'assets-src', 'story', 'character', 'live2d', 'chiaki.8192', 'texture_00.png'
)
const OUT = path.join(
  __dirname, '..', 'public', 'assets', 'story', 'character', 'live2d', 'chiaki.2048', 'texture_00.webp'
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
