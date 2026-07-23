import { motion } from 'framer-motion'
import { Box, Container, Flex, styled } from 'styled-system/jsx'
import { HUNINN } from './huninnTheme'
import { useI18n } from 'i18n'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const MotionBox = motion.create(Box)

// Flat solid pearls floating around the title: [size, top, left, color]
const pearls = [
  [120, '8%', '4%', HUNINN.yellow], [52, '64%', '12%', HUNINN.red],
  [84, '14%', '82%', HUNINN.blue], [44, '66%', '86%', HUNINN.green],
  [28, '38%', '20%', HUNINN.red], [36, '30%', '72%', HUNINN.yellow],
] as const

const sampleTiles = [
  { bg: HUNINN.yellow, color: HUNINN.ink },
  { bg: HUNINN.red, color: HUNINN.paper },
  { bg: HUNINN.green, color: HUNINN.paper },
  { bg: HUNINN.blue, color: HUNINN.paper },
]

// 動態尺寸與色彩一律走 inline style：Panda 無法靜態抽取變數值。
const HuninnHero = () => {
  const { t } = useI18n()
  const samples = [0, 1, 2, 3].map((index) => t(`huninnPage.samples.${index}`))
  return <>
  <Box pt="96px" position="relative" overflow="hidden">
    {/* flat cropped rings bleeding off the edges, poster-style */}
    <Box position="absolute" top="-70px" left="-70px" width="230px" height="230px" borderRadius="full" style={{ border: `30px solid ${HUNINN.green}` }} opacity={.7} />
    <Box position="absolute" top="140px" right="-70px" width="170px" height="170px" borderRadius="full" style={{ border: `26px solid ${HUNINN.blue}` }} opacity={.7} display={{ base: 'none', md: 'block' }} />
    {pearls.map(([size, top, left, color], index) => <MotionBox key={index} position="absolute" borderRadius="full" opacity={.75} style={{ width: size, height: size, top, left, backgroundColor: color }} animate={{ y: [0, -14, 0] }} transition={{ duration: 5 + index, repeat: Infinity }} />)}
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 24 }} position="relative">
      <MotionBox textAlign="center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Text letterSpacing=".35em" fontWeight="bold" mb={5} style={{ color: HUNINN.yellow }}>JF OPEN HUNINN · OPEN SOURCE TYPEFACE</Text>
        <Heading fontFamily="huninn" fontSize={{ base: '4rem', md: '7rem' }} fontWeight="regular" mb={6} style={{ color: HUNINN.paper }}>粉<Span style={{ color: HUNINN.yellow }}>圓</Span>體</Heading>
        <Text fontFamily="huninn" fontSize={{ base: 'lg', md: '2xl' }} style={{ color: HUNINN.paper }}>{t('huninnPage.hero')}</Text>
      </MotionBox>
    </Container>
  </Box>
  <Flex justifyContent="stretch" flexWrap="wrap">{samples.map((text, index) => <Flex key={text} flex="1 1 25%" minW="160px" justifyContent="center" alignItems="center" py={4} px={4} style={{ backgroundColor: sampleTiles[index].bg }}><Span fontFamily="huninn" fontSize={{ base: 'lg', md: '2xl' }} whiteSpace="nowrap" style={{ color: sampleTiles[index].color }}>{text}</Span></Flex>)}</Flex>
</>
}

export default HuninnHero
