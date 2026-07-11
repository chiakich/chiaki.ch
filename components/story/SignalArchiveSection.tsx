import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import AsciiMatrixField from './AsciiMatrixField'
import TerminalSelfTest from './TerminalSelfTest'

const Text = styled.p

const SignalArchiveSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const systemRef = useRef<HTMLDivElement>(null)
  const [selfTestComplete, setSelfTestComplete] = useState(false)
  const handleSelfTestComplete = useCallback(() => setSelfTestComplete(true), [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const distance = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / distance))

      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(0, ${-progress * 90}px, 0) scale(${1 + progress * 0.08})`
      }
      if (systemRef.current) {
        // Keep the block vertically centred (the -50%) while the parallax
        // drifts it upward; JS transform would otherwise clobber the CSS one.
        systemRef.current.style.transform = `translate3d(0, calc(-50% + ${(-progress * 120).toFixed(1)}px), 0)`
        systemRef.current.style.opacity = String(Math.max(0.05, 1 - progress * 1.4))
      }
      frame = 0
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <Box ref={containerRef} height="260vh" position="relative" backgroundColor="#020504">
      <Box position="sticky" top="0" height="100vh" overflow="hidden" color="white">
        <Box
          ref={gridRef}
          position="absolute"
          inset="-15%"
          opacity=".28"
          backgroundImage="linear-gradient(rgba(88,190,166,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(88,190,166,.12) 1px, transparent 1px)"
          backgroundSize="52px 52px"
          transformOrigin="center"
          willChange="transform"
        />
        <AsciiMatrixField />
        <Box
          position="absolute"
          inset="0"
          background="radial-gradient(circle at 50% 46%, rgba(44,125,108,.22), transparent 34%), radial-gradient(circle at 12% 20%, rgba(145,51,33,.13), transparent 25%)"
        />
        <Flex
          position="absolute"
          top={{ base: '120px', md: '140px' }}
          left={{ base: '24px', md: '7vw' }}
          right={{ base: '24px', md: '7vw' }}
          justifyContent="space-between"
          fontFamily="nixie"
          fontSize="9px"
          letterSpacing=".22em"
          color="rgba(174,213,202,.44)"
        >
          <Text>ARCHIVE / SIGNAL LOSS</Text>
          <Text>DAY 11,247</Text>
        </Flex>

        <Box
          ref={systemRef}
          position="absolute"
          top="44%"
          left="24px"
          right="24px"
          transform="translateY(-50%)"
          willChange="transform, opacity"
          zIndex="2"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={{ base: '18px', md: '24px' }}
        >
          <TerminalSelfTest onComplete={handleSelfTestComplete} />
          {/* Subtitle sits directly beneath the terminal */}
          <Box
            pointerEvents="none"
            opacity={selfTestComplete ? 1 : 0}
            transform={selfTestComplete ? 'translateY(0)' : 'translateY(14px)'}
            transition="opacity 1.1s ease, transform 1.1s ease"
            px={{ base: '18px', md: '28px' }}
            py="10px"
            border="1px solid rgba(235,220,184,.16)"
            background="rgba(0,5,4,.68)"
            backdropFilter="blur(9px)"
            color="rgba(245,232,199,.92)"
            fontSize={{ base: '15px', md: '19px' }}
            letterSpacing=".12em"
            textShadow="0 2px 18px rgba(0,0,0,.9)"
          >
            到底怎麼了？
            <Box as="span" ml="5px" color="#e8c16b" animation="cursorBlink .8s steps(1) infinite">▌</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default SignalArchiveSection
