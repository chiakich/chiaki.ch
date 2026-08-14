// The .twee authoring format for the after-dark branch, both directions.
//
// A passage is one line she says. A link is one card the visitor can take.
// That is the whole idea: what you draw in Twine is what the visitor walks,
// with no second representation to keep in sync.
//
//   :: @st.during.sex.gentle [rule]
//   requires: acceptedSex, gentlePath, startedMoving
//   patterns:
//     ^(?:溫柔一點|慢一點)$
//
//   :: gentle.feeling [line rule:st.during.sex.gentle emotion:shy]
//   needs: startedMoving, gentlePath
//   sets: startedFeeling
//   ---
//   ……好溫暖。你緩緩進出時，裡面會自行變得濕熱。
//
//   [[你看起來開始發抖了。->gentle.begging]]
//   [[（轉過去，從後面進來）->doggy.turn]]
//
// `@`-prefixed `rule` passages carry what belongs to a rule rather than to a
// line — the patterns that let it be reached, and the flags that gate it.
// `line` passages carry the prose, and their order in the file is their tier
// order within the rule, which is what `pickReply` walks.
//
// Links become both a suggestion (the card's text) and an `offers` entry on
// the line that shows it. A card's `needs`/`done` are read off its target, so
// the flag handshake stays derived rather than hand-maintained.

const LIST_FIELDS = new Set([
  'needs',
  'sets',
  'forget',
  'requires',
  'blockedBy',
  'keywords',
])
const NUMBER_FIELDS = new Set(['signal', 'minSignal', 'priority'])
const FLAG_TAGS = new Set(['clearsPending', 'clearsAfterDark', 'repeatable'])

const splitList = (value) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

const LINK = /\[\[([^\]]*?)->([^\]]+?)\]\]/g

// ─────────────────────────────────────────────────────────────────── parsing

const parsePassages = (text) => {
  const passages = []
  let current = null
  for (const raw of text.split(/\r?\n/)) {
    const header = raw.match(/^:: +(.+?)(?: +\[(.*?)\])?(?: +\{.*\})?\s*$/)
    if (header) {
      current = {
        name: header[1].trim(),
        tags: (header[2] ?? '').split(/\s+/).filter(Boolean),
        lines: [],
      }
      passages.push(current)
      continue
    }
    if (current) current.lines.push(raw)
  }
  return passages
}

/** Header lines are `key: value` up to a `---` rule or the first blank line. */
const splitBody = (lines) => {
  const fields = {}
  let index = 0
  let key = null
  for (; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.trim() === '---') {
      index += 1
      break
    }
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/)
    if (match) {
      key = match[1]
      if (match[2].trim().length > 0) fields[key] = match[2].trim()
      else fields[key] = []
      continue
    }
    // An indented line continues the previous key — this is how a rule lists
    // several patterns without cramming them onto one comma-separated line,
    // which a regex containing a comma would break.
    if (key !== null && /^\s+\S/.test(line)) {
      if (!Array.isArray(fields[key])) fields[key] = [fields[key]]
      fields[key].push(line.trim())
      continue
    }
    if (line.trim().length === 0 && Object.keys(fields).length > 0) {
      index += 1
      break
    }
    if (line.trim().length > 0) break
  }
  return { fields, body: lines.slice(index) }
}

const tagValues = (tags) => {
  const values = {}
  const flags = new Set()
  for (const tag of tags) {
    const [key, ...rest] = tag.split(':')
    if (rest.length > 0) values[key] = rest.join(':')
    else flags.add(key)
  }
  return { values, flags }
}

const readField = (fields, key) => {
  const value = fields[key]
  if (value === undefined) return undefined
  if (LIST_FIELDS.has(key)) {
    const list = Array.isArray(value) ? value : splitList(value)
    return list.length > 0 ? list : undefined
  }
  if (NUMBER_FIELDS.has(key)) return Number(value)
  return Array.isArray(value) ? value[0] : value
}

const patternList = (fields) => {
  const value = fields.patterns
  if (value === undefined) return []
  return (Array.isArray(value) ? value : [value]).filter(
    (entry) => entry.length > 0
  )
}

/** Compiles an authored .twee into the payload the engine loads. */
const fromTwee = (text) => {
  const passages = parsePassages(text)
  const problems = []

  const ruleMeta = new Map()
  const lines = []
  for (const passage of passages) {
    const { fields, body } = splitBody(passage.lines)
    const { values, flags } = tagValues(passage.tags)

    if (passage.tags.includes('rule')) {
      ruleMeta.set(passage.name.replace(/^@/, ''), { fields, flags })
      continue
    }
    if (!passage.tags.includes('line')) continue

    const ruleId = values.rule
    if (!ruleId) {
      problems.push(`${passage.name}: line 沒有 rule: 標籤`)
      continue
    }
    const links = []
    const prose = body
      .join('\n')
      .replace(LINK, (_, label, target) => {
        links.push({ label: label.trim(), target: target.trim() })
        return ''
      })
      .trim()

    lines.push({ name: passage.name, ruleId, fields, values, flags, prose, links })
  }

  const byName = new Map(lines.map((line) => [line.name, line]))

  // Cards no line offers still have to live somewhere, or seeding the file
  // would quietly drop them. They belong to the pool, which is what the
  // engine falls back to when a line names no exits.
  const poolLinks = []
  const unplaced = []
  for (const passage of passages) {
    if (!passage.tags.includes('pool')) continue
    const { fields, body } = splitBody(passage.lines)
    body.join('\n').replace(LINK, (_, label, target) => {
      poolLinks.push({ label: label.trim(), target: target.trim() })
      return ''
    })
    const listed = fields.unplaced
    for (const entry of Array.isArray(listed) ? listed : [listed ?? []])
      if (typeof entry === 'string' && entry.length > 0) {
        const [text, needs, done] = entry.split('|').map((part) => part.trim())
        problems.push(`pool: 「${text}」還沒有目標 passage，只會靠 pool fallback 出現`)
        unplaced.push({ text, needs: splitList(needs ?? ''), done })
      }
  }

  // A card is named after where it leads, so the same destination reached by
  // two different phrasings stays two cards rather than silently collapsing.
  const suggestions = []
  const cardId = new Map()
  const usedIds = new Map()
  const allLinks = [
    ...lines.flatMap((line) => line.links.map((link) => ({ ...link, from: line.name }))),
    ...poolLinks.map((link) => ({ ...link, from: 'pool' })),
  ]
  for (const link of allLinks) {
    {
      const key = `${link.label}->${link.target}`
      if (cardId.has(key)) continue
      const target = byName.get(link.target)
      if (!target) {
        problems.push(`${link.from}: 連到不存在的 passage「${link.target}」`)
        continue
      }
      const count = (usedIds.get(link.target) ?? 0) + 1
      usedIds.set(link.target, count)
      const id = count === 1 ? link.target : `${link.target}.${count}`
      cardId.set(key, id)
      // A card's gate is *when it should appear*, which is the moment the line
      // showing it lands — not the gate on where it leads. Reading it off the
      // target instead both loses the opening cards (whose targets answer a
      // `continues` and so are ungated) and over-gates the spine, since a
      // register rung waits on `gentlePath`/`toolPath` while the card offering
      // it belongs to both voices.
      const source = link.from === 'pool' ? null : byName.get(link.from)
      const gate = source
        ? readField(source.fields, 'card') ?? readField(source.fields, 'sets')?.[0]
        : readField(target.fields, 'needs')?.filter(
            (flag) => !flag.endsWith('Path')
          )[0]
      suggestions.push({
        id,
        text: link.label,
        needs: gate ? [gate] : undefined,
        // A line often sets several flags at once — st.oral's opener sets
        // `enteredAfterDark`, `startedOral` and `usedOnce` together — and only
        // one of them is what *taking the card* accomplished. `card:` names it;
        // without it the first flag is the best guess available.
        done:
          readField(target.fields, 'card') ?? readField(target.fields, 'sets')?.[0],
        // Lets a chip click jump straight to the rule that owns its target
        // passage instead of re-matching `text` against every rule's patterns.
        ruleId: target.ruleId,
      })
    }
  }
  for (const card of unplaced)
    suggestions.push({
      id: card.done ?? card.text,
      text: card.text,
      needs: card.needs.length > 0 ? card.needs : undefined,
      done: card.done,
    })

  // Authored gates win over derived ones — see the @cards passage in toTwee.
  // A card drawn fresh in Twine simply is not listed, and keeps its default.
  const overrides = new Map()
  for (const passage of passages) {
    if (!passage.tags.includes('cards')) continue
    const { body } = splitBody(passage.lines)
    for (const raw of body) {
      if (raw.trim().length === 0) continue
      const [text, needs, done] = raw.split('|').map((part) => part.trim())
      overrides.set(text, {
        needs: splitList(needs ?? ''),
        done: done && done.length > 0 ? done : undefined,
      })
    }
  }
  for (const card of suggestions) {
    const override = overrides.get(card.text)
    if (!override) continue
    card.needs = override.needs.length > 0 ? override.needs : undefined
    card.done = override.done
  }

  const rules = []
  const seen = new Set()
  for (const line of lines) {
    if (seen.has(line.ruleId)) continue
    seen.add(line.ruleId)
    const meta = ruleMeta.get(line.ruleId)
    if (!meta) {
      problems.push(`${line.ruleId}: 沒有對應的 :: @${line.ruleId} [rule] passage`)
      continue
    }
    const members = lines.filter((entry) => entry.ruleId === line.ruleId)
    const patterns = patternList(meta.fields)
    if (patterns.length === 0)
      problems.push(`${line.ruleId}: 沒有 patterns，永遠不會被觸發`)

    rules.push({
      id: line.ruleId,
      priority: readField(meta.fields, 'priority'),
      patterns,
      keywords: readField(meta.fields, 'keywords'),
      requires: readField(meta.fields, 'requires'),
      blockedBy: readField(meta.fields, 'blockedBy'),
      continues: readField(meta.fields, 'continues'),
      // A jump-list target reachable again later (an after-dark scene the
      // ending loops back to, say) must not read as her repeating herself —
      // that is what routes a second visit to EXHAUSTED's meta "I already
      // said this" lines instead of the reply itself.
      repeatable: meta.flags.has('repeatable') || undefined,
      replies: members.map((entry) => ({
        text: entry.prose,
        emotion: entry.values.emotion,
        signal: readField(entry.fields, 'signal'),
        minSignal: readField(entry.fields, 'minSignal'),
        needs: readField(entry.fields, 'needs'),
        remember: readField(entry.fields, 'sets'),
        forget: readField(entry.fields, 'forget'),
        opens: readField(entry.fields, 'opens'),
        clearsPending: entry.flags.has('clearsPending') || undefined,
        clearsAfterDark: entry.flags.has('clearsAfterDark') || undefined,
        offers: entry.links.length
          ? entry.links
              .map((link) => cardId.get(`${link.label}->${link.target}`))
              .filter(Boolean)
          : undefined,
      })),
    })
  }

  // JSON.stringify drops undefined for us, so the payload stays as terse as a
  // hand-written one instead of carrying a null for every unused field.
  return { payload: JSON.parse(JSON.stringify({ rules, suggestions })), problems }
}

// ───────────────────────────────────────────────────────────────── emitting

const field = (key, value) => {
  if (value === undefined || value === null) return null
  if (Array.isArray(value))
    return value.length > 0 ? `${key}: ${value.join(', ')}` : null
  return `${key}: ${value}`
}

/** Seeds an authoring file from an existing payload. */
const toTwee = (payload) => {
  const rules = payload.rules ?? []
  const suggestions = payload.suggestions ?? []
  const byId = new Map(suggestions.map((item) => [item.id, item]))

  // Passage names have to be stable and readable; the rule id plus its tier
  // index is both, and it matches what the graph view already labels.
  const nameOf = (ruleId, index) => `${ruleId.replace(/^st\./, '')}.${index}`

  // Where each card leads, so a link can point at a passage rather than at a
  // flag. Falls back to the card's `done` being some line's first `sets`.
  const landing = new Map()
  for (const rule of rules)
    (rule.replies ?? []).forEach((reply, index) => {
      for (const flag of reply.remember ?? [])
        if (!landing.has(flag)) landing.set(flag, nameOf(rule.id, index))
    })

  // What arriving at a passage accomplishes, when it is not simply the first
  // flag the line sets — read back off the cards that lead there.
  const accomplishes = new Map()
  for (const card of suggestions) {
    const target = card.done ? landing.get(card.done) : undefined
    if (target && !accomplishes.has(target)) accomplishes.set(target, card.done)
  }

  const out = []
  for (const rule of rules) {
    const ruleTags = ['rule', ...(rule.repeatable ? ['repeatable'] : [])]
    out.push(
      `:: @${rule.id} [${ruleTags.join(' ')}]`,
      ...[
        field('priority', rule.priority),
        field('requires', rule.requires),
        field('blockedBy', rule.blockedBy),
        field('continues', rule.continues),
        field('keywords', rule.keywords),
      ].filter(Boolean),
      'patterns:',
      ...(rule.patterns ?? []).map((pattern) => `  ${pattern}`),
      ''
    )

    ;(rule.replies ?? []).forEach((reply, index) => {
      const tags = ['line', `rule:${rule.id}`]
      if (reply.emotion) tags.push(`emotion:${reply.emotion}`)
      if (reply.clearsPending) tags.push('clearsPending')
      if (reply.clearsAfterDark) tags.push('clearsAfterDark')

      const links = (reply.offers ?? []).flatMap((id) => {
        const card = byId.get(id)
        if (!card) return []
        const target = card.done ? landing.get(card.done) : undefined
        return target ? [`[[${card.text}->${target}]]`] : []
      })

      out.push(
        `:: ${nameOf(rule.id, index)} [${tags.join(' ')}]`,
        ...[
          field('needs', reply.needs),
          field('sets', reply.remember),
          ...(accomplishes.get(nameOf(rule.id, index)) !== undefined &&
          accomplishes.get(nameOf(rule.id, index)) !== (reply.remember ?? [])[0]
            ? [field('card', accomplishes.get(nameOf(rule.id, index)))]
            : []),
          field('forget', reply.forget),
          field('signal', reply.signal),
          field('minSignal', reply.minSignal),
          field('opens', reply.opens),
        ].filter(Boolean),
        '---',
        reply.text,
        ...(links.length > 0 ? ['', ...links] : []),
        ''
      )
    })
  }

  // Cards nothing offers. They still work — the engine falls back to the pool
  // — but they have no line to hang off, so they get a passage of their own
  // rather than being dropped on the way into the format.
  const offered = new Set(
    rules.flatMap((rule) =>
      (rule.replies ?? []).flatMap((reply) => reply.offers ?? [])
    )
  )
  const strays = suggestions.filter((item) => !offered.has(item.id))
  if (strays.length > 0) {
    const links = []
    const unplaced = []
    for (const card of strays) {
      const target = card.done ? landing.get(card.done) : undefined
      if (target) links.push(`[[${card.text}->${target}]]`)
      else
        unplaced.push(
          `unplaced: ${card.text} | ${(card.needs ?? []).join(', ')} | ${card.done ?? ''}`
        )
    }
    out.push(':: @pool [pool]', ...unplaced, '---', ...links, '')
  }

  // Every card's gate, in one table. Deriving it from graph position works for
  // a link drawn fresh in Twine, but it cannot recover an author's intent
  // where a card has several sources or lives in the pool — and it is the
  // difference between a card waiting for consent and one that does not.
  // Listing all of them keeps the file lossless and puts the gating somewhere
  // it can be read and edited as a whole.
  out.push(
    ':: @cards [cards]',
    '---',
    ...suggestions.map(
      (card) =>
        `${card.text} | ${(card.needs ?? []).join(', ')} | ${card.done ?? ''}`
    ),
    ''
  )
  return `${out.join('\n')}\n`
}

module.exports = { fromTwee, toTwee }
