import { cdnImage } from './lib/cdnImage'

// next.config.js points `images.loaderFile` here. The URL building itself lives
// in lib/cdnImage.ts so CSS background images can reuse it.
export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  // No <Image quality> prop is set anywhere in the codebase, so without a
  // fallback Cloudflare was applying its own (higher) default quality.
  return cdnImage({ src, width, quality: quality ?? 75 })
}
