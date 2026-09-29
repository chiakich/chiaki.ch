import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const at = (path) => fileURLToPath(new URL(path, import.meta.url))

export const TOOL = at('../')
export const LEXICON = at('../../../public/assets/story/terminal/lexicon.txt')
export const TEST = at('../data/test/')
export const GEN = at('../data/gen/')
export const TRAIN_DATA = at('../train/data/')
export const MODELS = at('../models/')

export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
export const readJsonl = (path) =>
  readFileSync(path, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line))
