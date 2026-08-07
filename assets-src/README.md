# assets-src

Untouched originals for everything under `public/assets`. Nothing here is
served: `output: 'export'` copies `public/` into `out/` verbatim, so keeping the
masters out of `public/` is what stops ~53 MB of dead weight shipping to the CDN
on every deploy.

The paths mirror `public/assets` exactly, minus the extension change — the
master for `public/assets/blog/foo/01.webp` is `assets-src/blog/foo/01.png`.

Only files the pipeline actually rewrites live here. An image whose `public/`
copy is already its own original (small stickers, icons) has no entry, and the
scripts fall back to reading it in place.

## Why keep them

The pipeline is lossy. Re-encoding an already-compressed webp to change the
quality or the size cap would stack generation loss; re-encoding from the master
always starts clean. Change a setting in a script, delete
`scripts/optimizeAssets.cache.json`, re-run, and every output is rebuilt from
source.

## Regenerating

```bash
yarn optimize-assets          # webp at <=1920 long edge, plus 400w -thumb
yarn convert-gifs             # the three heavy GIFs -> h264 mp4 + poster
yarn generate-live2d-texture  # 8192 master -> the 2048 webp atlas pixi loads
```

`optimize-assets` is incremental (keyed on the source hash) and also fixes up
any `/assets/...` path in `components`, `pages`, `lib`, `content` and `i18n`
when an extension changes. All three are byte-reproducible: running them on a
clean tree leaves no diff.

## Adding new art

Drop the master in `assets-src/` under the path you want it served from, run
`yarn optimize-assets`, and commit both the master and the generated output.
