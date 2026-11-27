// Generates public/sitemap.xml from the real route sources so it can never
// drift out of sync by hand:
//   - localized pages: the `routes` map in pages/[locale]/[[...slug]].tsx
//     (the authority for which paths actually have /ja and /en versions)
//   - blog posts: the markdown files in content/blog (single-language, TW only)
// Page lastmod comes from git history of the page file and the component folders it imports.
const { execFileSync } = require('node:child_process')
const { existsSync, readdirSync, readFileSync, writeFileSync } = require('node:fs')
const { dirname, join, resolve } = require('node:path')
const matter = require('gray-matter')

const SITE_URL = 'https://chiaki.ch'
const LEGACY_REDIRECT_ROUTES = new Set(['works/tw-fuzzy-zipcode', 'character'])
// Adult-gated and noindex; reachable by link only.
const UNLISTED_ROUTES = new Set(['story/terminal'])
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

// Pull the localized route keys (and the page module each one loads) straight
// from the catch-all's `routes` map.
const readLocalizedRoutes = () => {
  const source = readFileSync(localeRoutesFile, 'utf-8')
  const body = source.slice(
    source.indexOf('routes'),
    source.indexOf('const LocalePage')
  )
  const routes = []
  const entry = /(?:'([^']*)'|([A-Za-z0-9_]+))\s*:\s*dynamic\(\(\)\s*=>\s*import\('([^']+)'\)/g
  let match
  while ((match = entry.exec(body)) !== null) {
    routes.push({ route: match[1] !== undefined ? match[1] : match[2], module: match[3] })
  }
  return routes
}

// Content that a page renders but does not import directly
const EXTRA_SOURCES = { blog: ['content/blog'] }

const resolvePageFile = (module) =>
  [`${module}.tsx`, `${module}/index.tsx`].map((file) => resolve(process.cwd(), file)).find(existsSync)

const pageSources = ({ route, module }) => {
  const file = resolvePageFile(module)
  if (!file) return []
  const imports = [...readFileSync(file, 'utf-8').matchAll(/from '(components\/[^']+)'/g)]
  return [file, ...new Set(imports.map((m) => dirname(m[1]))), ...(EXTRA_SOURCES[route] ?? [])]
}

// A shallow clone (e.g. on the CI builder) only knows the tip commit, so every
// page would get the same date; reuse the dates committed in the sitemap instead.
const gitHistoryAvailable = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() === 'false'
  } catch {
    return false
  }
})()

const committedLastmods = (() => {
  if (!existsSync(outFile)) return new Map()
  const xml = readFileSync(outFile, 'utf-8')
  return new Map([...xml.matchAll(/<loc>([^<]+)<\/loc>.*?<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]))
})()

const gitLastmod = (paths) => {
  if (!paths.length) return null
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    return out || null
  } catch {
    return null
  }
}

const pageLastmod = (page) =>
  gitHistoryAvailable
    ? gitLastmod(pageSources(page))
    : committedLastmods.get(hrefFor('', page.route)) ?? null

// Mirror of i18n's localizedPath: home -> `${prefix}` (tw:'/', ja:'/ja'),
// sub-page -> `${prefix}/${route}`. Keeps sitemap URLs byte-identical to the
// on-page hreflang links (no stray trailing slashes).
const hrefFor = (prefix, route) =>
  route ? `${SITE_URL}${prefix}/${route}` : `${SITE_URL}${prefix || '/'}`

const localizedUrl = (route, lastmod) => {
  const alternates = LOCALES.map(
    ([hreflang, prefix]) =>
      `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${hrefFor(prefix, route)}"/>`
  )
  // x-default points at the TW (unprefixed) version.
  alternates.push(
    `<xhtml:link rel="alternate" hreflang="x-default" href="${hrefFor('', route)}"/>`
  )
  const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : ''
  // Google wants every language version as its own <url>, each carrying the full alternate set.
  return LOCALES.map(
    ([, prefix]) => `  <url><loc>${hrefFor(prefix, route)}</loc>${mod}${alternates.join('')}</url>`
  )
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
  const rows = readLocalizedRoutes()
    .filter(({ route }) => !LEGACY_REDIRECT_ROUTES.has(route) && !UNLISTED_ROUTES.has(route))
    .flatMap((page) => localizedUrl(page.route, pageLastmod(page)))

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
