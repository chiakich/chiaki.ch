// One-shot migration: pull posts from the Medium RSS feed, convert the
// content:encoded HTML to Markdown, download inline images locally, and
// write content/blog/<slug>.md files. Re-runnable (overwrites output).
const fs = require('fs')
const path = require('path')
const TurndownService = require('turndown')
const { gfm } = require('turndown-plugin-gfm')

const FEED_URL = 'https://akiakira02.medium.com/feed'
const ROOT = path.join(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'content', 'blog')
const IMG_ROOT = path.join(ROOT, 'public', 'assets', 'blog')

// Curated selection: which feed items to migrate, keyed by a stable slug.
// `match` is a substring test against the RSS <title>. Two 2020 tutorials
// are intentionally excluded.
const SELECTION = [
  { slug: 'acf-akihabara-fes-2026', match: 'ACF 秋葉原動漫祭', lang: 'zh' },
  { slug: 'blocto-js-sdk-monorepo', match: 'Monorepo', lang: 'en' },
  { slug: 'plurk-ui-redesign-tokyono-sora', match: 'Plurk UI Redesign', lang: 'zh' },
  { slug: 'comiket-horizon-doujin', match: '開拓動漫祭', lang: 'zh' },
]

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
})
td.use(gfm)

// Keep <figure><img><figcaption> as image + italic caption line.
td.addRule('figure', {
  filter: 'figure',
  replacement: (_content, node) => {
    const img = node.querySelector('img')
    if (!img) return ''
    const src = img.getAttribute('src') || ''
    const alt = img.getAttribute('alt') || ''
    const cap = node.querySelector('figcaption')
    const caption = cap ? cap.textContent.trim() : ''
    const imgMd = `![${alt}](${src})`
    return caption ? `\n\n${imgMd}\n*${caption}*\n\n` : `\n\n${imgMd}\n\n`
  },
})

const decodeCdata = (s) => s

function extractItems(xml) {
  const items = []
  const re = /<item>([\s\S]*?)<\/item>/g
  let m
  while ((m = re.exec(xml))) items.push(m[1])
  return items
}
function tag(block, name) {
  const m = block.match(
    new RegExp(`<${name}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${name}>`)
  )
  return m ? m[1].trim() : ''
}
function categories(block) {
  const out = []
  const re = /<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/g
  let m
  while ((m = re.exec(block))) out.push(m[1].trim())
  return out
}
function toISODate(pubDate) {
  const d = new Date(pubDate)
  return d.toISOString().slice(0, 10)
}
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}
function makeExcerpt(html, limit = 90) {
  const first = (html.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || html
  const text = stripHtml(first)
  return text.length > limit ? text.slice(0, limit) + '…' : text
}
function readingTime(html, lang) {
  const text = stripHtml(html)
  const minutes = lang === 'en'
    ? text.split(/\s+/).length / 220 // words/min
    : text.length / 500 // CJK chars/min
  return Math.max(1, Math.round(minutes))
}
function extractCover(html) {
  const m = html.match(/<img[^>]+src="([^"]+)"/)
  return m ? m[1] : ''
}

async function downloadImages(html, slug) {
  const dir = path.join(IMG_ROOT, slug)
  fs.mkdirSync(dir, { recursive: true })
  const urls = [...html.matchAll(/(https:\/\/cdn-images-1\.medium\.com\/[^\s"')]+)/g)].map(
    (m) => m[1]
  )
  const unique = [...new Set(urls)]
  const map = {}
  let i = 0
  for (const url of unique) {
    i += 1
    const ext = (url.match(/\.(jpe?g|png|gif|webp)/i) || [, 'jpeg'])[1].toLowerCase()
    const file = `${String(i).padStart(2, '0')}.${ext === 'jpg' ? 'jpeg' : ext}`
    const local = `/assets/blog/${slug}/${file}`
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      fs.writeFileSync(path.join(dir, file), buf)
      map[url] = local
      console.log(`    img ${file}  (${(buf.length / 1024).toFixed(0)} KB)`)
    } catch (e) {
      console.warn(`    ! failed ${url}: ${e.message}`)
    }
  }
  return map
}

function yamlEscape(s) {
  return `"${String(s).replace(/"/g, '\\"')}"`
}

async function main() {
  console.log('Fetching feed…')
  const xml = await (await fetch(FEED_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
  const items = extractItems(xml)
  fs.mkdirSync(CONTENT_DIR, { recursive: true })

  for (const sel of SELECTION) {
    const block = items.find((b) => tag(b, 'title').includes(sel.match))
    if (!block) {
      console.warn(`! not found: ${sel.match}`)
      continue
    }
    const title = tag(block, 'title')
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1].trim()
    const canonical = link.split('?')[0]
    const pubDate = tag(block, 'pubDate')
    const cats = categories(block)
    let html = (block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || [])[1] || ''
    // Drop the Medium tracking pixel.
    html = html.replace(/<img[^>]*stat\?event=[^>]*>/g, '')

    console.log(`\n▸ ${sel.slug}  «${title.slice(0, 30)}…»`)
    const cover = extractCover(html)
    const excerpt = makeExcerpt(html)
    const minutes = readingTime(html, sel.lang)

    const imgMap = await downloadImages(html, sel.slug)
    for (const [url, local] of Object.entries(imgMap)) {
      html = html.split(url).join(local)
    }

    let md = td.turndown(html).trim()
    // Normalize Medium's h3/h4 subheads to a saner h2/h3 hierarchy.
    md = md.replace(/^#### /gm, '### ').replace(/^### /gm, '## ')

    const coverLocal = imgMap[cover] || ''
    const fm = [
      '---',
      `title: ${yamlEscape(title)}`,
      `date: ${toISODate(pubDate)}`,
      `lang: ${sel.lang}`,
      `excerpt: ${yamlEscape(excerpt)}`,
      `tags: [${cats.map(yamlEscape).join(', ')}]`,
      coverLocal ? `cover: ${coverLocal}` : null,
      `readingTime: ${minutes}`,
      `canonical: ${canonical}`,
      '---',
      '',
    ].filter((l) => l !== null).join('\n')

    fs.writeFileSync(path.join(CONTENT_DIR, `${sel.slug}.md`), fm + md + '\n', 'utf-8')
    console.log(`  wrote content/blog/${sel.slug}.md  (${md.length} chars, ${minutes} min)`)
  }
  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
