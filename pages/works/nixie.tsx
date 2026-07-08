import { NextPage } from 'next'
import Head from 'next/head'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Container, HStack, Stack, styled } from 'styled-system/jsx'
import { motion } from 'framer-motion'
import TopBar from 'components/TopBar'
import FontsSubNav from 'components/FontsSubNav'
import SectionHeading from 'components/works/SectionHeading'
import GlyphGrid from 'components/works/GlyphGrid'
import DownloadButton from 'components/works/DownloadButton'

const Text = styled.p
const Span = styled.span

const MotionBox = motion(Box)

const NIXIE = '#cc5003'
const NIXIE_BRIGHT = '#ff9b28'

const glowTextShadow =
  '0px 0px 6px rgba(255,65,0,0.7), 0px 0px 20px #ff8000, 0px 0px 10px rgb(118,18,3)'

// Steins;Gate-style divergence meter: a live clock that occasionally
// undergoes a worldline shift — digits spin wildly, then settle one by
// one (left to right) on a divergence number, hold, and return to time.
const DIVERGENCE_LINES = [
  '1.048596',
  '0.571024',
  '0.523299',
  '0.337187',
  '1.130205',
  '1.129848',
  '2.615074',
  '3.406288',
]

const getClockDisplay = (cycle: number) => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const a = now.getHours() >= 12 ? '1' : '0'
  return `${a}.${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(cycle % 100)}`
}

const useWorldline = () => {
  const [display, setDisplay] = useState('0.000000')
  const [shifting, setShifting] = useState(false)
  const cycle = useRef(0)
  const busy = useRef(false)
  const alive = useRef(true)

  const shift = useCallback(() => {
    if (busy.current || !alive.current) return
    busy.current = true
    setShifting(true)
    const target =
      DIVERGENCE_LINES[Math.floor(Math.random() * DIVERGENCE_LINES.length)]
    const start = Date.now()

    // Interval-driven (not rAF) so a backgrounded tab can still settle
    const spin = setInterval(() => {
      if (!alive.current) {
        clearInterval(spin)
        return
      }
      const elapsed = Date.now() - start
      let out = ''
      let allSettled = true
      let digitIndex = 0
      for (const ch of target) {
        if (ch === '.') {
          out += '.'
          continue
        }
        // Each tube locks in 140ms after the previous one
        if (elapsed >= 900 + digitIndex * 100) {
          out += ch
        } else {
          out += String(Math.floor(Math.random() * 10))
          allSettled = false
        }
        digitIndex++
      }
      setDisplay(out)
      if (allSettled) {
        clearInterval(spin)
        setShifting(false)
        // Hold the new worldline before drifting back to the present
        setTimeout(() => {
          if (!alive.current) return
          const returnStart = Date.now()
          const returnToClock = setInterval(() => {
            if (!alive.current) {
              clearInterval(returnToClock)
              return
            }

            const elapsed = Date.now() - returnStart
            const clockDisplay = getClockDisplay(cycle.current)
            let out = ''
            let allReturned = true
            let digitIndex = 0

            for (let i = 0; i < clockDisplay.length; i++) {
              const ch = clockDisplay[i]
              if (ch === '.') {
                out += '.'
                continue
              }

              if (elapsed >= digitIndex * 140) {
                out += ch
              } else {
                out += target[i]
                allReturned = false
              }
              digitIndex++
            }

            setDisplay(out)
            if (allReturned) {
              clearInterval(returnToClock)
              busy.current = false
            }
          }, 90)
        }, 2000)
      }
    }, 30)
  }, [])

  useEffect(() => {
    alive.current = true
    const clock = setInterval(() => {
      if (busy.current || !alive.current) return
      setDisplay(getClockDisplay(cycle.current))
      cycle.current = (cycle.current + 1) % 100
    }, 50)

    const shifts = setInterval(() => shift(), 12000 + Math.random() * 6000)

    return () => {
      alive.current = false
      clearInterval(clock)
      clearInterval(shifts)
    }
  }, [shift])

  return { display, shifting, shift }
}

const NixiePage: NextPage = () => {
  const { display, shifting, shift } = useWorldline()

  return (
    <Box backgroundColor="#020202" color="white" minHeight="100vh">
      <Head>
        <title>Nixie 數字字體 - 千秋的字體作品</title>
        <meta
          name="description"
          content="靈感來自輝光管顯示器的數位字體，重現輝光管獨特的溫暖橙光。"
        />
      </Head>

      <TopBar />
      <FontsSubNav />

      {/* Hero: glowing clock */}
      <Box
        pt="88px"
        minHeight="80vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
        background="radial-gradient(ellipse at 50% 60%, #1a0a00 0%, #020202 70%)"
      >
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          textAlign="center"
          px={4}
        >
          <Text
            fontSize="sm"
            letterSpacing="0.4em"
            color={NIXIE}
            fontWeight="bold"
            mb={6}
            textShadow={`0 0 10px ${NIXIE}`}
          >
            AKINIXIE NUMBER FONT
          </Text>
          <Box
            position="relative"
            display="inline-block"
            cursor="pointer"
            onClick={shift}
            style={{
              filter: shifting ? 'blur(1.2px) brightness(1.7)' : 'none',
              transition: 'filter 0.15s ease',
            }}
          >
            {/* Filament background trick from the original page */}
            <Span
              position="absolute"
              inset="0"
              fontFamily="nixie"
              fontSize={{ base: '3.4rem', md: '8rem' }}
              opacity={0.25}
              color="rgba(222,169,89,0.38)"
              aria-hidden
              userSelect="none"
            >
              $.$$$$$$
            </Span>
            <Text
              fontFamily="nixie"
              fontSize={{ base: '3.4rem', md: '8rem' }}
              color={NIXIE_BRIGHT}
              animation={
                shifting ? 'nixieShine 0.05s infinite' : 'nixieShine 0.17s infinite'
              }
              textShadow={glowTextShadow}
              suppressHydrationWarning
            >
              {display}
            </Text>
          </Box>
          <Text mt={6} opacity={0.6} fontSize={{ base: 'sm', md: 'md' }}>
            靈感來自輝光管顯示器的數字字體，現在時刻，以及偶爾的世界線變動。
          </Text>
          <Text mt={2} opacity={0.35} fontSize="xs" letterSpacing="0.2em">
            點選來互動
          </Text>
        </MotionBox>
      </Box>

      {/* Static worldline band */}
      <Box
        backgroundColor="#0a0503"
        borderTop="1px solid #2a160a"
        borderBottom="1px solid #2a160a"
        py={4}
        px={6}
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={{ base: 6, md: 12 }}
        flexWrap="wrap"
        overflow="hidden"
      >
        {DIVERGENCE_LINES.slice(0, 5).map((line, i) => (
          <Span
            key={i}
            fontFamily="nixie"
            fontSize={{ base: 'lg', md: '2xl' }}
            color={i % 2 ? `${NIXIE}88` : NIXIE_BRIGHT}
            textShadow={i % 2 ? undefined : glowTextShadow}
            whiteSpace="nowrap"
          >
            {line}
          </Span>
        ))}
      </Box>

      <Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}>
        <Stack gap={16}>
          <MotionBox
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeading en="STORY" accent={NIXIE_BRIGHT}>
              關於這套字
            </SectionHeading>
            <Stack gap={4} fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={0.9} maxW="720px">
              <Text>
                輝光管（Nixie Tube）是冷戰時期的數字顯示元件：玻璃管裡疊著
                0–9 十片金屬陰極，通電時氖氣在數字周圍發出溫暖的橙光。它早已被
                LED 取代，但那種帶著燈絲與玻璃反光的顯示質感，至今仍難以複製。
              </Text>
              <Text>
                這套字體重現了輝光管數字的字形與氛圍，收錄 0–9 與小數點、負號，並附上一個特殊的「$」字符——它是所有數字疊在一起的燈絲剪影，把它墊在數字後面，就能做出真實輝光管「背景陰極」的效果。
              </Text>
            </Stack>
          </MotionBox>

          <Box>
            <SectionHeading en="GLYPHS" accent={NIXIE_BRIGHT}>
              字符一覽
            </SectionHeading>
            <Text fontSize="sm" opacity={0.6} mb={5}>
              全部 13 個數字字符。
            </Text>
            <GlyphGrid
              chars="0123456789-.$"
              fontFamily="nixie"
              accent={NIXIE_BRIGHT}
              glow
              minCell="88px"
            />
          </Box>

          <MotionBox
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeading en="DOWNLOAD" accent={NIXIE_BRIGHT}>
              下載與授權
            </SectionHeading>
            <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" opacity={0.9} mb={6} maxW="720px">
              以 CC BY-SA 4.0 授權釋出，標註來源即可自由使用與改作。
            </Text>
            <HStack gap={4} flexWrap="wrap">
              <DownloadButton
                href="/assets/fonts/AkiNixie.ttf"
                download="AkiNixie.ttf"
                label="DOWNLOAD"
                sub="TTF"
                accent={NIXIE_BRIGHT}
              />
            </HStack>
            <Text fontSize="sm" opacity={0.5} mt={4}>
              © 千秋 — CC BY-SA 4.0
            </Text>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  )
}

export default NixiePage
