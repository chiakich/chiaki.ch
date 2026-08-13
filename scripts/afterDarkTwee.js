#!/usr/bin/env node

// The .twee authoring pipeline for the after-dark branch — see
// scripts/tweeFormat.js for the format itself.
//
//   --emit      seed content/after-dark.source.twee from the current JSON
//   --compile   compile that .twee back into content/after-dark.json
//   --check     emit → compile → compare, without writing anything
//
// The seed is a one-time step. Once you are authoring in Twine, the .twee is
// the source and the JSON is a build product; re-seeding would overwrite your
// passage layout with a fresh one derived from the compiled output.

const fs = require('fs')
const path = require('path')
const { fromTwee, toTwee } = require('./tweeFormat')

const args = process.argv.slice(2)
const jsonPath = path.resolve(__dirname, '../content/after-dark.json')
const tweePath = path.resolve(__dirname, '../content/after-dark.source.twee')

const readJson = () => JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

const report = (problems) => {
  for (const problem of problems) console.log(`⚠ ${problem}`)
  return problems.length
}

// Compares what matters — the rules and cards the engine will see — rather
// than bytes, since key order and absent-vs-undefined are not differences the
// engine can observe. Card ids are deliberately excluded: the format renames
// them after the passage they lead to, which is the point of moving to it.
// What must survive is which card *texts* each line offers.
const normalise = (payload) => {
  const text = new Map(
    (payload.suggestions ?? []).map((item) => [item.id, item.text])
  )
  return JSON.stringify({
    rules: (payload.rules ?? []).map((rule) => ({
      id: rule.id,
      priority: rule.priority ?? null,
      patterns: rule.patterns ?? [],
      keywords: rule.keywords ?? [],
      requires: rule.requires ?? [],
      blockedBy: rule.blockedBy ?? [],
      continues: rule.continues ?? null,
      replies: (rule.replies ?? []).map((reply) => ({
        text: reply.text,
        emotion: reply.emotion ?? null,
        signal: reply.signal ?? null,
        minSignal: reply.minSignal ?? null,
        needs: reply.needs ?? [],
        remember: reply.remember ?? [],
        forget: reply.forget ?? [],
        opens: reply.opens ?? null,
        clearsPending: reply.clearsPending ?? false,
        clearsAfterDark: reply.clearsAfterDark ?? false,
        offers: (reply.offers ?? []).map((id) => text.get(id) ?? id),
      })),
    })),
    suggestions: (payload.suggestions ?? [])
      .map((item) => ({
        text: item.text,
        needs: item.needs ?? [],
        done: item.done ?? null,
      }))
      .sort((a, b) => (a.text < b.text ? -1 : 1)),
  })
}

if (args.includes('--check')) {
  const original = readJson()
  const { payload, problems } = fromTwee(toTwee(original))
  const failures = report(problems)
  // Two questions, not one. Prose, gating and which cards each line offers
  // must survive exactly — that is the payload the engine runs. A card's own
  // `needs` is *derived* from where it sits in the graph, so a hand-wired
  // value that disagreed with the graph is expected to change here, and is
  // reported rather than treated as a failure.
  const strip = (text) =>
    JSON.stringify(JSON.parse(text), (key, value) =>
      key === 'suggestions' ? undefined : value
    )
  const same = strip(normalise(original)) === strip(normalise(payload))
  const cards = normalise(original) === normalise(payload)
  console.log(
    same
      ? '✓ rules / 台詞 / offers 完全一致'
      : '✗ rules / 台詞 / offers 不一致'
  )
  if (same && !cards) {
    const a = new Map(original.suggestions.map((item) => [item.text, item]))
    const drifted = payload.suggestions.filter(
      (item) =>
        JSON.stringify(a.get(item.text)?.needs ?? []) !==
        JSON.stringify(item.needs ?? [])
    )
    console.log(`  ${drifted.length} 張卡的 needs 由圖上的位置重新推導：`)
    for (const item of drifted)
      console.log(
        `    「${item.text}」 ${JSON.stringify(
          a.get(item.text)?.needs ?? []
        )} → ${JSON.stringify(item.needs ?? [])}`
      )
  }
  if (!same) {
    const a = JSON.parse(normalise(original))
    const b = JSON.parse(normalise(payload))
    console.log(`  rules ${a.rules.length} → ${b.rules.length}`)
    console.log(`  cards ${a.suggestions.length} → ${b.suggestions.length}`)
    for (const [index, rule] of a.rules.entries()) {
      const other = b.rules[index]
      if (!other) {
        console.log(`  少了 rule ${rule.id}`)
        continue
      }
      if (JSON.stringify(rule) !== JSON.stringify(other))
        console.log(`  rule ${rule.id} 不一致`)
    }
  }
  process.exit(same && failures === 0 ? 0 : 1)
}

if (args.includes('--emit')) {
  if (fs.existsSync(tweePath) && !args.includes('--force')) {
    console.error(
      `${path.relative(process.cwd(), tweePath)} 已存在。` +
        '重新產生會蓋掉你在 Twine 裡的編排 —— 確定要的話加 --force。'
    )
    process.exit(1)
  }
  fs.writeFileSync(tweePath, toTwee(readJson()))
  console.log(`Wrote ${path.relative(process.cwd(), tweePath)}`)
  process.exit(0)
}

if (args.includes('--compile')) {
  if (!fs.existsSync(tweePath)) {
    console.error(`找不到 ${path.relative(process.cwd(), tweePath)}，先跑 --emit`)
    process.exit(1)
  }
  const { payload, problems } = fromTwee(fs.readFileSync(tweePath, 'utf8'))
  if (report(problems) > 0) {
    console.error('有問題沒解決，沒有寫出 JSON。')
    process.exit(1)
  }
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(
    `Wrote ${path.relative(process.cwd(), jsonPath)} · ` +
      `${payload.rules.length} rules · ${payload.suggestions.length} cards`
  )
  console.log('接著跑 yarn encode-after-dark 才會進到網站。')
  process.exit(0)
}

console.error('用法: yarn twee-source [--emit|--compile|--check] [--force]')
process.exit(1)
