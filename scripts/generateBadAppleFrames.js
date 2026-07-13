// Convert a video into flap-board frames for the /works/split-flap easter egg.
// Requires ffmpeg on PATH. The video file is NOT included in this repo — supply your own.
//
// Usage:
//   node scripts/generateBadAppleFrames.js <input.mp4> [fps]
//
// Output: public/assets/works/split-flap/bad-apple.json
// Format: string[frame][12 rows] of 20 chars (' ' or '█'), matching FlapShowcase.

const { execFileSync } = require('node:child_process')
const { writeFileSync, mkdtempSync, readFileSync, rmSync } = require('node:fs')
const { join } = require('node:path')
const { tmpdir } = require('node:os')

const W = 20
const H = 12
const THRESHOLD = 127

const [input, fpsArg] = process.argv.slice(2)
if (!input) {
  console.error('Usage: node scripts/generateBadAppleFrames.js <input.mp4> [fps]')
  process.exit(1)
}
const fps = Number(fpsArg) || 5

const tmp = mkdtempSync(join(tmpdir(), 'badapple-'))
const raw = join(tmp, 'frames.raw')

try {
  execFileSync('ffmpeg', [
    '-i', input,
    '-vf', `fps=${fps},scale=${W}:${H}`,
    '-f', 'rawvideo',
    '-pix_fmt', 'gray',
    '-y', raw,
  ], { stdio: ['ignore', 'ignore', 'inherit'] })

  const buffer = readFileSync(raw)
  const frameSize = W * H
  const frames = []
  for (let offset = 0; offset + frameSize <= buffer.length; offset += frameSize) {
    const rows = []
    for (let y = 0; y < H; y++) {
      let row = ''
      for (let x = 0; x < W; x++) row += buffer[offset + y * W + x] > THRESHOLD ? '█' : ' '
      rows.push(row)
    }
    frames.push(rows)
  }

  const output = join(__dirname, '..', 'public', 'assets', 'works', 'split-flap', 'bad-apple.json')
  writeFileSync(output, JSON.stringify(frames))
  console.log(`${frames.length} frames @ ${fps}fps → ${output}`)
  console.log('注意:FlapShowcase 播放間隔為 200ms,建議 fps=5 使播放速度與原片一致。')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
