import { motion } from 'framer-motion'
import { Box, styled } from 'styled-system/jsx'
import { NIXIE, NIXIE_BRIGHT, NIXIE_GLOW, WORLDLINES } from './nixieTheme'
import { useWorldline } from './useWorldline'

const Text = styled.p
const Span = styled.span
const MotionBox = motion(Box)

// 動態色彩一律走 inline style：Panda 無法靜態抽取 import 進來的常數。
const NixieHero = () => {
  const { display, shifting, shift } = useWorldline()
  return <>
    <Box pt="96px" minHeight="80vh" display="flex" alignItems="center" justifyContent="center" background="radial-gradient(ellipse at 50% 60%, #1a0a00, #020202 70%)">
      <MotionBox textAlign="center" px={4} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
        <Text letterSpacing=".4em" fontWeight="bold" mb={6} style={{ color: NIXIE }}>AKINIXIE NUMBER FONT</Text>
        <Box position="relative" display="inline-block" cursor="pointer" onClick={shift} style={{ filter: shifting ? 'blur(1px) brightness(1.7)' : 'none' }}>
          <Span position="absolute" inset="0" fontFamily="nixie" fontSize={{ base: '3.4rem', md: '8rem' }} opacity={.22} color="#deab59">$.$$$$$$</Span>
          <Text fontFamily="nixie" fontSize={{ base: '3.4rem', md: '8rem' }} style={{ color: NIXIE_BRIGHT, textShadow: NIXIE_GLOW }}>{display}</Text>
        </Box>
        <Text mt={6} opacity={.6}>現在時刻，以及偶爾的世界線變動。</Text><Text mt={2} opacity={.35} fontSize="xs">點選來互動</Text>
      </MotionBox>
    </Box>
    <Box backgroundColor="#0a0503" py={4} px={6} display="flex" justifyContent="center" gap={{ base: 6, md: 12 }} flexWrap="wrap">{WORLDLINES.slice(0, 5).map((line, index) => <Span key={line} fontFamily="nixie" fontSize={{ base: 'lg', md: '2xl' }} style={{ color: index % 2 ? `${NIXIE}88` : NIXIE_BRIGHT, textShadow: index % 2 ? undefined : NIXIE_GLOW }}>{line}</Span>)}</Box>
  </>
}

export default NixieHero
