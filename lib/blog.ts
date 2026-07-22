import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

export interface PostMeta {
  slug: string
  title: string
  date: string
  lang: 'zh' | 'en'
  excerpt: string
  tags: string[]
  cover: string | null
  readingTime: number
  canonical: string | null
}

export interface Post extends PostMeta {
  html: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

// YAML auto-parses `date: 2026-04-05` into a Date; normalize back to yyyy-mm-dd.
const toISODate = (v: unknown): string => {
  if (!v) return ''
  const d = v instanceof Date ? v : new Date(String(v))
  return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10)
}

export const getPostSlugs = (): string[] =>
  fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))

const readMeta = (slug: string): { meta: PostMeta; content: string } => {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), 'utf-8')
  const { data, content } = matter(raw)
  const meta: PostMeta = {
    slug,
    title: data.title ?? slug,
    date: toISODate(data.date),
    lang: data.lang === 'en' ? 'en' : 'zh',
    excerpt: data.excerpt ?? '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    cover: data.cover ?? null,
    readingTime: data.readingTime ?? 1,
    canonical: data.canonical ?? null,
  }
  return { meta, content }
}

export const getAllPostMeta = (): PostMeta[] =>
  getPostSlugs()
    .map((slug) => readMeta(slug).meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

const renderMarkdown = async (content: string): Promise<string> => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify)
    .process(content)
  return String(file)
}

export const getPost = async (slug: string): Promise<Post> => {
  const { meta, content } = readMeta(slug)
  const html = await renderMarkdown(content)
  return { ...meta, html }
}
