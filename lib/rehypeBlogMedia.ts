import fs from 'fs'
import path from 'path'

// Post bodies come straight from markdown, so every image would otherwise be a
// bare <img> with no dimensions and no lazy loading. This runs at build time
// and fixes both, plus swaps the mp4s (ex-GIFs) over to <video>.

type Node = {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: Node[]
}

// scripts/optimizeAssets.js records the final dimensions of everything it
// touched; reusing that avoids decoding the images again here.
const sizes: Record<string, { width: number; height: number }> = (() => {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'scripts', 'optimizeAssets.cache.json'), 'utf-8')
    )
  } catch {
    return {}
  }
})()

// Cache keys are extensionless: "/assets/blog/foo/01.webp" -> "blog/foo/01".
const sizeOf = (src: string) => sizes[src.replace(/^\/assets\//, '').replace(/\.[^./]+$/, '')]

const toVideo = (node: Node, src: string) => {
  const poster = src.replace(/\.mp4$/, '-poster.webp')
  node.tagName = 'video'
  node.properties = {
    src,
    poster: fs.existsSync(path.join(process.cwd(), 'public', poster)) ? poster : undefined,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: 'metadata',
  }
  node.children = []
}

const walk = (node: Node) => {
  if (node.tagName === 'img') {
    const src = String(node.properties?.src ?? '')
    if (src.endsWith('.mp4')) {
      toVideo(node, src)
    } else {
      const size = sizeOf(src)
      node.properties = {
        ...node.properties,
        loading: 'lazy',
        decoding: 'async',
        ...(size ? { width: size.width, height: size.height } : {}),
      }
    }
  }
  node.children?.forEach(walk)
}

export const rehypeBlogMedia = () => (tree: Node) => {
  walk(tree)
}
