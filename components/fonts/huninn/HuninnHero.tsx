import { motion } from 'framer-motion'
import { Box, Container, Flex, styled } from 'styled-system/jsx'
import { HUNINN } from './huninnTheme'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const MotionBox = motion(Box)

const pearls = [
  [140, '10%', '6%', HUNINN.yellow], [60, '22%', '76%', HUNINN.red], [90, '68%', '14%', HUNINN.blue], [46, '58%', '74%', HUNINN.green],
] as const

const HuninnHero = () => <>
  <Box pt="96px" position="relative" overflow="hidden">
    {pearls.map(([size, top, left, color], index) => <MotionBox key={index} position="absolute" width={`${size}px`} height={`${size}px`} top={top} left={left} borderRadius="full" border="3px solid" borderColor={color} opacity={.28} animate={{ y: [0, -14, 0] }} transition={{ duration: 5 + index, repeat: Infinity }} />)}
    <Box position="absolute" inset="0" backgroundImage="radial-gradient(rgba(255,255,255,.06) 1px, transparent 1.5px)" backgroundSize="22px 22px" />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 24 }} position="relative">
      <MotionBox textAlign="center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Text letterSpacing=".35em" color={HUNINN.yellow} fontWeight="bold" mb={5}>JF OPEN HUNINN · OPEN SOURCE TYPEFACE</Text>
        <Heading fontFamily="huninn" fontSize={{ base: '4rem', md: '7rem' }} fontWeight="normal" color={HUNINN.paper} mb={6}>粉<Span position="relative" color={HUNINN.yellow}>圓</Span>體</Heading>
        <Text fontFamily="huninn" fontSize={{ base: 'lg', md: '2xl' }} color={HUNINN.paper}>一款免費開源的台灣圓體，像粉圓一樣圓潤可愛。</Text>
      </MotionBox>
    </Container>
  </Box>
  <Flex backgroundColor="#111" py={4} px={6} justifyContent="center" gap={{ base: 4, md: 10 }} flexWrap="wrap">{[['視野無限廣，窗外有藍天', HUNINN.yellow], ['像珍珠一樣', HUNINN.red], ['圓潤有彈性', HUNINN.green], ['打字的好朋友', '#4E97F8']].map(([text, color]) => <Span key={text} fontFamily="huninn" fontSize={{ base: 'lg', md: '2xl' }} color={color}>{text}</Span>)}</Flex>
</>

export default HuninnHero
