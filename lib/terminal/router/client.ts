import type { RouterScores } from '../engine'
import { normalize } from '../normalize'
import type { RouterReply, RouterRequest } from './worker'

export type Router = {
  /** Null until the model has loaded, if it failed to, or if it took too long. */
  score: (text: string) => Promise<RouterScores | null>
  stop: () => void
}

// Written by tools/terminal-router/scripts/export-web.mjs; a retrained model gets a new folder.
const ROUTER_VERSION = 'v2'
const BASE = `/assets/story/terminal/router/${ROUTER_VERSION}/`
// Inference takes tens of milliseconds; anything slower is a stalled worker, and
// regex alone is a better reply than a late one.
const TIMEOUT_MS = 1500

const NONE: Router = { score: async () => null, stop: () => {} }

export const startRouter = (): Router => {
  if (typeof Worker === 'undefined') return NONE
  const worker = new Worker(new URL('./worker.ts', import.meta.url))
  const waiting = new Map<number, (scores: RouterScores | null) => void>()
  let state: 'loading' | 'ready' | 'failed' = 'loading'
  let next = 0

  const fail = () => {
    state = 'failed'
    worker.terminate()
    waiting.forEach((resolve) => resolve(null))
    waiting.clear()
  }
  worker.onerror = fail
  worker.onmessage = (event: MessageEvent<RouterReply>) => {
    const reply = event.data
    if (reply.type === 'ready') state = 'ready'
    else if (reply.type === 'error') fail()
    else {
      waiting.get(reply.id)?.(new Map(reply.scores))
      waiting.delete(reply.id)
    }
  }
  const send = (request: RouterRequest) => worker.postMessage(request)
  send({ type: 'init', base: BASE })

  return {
    score: (raw) => {
      const text = normalize(raw).text
      if (state !== 'ready' || !text) return Promise.resolve(null)
      const id = next++
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          waiting.delete(id)
          resolve(null)
        }, TIMEOUT_MS)
        waiting.set(id, (scores) => {
          clearTimeout(timer)
          resolve(scores)
        })
        send({ type: 'score', id, text })
      })
    },
    stop: () => {
      if (state !== 'failed') fail()
    },
  }
}
