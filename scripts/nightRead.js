// Reading copies of the night scripts for writing passes: one Markdown file per
// .twee in content/night/read/, with engine-only directives hidden and the rest
// folded into short ［…］ notes. One-way; the .twee files stay the source.

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const HIDDEN = new Set(['men', 'var', 'target', 'set', 'unset', 'wave', 'hotwait', 'timeout', 'input'])
const MODE = { day: '白天', perf: '深夜', private: '私人頻道' }
const FACE = {
  neutral: '平常',
  happy: '開心',
  shy: '害羞',
  surprised: '驚訝',
  sad: '難過',
  thinking: '思考',
  proud: '得意',
}
const EYES = { open: '睜眼', half: '半閉眼', closed: '閉眼' }
const PART = {
  eyes: '眼睛',
  mouth: '嘴',
  chest: '胸',
  hands: '手',
  waist: '腰',
  crotch: '下身',
  thighs: '大腿',
}
const CHOICE = /^\[\[(.+?)->(.+?)\]\]\s*(?:\?([^;]+))?\s*(?:;(.*))?$/
const STACKED = new Set(['type', 'choice', 'list'])
const EDITABLE = new Set(['type', 'pause', 'sys', 'text', 'comment'])
const BLANK = { text: '', src: -1, after: -1 }
const STAMP = /^<!-- night-read (\w+) -->\n/

const signed = (n) => (n.startsWith('=') ? `=${n.slice(1)}` : n.startsWith('-') ? `−${n.slice(1)}` : `+${n}`)

const note = (op, args) => {
  const [a] = args
  switch (op) {
    case 'bpm':
      return `bpm ${a}`
    case 'mode':
      return MODE[a] ?? a
    case 'face':
      return `表情 ${FACE[a] ?? a}`
    case 'eyes':
      return EYES[a] ?? a
    case 'battery':
      return `電量 ${signed(a)}`
    case 'trust':
      return `信任 ${signed(a)}`
    case 'warm':
      return `暖 ${signed(a)}`
    case 'day':
      return `DAY ${a}`
    case 'thrust':
      return a === 'off' ? '停下' : `頂 ${a}/分`
    case 'shake':
      return '震動'
    case 'tremble':
      return '發抖'
    case 'dim':
      return a === 'on' ? '畫面變暗' : '畫面恢復'
    default:
      return `${op} ${args.join(' ')}`.trim()
  }
}

// Flags read better as the choice or prompt that sets them.
const flagLabels = (text) => {
  const labels = {}
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    const hot = line.match(/^@hot\s+\S+\s+(\S+)\s+(\S+)/)
    if (hot) labels[hot[1]] = `按了「${hot[2]}」`
    const choice = line.match(CHOICE)
    if (choice?.[4])
      for (const entry of choice[4].split(',').map((part) => part.trim()))
        if (/^[A-Za-z_]\w*$/.test(entry)) labels[entry] ??= `選了「${choice[1].trim()}」`
  }
  return labels
}

const readCond = (expr, labels) =>
  expr
    .split(/\s*([&|])\s*/)
    .map((term) => {
      if (term === '&') return '且'
      if (term === '|') return '或'
      const negated = term.startsWith('!')
      const name = negated ? term.slice(1) : term
      if (labels[name]) return negated ? `沒有${labels[name]}` : labels[name]
      return term.replace('battery', '電量').replace('trust', '信任')
    })
    .join(' ')

// Each entry remembers the twee line it came from (src) and the twee line that
// new text after it should follow (after), so edits can be applied back.
const renderEntries = (file, text) => {
  const labels = flagLabels(text)
  const entries = [{ text: `# ${path.basename(file, '.twee')}`, src: -1, after: -1 }, BLANK]
  let notes = []
  let notesAt = -1
  let last = 'blank'
  let at = -1

  const push = (line, src, after = src) => entries.push({ text: line, src, after })
  const gap = () => {
    if (entries[entries.length - 1] !== BLANK) entries.push(BLANK)
  }
  const emit = (kind, line, src = at) => {
    // Runs of messages, choices and list entries stay together.
    if (last !== 'blank' && !(kind === last && STACKED.has(kind))) gap()
    // Two trailing spaces keep each message on its own line in Markdown preview.
    push(kind === 'type' || kind === 'choice' ? `${line}  ` : line, EDITABLE.has(kind) ? src : -1, src)
    last = kind
  }
  const flushNotes = () => {
    if (!notes.length) return
    emit('note', `［${notes.join(' · ')}］`, notesAt)
    notes = []
  }

  text.split(/\r?\n/).forEach((raw, index) => {
    at = index
    const line = raw.trim()
    if (!line) return
    const header = line.match(/^:: +(\S+)(?: +\[(.*?)\])?/)
    if (header) {
      flushNotes()
      gap()
      push(`## ${header[1]}${header[2] ? `　〔${header[2]}〕` : ''}`, -1, index)
      entries.push(BLANK)
      last = 'blank'
      return
    }
    if (line.startsWith('//')) {
      flushNotes()
      const body = line.slice(2).trim()
      const section = body.match(/^─+\s*(.+)$/)
      if (section) {
        gap()
        push('---', -1, index)
        entries.push(BLANK)
        push(`# ${section[1]}`, -1, index)
        entries.push(BLANK)
        last = 'blank'
      } else emit('comment', `※ ${body}`)
      return
    }
    if (line.startsWith('@')) {
      const [op, ...args] = line.slice(1).split(/\s+/)
      const rest = line.slice(1 + op.length).trim()
      if (HIDDEN.has(op)) return
      if (['if', 'else', 'endif', 'goto', 'summary', 'ending', 'adult', 'end', 'list', 'choices', 'hot'].includes(op))
        flushNotes()
      if (op === 'if') emit('flow', `◇ 如果${readCond(rest, labels)}`)
      else if (op === 'else') emit('flow', '◇ 否則')
      else if (op === 'endif') emit('flow', '◇ 分支結束')
      else if (op === 'goto') emit('flow', `→ ${rest}`)
      else if (op === 'summary') emit('flow', '［本夜結束］')
      else if (op === 'ending') emit('flow', `［結局：${rest}］`)
      else if (op === 'adult') emit('flow', `［18 歲確認${rest ? `，不看 → ${rest}` : ''}］`)
      else if (op === 'end') emit('flow', '［結束］')
      else if (op === 'list') emit('list', `［清單］${rest}`)
      else if (op === 'choices') emit('flow', `［選擇：${rest}］`)
      else if (op === 'hot')
        emit('note', `［提示：${PART[args[0]] ?? args[0]}「${args[2]}」${args[3] ? ` · ${args[3]} 秒` : ''}］`)
      else {
        notes.push(note(op, args))
        notesAt = index
      }
      return
    }
    flushNotes()
    const choice = line.match(CHOICE)
    if (choice) {
      const cond = choice[3] ? `（${readCond(choice[3].trim(), labels)}）` : ''
      emit('choice', `〔${choice[1].trim()}〕→ ${choice[2].trim()}${cond}`)
      return
    }
    if (/^~\d+(\.\d+)?$/.test(line)) emit('pause', `（${line.slice(1)}s）`)
    else if (line.startsWith('~unsent ')) emit('type', `> ~~${line.slice(8)}~~（打了又刪掉）`)
    else if (line.startsWith('> ') || line === '>') emit('type', line)
    else if (line.startsWith('! ')) emit('sys', `【${line.slice(2)}】`)
    else emit('text', line)
  })
  flushNotes()
  while (entries[entries.length - 1] === BLANK) entries.pop()
  return entries
}

const render = (file, text) => `${renderEntries(file, text).map((entry) => entry.text).join('\n')}\n`

// Reading-copy line back to twee; null for lines that only the twee can change.
const toTwee = (line) => {
  const pause = line.match(/^（(\d+(?:\.\d+)?)s）$/)
  if (pause) return `~${pause[1]}`
  const unsent = line.match(/^> ~~(.*)~~（打了又刪掉）$/)
  if (unsent) return `~unsent ${unsent[1]}`
  if (line.startsWith('>')) return line
  const sys = line.match(/^【(.*)】$/)
  if (sys) return `! ${sys[1]}`
  if (line.startsWith('※ ')) return `// ${line.slice(2)}`
  if (/^(［|〔|◇|→|#|---)/.test(line)) return null
  return line
}

// Plain LCS; reading copies are a few thousand lines at most.
const diff = (a, b) => {
  const n = a.length
  const m = b.length
  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i -= 1)
    for (let j = m - 1; j >= 0; j -= 1)
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
  const hunks = []
  let i = 0
  let j = 0
  let hunk = null
  const close = () => {
    if (hunk) hunks.push(hunk)
    hunk = null
  }
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      close()
      i += 1
      j += 1
    } else {
      hunk ??= { from: i, removed: [], added: [] }
      if (j < m && (i >= n || table[i][j + 1] >= table[i + 1][j])) hunk.added.push(b[j++])
      else hunk.removed.push(i++)
    }
  }
  close()
  return hunks
}

const stripStamp = (text) => text.replace(STAMP, '')
const normalize = (text) => text.replace(/\r/g, '').split('\n').map((line) => line.trimEnd())

// Applies reading-copy edits to the .twee; returns problems instead of guessing.
const applyReading = (file, twee, edited) => {
  const entries = renderEntries(file, twee)
  const fresh = entries.map((entry) => entry.text.trimEnd())
  const lines = twee.split('\n')
  const problems = []
  const edits = []
  for (const hunk of diff(fresh, normalize(stripStamp(edited)).filter((_, i, all) => i < all.length - 1 || all[i] !== ''))) {
    const removed = hunk.removed.map((index) => entries[index]).filter((entry) => entry !== BLANK)
    const added = hunk.added.filter(Boolean).map((line) => ({ line, twee: toTwee(line) }))
    const locked = removed.find((entry) => entry.src < 0)
    const unsupported = added.find((item) => item.twee === null)
    if (locked || unsupported) {
      problems.push(`${file}: 只能在 twee 改：${(locked?.text ?? unsupported.line).trim()}`)
      continue
    }
    const before = entries.slice(0, hunk.from).reverse().find((entry) => entry.after >= 0)
    const position = removed.length ? removed[0].src : (before?.after ?? -1) + 1
    edits.push({ position, remove: removed.map((entry) => entry.src), insert: added.map((item) => item.twee) })
  }
  if (problems.length) return { problems }
  for (const edit of edits.sort((x, y) => y.position - x.position)) {
    for (const index of [...edit.remove].sort((x, y) => y - x)) lines.splice(index, 1)
    lines.splice(edit.position, 0, ...edit.insert)
  }
  return { text: lines.join('\n'), changed: edits.length }
}

const hash = (body) => crypto.createHash('sha1').update(body).digest('hex').slice(0, 12)

// Refuses to overwrite a reading copy that was edited since it was exported.
const exportReading = (sourceDir, files, force) => {
  const dir = path.join(sourceDir, 'read')
  fs.mkdirSync(dir, { recursive: true })
  const skipped = []
  for (const file of files) {
    const target = path.join(dir, file.replace(/\.twee$/, '.md'))
    if (fs.existsSync(target) && !force) {
      const current = fs.readFileSync(target, 'utf8')
      const stamp = current.match(STAMP)
      if (!stamp || hash(current.slice(stamp[0].length)) !== stamp[1]) {
        skipped.push(path.basename(target))
        continue
      }
    }
    const body = render(file, fs.readFileSync(path.join(sourceDir, file), 'utf8'))
    fs.writeFileSync(target, `<!-- night-read ${hash(body)} -->\n${body}`)
  }
  return { dir, skipped }
}

const applyAll = (sourceDir, files) => {
  const dir = path.join(sourceDir, 'read')
  const report = []
  for (const file of files) {
    const copy = path.join(dir, file.replace(/\.twee$/, '.md'))
    if (!fs.existsSync(copy)) continue
    const source = path.join(sourceDir, file)
    const result = applyReading(file, fs.readFileSync(source, 'utf8'), fs.readFileSync(copy, 'utf8'))
    if (result.problems) {
      report.push(...result.problems)
      continue
    }
    if (!result.changed) continue
    fs.writeFileSync(source, result.text)
    const body = render(file, result.text)
    fs.writeFileSync(copy, `<!-- night-read ${hash(body)} -->\n${body}`)
    report.push(`${file}: 套用 ${result.changed} 處`)
  }
  return report
}

module.exports = { exportReading, applyAll, render }
