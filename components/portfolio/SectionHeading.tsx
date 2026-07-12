import { Box, styled } from 'styled-system/jsx'

const Heading = styled.h2
const Text = styled.p

interface SectionHeadingProps {
  en: string
  children: React.ReactNode
  accent?: string
  center?: boolean
  sub?: React.ReactNode
}

// Apple 產品頁式的段落標題：小字 eyebrow + 大標，可置中，可帶副標。
// accent 走 CSS 變數讓 Panda 能靜態抽取。
const SectionHeading = ({ en, children, accent = '#df8a42', center = false, sub }: SectionHeadingProps) => (
  <Box
    mb={{ base: 8, md: 10 }}
    textAlign={center ? 'center' : 'left'}
    style={{ '--accent': accent } as React.CSSProperties}
  >
    <Text
      color="var(--accent)"
      fontWeight="700"
      fontSize="sm"
      letterSpacing=".14em"
      textTransform="uppercase"
      mb={3}
    >
      {en}
    </Text>
    <Heading
      as="h2"
      fontSize={{ base: '2rem', md: '3rem' }}
      fontWeight="700"
      letterSpacing="-.02em"
      lineHeight="1.12"
    >
      {children}
    </Heading>
    {sub && (
      <Text
        mt={4}
        fontSize={{ base: 'md', md: 'lg' }}
        lineHeight="1.8"
        opacity={.65}
        maxW="680px"
        mx={center ? 'auto' : undefined}
      >
        {sub}
      </Text>
    )}
  </Box>
)

export default SectionHeading
