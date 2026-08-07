import { cp, readdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distAssets = path.join(root, 'dist/assets')
const target = path.resolve(root, '../../public/assets/story/character/live2d/r5')
const targetAssets = path.join(target, 'assets')
const bundles = (await readdir(distAssets)).filter((name) => /^index-.*\.js$/.test(name))

if (bundles.length !== 1) throw new Error(`Expected one viewer bundle, found ${bundles.length}.`)

for (const name of await readdir(targetAssets)) {
  if (/^index-.*\.js(\.map)?$/.test(name)) await rm(path.join(targetAssets, name))
}

await cp(path.join(distAssets, bundles[0]), path.join(targetAssets, bundles[0]))
// The bundle carries a sourceMappingURL, so ship the map with it rather than
// leaving devtools to 404 on every load.
const map = `${bundles[0]}.map`
if (existsSync(path.join(distAssets, map)))
  await cp(path.join(distAssets, map), path.join(targetAssets, map))
await writeFile(
  path.join(target, 'index.html'),
  `<!doctype html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Chiaki Live2D</title><style>html,body{margin:0;overflow:hidden;background:transparent}body>canvas:only-child{width:100vw;height:100vh;background:transparent}</style><script src="/assets/story/character/live2d/r5/Core/live2dcubismcore.js"></script><script type="module" crossorigin src="/assets/story/character/live2d/r5/assets/${bundles[0]}"></script></head><body></body></html>\n`
)
