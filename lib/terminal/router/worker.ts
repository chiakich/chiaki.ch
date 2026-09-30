// Runs the embedding model off the main thread, so typing never waits on it.
import * as ort from 'onnxruntime-web/wasm'
import { loadProtos, poolCls, type ProtoIndex, type Protos, scoreRules } from './protos'
import { parseVocab, tokenize, type Vocab } from './tokenize'

export type RouterRequest = { type: 'init'; base: string } | { type: 'score'; id: number; text: string }

export type RouterReply =
  | { type: 'ready' }
  | { type: 'error'; message: string }
  | { type: 'scores'; id: number; scores: [string, number][] }

let model: ort.InferenceSession
let vocab: Vocab
let protos: Protos

const post = (reply: RouterReply) => self.postMessage(reply)

const fetchOk = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: ${response.status}`)
  return response
}

const load = async (base: string) => {
  // The wasm is left to webpack, which emits it content-hashed under
  // /_next/static and so cached for good. Threads would need cross-origin
  // isolation, which a static host doesn't give us.
  ort.env.wasm.numThreads = 1
  const [weights, vocabText, index, bin] = await Promise.all([
    fetchOk(`${base}model.onnx`).then((r) => r.arrayBuffer()),
    fetchOk(`${base}vocab.txt`).then((r) => r.text()),
    fetchOk(`${base}protos.json`).then((r) => r.json() as Promise<ProtoIndex>),
    fetchOk(`${base}protos.bin`).then((r) => r.arrayBuffer()),
  ])
  model = await ort.InferenceSession.create(weights, { executionProviders: ['wasm'] })
  vocab = parseVocab(vocabText)
  protos = loadProtos(index, bin)
}

const embed = async (text: string) => {
  const ids = tokenize(text, vocab)
  const shape = [1, ids.length]
  const int64 = (fill: (i: number) => number) =>
    new ort.Tensor('int64', BigInt64Array.from(ids, (_, i) => BigInt(fill(i))), shape)
  const out = await model.run({
    input_ids: int64((i) => ids[i]),
    attention_mask: int64(() => 1),
    token_type_ids: int64(() => 0),
  })
  return poolCls(out.last_hidden_state.data as Float32Array, protos.dim)
}

self.onmessage = async (event: MessageEvent<RouterRequest>) => {
  const request = event.data
  try {
    if (request.type === 'init') {
      await load(request.base)
      post({ type: 'ready' })
    } else {
      const scores = scoreRules(await embed(request.text), protos)
      post({ type: 'scores', id: request.id, scores: [...scores] })
    }
  } catch (error) {
    post({ type: 'error', message: String(error) })
  }
}
