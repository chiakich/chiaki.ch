import { motion } from 'framer-motion'
import { Box, Container, Flex, styled } from 'styled-system/jsx'
import { HUNINN } from './huninnTheme'
import { useI18n } from 'i18n'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const MotionBox = motion.create(Box)

const pearls = [
  [140, '10%', '6%', HUNINN.yellow], [60, '22%', '76%', HUNINN.red], [90, '68%', '14%', HUNINN.blue], [46, '58%', '74%', HUNINN.green],
] as const

// 動態尺寸與色彩一律走 inline style：Panda 無法靜態抽取變數值。
const HuninnHero = () => {
  const { t } = useI18n()
  const samples = [0, 1, 2, 3].map((index) => t(`huninnPage.samples.${index}`))
  return <>
  <Box pt="96px" position="relative" overflow="hidden">
    {pearls.map(([size, top, left, color], index) => <MotionBox key={index} position="absolute" borderRadius="full" opacity={.28} style={{ width: size, height: size, top, left, border: `3px solid ${color}` }} animate={{ y: [0, -14, 0] }} transition={{ duration: 5 + index, repeat: Infinity }} />)}
    <Box position="absolute" inset="0" backgroundImage="radial-gradient(rgba(255,255,255,.06) 1px, transparent 1.5px)" backgroundSize="22px 22px" />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 24 }} position="relative">
      <MotionBox textAlign="center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Text letterSpacing=".35em" fontWeight="bold" mb={5} style={{ color: HUNINN.yellow }}>JF OPEN HUNINN · OPEN SOURCE TYPEFACE</Text>
        <Heading fontFamily="huninn" fontSize={{ base: '4rem', md: '7rem' }} fontWeight="normal" mb={6} style={{ color: HUNINN.paper }}>粉<Span position="relative" style={{ color: HUNINN.yellow }}>圓</Span>體</Heading>
        <Text fontFamily="huninn" fontSize={{ base: 'lg', md: '2xl' }} style={{ color: HUNINN.paper }}>{t('huninnPage.hero')}</Text>
      </MotionBox>
    </Container>
  </Box>
  <Flex backgroundColor="#111" py={4} px={6} justifyContent="center" gap={{ base: 4, md: 10 }} flexWrap="wrap">{samples.map((text, index) => <Span key={text} fontFamily="huninn" fontSize={{ base: 'lg', md: '2xl' }} style={{ color: [HUNINN.yellow, HUNINN.red, HUNINN.green, '#4E97F8'][index] }}>{text}</Span>)}</Flex>
</>
}

export default HuninnHero
