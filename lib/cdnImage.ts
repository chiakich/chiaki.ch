// Cloudflare Image Resizing URL builder.
//
// next/image goes through imageLoader.ts (which delegates here), but CSS
// `background-image` can't use a loader or a srcset, so those call sites build
// their URLs with `cdnBackground` instead of pointing straight at the original.
// Without this, decorative backgrounds ship at full size in their source format
// — e.g. portrait-1.png was 713 KB over the wire behind `opacity: 0.2`.

const normalizeSrc = (src: string) => (src.startsWith('/') ? src.slice(1) : src)

export const cdnImage = ({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) => {
  // `format=auto` negotiates AVIF/WebP off the Accept header. Without it
  // Resizing preserves the source format.
  const params = [`width=${width}`, 'format=auto', 'onerror=redirect', `quality=${quality ?? 75}`]

  if (process.env.NODE_ENV === 'development') {
    return `/${normalizeSrc(src)}`
  }

  return `/cdn-cgi/image/${params.join(',')}/${normalizeSrc(src)}`
}

// Pick `width` from how large the background actually paints, not from the
// source dimensions. A single candidate keeps this compatible everywhere —
// image-set() would need prefixing that Panda doesn't add.
export const cdnBackground = (src: string, width: number, quality?: number) =>
  `url('${cdnImage({ src, width, quality })}')`
