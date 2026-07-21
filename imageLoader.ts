const normalizeSrc = (src: string) => {
  return src.startsWith('/') ? src.slice(1) : src
}

export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  // No <Image quality> prop is set anywhere in the codebase, so without a fallback
  // Cloudflare Image Resizing was applying its own (higher) default quality.
  const params = [`width=${width}`, `onerror=redirect`, `quality=${quality ?? 75}`]
  const paramsString = params.join(',')

  if (process.env.NODE_ENV === 'development') {
    return `/${normalizeSrc(src)}?${paramsString}`
  }

  return `/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`
}
