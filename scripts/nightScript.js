#!/usr/bin/env node
// Compiles the night-loop slice scripts (content/night/*.twee) into the
// obfuscated payload at lib/night/script.ts. The .twee sources are gitignored
// adult content, same arrangement as the after-dark branch.
//
//   :: n1.private.time [tags]
//   > typed line              her terminal messages
//   「spoken line」            her voice
//   ! system line             terminal system text
//   ~2                        typing pause, seconds
//   ~unsent text              typed, then deleted
//   @op args                  state / flow directive (see OPS)
//   @hot part flag label [s]  timed panel button; @hotwait blocks until it resolves
//   @thrust N | off           rhythmic jolt while she is being taken, N per minute
//   @if cond / @else / @endif
//   [[label->target]] ?cond ;flag,!flag,key=value
//   anything else             narration paragraph
//
// Each run also writes a line-by-line encoded copy of the sources to
// content/night-source/, which is committed so the story lives in git without
// plain-text spoilers. A fresh clone restores the sources with --unpack.
//
// --read writes Markdown reading copies to content/night/read/ instead.
//
// Usage: yarn night-script [--check | --read [--force] | --unpack [--force]]

const fs = require('fs')
const path = require('path')
const { exportReading } = require('./nightRead')

const ROOT = path.resolve(__dirname, '..')
const SOURCE_DIR = path.join(ROOT, 'content/night')
const TARGET = path.join(ROOT, 'lib/night/script.ts')
const PACK_DIR = path.join(ROOT, 'content/night-source')
const PACK_EXT = '.enc'
const PACK_HEADER = '# 劇透／成人內容警告：content/night/*.twee 的編碼副本。還原：yarn night-script --unpack'
const KEY = 'ash-and-ember'

const OPS = {
  goto: 1,
  end: 0,
  summary: 0,
  bpm: 1,
  battery: 1,
  trust: 1,
  list: 1,
  set: 1,
  unset: 1,
  var: 2,
  wave: 3,
  men: 1,
  target: 1,
  timeout: 2,
  mode: 1,
  day: 1,
  input: 1,
  choices: 1,
  shake: 0,
  dim: 1,
  hot: 3,
  hotwait: 0,
  face: 1,
  eyes: 1,
  tremble: 0,
  thrust: 1,
}
const MODES = new Set(['day', 'perf', 'private'])
const MEN = new Set(['boss', 'guard', 'young'])
const WAVE_KINDS = new Set(['desire', 'liking', 'possess'])
const PARTS = new Set(['eyes', 'mouth', 'chest', 'hands', 'waist', 'crotch', 'thighs'])
const FACES = new Set(['neutral', 'happy', 'shy', 'surprised', 'sad', 'thinking', 'proud'])
const EYES = new Set(['open', 'half', 'closed'])
const COND_TERM = /^(!?)([A-Za-z_][\w]*)(?:(>=|<=|==|!=|>|<)(.+))?$/

const errors = []
const fail = (where, message) => errors.push(`${where}: ${message}`)

// A condition is `term & term | term & term`; terms are flag, !flag or var<op>value.
const parseCond = (raw, where) => {
  const expr = raw.trim()
  for (const term of expr.split(/[&|]/).map((part) => part.trim()))
    if (!COND_TERM.test(term)) fail(where, `bad condition "${term}"`)
  return [expr]
}

const parseSets = (raw) =>
  raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const eq = entry.indexOf('=')
      if (eq > 0) return { key: entry.slice(0, eq).trim(), value: entry.slice(eq + 1).trim() }
      if (entry.startsWith('!')) return { unset: entry.slice(1) }
      return { flag: entry }
    })

const CHOICE = /^\[\[(.+?)->(.+?)\]\]\s*(?:\?([^;]+))?\s*(?:;(.*))?$/

const parsePassage = (name, lines, file) => {
  const ops = []
  const choices = []
  const stack = []
  let group = null

  lines.forEach((raw, index) => {
    const line = raw.trimEnd()
    const trimmed = line.trim()
    const where = `${file}:${name}+${index + 1}`
    if (!trimmed || trimmed.startsWith('//')) return

    if (trimmed.startsWith('[[')) {
      const match = trimmed.match(CHOICE)
      if (!match) return fail(where, `bad choice "${trimmed}"`)
      if (stack.some((entry) => entry.multiElse))
        return fail(where, 'choice inside the @else of a compound @if')
      const own = match[3] ? parseCond(match[3], where) : []
      choices.push({
        label: match[1].trim(),
        target: match[2].trim(),
        cond: [...stack.flatMap((entry) => entry.cond), ...own],
        sets: match[4] ? parseSets(match[4]) : [],
        group,
      })
      return
    }

    if (trimmed.startsWith('@')) {
      const [op, ...rest] = trimmed.slice(1).split(/\s+/)
      const argText = trimmed.slice(1 + op.length).trim()
      if (op === 'if') {
        const cond = parseCond(argText, where)
        ops.push({ t: 'if', cond, skip: -1 })
        stack.push({ at: ops.length - 1, cond, elseAt: null })
        return
      }
      if (op === 'else') {
        const top = stack[stack.length - 1]
        if (!top || top.elseAt !== null) return fail(where, 'stray @else')
        ops.push({ t: 'jump', to: -1 })
        top.elseAt = ops.length - 1
        ops[top.at].skip = ops.length
        // Choices in an else branch need the inverted condition, which only
        // stays an AND list when the original was a single term.
        if (top.cond.length === 1 && COND_TERM.test(top.cond[0])) top.cond = [invert(top.cond[0])]
        else top.multiElse = true
        return
      }
      if (op === 'endif') {
        const top = stack.pop()
        if (!top) return fail(where, 'stray @endif')
        if (top.elseAt !== null) ops[top.elseAt].to = ops.length
        else ops[top.at].skip = ops.length
        return
      }
      if (!(op in OPS)) return fail(where, `unknown op @${op}`)
      if (op === 'choices') {
        group = argText || null
        return
      }
      const args = OPS[op] === 1 ? [argText] : rest
      if (args.length < OPS[op]) fail(where, `@${op} needs ${OPS[op]} args`)
      if (op === 'mode' && !MODES.has(args[0])) fail(where, `bad mode ${args[0]}`)
      if (op === 'target' && args[0] !== 'none' && !MEN.has(args[0]))
        fail(where, `bad target ${args[0]}`)
      if (op === 'wave') {
        if (!MEN.has(args[0])) fail(where, `bad man ${args[0]}`)
        if (!WAVE_KINDS.has(args[1])) fail(where, `bad wave kind ${args[1]}`)
        if (Number.isNaN(Number(args[2]))) fail(where, `bad wave amount ${args[2]}`)
      }
      if (op === 'hot') {
        if (!PARTS.has(args[0])) fail(where, `bad part ${args[0]}`)
        if (args[3] !== undefined && Number.isNaN(Number(args[3])))
          fail(where, `bad hot seconds ${args[3]}`)
      }
      if (op === 'thrust' && args[0] !== 'off' && !(Number(args[0]) > 0))
        fail(where, `bad thrust ${args[0]}`)
      if (op === 'face' && !FACES.has(args[0])) fail(where, `bad face ${args[0]}`)
      if (op === 'eyes' && !EYES.has(args[0])) fail(where, `bad eyes ${args[0]}`)
      ops.push({ t: 'op', op, args })
      return
    }

    if (trimmed.startsWith('> ') || trimmed === '>') {
      ops.push({ t: 'type', text: trimmed.slice(2) })
      return
    }
    if (trimmed.startsWith('~unsent ')) {
      ops.push({ t: 'unsent', text: trimmed.slice(8) })
      return
    }
    if (/^~\d+(\.\d+)?$/.test(trimmed)) {
      ops.push({ t: 'pause', s: Number(trimmed.slice(1)) })
      return
    }
    if (trimmed.startsWith('! ')) {
      ops.push({ t: 'sys', text: trimmed.slice(2) })
      return
    }
    if (trimmed.startsWith('「')) {
      ops.push({ t: 'say', text: trimmed })
      return
    }
    ops.push({ t: 'narr', text: trimmed })
  })

  if (stack.length) fail(`${file}:${name}`, 'unclosed @if')
  return { ops, choices }
}

function invert(term) {
  const match = term.match(COND_TERM)
  if (!match) return term
  const [, neg, name, cmp, value] = match
  if (!cmp) return neg ? name : `!${name}`
  const flip = { '>=': '<', '<=': '>', '>': '<=', '<': '>=', '==': '!=', '!=': '==' }
  return `${name}${flip[cmp]}${value}`
}

const parseFile = (file, text, passages) => {
  let current = null
  const flush = () => {
    if (!current) return
    if (passages[current.name]) fail(file, `duplicate passage ${current.name}`)
    passages[current.name] = {
      tags: current.tags,
      ...parsePassage(current.name, current.lines, file),
    }
  }
  for (const raw of text.split(/\r?\n/)) {
    const header = raw.match(/^:: +(\S+)(?: +\[(.*?)\])?\s*$/)
    if (header) {
      flush()
      current = {
        name: header[1],
        tags: (header[2] ?? '').split(/\s+/).filter(Boolean),
        lines: [],
      }
      continue
    }
    if (current) current.lines.push(raw)
  }
  flush()
}

const validate = (passages) => {
  const names = new Set(Object.keys(passages))
  const reached = new Set()
  const starts = Object.keys(passages).filter((name) => passages[name].tags.includes('start'))
  if (!starts.length) fail('script', 'no passage tagged [start]')

  const visit = (name) => {
    if (reached.has(name) || !names.has(name)) return
    reached.add(name)
    const passage = passages[name]
    const targets = [
      ...passage.choices.map((choice) => choice.target),
      ...passage.ops
        .filter((op) => op.t === 'op' && (op.op === 'goto' || op.op === 'timeout'))
        .map((op) => (op.op === 'goto' ? op.args[0] : op.args[1])),
      // `@var stop <passage>` arms the always-on 〔先停在這裡〕 button.
      ...passage.ops
        .filter((op) => op.t === 'op' && op.op === 'var' && op.args[0] === 'stop' && op.args[1] !== 'none')
        .map((op) => op.args[1]),
    ]
    for (const target of targets) {
      if (!names.has(target)) fail(name, `missing target ${target}`)
      visit(target)
    }
    const ends = passage.ops.some(
      (op) => op.t === 'op' && ['goto', 'end', 'summary'].includes(op.op)
    )
    if (!passage.choices.length && !ends) fail(name, 'dead end: no choices, @goto or @end')
  }
  starts.forEach(visit)
  for (const name of names)
    if (!reached.has(name)) console.warn(`warning: unreachable passage ${name}`)
  return starts
}

const xor = (bytes) => {
  const key = Buffer.from(KEY)
  for (let index = 0; index < bytes.length; index += 1)
    bytes[index] ^= key[index % key.length]
  return bytes
}

// Per line, so git diffs still point at the lines that changed.
const encodeSource = (text) =>
  [
    PACK_HEADER,
    ...text
      .split('\n')
      .map((line) => (line ? xor(Buffer.from(line, 'utf8')).toString('base64') : '')),
  ].join('\n')

const decodeSource = (text) =>
  text
    .split('\n')
    .slice(1)
    .map((line) => (line ? xor(Buffer.from(line, 'base64')).toString('utf8') : ''))
    .join('\n')

const pack = (files) => {
  fs.mkdirSync(PACK_DIR, { recursive: true })
  const keep = new Set(files.map((file) => file + PACK_EXT))
  for (const stale of fs.readdirSync(PACK_DIR))
    if (stale.endsWith(PACK_EXT) && !keep.has(stale)) fs.unlinkSync(path.join(PACK_DIR, stale))
  for (const file of files) {
    const text = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8')
    fs.writeFileSync(path.join(PACK_DIR, file + PACK_EXT), encodeSource(text))
  }
}

const unpack = () => {
  const force = process.argv.includes('--force')
  const packed = fs.existsSync(PACK_DIR)
    ? fs.readdirSync(PACK_DIR).filter((file) => file.endsWith(PACK_EXT))
    : []
  if (!packed.length) {
    console.error(`Nothing to unpack in ${path.relative(ROOT, PACK_DIR)}`)
    process.exit(1)
  }
  fs.mkdirSync(SOURCE_DIR, { recursive: true })
  for (const file of packed) {
    const target = path.join(SOURCE_DIR, file.slice(0, -PACK_EXT.length))
    const text = decodeSource(fs.readFileSync(path.join(PACK_DIR, file), 'utf8'))
    if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') !== text && !force) {
      console.error(`Skip ${path.relative(ROOT, target)}: local copy differs (use --force)`)
      continue
    }
    fs.writeFileSync(target, text)
    console.log(`Unpacked ${path.relative(ROOT, target)}`)
  }
}

const main = () => {
  if (process.argv.includes('--unpack')) return unpack()
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(
      `Missing local night scripts: ${path.relative(ROOT, SOURCE_DIR)} (yarn night-script --unpack)`
    )
    process.exit(1)
  }
  const passages = {}
  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((file) => file.endsWith('.twee'))
    .sort()
  if (process.argv.includes('--read')) {
    const { dir, skipped } = exportReading(SOURCE_DIR, files, process.argv.includes('--force'))
    console.log(`Wrote ${files.length - skipped.length} reading copies to ${path.relative(ROOT, dir)}`)
    if (skipped.length) console.log(`Skipped (edited since export, use --force): ${skipped.join(', ')}`)
    return
  }
  for (const file of files)
    parseFile(file, fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8'), passages)

  const starts = validate(passages)
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }

  const count = Object.keys(passages).length
  if (process.argv.includes('--check')) {
    console.log(`OK: ${count} passages, starts: ${starts.join(', ')}`)
    return
  }

  pack(files)
  const source = xor(Buffer.from(JSON.stringify({ passages, starts }), 'utf8'))
  const chunks = source.toString('base64').match(/.{1,96}/g) ?? []

  fs.mkdirSync(path.dirname(TARGET), { recursive: true })
  fs.writeFileSync(
    TARGET,
    `// ⚠️ 劇透／成人內容警告：解碼這個檔案會導致劇透。
// Generated by scripts/nightScript.js from content/night/*.twee — do not edit.

const KEY = '${KEY}'

const PAYLOAD = [
${chunks.map((chunk) => `  '${chunk}',`).join('\n')}
].join('')

export const decodeNightScript = (): unknown => {
  const binary = globalThis.atob(PAYLOAD)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const key = new TextEncoder().encode(KEY)

  for (let index = 0; index < bytes.length; index += 1)
    bytes[index] ^= key[index % key.length]

  return JSON.parse(new TextDecoder().decode(bytes))
}
`
  )
  console.log(`Wrote ${path.relative(ROOT, TARGET)} (${count} passages) and ${files.length} packed sources`)
}

main()
