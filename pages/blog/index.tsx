import type { NextPage } from 'next'
import { Box, Flex, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import PostCard, { PostCardData } from 'components/blog/PostCard'
import posts from 'content/blog/index.json'

const Text = styled.p

const allPosts = posts as unknown as PostCardData[]

const Blog: NextPage = () => {
  const { t } = useI18n()

  return (
    <Box
      backgroundColor="black"
      color="white"
      minHeight="100vh"
      overflowX="clip"
      position="relative"
    >
      {/* Orange dot grid, matching profile tone */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        height="100vh"
        opacity=".2"
        backgroundImage="radial-gradient(rgba(223, 138, 66, .2) 1px, transparent 1px)"
        backgroundSize="18px 18px"
        maskImage="linear-gradient(to bottom, black 40%, transparent)"
        pointerEvents="none"
        zIndex={0}
        aria-hidden
      />

      <Flex
        pt="96px"
        pb="80px"
        minHeight="100vh"
        maxW="width.section"
        mx="auto"
        px={{ base: '24px', md: '48px' }}
        direction="column"
        position="relative"
        zIndex={1}
      >
        {/* Header — kept minimal: mono eyebrow + count, no display title */}
        <Flex alignItems="center" gap={3} mb={10}>
          <Text
            as="h1"
            fontFamily="mono"
            fontSize={{ base: 'xs', md: 'sm' }}
            letterSpacing={{ base: '0.2em', md: '0.35em' }}
            color="accent"
            fontWeight="bold"
          >
            {t('blogPage.eyebrow')}
          </Text>
          <Box
            width={{ base: '32px', sm: '64px' }}
            height="6px"
            background="repeating-linear-gradient(-45deg, var(--colors-accent) 0 8px, transparent 8px 16px)"
            flexShrink={0}
          />
        </Flex>

        {/* Post list */}
        <Box
          borderBottom="1px solid color-mix(in srgb, var(--colors-accent) 22%, transparent)"
        >
          {allPosts.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </Box>
      </Flex>
    </Box>
  )
}

export default Blog
