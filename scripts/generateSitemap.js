// Generates public/sitemap.xml from the real route sources so it can never
// drift out of sync by hand:
//   - localized pages: the `routes` map in pages/[locale]/[[...slug]].tsx
//     (the authority for which paths actually have /ja and /en versions)
//   - blog posts: the markdown files in content/blog (single-language, TW only)
const { existsSync, readdirSync, readFileSync, writeFileSync } = require('node:fs')
const { join, resolve } = require('node:path')
const matter = require('gray-matter')

const SITE_URL = 'https://chiaki.ch'
const LOCALES = [
  ['zh-TW', ''],
  ['ja', '/ja'],
  ['en', '/en'],
]

const localeRoutesFile = resolve(
  process.cwd(),
  'pages',
  '[locale]',
  '[[...slug]].tsx'
)
const blogDir = resolve(process.cwd(), 'content', 'blog')
const outFile = resolve(process.cwd(), 'public', 'sitemap.xml')

// Pull the localized route keys straight from the catch-all's `routes` map.
const readLocalizedRoutes = () => {
  const source = readFileSync(localeRoutesFile, 'utf-8')
  const body = source.slice(
    source.indexOf('routes'),
    source.indexOf('const LocalePage')
  )
  const routes = []
  const entry = /(?:'([^']*)'|([A-Za-z0-9_]+))\s*:\s*dynamic/g
  let match
  while ((match = entry.exec(body)) !== null) {
    routes.push(match[1] !== undefined ? match[1] : match[2])
  }
  return routes
}

// Mirror of i18n's localizedPath: home -> `${prefix}` (tw:'/', ja:'/ja'),
// sub-page -> `${prefix}/${route}`. Keeps sitemap URLs byte-identical to the
// on-page hreflang links (no stray trailing slashes).
const hrefFor = (prefix, route) =>
  route ? `${SITE_URL}${prefix}/${route}` : `${SITE_URL}${prefix || '/'}`

const localizedUrl = (route) => {
  const alternates = LOCALES.map(
    ([hreflang, prefix]) =>
      `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${hrefFor(prefix, route)}"/>`
  )
  // x-default points at the TW (unprefixed) version.
  alternates.push(
    `<xhtml:link rel="alternate" hreflang="x-default" href="${hrefFor('', route)}"/>`
  )
  return `  <url><loc>${hrefFor('', route)}</loc>${alternates.join('')}</url>`
}

const toISODate = (value) => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(String(value))
  return isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

const blogUrl = (slug, lastmod) => {
  const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : ''
  return `  <url><loc>${SITE_URL}/blog/${slug}</loc>${mod}</url>`
}

const build = () => {
  const rows = readLocalizedRoutes().map(localizedUrl)

  if (existsSync(blogDir)) {
    for (const file of readdirSync(blogDir)) {
      if (!file.endsWith('.md')) continue
      const slug = file.replace(/\.md$/, '')
      const { data } = matter(readFileSync(join(blogDir, file), 'utf-8'))
      rows.push(blogUrl(slug, toISODate(data.date)))
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...rows,
    '</urlset>',
    '',
  ].join('\n')

  writeFileSync(outFile, xml)
  console.log(`Generated sitemap.xml with ${rows.length} URLs`)
}

build()
