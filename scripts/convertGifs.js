const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const sharp = require('sharp')

// Animated GIF is the worst-value format on the site — 06.gif was 2.9MB for a
// 448x396 clip. Re-encode the heavy ones as looping mp4 + webm; the small pixel
// -art GIFs in the character gallery stay as they are, because ProjectCard and
// the lightbox only know how to show images.

const ROOT = path.join(__dirname, '..', 'public')
const TARGETS = [
  'assets/blog/plurk-ui-redesign-tokyono-sora/06.gif',
  'assets/blog/plurk-ui-redesign-tokyono-sora/11.gif',
  'assets/works/chiakey/chiaki.gif',
]

// yuv420p needs even dimensions, and Safari will not inline-play without it.
const EVEN = 'scale=trunc(iw/2)*2:trunc(ih/2)*2'

const kb = (n) => `${(n / 1024).toFixed(0)}KB`

async function convert(relPath) {
  const input = path.join(ROOT, relPath)
  if (!fs.existsSync(input)) {
    console.log(`skip (missing): ${relPath}`)
    return
  }
  const base = input.slice(0, -path.extname(input).length)

  execFileSync('ffmpeg', [
    '-y', '-i', input,
    '-vf', EVEN,
    '-c:v', 'libx264', '-crf', '26', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
    `${base}.mp4`,
  ], { stdio: 'pipe' })

  // No webm: vp9 came out no smaller than h264 on these short clips, and h264
  // mp4 already plays everywhere.

  // A still first frame, so the <video> has a poster before it decodes.
  // This ffmpeg build has no webp encoder, so sharp does it.
  await sharp(input, { animated: false }).webp({ quality: 75 }).toFile(`${base}-poster.webp`)

  const before = fs.statSync(input).size
  const after = fs.statSync(`${base}.mp4`).size
  fs.unlinkSync(input)
  console.log(`${relPath}: ${kb(before)} -> mp4 ${kb(after)}`)
}

if (require.main === module) {
  ;(async () => {
    for (const target of TARGETS) await convert(target)
  })()
}
