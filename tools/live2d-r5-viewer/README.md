# Terminal Live2D R5 viewer

This is the source of the official Cubism Web SDK R5 viewer used by `/story/terminal`.

`src/` contains the adapted official sample and terminal-specific behaviour: lip sync,
breathing, tail physics input, gaze inertia, idle reactions, and head/chest taps.
`vendor/framework/` is Cubism Web Framework R5 source. Its license is in
`vendor/framework/LICENSE.md`. The proprietary Core runtime and exported model remain
in `public/assets/story/character/live2d/r5/`.

## Build and deploy

```sh
cd tools/live2d-r5-viewer
npm install
npm run deploy
```

`deploy` compiles the viewer and updates only the generated `index-*.js` bundle and
`index.html` under `public/assets/story/character/live2d/r5/`.

When exporting a new Cubism model, replace the files in
`public/assets/story/character/live2d/r5/Resources/chiaki/`. Keep its `.exp3.json`
files registered in `chiaki.model3.json`, then run `npm run deploy`.
