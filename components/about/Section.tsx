import { Box, Flex, styled } from 'styled-system/jsx'
import { motion } from 'framer-motion'
import { ACCENT } from 'components/about/theme'

const Heading = styled.h2
const Span = styled.span

const MotionBox = motion(Box)

// Skewed P5-style tag + heading, with a trailing serial code
const SectionTitle = ({
  en,
  code,
  children,
}: {
  en: string
  code: string
  children: React.ReactNode
}) => (
  <Flex alignItems="center" gap={4} mb={5}>
    <Box position="relative" flexShrink={0}>
      {/* Offset outline echo behind the solid chip */}
      <Box
        position="absolute"
        inset="0"
        border={`1px solid ${ACCENT}aa`}
        transform="skewX(-6deg) translate(4px, 4px)"
        clipPath="polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)"
        aria-hidden
      />
      <Box
        position="relative"
        backgroundColor={ACCENT}
        color="black"
        fontWeight="bold"
        fontSize="xs"
        letterSpacing="0.2em"
        px={3}
        py={1}
        transform="skewX(-6deg)"
        clipPath="polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)"
        outline="1px solid rgba(0,0,0,0.35)"
        outlineOffset="-3px"
      >
        <Box transform="skewX(6deg)">{en}</Box>
      </Box>
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
      background={`linear-gradient(90deg, ${ACCENT}55, transparent)`}
    />
    <Span
      fontFamily="mono"
      fontSize="0.6rem"
      letterSpacing="0.2em"
      opacity={0.4}
      whiteSpace="nowrap"
      flexShrink={0}
      display={{ base: 'none', md: 'inline' }}
      aria-hidden
    >
      {`${code} ///`}
    </Span>
  </Flex>
)

const Section = ({
  en,
  code,
  title,
  children,
}: {
  en: string
  code: string
  title: string
  children: React.ReactNode
}) => (
  <MotionBox
    width="100%"
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    <SectionTitle en={en} code={code}>{title}</SectionTitle>
    <Box fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" opacity={0.92}>
      {children}
    </Box>
  </MotionBox>
)

export default Section
