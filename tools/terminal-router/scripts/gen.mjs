// Generated paraphrases: every data/gen/train-N.json merged into rule id -> lines.
import { readdirSync } from 'node:fs'
import { GEN, readJson } from './paths.mjs'

export const paraphrases = () => {
  const files = readdirSync(GEN).filter((f) => /^train-\d+\.json$/.test(f))
  const lines = {}
  for (const f of files) for (const [id, texts] of Object.entries(readJson(`${GEN}${f}`))) (lines[id] ??= []).push(...texts)
  return { lines, files: files.length }
}
