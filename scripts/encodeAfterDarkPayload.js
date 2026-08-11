#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const sourcePath = process.argv[2] ?? path.resolve(__dirname, '../content/after-dark.json')
if (!fs.existsSync(sourcePath)) {
  console.error(`Missing local after-dark source: ${sourcePath}`)
  console.error('Usage: yarn encode-after-dark [path/to/dirty.json]')
  process.exit(1)
}

const source = fs.readFileSync(sourcePath)
try {
  JSON.parse(source.toString('utf8'))
} catch {
  console.error(`Not valid JSON: ${sourcePath}`)
  process.exit(1)
}

const key = Buffer.from('moss-and-snow')
for (let index = 0; index < source.length; index += 1)
  source[index] ^= key[index % key.length]

const chunks = source.toString('base64').match(/.{1,96}/g) ?? []
const target = path.resolve(__dirname, '../lib/terminal/after-dark.ts')
const moduleSource = `// ⚠️ 劇透／成人內容警告：解碼這個檔案會導致劇透。

const KEY = 'moss-and-snow'

const PAYLOAD = [
${chunks.map((chunk) => `  '${chunk}',`).join('\n')}
].join('')

export const decodeAfterDarkPayload = (): unknown => {
  const binary = globalThis.atob(PAYLOAD)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const key = new TextEncoder().encode(KEY)

  for (let index = 0; index < bytes.length; index += 1)
    bytes[index] ^= key[index % key.length]

  return JSON.parse(new TextDecoder().decode(bytes))
}
`

fs.writeFileSync(target, moduleSource)
console.log(`Wrote ${path.relative(process.cwd(), target)}`)
