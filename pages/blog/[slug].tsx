import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { motion } from 'framer-motion'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import { css } from 'styled-system/css'
import { getPost, getPostSlugs, type Post } from 'lib/blog'
import type { PageMetaOverride } from 'components/PageMeta'

const Heading = styled.h1
const Span = styled.span
const MotionBox = motion.create(Box)

type Theme = 'dark' | 'light'
const STORAGE_KEY = 'blog-reading-theme'

// Medium-style reading column. Serif body, sans headings, generous rhythm.
// Colors come from CSS variables so a single data-theme flip repaints everything.
const prose = css({
  fontFamily: '"Source Serif 4", Georgia, "Songti TC", "Noto Serif TC", serif',
  fontSize: { base: '1.08rem', md: '1.2rem' },
  lineHeight: '1.85',
  color: 'var(--prose-text)',
  '& h2, & h3, & h4': {
    fontFamily:
      'var(--fonts-body, "PingFang TC", "Noto Sans TC", sans-serif)',
    fontWeight: 'bold',
    color: 'var(--prose-heading)',
    lineHeight: '1.3',
    letterSpacing: '-0.01em',
  },
  '& h2': { fontSize: { base: '1.6rem', md: '1.9rem' }, mt: 12, mb: 4 },
  '& h3': { fontSize: { base: '1.3rem', md: '1.5rem' }, mt: 10, mb: 3 },
  '& h4': { fontSize: '1.15rem', mt: 8, mb: 3 },
  '& p': { my: 6 },
  '& a': {
    color: 'var(--prose-link)',
    borderBottom: '1px solid color-mix(in srgb, var(--prose-link) 45%, transparent)',
    transition: 'border-color .2s',
    _hover: { borderBottomColor: 'var(--prose-link)' },
  },
  '& strong': { fontWeight: 'bold', color: 'var(--prose-heading)' },
  '& ul, & ol': { my: 6, pl: 7, display: 'flex', flexDirection: 'column', gap: 2 },
  '& li': { pl: 1 },
  '& blockquote': {
    my: 7,
    pl: 5,
    borderLeft: '3px solid var(--prose-link)',
    fontStyle: 'italic',
    color: 'var(--prose-muted)',
  },
  '& hr': {
    my: 12,
    border: 'none',
    height: '1px',
    background: 'var(--prose-border)',
  },
  '& img': {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    mx: 'auto',
    my: 8,
    borderRadius: '2px',
  },
  // figure caption emitted as an italic paragraph right after an image
  '& img + em, & em': { color: 'var(--prose-muted)' },
  '& code': {
    fontFamily: 'var(--fonts-mono, ui-monospace, monospace)',
    fontSize: '0.88em',
    backgroundColor: 'var(--prose-code-bg)',
    px: '0.35em',
    py: '0.1em',
    borderRadius: '3px',
  },
  '& pre': {
    my: 7,
    p: 5,
    borderRadius: '6px',
    overflowX: 'auto',
    backgroundColor: 'var(--prose-pre-bg)',
    border: '1px solid var(--prose-border)',
    fontSize: { base: '0.82rem', md: '0.9rem' },
    lineHeight: '1.6',
  },
  '& pre code': { backgroundColor: 'transparent', p: 0, fontSize: 'inherit' },
  // Minimal highlight.js palette, readable on both themes
  '& .hljs-comment, & .hljs-quote': { color: 'var(--prose-muted)', fontStyle: 'italic' },
  '& .hljs-keyword, & .hljs-selector-tag, & .hljs-built_in': { color: '#c678dd' },
  '& .hljs-string, & .hljs-attr': { color: '#98c379' },
  '& .hljs-number, & .hljs-literal': { color: '#d19a66' },
  '& .hljs-title, & .hljs-function, & .hljs-name': { color: '#61afef' },
  '& .hljs-type, & .hljs-class': { color: '#e5c07b' },
})

const themeVars = (theme: Theme): Record<string, string> =>
  theme === 'light'
    ? {
        '--prose-sheet': '#faf8f4',
        '--prose-text': '#2b2926',
        '--prose-heading': '#141312',
        '--prose-muted': '#6b665e',
        '--prose-link': '#c8641a',
        '--prose-border': 'rgba(0,0,0,0.12)',
        '--prose-code-bg': 'rgba(0,0,0,0.06)',
        '--prose-pre-bg': '#f2efe8',
      }
    : {
        '--prose-sheet': 'transparent',
        '--prose-text': 'rgba(255,255,255,0.86)',
        '--prose-heading': '#ffffff',
        '--prose-muted': 'rgba(255,255,255,0.5)',
        '--prose-link': '#df8a42',
        '--prose-border': 'rgba(255,255,255,0.14)',
        '--prose-code-bg': 'rgba(255,255,255,0.09)',
        '--prose-pre-bg': '#0d0d0f',
      }

const formatDate = (iso: string) => iso.replace(/-/g, '.')

const BlogPost: NextPage<{ post: Post }> = ({ post }) => {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') setTheme(stored)
  }, [])

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      window.localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <Box
      backgroundColor="black"
      color="white"
      minHeight="100vh"
      overflowX="clip"
      position="relative"
    >
      {/* Orange dot grid */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        height="100vh"
        opacity=".18"
        backgroundImage="radial-gradient(rgba(223, 138, 66, .2) 1px, transparent 1px)"
        backgroundSize="18px 18px"
        maskImage="linear-gradient(to bottom, black 30%, transparent)"
        pointerEvents="none"
        zIndex={0}
        aria-hidden
      />

      <Box
        maxW="820px"
        mx="auto"
        px={{ base: '24px', md: '32px' }}
        pt="96px"
        pb="120px"
        position="relative"
        zIndex={1}
      >
        {/* Top rail: back + theme toggle */}
        <Flex justify="space-between" alignItems="center" mb={10}>
          <NextLink href="/blog" style={{ textDecoration: 'none' }}>
            <Span
              fontFamily="mono"
              fontSize="xs"
              letterSpacing="0.2em"
              color="accent"
              _hover={{ opacity: 0.7 }}
            >
              ◂ BLOG
            </Span>
          </NextLink>
          <styled.button
            onClick={toggle}
            type="button"
            display="flex"
            alignItems="center"
            gap={2}
            fontFamily="mono"
            fontSize="0.6rem"
            letterSpacing="0.18em"
            color="accent"
            border="1px solid color-mix(in srgb, var(--colors-accent) 40%, transparent)"
            px={3}
            py={1.5}
            cursor="pointer"
            transition="background .2s"
            _hover={{ backgroundColor: 'color-mix(in srgb, var(--colors-accent) 12%, transparent)' }}
            aria-label="toggle reading theme"
          >
            {theme === 'dark' ? '◐ LIGHT' : '◑ DARK'}
          </styled.button>
        </Flex>

        {/* Header — mechanical style */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          mb={10}
        >
          <HStack gap={3} mb={5} flexWrap="wrap">
            <Span
              fontFamily="mono"
              fontSize="0.55rem"
              fontWeight="bold"
              letterSpacing="0.15em"
              backgroundColor="accent"
              color="black"
              px={2}
              py={0.5}
              transform="skewX(-8deg)"
            >
              <Box transform="skewX(8deg)">{post.lang === 'en' ? 'EN' : 'ZH'}</Box>
            </Span>
            <Span fontFamily="mono" fontSize="xs" color="accent" letterSpacing="0.15em">
              {formatDate(post.date)}
            </Span>
            <Span fontFamily="mono" fontSize="xs" opacity={0.45} letterSpacing="0.15em">
              {post.readingTime} MIN READ
            </Span>
          </HStack>

          <Heading
            fontSize={{ base: '2.2rem', md: '3rem' }}
            fontWeight="bold"
            lineHeight="1.2"
            letterSpacing="-0.01em"
            mb={5}
          >
            {post.title}
          </Heading>

          {post.tags.length > 0 && (
            <HStack gap={3} flexWrap="wrap" mb={2}>
              {post.tags.map((tag) => (
                <Span key={tag} fontFamily="mono" fontSize="0.65rem" color="accentSoft" opacity={0.6}>
                  #{tag}
                </Span>
              ))}
            </HStack>
          )}
          <Box
            mt={4}
            width="64px"
            height="6px"
            background="repeating-linear-gradient(-45deg, var(--colors-accent) 0 8px, transparent 8px 16px)"
          />
        </MotionBox>

        {/* Reading sheet — theme-switchable */}
        <Box
          style={themeVars(theme)}
          backgroundColor="var(--prose-sheet)"
          borderRadius={theme === 'light' ? '8px' : '0'}
          transition="background-color .3s"
          mx={{ base: theme === 'light' ? '-16px' : '0', md: theme === 'light' ? '-40px' : '0' }}
          px={{ base: theme === 'light' ? '16px' : '0', md: theme === 'light' ? '40px' : '0' }}
          py={theme === 'light' ? { base: 6, md: 10 } : '0'}
        >
          <div className={prose} dangerouslySetInnerHTML={{ __html: post.html }} />
        </Box>

        {/* Footer: back to list */}
        <Box
          mt={16}
          pt={6}
          borderTop="1px solid color-mix(in srgb, var(--colors-accent) 20%, transparent)"
        >
          <NextLink href="/blog" style={{ textDecoration: 'none' }}>
            <Span fontFamily="mono" fontSize="xs" letterSpacing="0.2em" color="accent" _hover={{ opacity: 0.7 }}>
              ◂ BACK TO BLOG
            </Span>
          </NextLink>
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
  return { props: { post, pageMeta } }
}

export default BlogPost
