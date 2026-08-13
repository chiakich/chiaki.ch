#!/usr/bin/env node

// Same trick as encodeAfterDarkPayload.js, applied one step earlier in the
// pipeline: content/after-dark.source.twee is gitignored (spoiler content,
// same as after-dark.json), so without this it would exist only on this
// machine. This XORs and base64s it into a committed TS module — not loaded
// by the app, just a recoverable backup — the same way after-dark.ts is git's
// copy of after-dark.json.
//
// Usage:
//   yarn encode-after-dark-source            content/after-dark.source.twee → lib/terminal/after-dark-source.ts
//   yarn encode-after-dark-source --restore  lib/terminal/after-dark-source.ts → content/after-dark.source.twee

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const sourcePath = path.resolve(__dirname, '../content/after-dark.source.twee')
const target = path.resolve(__dirname, '../lib/terminal/after-dark-source.ts')
const KEY = 'moss-and-snow'

if (args.includes('--restore')) {
  if (!fs.existsSync(target)) {
    console.error(`Missing ${path.relative(process.cwd(), target)}`)
    process.exit(1)
  }
  if (fs.existsSync(sourcePath) && !args.includes('--force')) {
    console.error(
      `${path.relative(process.cwd(), sourcePath)} 已存在 —— 這會蓋掉現在的工作檔。` +
        '確定要用 git 裡的備份覆寫的話加 --force。'
    )
    process.exit(1)
  }
  const module = fs.readFileSync(target, 'utf8')
  // Scoped to the PAYLOAD array specifically — a naive "every quoted string
  // in the file" match would also pick up `const KEY = 'moss-and-snow'` and
  // corrupt the decode with that string prepended to the real payload.
  const arrayBody = module.match(/const PAYLOAD = \[([\s\S]*?)\]\.join\(''\)/)?.[1]
  if (!arrayBody) {
    console.error(`${path.relative(process.cwd(), target)} 格式不對，找不到 PAYLOAD`)
    process.exit(1)
  }
  const b64 = [...arrayBody.matchAll(/'([^']+)'/g)].map((match) => match[1]).join('')
  const bytes = Buffer.from(b64, 'base64')
  const key = Buffer.from(KEY)
  for (let index = 0; index < bytes.length; index += 1) bytes[index] ^= key[index % key.length]
  fs.writeFileSync(sourcePath, bytes)
  console.log(`Wrote ${path.relative(process.cwd(), sourcePath)}`)
  process.exit(0)
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Missing ${path.relative(process.cwd(), sourcePath)}`)
  console.error('Usage: yarn encode-after-dark-source [--restore] [--force]')
  process.exit(1)
}

const source = fs.readFileSync(sourcePath)
const key = Buffer.from(KEY)
for (let index = 0; index < source.length; index += 1) source[index] ^= key[index % key.length]

const chunks = source.toString('base64').match(/.{1,96}/g) ?? []
const moduleSource = `// ⚠️ 劇透／成人內容警告：解碼這個檔案會導致劇透。
//
// A git-safe backup of content/after-dark.source.twee, not loaded by the app
// — the .twee is what scripts/afterDarkTwee.js compiles from and what Twine
// edits belong in. Restore it with:
//   yarn encode-after-dark-source --restore

const KEY = 'moss-and-snow'

const PAYLOAD = [
${chunks.map((chunk) => `  '${chunk}',`).join('\n')}
].join('')

export const decodeAfterDarkSource = (): string => {
  const binary = globalThis.atob(PAYLOAD)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const key = new TextEncoder().encode(KEY)

  for (let index = 0; index < bytes.length; index += 1)
    bytes[index] ^= key[index % key.length]

  return new TextDecoder().decode(bytes)
}
`

fs.writeFileSync(target, moduleSource)
console.log(`Wrote ${path.relative(process.cwd(), target)}`)
