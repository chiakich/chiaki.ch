// Prototype embeddings written by tools/terminal-router/scripts/export-web.mjs:
// one row per training sentence, int8 with a scale per row to keep the file
// small, and the rule each row stands for.
export type ProtoIndex = { labels: string[]; rows: number[]; scales: number[] }

export type Protos = ProtoIndex & { dim: number; values: Int8Array }

export const loadProtos = (index: ProtoIndex, bin: ArrayBuffer): Protos => {
  const values = new Int8Array(bin)
  return { ...index, dim: values.length / index.rows.length, values }
}

/** Max similarity to each rule over its rows, which is how the router was evaluated. */
export const scoreRules = (query: Float32Array, protos: Protos): Map<string, number> => {
  const best = new Float32Array(protos.labels.length).fill(-1)
  const { dim, values, rows, scales } = protos
  for (let row = 0; row < rows.length; row++) {
    let dot = 0
    const at = row * dim
    for (let k = 0; k < dim; k++) dot += query[k] * values[at + k]
    dot *= scales[row]
    if (dot > best[rows[row]]) best[rows[row]] = dot
  }
  return new Map(protos.labels.map((label, i) => [label, best[i]]))
}

/** [CLS] pooling, L2-normalised — the pooling the model was fine-tuned with. */
export const poolCls = (hidden: Float32Array, dim: number): Float32Array => {
  const cls = hidden.slice(0, dim)
  let norm = 0
  for (let k = 0; k < dim; k++) norm += cls[k] * cls[k]
  norm = Math.sqrt(norm) || 1
  for (let k = 0; k < dim; k++) cls[k] /= norm
  return cls
}
