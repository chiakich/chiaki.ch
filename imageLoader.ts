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
  const params = [`width=${width}`, `onerror=redirect`]
  if (quality) {
    params.push(`quality=${quality}`)
  }
  const paramsString = params.join(',')

  if (process.env.NODE_ENV === 'development') {
    return `/${normalizeSrc(src)}?${paramsString}`
  }

  return `/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`
}
