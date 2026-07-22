// Build-time: read content/blog/*.md frontmatter and emit content/blog/index.json.
// The blog list component imports this JSON directly so it renders identically
// across locale variants (/blog, /ja/blog, /en/blog) without per-page getStaticProps.
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog')
const OUT = path.join(BLOG_DIR, 'index.json')

// YAML auto-parses `date: 2026-04-05` into a Date; normalize back to yyyy-mm-dd.
const toISODate = (v) => {
  if (!v) return ''
  const d = v instanceof Date ? v : new Date(v)
  return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10)
}

const slugs = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''))

const posts = slugs
  .map((slug) => {
    const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), 'utf-8'))
    return {
      slug,
      title: data.title ?? slug,
      date: toISODate(data.date),
      lang: data.lang === 'en' ? 'en' : 'zh',
      excerpt: data.excerpt ?? '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      cover: data.cover ?? null,
      readingTime: data.readingTime ?? 1,
    }
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1))

fs.writeFileSync(OUT, JSON.stringify(posts, null, 2) + '\n', 'utf-8')
console.log(`Wrote ${OUT} (${posts.length} posts)`)
