import { Box, Flex, styled } from 'styled-system/jsx'

const Heading = styled.h2

interface SectionHeadingProps {
  en: string
  children: React.ReactNode
  accent?: string
}

// Skewed tag + heading, shared across works pages.
// The accent is passed as a CSS variable so Panda can statically extract the styles.
const SectionHeading = ({ en, children, accent = '#df8a42' }: SectionHeadingProps) => (
  <Flex
    alignItems="center"
    gap={4}
    mb={6}
    style={{ '--accent': accent } as React.CSSProperties}
  >
    <Box
      backgroundColor="var(--accent)"
      color="black"
      fontWeight="bold"
      fontSize="xs"
      letterSpacing="0.2em"
      px={3}
      py={1}
      transform="skewX(-12deg)"
      flexShrink={0}
    >
      <Box transform="skewX(12deg)">{en}</Box>
    </Box>
    <Heading
      as="h2"
      fontSize={{ base: 'xl', md: '2xl' }}
      fontWeight="bold"
      letterSpacing="0.05em"
    >
      {children}
    </Heading>
    <Box
      flex="1"
      height="1px"
      background="linear-gradient(90deg, color-mix(in srgb, var(--accent) 35%, transparent), transparent)"
    />
  </Flex>
)

export default SectionHeading
