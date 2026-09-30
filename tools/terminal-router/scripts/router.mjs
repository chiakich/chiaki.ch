// Embedding router over the generated paraphrases, shared by the replay simulation.
import { existsSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { env, pipeline } from '@huggingface/transformers'
import { normalize } from '../build/engine.mjs'
import { MODELS, TRAIN_DATA, readJsonl } from './paths.mjs'
import { routable } from './protos.mjs'

export const loadRouter = async (modelArg) => {
  const local = [modelArg, `${MODELS}${modelArg}`].find((p) => existsSync(p))
  if (!local) throw new Error(`model not found: ${modelArg}`)
  env.localModelPath = `${dirname(resolve(local))}/`
  env.allowRemoteModels = false
  const extractor = await pipeline('feature-extraction', basename(local), { dtype: 'int8' })
  const embed = async (texts) => {
    const out = []
    for (let i = 0; i < texts.length; i += 64)
      out.push(...(await extractor(texts.slice(i, i + 64), { pooling: 'cls', normalize: true })).tolist())
    return out
  }
  const protos = readJsonl(`${TRAIN_DATA}train.jsonl`)
  const pv = await embed(protos.map((p) => p.text))

  // Best-scoring rule the session may currently reach, plus how well the input matches any
  // given rule (`of`), or null for input with nothing to embed.
  return async (raw, flags) => {
    const text = normalize(raw).text
    if (!text) return null
    const [q] = await embed([text])
    const best = new Map()
    protos.forEach((p, i) => {
      let d = 0
      for (let k = 0; k < q.length; k++) d += q[k] * pv[i][k]
      if (d > (best.get(p.label) ?? -1)) best.set(p.label, d)
    })
    let top = null
    for (const r of routable) {
      if ((r.requires ?? []).some((f) => !flags.has(f)) || (r.blockedBy ?? []).some((f) => flags.has(f))) continue
      const s = best.get(r.id)
      if (s !== undefined && (!top || s > top.score)) top = { rule: r.id, score: s }
    }
    return top && { ...top, of: (id) => best.get(id) ?? 0, scores: best }
  }
}
