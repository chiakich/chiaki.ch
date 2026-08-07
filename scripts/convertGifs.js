const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const sharp = require('sharp')

// Animated GIF is the worst-value format on the site — 06.gif was 2.9MB for a
// 448x396 clip. Re-encode the heavy ones as looping h264. The small pixel-art
// GIFs in the character gallery stay as they are, because ProjectCard and the
// lightbox only know how to show images.
//
// Reads from assets-src/ and writes to public/assets/, same as
// scripts/optimizeAssets.js — public/ ships to the CDN verbatim, so the fat
// originals must not live there.

const SRC_ROOT = path.join(__dirname, '..', 'assets-src')
const OUT_ROOT = path.join(__dirname, '..', 'public', 'assets')
const TARGETS = [
  'blog/plurk-ui-redesign-tokyono-sora/06.gif',
  'blog/plurk-ui-redesign-tokyono-sora/11.gif',
  'works/chiakey/chiaki.gif',
]

// yuv420p needs even dimensions, and Safari will not inline-play without it.
const EVEN = 'scale=trunc(iw/2)*2:trunc(ih/2)*2'

const kb = (n) => `${(n / 1024).toFixed(0)}KB`

async function convert(relPath) {
  const input = path.join(SRC_ROOT, relPath)
  if (!fs.existsSync(input)) {
    console.log(`skip (no source): assets-src/${relPath}`)
    return
  }
  const base = path.join(OUT_ROOT, relPath.slice(0, -path.extname(relPath).length))
  fs.mkdirSync(path.dirname(base), { recursive: true })

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

  console.log(
    `${relPath}: ${kb(fs.statSync(input).size)} -> mp4 ${kb(fs.statSync(`${base}.mp4`).size)}`
  )
}

if (require.main === module) {
  ;(async () => {
    for (const target of TARGETS) await convert(target)
  })()
}
