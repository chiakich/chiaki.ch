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

const render = (file, text) => {
  const labels = flagLabels(text)
  const out = [`# ${path.basename(file, '.twee')}`, '']
  let notes = []
  let last = 'blank'

  const emit = (kind, line) => {
    // Runs of messages, choices and list entries stay together.
    if (last !== 'blank' && !(kind === last && STACKED.has(kind))) out.push('')
    // Two trailing spaces keep each message on its own line in Markdown preview.
    out.push(kind === 'type' ? `${line}  ` : line)
    last = kind
  }
  const flushNotes = () => {
    if (!notes.length) return
    emit('note', `［${notes.join(' · ')}］`)
    notes = []
  }

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const header = line.match(/^:: +(\S+)(?: +\[(.*?)\])?/)
    if (header) {
      flushNotes()
      out.push('', `## ${header[1]}${header[2] ? `　〔${header[2]}〕` : ''}`)
      last = 'blank'
      out.push('')
      continue
    }
    if (line.startsWith('//')) {
      flushNotes()
      const body = line.slice(2).trim()
      const section = body.match(/^─+\s*(.+)$/)
      if (section) {
        out.push('', '---', '', `# ${section[1]}`, '')
        last = 'blank'
      } else emit('comment', `※ ${body}`)
      continue
    }
    if (line.startsWith('@')) {
      const [op, ...args] = line.slice(1).split(/\s+/)
      const rest = line.slice(1 + op.length).trim()
      if (HIDDEN.has(op)) continue
      if (['if', 'else', 'endif', 'goto', 'summary', 'end', 'list', 'choices', 'hot'].includes(op))
        flushNotes()
      if (op === 'if') emit('flow', `◇ 如果${readCond(rest, labels)}`)
      else if (op === 'else') emit('flow', '◇ 否則')
      else if (op === 'endif') emit('flow', '◇ 分支結束')
      else if (op === 'goto') emit('flow', `→ ${rest}`)
      else if (op === 'summary') emit('flow', '［本夜結束］')
      else if (op === 'end') emit('flow', '［結束］')
      else if (op === 'list') emit('list', `［清單］${rest}`)
      else if (op === 'choices') emit('flow', `［選擇：${rest}］`)
      else if (op === 'hot')
        emit('note', `［提示：${PART[args[0]] ?? args[0]}「${args[2]}」${args[3] ? ` · ${args[3]} 秒` : ''}］`)
      else notes.push(note(op, args))
      continue
    }
    flushNotes()
    const choice = line.match(CHOICE)
    if (choice) {
      const cond = choice[3] ? `（${readCond(choice[3].trim(), labels)}）` : ''
      emit('choice', `〔${choice[1].trim()}〕→ ${choice[2].trim()}${cond}  `)
      continue
    }
    if (/^~\d+(\.\d+)?$/.test(line)) emit('pause', `（${line.slice(1)}s）`)
    else if (line.startsWith('~unsent ')) emit('type', `> ~~${line.slice(8)}~~（打了又刪掉）`)
    else if (line.startsWith('> ') || line === '>') emit('type', line)
    else if (line.startsWith('! ')) emit('sys', `【${line.slice(2)}】`)
    else emit('text', line)
  }
  flushNotes()
  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`
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

module.exports = { exportReading }
