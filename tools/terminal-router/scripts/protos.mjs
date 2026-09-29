import { rules } from '../build/engine.mjs'

// Literal alternatives out of a pattern: 「(你叫什麼|你是誰|大名)」 -> three anchors.
const fragments = (re) =>
  re.source
    .replace(/\(\?[=!<][^)]*\)/g, '')
    .replace(/\[[^\]]*\](\{\d+(,\d*)?\}|[?*+])?/g, '|')
    .replace(/\\.|\{\d+(,\d*)?\}|\(\?:|[\^$?*+.]/g, '|')
    .split(/[|()]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && !/[\\\[\]{}]/.test(s))

// Rules the router may pick. `continues` and name capture stay with regex: they need turn context.
export const routable = rules.filter((r) => !r.continues && !r.capturesName)

export const prototypes = () => {
  const out = []
  for (const r of routable) {
    const seen = new Set()
    const add = (text, kind) => {
      if (seen.has(text)) return
      seen.add(text)
      out.push({ rule: r.id, text, kind })
    }
    for (const p of r.patterns) for (const f of fragments(p)) add(f, 'pattern')
    for (const k of r.keywords ?? []) add(k, 'keyword')
    for (const reply of r.replies) add(reply.text.replace(/\{[a-z]+\}/gi, '你'), 'reply')
  }
  return out
}
