import NextLink from 'next/link'
import Image from 'next/image'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import { thumbSrc } from 'lib/imageThumb'

const Heading = styled.h2
const Text = styled.p
const Span = styled.span

export interface PostCardData {
  slug: string
  title: string
  date: string
  lang: 'zh' | 'en'
  excerpt: string
  tags: string[]
  cover: string | null
  readingTime: number
}

const formatDate = (iso: string) => iso.replace(/-/g, '.')

const PostCard = ({ post, index }: { post: PostCardData; index: number }) => {
  const serial = String(index + 1).padStart(2, '0')

  return (
    <NextLink href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <Flex
        gap={{ base: 4, md: 7 }}
        direction={{ base: 'column', sm: 'row' }}
        alignItems="stretch"
        py={{ base: 6, md: 7 }}
        position="relative"
        transition="background .25s"
        style={{ borderTop: '1px solid color-mix(in srgb, var(--ink) 20%, transparent)' }}
        _hover={{
          backgroundColor: 'color-mix(in srgb, var(--red) 5%, transparent)',
          '& [data-cover]': { transform: 'scale(1.04)' },
          '& [data-title]': { color: 'var(--red)' },
          '& [data-go]': { transform: 'translateX(4px)', opacity: 1 },
        }}
      >
        <Flex direction="column" gap={2} flexShrink={0} minW={{ sm: '96px' }}>
          <Span className="lbl" style={{ color: 'var(--red)' }}>NO.{serial}</Span>
          <Span className="lbl">{formatDate(post.date)}</Span>
          <Span className="lbl">{post.readingTime} MIN</Span>
        </Flex>

        <Box flex="1" minW={0}>
          <HStack gap={3} mb={2} flexWrap="wrap">
            <Span className="lbl" style={{ color: 'var(--red)' }}>{post.lang === 'en' ? 'EN' : 'ZH'}</Span>
            {post.tags.slice(0, 3).map((tag) => (
              <Span key={tag} className="lbl">{tag}</Span>
            ))}
          </HStack>
          <Heading
            data-title
            mb={2}
            transition="color .2s"
            style={{ fontFamily: 'var(--type)', fontSize: '15pt', fontWeight: 700, letterSpacing: '.06em', lineHeight: 1.5 }}
          >
            {post.title}
          </Heading>
          <Text
            maxW="60ch"
            style={{ fontFamily: 'var(--type)', fontSize: '11pt', lineHeight: 1.95, color: 'var(--ink3)', textAlign: 'justify' }}
          >
            {post.excerpt}
          </Text>
          <Span data-go className="lbl" display="inline-block" mt={3} opacity={0.7} transition="transform .2s, opacity .2s" style={{ color: 'var(--red)' }}>
            READ ▸
          </Span>
        </Box>

        {/* 相片不是印出來的，所以給壓痕陰影而不是墨壓濾鏡。 */}
        {post.cover && (
          <Box
            order={{ base: -1, sm: 0 }}
            flexShrink={0}
            width={{ base: '100%', sm: '150px', md: '190px' }}
            height={{ base: '180px', sm: '110px', md: '128px' }}
            overflow="hidden"
            position="relative"
            style={{ boxShadow: '0 1px 2px rgba(22, 19, 15, .26), 0 8px 18px rgba(22, 19, 15, .12)' }}
          >
            <Box data-cover position="absolute" inset="0" transition="transform .4s ease">
              <Image src={thumbSrc(post.cover)} alt="" fill sizes="190px" style={{ objectFit: 'cover' }} />
            </Box>
          </Box>
        )}
      </Flex>
    </NextLink>
  )
}

export default PostCard
