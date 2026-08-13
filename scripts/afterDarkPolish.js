#!/usr/bin/env node

// Batches after-dark.source.twee prose out to a local Ollama model for a
// polish/expand pass, one rule at a time, and reads the result back in.
//
// The model never gets the whole file — a 12B/14B local model chokes on
// (and mangles) anything that big. Each rule's line passages go out as
// plain `[LINE: id]` blocks with no twee syntax around them, so the model
// can't "helpfully" rewrite headers, tags or links; only prose leaves and
// only prose comes back. Everything else in the passage — needs/sets/signal,
// the `[[links]]` — is preserved byte-for-byte by never being sent.
//
// This is deliberately NOT a one-shot pipe: local-model output needs a human
// read before it lands in the story (see content/after-dark.polish-prompt.txt
// for what it tends to get wrong — invented actions, drifted punctuation,
// simplified characters). --run only writes the .out.txt; --apply is a
// separate, deliberate step.
//
// Usage:
//   yarn after-dark-polish --list
//   yarn after-dark-polish --extract st.during.sex.gentle
//   yarn after-dark-polish --run st.during.sex.gentle       (extract + call Ollama)
//   yarn after-dark-polish --apply st.during.sex.gentle      (read back the reviewed .out.txt)

const fs = require('fs')
const path = require('path')
const OpenCC = require('opencc-js')

// Detects (and fixes) simplified characters a local model slips into its
// output, by round-tripping through OpenCC's simplified→traditional
// converter: any character that changes under conversion was simplified.
// Deliberately 's2tw' — not 's2twp', whose vocabulary localisation
// false-positives on words this file's author already chose on purpose
// (「權限」 appears four times in the hand-authored original, and OpenCC
// wants to rewrite it to 「許可權」); and not 's2t', which normalises to
// archaic orthodox variants nobody actually writes (床→牀, 唇→脣, 吃→喫).
const toTraditional = OpenCC.Converter({ from: 'cn', to: 'tw' })

const args = process.argv.slice(2)
const sourcePath = path.resolve(__dirname, '../content/after-dark.source.twee')
const promptPath = path.resolve(__dirname, '../content/after-dark.polish-prompt.txt')
const batchDir = path.resolve(__dirname, '../content/after-dark.polish')

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate'
const MODEL = 'hf.co/mradermacher/Qwen3-14B-Uncensored-GGUF:Q4_K_M'
const OPTIONS = { num_ctx: 4096, temperature: 0.8, repeat_penalty: 1.15 }

const HEADER = /^:: +(.+?)(?: +\[(.*?)\])?(?: +\{.*\})?\s*$/

// ---------------------------------------------------------------- parsing

/** One line passage's prose region, located but not yet extracted. */
const findLineRegions = (lines, ruleId) => {
  const regions = []
  let i = 0
  while (i < lines.length) {
    const header = lines[i].match(HEADER)
    if (!header) {
      i += 1
      continue
    }
    const name = header[1].trim()
    const tags = (header[2] ?? '').split(/\s+/).filter(Boolean)
    const bodyStart = i + 1
    let bodyEnd = lines.length
    for (let j = bodyStart; j < lines.length; j += 1) {
      if (HEADER.test(lines[j])) {
        bodyEnd = j
        break
      }
    }
    if (tags.includes('line') && tags.includes(`rule:${ruleId}`)) {
      const body = lines.slice(bodyStart, bodyEnd)
      const dashIndex = body.findIndex((l) => l.trim() === '---')
      if (dashIndex === -1) {
        console.error(`⚠ ${name}: 找不到 ---，跳過`)
        i = bodyEnd
        continue
      }
      const rest = body.slice(dashIndex + 1)
      // Prose ends at the blank line right before the first [[link]] — not
      // at the first blank line outright, since multi-paragraph narration
      // (the tier-wired conversions) has blank lines *inside* the prose.
      let linkStart = rest.length
      for (let k = 0; k < rest.length; k += 1) {
        if (/^\[\[.*\]\]$/.test(rest[k].trim())) {
          let j = k
          while (j > 0 && rest[j - 1].trim() === '') j -= 1
          linkStart = j
          break
        }
      }
      let proseEnd = linkStart
      // No links at all: trim trailing blank lines off the prose region.
      while (proseEnd > 0 && rest[proseEnd - 1].trim() === '') proseEnd -= 1
      const proseStartAbs = bodyStart + dashIndex + 1
      const proseEndAbs = proseStartAbs + proseEnd
      const remainderStartAbs = proseStartAbs + linkStart
      regions.push({
        name,
        proseStart: proseStartAbs,
        proseEnd: proseEndAbs,
        remainderStart: remainderStartAbs,
        passageEnd: bodyEnd,
      })
    }
    i = bodyEnd
  }
  return regions
}

const listRules = (lines) => {
  const counts = new Map()
  for (const line of lines) {
    const header = line.match(HEADER)
    if (!header) continue
    const tags = (header[2] ?? '').split(/\s+/).filter(Boolean)
    const ruleTag = tags.find((t) => t.startsWith('rule:'))
    if (!tags.includes('line') || !ruleTag) continue
    const ruleId = ruleTag.slice(5)
    counts.set(ruleId, (counts.get(ruleId) ?? 0) + 1)
  }
  return counts
}

// --------------------------------------------------------------- commands

const readSource = () => fs.readFileSync(sourcePath, 'utf8').split('\n')

const cmdList = () => {
  const counts = listRules(readSource())
  for (const [ruleId, count] of counts)
    console.log(`${ruleId}  (${count} line${count > 1 ? 's' : ''})`)
  console.log(`\n${counts.size} rules total`)
}

const batchPaths = (ruleId) => ({
  in: path.join(batchDir, `${ruleId}.in.txt`),
  out: path.join(batchDir, `${ruleId}.out.txt`),
})

const extractBatch = (ruleId) => {
  const lines = readSource()
  const regions = findLineRegions(lines, ruleId)
  if (regions.length === 0) {
    console.error(`找不到 rule ${ruleId} 底下的任何 line passage`)
    process.exit(1)
  }
  const out = regions
    .map((r) => `[LINE: ${r.name}]\n${lines.slice(r.proseStart, r.proseEnd).join('\n')}\n`)
    .join('\n')
  fs.mkdirSync(batchDir, { recursive: true })
  const { in: inPath } = batchPaths(ruleId)
  fs.writeFileSync(inPath, out)
  console.log(`寫入 ${path.relative(process.cwd(), inPath)} · ${regions.length} 行`)
  return { regions, out }
}

const callOllama = async (material) => {
  const promptTemplate = fs.readFileSync(promptPath, 'utf8')
  const prompt = promptTemplate.replace('[MATERIAL]', material)
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    body: JSON.stringify({ model: MODEL, prompt, stream: false, options: OPTIONS }),
  })
  if (!res.ok) throw new Error(`Ollama 回應 ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.response
}

const runBatch = async (ruleId) => {
  const { out: material } = extractBatch(ruleId)
  console.log(`送給 ${MODEL}……`)
  const start = Date.now()
  const response = await callOllama(material)
  const { out: outPath } = batchPaths(ruleId)
  fs.writeFileSync(outPath, response)
  console.log(
    `寫入 ${path.relative(process.cwd(), outPath)} · ${((Date.now() - start) / 1000).toFixed(1)}s`
  )
  console.log('先人工檢查這份檔案（簡體字／自己加的劇情／標點被改），再跑 --apply。')
}

/** Parses a `[LINE: id]\n<prose>` batch file back into a name → prose map. */
const parseBatch = (text) => {
  const map = new Map()
  // Not anchored to its own line — the model sometimes runs prose straight
  // on from the marker with no newline in between (seen on st.body.display).
  const blocks = text.split(/\[LINE: (.+?)\]/)
  // split on a capturing regex interleaves [prefix, id, body, id, body, ...]
  for (let i = 1; i < blocks.length; i += 2) {
    const name = blocks[i].trim()
    const prose = blocks[i + 1].replace(/^\n+/, '').replace(/\n+$/, '')
    map.set(name, prose)
  }
  return map
}

/** Mechanical checks a human reviewer would otherwise have to do by eye. */
const checkProse = (name, original, polished) => {
  const issues = []
  const converted = toTraditional(polished)
  if (converted !== polished) {
    // Length can shift under phrase-level localisation (软件→軟體), so this
    // is a best-effort "roughly here" pointer, not a precise character diff.
    const polishedChars = [...polished]
    const convertedChars = [...converted]
    const diffAt = polishedChars.findIndex((ch, i) => ch !== convertedChars[i])
    const around = polishedChars.slice(Math.max(0, diffAt - 5), diffAt + 6).join('')
    issues.push({ level: 'error', message: `簡體字/大陸用語，大約在「…${around}…」附近` })
  }
  const dotsIn = (original.match(/\.\.\.+/g) ?? []).length
  const dotsOut = (polished.match(/\.\.\.+/g) ?? []).length
  if (dotsOut > dotsIn) issues.push({ level: 'warn', message: '刪節號疑似被改成半形「...」' })
  if (!polished.startsWith(original.slice(0, Math.min(20, original.length))))
    issues.push({ level: 'warn', message: '開頭跟原文對不太起來，原句可能被整段改寫' })
  return issues
}

const applyBatch = (ruleId, { dryRun = false } = {}) => {
  const { out: outPath } = batchPaths(ruleId)
  if (!fs.existsSync(outPath)) {
    console.error(`找不到 ${path.relative(process.cwd(), outPath)}，先跑 --run 或手動放一份進去`)
    process.exit(1)
  }
  const lines = readSource()
  const regions = findLineRegions(lines, ruleId)
  const polished = parseBatch(fs.readFileSync(outPath, 'utf8'))

  const regionNames = new Set(regions.map((r) => r.name))
  const missing = regions.filter((r) => !polished.has(r.name))
  const extra = [...polished.keys()].filter((name) => !regionNames.has(name))
  if (missing.length > 0 || extra.length > 0) {
    if (missing.length > 0)
      console.error(`✗ 潤飾檔缺了: ${missing.map((r) => r.name).join(', ')}`)
    if (extra.length > 0) console.error(`✗ 潤飾檔多出不認得的標記: ${extra.join(', ')}`)
    console.error('沒有寫回，先修好上面的落差。')
    process.exit(1)
  }

  let hasError = false
  for (const region of regions) {
    const original = lines.slice(region.proseStart, region.proseEnd).join('\n')
    const issues = checkProse(region.name, original, polished.get(region.name))
    for (const issue of issues) {
      console.log(`${issue.level === 'error' ? '✗' : '⚠'} ${region.name}: ${issue.message}`)
      if (issue.level === 'error') hasError = true
    }
  }
  if (dryRun) {
    console.log(hasError ? '有簡體字要處理。' : '沒有擋下任何東西，可以 --apply。')
    return
  }
  if (hasError && !args.includes('--force')) {
    console.error('有簡體字沒解決，沒有寫回。修好潤飾檔，或加 --force 硬寫（不建議）。')
    process.exit(1)
  }

  // Walk the file once, splicing in the new prose at each region and
  // otherwise copying lines through untouched — this is what keeps every
  // needs/sets/signal field and every [[link]] byte-identical.
  const outLines = []
  let cursor = 0
  for (const region of regions.sort((a, b) => a.proseStart - b.proseStart)) {
    outLines.push(...lines.slice(cursor, region.proseStart))
    outLines.push(...polished.get(region.name).split('\n'))
    cursor = region.proseEnd
  }
  outLines.push(...lines.slice(cursor))

  fs.writeFileSync(sourcePath, outLines.join('\n'))
  console.log(`已寫回 ${path.relative(process.cwd(), sourcePath)} · ${regions.length} 行更新`)
  console.log('接著跑 yarn twee-source --compile 跟 yarn lint-after-dark 確認沒壞。')
}

/** Runs a .out.txt through the same simplified→traditional converter --check uses. */
const autofixBatch = (ruleId) => {
  const { out: outPath } = batchPaths(ruleId)
  const text = fs.readFileSync(outPath, 'utf8')
  const fixed = toTraditional(text)
  if (fixed === text) {
    console.log(`${ruleId}: 沒有簡體字`)
    return
  }
  fs.writeFileSync(outPath, fixed)
  console.log(`${ruleId}: 已轉換`)
}

// ------------------------------------------------------------------- main

const ruleArg = args.find((a) => !a.startsWith('--'))

;(async () => {
  if (args.includes('--list')) return cmdList()
  if (args.includes('--extract')) {
    if (!ruleArg) throw new Error('用法: --extract <ruleId>')
    return extractBatch(ruleArg)
  }
  if (args.includes('--run')) {
    if (!ruleArg) throw new Error('用法: --run <ruleId>')
    return runBatch(ruleArg)
  }
  if (args.includes('--check')) {
    if (!ruleArg) throw new Error('用法: --check <ruleId>')
    return applyBatch(ruleArg, { dryRun: true })
  }
  if (args.includes('--autofix')) {
    if (!ruleArg) throw new Error('用法: --autofix <ruleId>')
    return autofixBatch(ruleArg)
  }
  if (args.includes('--apply')) {
    if (!ruleArg) throw new Error('用法: --apply <ruleId>')
    return applyBatch(ruleArg)
  }
  console.error(
    '用法: yarn after-dark-polish [--list|--extract|--run|--check|--autofix|--apply] [ruleId]'
  )
  process.exit(1)
})().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
