// scripts/optimizeAssets.js writes a 400w `-thumb.webp` beside every asset
// wider than that. Only use this where the image really paints small — a
// gallery strip, a card cover — never for something that can be opened full.
export const thumbSrc = (src: string) => src.replace(/\.webp$/, '-thumb.webp')
