import NextLink from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'

const Heading = styled.h2
const Text = styled.p
const Span = styled.span
const MotionBox = motion.create(Box)

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
    <MotionBox
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <NextLink href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <Flex
          gap={{ base: 4, md: 6 }}
          direction={{ base: 'column', sm: 'row' }}
          alignItems="stretch"
          borderTop="1px solid color-mix(in srgb, var(--colors-accent) 22%, transparent)"
          py={{ base: 6, md: 7 }}
          position="relative"
          transition="background .25s"
          _hover={{
            backgroundColor: 'color-mix(in srgb, var(--colors-accent) 6%, transparent)',
            '& [data-cover]': { transform: 'scale(1.04)' },
            '& [data-title]': { color: 'accent' },
            '& [data-go]': { transform: 'translateX(4px)', opacity: 1 },
          }}
        >
          {/* Serial + meta rail */}
          <Flex direction="column" gap={2} flexShrink={0} minW={{ sm: '92px' }}>
            <Span
              fontFamily="mono"
              fontSize="0.6rem"
              letterSpacing="0.25em"
              color="accent"
              fontWeight="bold"
            >
              POST.{serial}
            </Span>
            <Span fontFamily="mono" fontSize="xs" opacity={0.55} letterSpacing="0.1em">
              {formatDate(post.date)}
            </Span>
            <Span fontFamily="mono" fontSize="0.6rem" opacity={0.4} letterSpacing="0.1em">
              {post.readingTime} MIN
            </Span>
          </Flex>

          {/* Body */}
          <Box flex="1" minW={0}>
            <HStack gap={2} mb={2} flexWrap="wrap">
              <Span
                fontFamily="mono"
                fontSize="0.55rem"
                fontWeight="bold"
                letterSpacing="0.15em"
                backgroundColor="accent"
                color="black"
                px={1.5}
                py={0.5}
                transform="skewX(-8deg)"
              >
                <Box transform="skewX(8deg)">{post.lang === 'en' ? 'EN' : 'ZH'}</Box>
              </Span>
              {post.tags.slice(0, 3).map((tag) => (
                <Span
                  key={tag}
                  fontFamily="mono"
                  fontSize="0.6rem"
                  letterSpacing="0.08em"
                  color="accentSoft"
                  opacity={0.7}
                >
                  #{tag}
                </Span>
              ))}
            </HStack>
            <Heading
              data-title
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              lineHeight="1.3"
              letterSpacing="-0.01em"
              mb={2}
              transition="color .2s"
            >
              {post.title}
            </Heading>
            <Text fontSize={{ base: 'sm', md: 'md' }} opacity={0.6} lineHeight="1.7" maxW="60ch">
              {post.excerpt}
            </Text>
            <Span
              data-go
              display="inline-block"
              mt={3}
              fontFamily="mono"
              fontSize="xs"
              letterSpacing="0.2em"
              color="accent"
              opacity={0.6}
              transition="transform .2s, opacity .2s"
            >
              READ ▸
            </Span>
          </Box>

          {/* Cover */}
          {post.cover && (
            <Box
              order={{ base: -1, sm: 0 }}
              flexShrink={0}
              width={{ base: '100%', sm: '150px', md: '190px' }}
              height={{ base: '180px', sm: '110px', md: '128px' }}
              overflow="hidden"
              position="relative"
              border="1px solid color-mix(in srgb, var(--colors-accent) 25%, transparent)"
            >
              <Box data-cover position="absolute" inset="0" transition="transform .4s ease">
                <Image
                  src={post.cover}
                  alt=""
                  fill
                  sizes="190px"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Box>
          )}
        </Flex>
      </NextLink>
    </MotionBox>
  )
}

export default PostCard
