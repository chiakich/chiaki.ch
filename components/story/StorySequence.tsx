import { useEffect, useRef, useState } from 'react'
import { Box, styled } from 'styled-system/jsx'

const Text = styled.p

// The re-added origin story. A ruined-city still (save the reference image to
// public/assets/story/ruins.jpg) with a per-line dynamic filter — VHS roll,
// glitch, blur, flash — while the narration types in as film subtitles.

const RUINS = '/assets/story/ruins.jpg'

type Effect = {
  text: string
  filter: string
  flash?: boolean
  glitch?: boolean
}

const beats: Effect[] = [
  {
    text: '…世界大戰的終結，出乎所有人的意料',
    filter: 'grayscale(.4) contrast(1.05) brightness(.9)',
  },
  {
    text: '新式的炸彈投下後，不止帶走了生命',
    filter: 'grayscale(.2) contrast(1.2) brightness(1.25)',
    flash: true,
  },
  {
    text: '更像是搞砸了某種「人類習以為常」的東西',
    filter: 'hue-rotate(75deg) brightness(0.92) saturate(6)',
  },
  {
    text: '一瞬間，像是斷線一般，世界唐突安靜了下來',
    filter: 'contrast(1.35) hue-rotate(-14deg) brightness(0.1)',
    glitch: true,
  },
  { text: '距離的概念變得模糊', filter: 'blur(4px) brightness(.9) contrast(1.05)' },
  {
    text: '火藥不再能順利的點燃',
    filter: 'grayscale(.7) brightness(.78) contrast(1.1)',
  },
  {
    text: '機翼不再能提供足夠的升力',
    filter: 'grayscale(.5) brightness(.85) saturate(.6)',
  },
  {
    text: '…新生命變得難以誕生。',
    filter: 'sepia(.4) brightness(.72) contrast(1.02)',
  },
  {
    text: '就彷彿是……神明在一夜之間消失了',
    filter: 'grayscale(1) invert(1) brightness(0.5)',
  },
  {
    text: '沒有人知道發生了什麼事',
    filter: 'grayscale(.9) brightness(.42) contrast(1.1)',
  },
  {
    text: '但如同掙扎著倖存下來的人們一樣，',
    filter: 'grayscale(.3) brightness(.82) contrast(1.05)',
  },
  {
    text: '故事並沒有完全終結。',
    filter: 'sepia(.2) brightness(1) contrast(1.05) saturate(1.1)',
  },
]

// SVG fractal-noise grain, inlined so nothing extra loads over the network
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")"

const StorySequence = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState(0)

  // Scroll → active beat
  useEffect(() => {
    let frame = 0
    const update = () => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const distance = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / distance))
      const next = Math.min(beats.length - 1, Math.floor(progress * beats.length))
      setIndex((current) => (current === next ? current : next))
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

  // Typewriter for the active subtitle
  useEffect(() => {
    setTyped(0)
    const text = beats[index].text
    const id = window.setInterval(() => {
      setTyped((count) => {
        if (count >= text.length) {
          window.clearInterval(id)
          return count
        }
        return count + 1
      })
    }, 55)
    return () => window.clearInterval(id)
  }, [index])

  const beat = beats[index]

  return (
    <Box ref={containerRef} height="560vh" position="relative" backgroundColor="black">
      <Box position="sticky" top="0" height="100vh" overflow="hidden">
        {/* Background still + fallback gradient underneath */}
        <Box
          position="absolute"
          inset="0"
          background="radial-gradient(ellipse at 50% 40%, #1c2a2e, #05080a 70%)"
        />
        <Box
          position="absolute"
          inset="-4%"
          backgroundImage={`url('${RUINS}')`}
          backgroundSize="cover"
          backgroundPosition="center"
          animation="kenBurns 26s ease-in-out infinite alternate"
          style={{ filter: beat.filter, transition: 'filter 1.1s ease' }}
        />

        {/* Glitch chromatic doubles (only on glitch beats) */}
        {beat.glitch && (
          <>
            <Box
              key={`g1-${index}`}
              position="absolute"
              inset="-4%"
              backgroundImage={`url('${RUINS}')`}
              backgroundSize="cover"
              backgroundPosition="center"
              mixBlendMode="screen"
              opacity=".5"
              pointerEvents="none"
              style={{ transform: 'translateX(-6px)', filter: 'brightness(1.2) saturate(0) sepia(1) hue-rotate(-50deg)' }}
            />
            <Box
              key={`g2-${index}`}
              position="absolute"
              inset="-4%"
              backgroundImage={`url('${RUINS}')`}
              backgroundSize="cover"
              backgroundPosition="center"
              mixBlendMode="screen"
              opacity=".5"
              pointerEvents="none"
              style={{ transform: 'translateX(6px)', filter: 'brightness(1.2) saturate(0) sepia(1) hue-rotate(150deg)' }}
            />
          </>
        )}

        {/* White flash on flash beats */}
        {beat.flash && (
          <Box
            key={`flash-${index}`}
            position="absolute"
            inset="0"
            background="white"
            pointerEvents="none"
            animation="flashOut 1.1s ease-out forwards"
          />
        )}

        {/* VHS: scanlines + rolling band + grain + vignette */}
        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          opacity=".5"
          backgroundImage="repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,.28) 3px)"
        />
        <Box
          position="absolute"
          left="0"
          right="0"
          height="18%"
          pointerEvents="none"
          background="linear-gradient(transparent, rgba(180,255,235,.08), transparent)"
          animation="vhsRoll 6s linear infinite"
        />
        <Box
          position="absolute"
          inset="-40%"
          pointerEvents="none"
          opacity=".08"
          style={{ backgroundImage: GRAIN, animation: 'grainShift 1.4s steps(4) infinite' }}
        />
        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          background="radial-gradient(ellipse 70% 70% at 50% 50%, transparent 44%, rgba(0,0,0,.72) 100%)"
        />

        {/* HUD label */}
        <Text
          position="absolute"
          top={{ base: '116px', md: '136px' }}
          left={{ base: '24px', md: '7vw' }}
          fontFamily="nixie"
          fontSize="9px"
          letterSpacing=".22em"
          color="rgba(200,215,210,.4)"
        >
          ARCHIVE / RECOVERED FOOTAGE — {String(index + 1).padStart(2, '0')}/{beats.length}
        </Text>

        {/* Film subtitle */}
        <Box
          position="absolute"
          left="0"
          right="0"
          bottom={{ base: '11%', md: '13%' }}
          display="flex"
          justifyContent="center"
          px="24px"
          pointerEvents="none"
        >
          <Text
            maxWidth="880px"
            textAlign="center"
            fontSize={{ base: '1.15rem', md: '1.7rem' }}
            lineHeight="1.6"
            letterSpacing=".06em"
            color="rgba(248,244,235,.96)"
            textShadow="0 2px 18px rgba(0,0,0,.95), 0 0 30px rgba(0,0,0,.6)"
          >
            {beat.text.slice(0, typed)}
            {typed < beat.text.length && (
              <Box as="span" ml="2px" color="rgba(245,220,170,.9)" animation="cursorBlink .7s steps(1) infinite">
                ▌
              </Box>
            )}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default StorySequence
