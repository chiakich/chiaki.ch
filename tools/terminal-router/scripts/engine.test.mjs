import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createSession, respond, rules, jumpTo, parseLexicon, normalize, LEGACY_ROUTER_POLICY, DEFAULT_ROUTER_POLICY } from '../build/engine.mjs'
import { LEXICON, TRAIN_DATA, TEST, readJson, readJsonl } from './paths.mjs'
const lexicon = parseLexicon(readFileSync(LEXICON, 'utf8'))
const policy = DEFAULT_ROUTER_POLICY
const say = (text, scores, session = createSession(), p = policy) => {
  const random = Math.random; Math.random = () => .42
  try { return respond(text, session, lexicon, scores && new Map(scores), p) }
  finally { Math.random = random }
}

test('a confident age question can correct a related but wrong year rule', () => {
  const scores = [['age', .893], ['peace', .737], ['name', .562]]
  assert.equal(say('妳是哪一年出生的', scores, createSession(), LEGACY_ROUTER_POLICY).intentId, 'age.years')
  assert.equal(say('妳是哪一年出生的', scores).ruleId, 'age')
})
test('ambiguous fill and override candidates retain the original response', () => {
  for (const text of ['我本來是要問', '妳是哪一年出生的']) {
    const baseline = say(text, null)
    const turn = say(text, [['age', .8], ['peace', .79]])
    assert.equal(turn.ruleId, baseline.ruleId)
    assert.equal(turn.routed, undefined)
  }
})
test('an answer to a pending question and a contextual follow-up outrank the router', () => {
  for (const [text, setup] of [
    ['是', s => { s.pending = 'alive' }],
    ['然後呢', s => { s.lastTopic = 'war' }],
    ['我要走了掰掰', () => {}],
  ]) {
    const session = createSession(); setup(session)
    const baseline = say(text, null, structuredClone(session))
    const turn = say(text, [['age', .99]], session)
    assert.equal(turn.ruleId, baseline.ruleId)
    assert.equal(turn.routed, undefined)
  }
})
test('locked rules cannot be selected by a high score', () => {
  const gated = rules.find(r => r.requires?.length && !r.continues && r.patterns.length)
  assert.ok(gated)
  assert.notEqual(say('我本來是要問', [[gated.id, .99]]).ruleId, gated.id)
})
test('story discovery waits while the visitor asks a question, even without a router', () => {
  const session = createSession()
  session.modernScore = 100
  const turn = say('你們研究室有電腦嗎？', null, session)
  assert.notEqual(turn.ruleId, 'discovery.peacetime')
  assert.equal(session.flags.has('askedPeace'), false)
  const next = say('我正在用手機', null, session)
  assert.equal(next.ruleId, 'discovery.peacetime')
})
test('a rule answering the question clause is not displaced by its introductory topic', () => {
  const turn = say('我今天好累，你會寂寞嗎？', [['tired', .99], ['st.lonely', .5]])
  assert.equal(turn.ruleId, 'st.lonely')
  assert.equal(turn.routed, undefined)
})
test('hardware complaints never draw the programming-specific reply', () => {
  const tech = rules.find(r => r.id === 'visitor.tech')
  for (let i = 0; i < 20; i++) {
    const random = Math.random; Math.random = () => i / 20
    try {
      const session = createSession(); session.flags.add('knowsPeace')
      const turn = respond('電腦很慢', session, lexicon)
      assert.equal(turn.ruleId, 'visitor.tech')
      assert.ok(!turn.text.includes('程式我不會寫'))
      assert.ok(!turn.text.includes('一起壞給你看'))
    } finally { Math.random = random }
  }
  const session = createSession()
  tech.replies.filter(r => !r.forInput).forEach(r => session.used.add(r.text))
  assert.equal(jumpTo('visitor.tech', session), null, 'a chip has no direct input to justify a specific reply')
})
test('a programming question selects its available specific answer', () => {
  const turn = say('javascript迴圈怎麼寫', null)
  assert.equal(turn.ruleId, 'visitor.tech')
  assert.equal(turn.intentId, 'tech.code')
  assert.match(turn.text, /不會寫|不能改/)
})
test('corrections discard the negated subject, including simplified input', () => {
  for (const text of ['不是程式，我問的是印表機壞了', '不是程序，我问的是印表机坏了']) {
    const s = createSession(); s.flags.add('knowsPeace')
    const turn = say(text, null, s)
    assert.equal(turn.intentId, 'tech.device')
    assert.doesNotMatch(turn.text, /程式|除錯/)
  }
})
test('an explicit visitor subject and preferences do not become specific bot facts', () => {
  for (const text of ['我今天看到太陽', '我家氣溫三十度', '我的生日是明天', '你喜歡寫程式嗎？', '今天幾月幾號', '外頭是大太陽喔，沒半片雪花', '我的老闆很機車']) {
    const s = createSession(); s.flags.add('knowsPeace')
    assert.equal(say(text, null, s).intentId, undefined)
  }
})
test('follow-ups stay on the answered aspect and chips clear the aspect memory', () => {
  const s = createSession()
  assert.equal(say('雪下了多久？', null, s).intentId, 'snow.duration')
  assert.equal(say('為什麼？', null, s).intentId, 'snow.cause')
  say('我問的是雪有多厚？', null, s)
  assert.equal(say('再多說一點', null, s).intentId, 'snow.depth')
  assert.match(say('再多說一點', null, s).text, /沒有更多確定/)
  assert.ok(jumpTo('age', s))
  assert.equal(s.lastAnswerIntent, null)
})
test('prepared training inputs are disjoint from dev/test and have one label per text', () => {
  const train = readJsonl(`${TRAIN_DATA}train.jsonl`), dev = readJsonl(`${TRAIN_DATA}dev.jsonl`)
  const heldout = new Set(dev.map(r => r.text))
  for (const text of [...readJson(`${TEST}cases.json`).flatMap(c => c.texts), ...readJson(`${TEST}negatives.json`)]) heldout.add(normalize(text).text)
  const labels = new Map()
  for (const r of train) {
    assert.ok(!heldout.has(r.text), `training overlap: ${r.text}`)
    assert.ok(!labels.has(r.text) || labels.get(r.text) === r.label, `conflicting label: ${r.text}`)
    labels.set(r.text, r.label)
  }
  assert.ok(!train.some(r => ['什麼', '哪一', '出來'].includes(r.text)))
})
test('the exported router matches the calibrated policy and prepared anchors', () => {
  const manifest = readJson(new URL('../../../public/assets/story/terminal/router/v4/manifest.json', import.meta.url))
  assert.deepEqual(manifest.policy, DEFAULT_ROUTER_POLICY)
  const hash = createHash('sha256').update(readFileSync(`${TRAIN_DATA}train.jsonl`)).digest('hex')
  assert.equal(manifest.trainingSha256, hash)
})
