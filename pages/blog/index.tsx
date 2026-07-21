import type { NextPage } from 'next'
import { Box, Flex, VStack, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span

// Placeholder shell; real blog layout is designed later.
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
      {/* Orange dot grid, matching profile/index tone */}
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
        pt="44px"
        minHeight="100vh"
        maxW="width.section"
        mx="auto"
        px={{ base: '24px', md: '48px' }}
        direction="column"
        justify="center"
        position="relative"
        zIndex={1}
      >
        <VStack gap={4} alignItems="start">
          <Text
            fontFamily="mono"
            fontSize={{ base: 'xs', md: 'sm' }}
            letterSpacing={{ base: '0.2em', md: '0.35em' }}
            color="accent"
            fontWeight="bold"
          >
            {t('blogPage.eyebrow')}
          </Text>
          <Heading
            fontSize={{ base: '3.5rem', md: '5.5rem' }}
            fontWeight="medium"
            lineHeight="1.05"
            letterSpacing="-0.02em"
          >
            {t('blogPage.title')}
          </Heading>
          <Flex alignItems="center" gap={3}>
            <Box
              width={{ base: '32px', sm: '64px' }}
              height="6px"
              background="repeating-linear-gradient(-45deg, var(--colors-accent) 0 8px, transparent 8px 16px)"
              flexShrink={0}
            />
            <Span fontSize={{ base: 'md', md: 'lg' }} color="accentSoft">
              {t('blogPage.comingSoon')}
            </Span>
          </Flex>
        </VStack>
      </Flex>
    </Box>
  )
}

export default Blog
