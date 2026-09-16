import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useRef } from 'react'
import NextLink from 'next/link'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import { css } from 'styled-system/css'
import { LetterpressStyles } from 'kappan/react'
import { getPost, getPostSlugs, type Post } from 'lib/blog'
import { getMessages } from 'i18n/messages'
import type { PageMetaOverride } from 'components/PageMeta'
import BlogWidgets from 'components/blog/widgets'
import { BLOG_OPTIONS, SHEET_CLASS, blogLetterpressCss } from 'components/blog/letterpress'

const Heading = styled.h1
const Span = styled.span

const prose = css({
  fontFamily: 'var(--type)',
  fontWeight: 'regular',
  // 黑體字面比明體滿，級數略收；版心 696px 在 13pt 下約 40 字一行。
  fontSize: { base: '12pt', md: '13pt' },
  lineHeight: '1.9',
  letterSpacing: '.02em',
  color: 'var(--ink)',
  hangingPunctuation: 'allow-end',
  '& h2, & h3, & h4': {
    fontFamily: 'var(--type)',
    color: 'var(--ink)',
    lineHeight: '1.5',
    letterSpacing: '.06em',
    textWrap: 'balance',
  },
  '& h2': { fontSize: { base: '18pt', md: '22pt' }, fontWeight: 'bold', lineHeight: '1.55', mt: 14, mb: 5 },
  '& h3': { fontSize: { base: '14pt', md: '15.5pt' }, fontWeight: 'medium', mt: 10, mb: 3 },
  '& h4': { fontSize: '13pt', fontWeight: 'medium', mt: 8, mb: 3 },
  '& h2 + h3': { mt: 6 },
  '& p': { my: 6, textAlign: 'start', textWrap: 'pretty', overflowWrap: 'break-word' },
  '& a': {
    color: 'var(--red)',
    borderBottom: '1px solid color-mix(in srgb, var(--red) 45%, transparent)',
    transition: 'border-color .2s',
    _hover: { borderBottomColor: 'var(--red)' },
  },
  // 信黑只掛到 W6，700 會落到 W8；內文粗體用 600 就夠對比，不會搶掉標題。
  '& strong': { fontWeight: 'medium' },
  // Panda preflight resets list-style; restore it explicitly or markers vanish.
  '& ul, & ol': { my: 6, pl: 7, listStylePosition: 'outside' },
  '& ul': { listStyleType: 'disc' },
  '& ol': { listStyleType: 'decimal' },
  '& li': { pl: 1, my: 2 },
  '& li > p': { my: 0 },
  '& li > p + p': { mt: 2 },
  '& li::marker': { color: 'var(--ink3)' },
  '& blockquote': {
    my: 7,
    pl: 5,
    borderLeft: '3px solid var(--red)',
    color: 'var(--ink3)',
  },
  '& hr': {
    my: 12,
    border: 'none',
    height: '1px',
    background: 'color-mix(in srgb, var(--ink) 22%, transparent)',
  },
  // video covers the ex-GIF clips rehypeBlogMedia swaps in
  '& img, & video': {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    mx: 'auto',
    my: 8,
    // 相片不是印出來的，給壓痕陰影而不是墨壓濾鏡。
    boxShadow: '0 1px 2px rgba(22, 19, 15, .24), 0 10px 22px rgba(22, 19, 15, .12)',
  },
  // 黑體沒有斜體，瀏覽器合成的假斜體很難看；強調靠墨色淡一級就好。
  '& em': { fontStyle: 'normal', color: 'var(--ink3)' },
  // figure caption: an emphasis-only paragraph right after an image
  '& p:has(> img:only-child, > video:only-child) + p:has(> em:only-child)': {
    mt: -6,
    fontSize: '.9em',
    textAlign: 'center',
    letterSpacing: '.04em',
  },
  '& code': {
    fontFamily: 'var(--latin)',
    fontSize: '.86em',
    backgroundColor: 'color-mix(in srgb, var(--ink) 7%, transparent)',
    px: '0.35em',
    py: '0.1em',
  },
  '& pre': {
    my: 7,
    p: 5,
    overflowX: 'auto',
    backgroundColor: 'color-mix(in srgb, var(--red) 4%, transparent)',
    border: '1px solid color-mix(in srgb, var(--red) 32%, transparent)',
    fontSize: { base: '0.78rem', md: '0.86rem' },
    lineHeight: '1.7',
    letterSpacing: 0,
  },
  '& pre code': { backgroundColor: 'transparent', p: 0, fontSize: 'inherit' },
  // Tables scroll on their own so a wide one never clips against the sheet.
  '& table': {
    display: 'block',
    my: 8,
    overflowX: 'auto',
    borderCollapse: 'collapse',
    fontSize: '.9em',
    lineHeight: '1.6',
    letterSpacing: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  '& th, & td': {
    py: 2,
    px: 3,
    textAlign: 'start',
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid color-mix(in srgb, var(--ink) 18%, transparent)',
  },
  '& th': { fontWeight: 'medium', borderBottomColor: 'var(--ink)' },
  '& tr:last-child td': { borderBottom: 'none' },
  // Widgets are figures, not prose — keep the reading rhythm around them but
  // stop the prose rules leaking into their own markup.
  '& [data-blog-widget]': { my: 12 },
  '& [data-blog-widget] p': { my: 0, textAlign: 'inherit' },
  '& [data-blog-widget] a': { border: 'none' },
  '& .hljs-comment, & .hljs-quote': { color: 'var(--ink3)' },
  '& .hljs-keyword, & .hljs-selector-tag, & .hljs-built_in, & .hljs-literal': { color: 'var(--red)' },
  '& .hljs-string, & .hljs-attr, & .hljs-number': { color: 'color-mix(in srgb, var(--red) 72%, var(--ink))' },
  '& .hljs-title, & .hljs-function, & .hljs-name, & .hljs-type, & .hljs-class': { fontWeight: 'medium' },
})

const formatDate = (iso: string) => iso.replace(/-/g, '.')

const BlogPost: NextPage<{ post: Post }> = ({ post }) => {
  const proseRef = useRef<HTMLDivElement>(null)

  return (
    <Box className={SHEET_CLASS} data-jf-skip minHeight="100vh" overflowX="clip" position="relative">
      <LetterpressStyles {...BLOG_OPTIONS} />
      <style dangerouslySetInnerHTML={{ __html: blogLetterpressCss }} />

      <Box
        maxW="760px"
        mx="auto"
        px={{ base: '24px', md: '32px' }}
        pt="96px"
        pb="120px"
        position="relative"
        zIndex={1}
      >
        <NextLink href="/blog" style={{ textDecoration: 'none' }}>
          <Span className="lbl" _hover={{ color: 'var(--red)' }}>◂ BLOG</Span>
        </NextLink>

        <Box mt={10} mb={12} textAlign="center">
          <HStack gap={4} justifyContent="center" flexWrap="wrap" mb={6}>
            <Span className="lbl" style={{ color: 'var(--red)' }}>{post.lang === 'en' ? 'EN' : 'ZH'}</Span>
            <Span className="lbl">{formatDate(post.date)}</Span>
            <Span className="lbl">{post.readingTime} MIN READ</Span>
          </HStack>

          <Heading
            style={{
              fontFamily: 'var(--type)',
              fontSize: 'clamp(26px, 5.4vw, 42px)',
              fontWeight: 700,
              letterSpacing: '.1em',
              lineHeight: 1.45,
            }}
          >
            {post.title}
          </Heading>

          {post.tags.length > 0 && (
            <HStack gap={4} flexWrap="wrap" justifyContent="center" mt={6}>
              {post.tags.map((tag) => (
                <Span key={tag} className="lbl" style={{ color: 'var(--red)' }}>{tag}</Span>
              ))}
            </HStack>
          )}
          <Box mx="auto" mt={8} style={{ width: 46, borderTop: '1px solid var(--ink)' }} />
        </Box>

        <div ref={proseRef} className={prose} dangerouslySetInnerHTML={{ __html: post.html }} />
        <BlogWidgets containerRef={proseRef} />

        <Box mt={16} pt={6} style={{ borderTop: '1px solid color-mix(in srgb, var(--ink) 25%, transparent)' }}>
          <Flex justify="space-between" alignItems="baseline" flexWrap="wrap" gap={3}>
            <NextLink href="/blog" style={{ textDecoration: 'none' }}>
              <Span className="lbl" _hover={{ color: 'var(--red)' }}>◂ BACK TO BLOG</Span>
            </NextLink>
            {/* .lbl 走 --latin，沒有漢字。 */}
            <Span
              style={{ fontFamily: 'var(--type)', fontSize: '8pt', letterSpacing: '.3em', color: 'var(--red)' }}
            >
              千秋稻荷社印書館
            </Span>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getPostSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getPost(params?.slug as string)
  const pageMeta: PageMetaOverride = {
    title: `${post.title} - 千秋稻荷社`,
    description: post.excerpt || post.title,
    image: post.cover ?? `/og/blog-${post.slug}.jpeg`,
    inLanguage: post.lang === 'en' ? 'en' : 'zh-TW',
    breadcrumbName: post.title,
    article: {
      publishedTime: post.date,
      ...(post.tags.length ? { tags: post.tags } : {}),
    },
  }
  if (post.canonical) pageMeta.canonical = post.canonical
  return { props: { post, pageMeta, messages: getMessages('tw', 'blog/[slug]') } }
}

export default BlogPost
