import { useEffect, useRef, useState } from 'react'
import { Box, styled } from 'styled-system/jsx'

const Text = styled.p

// The core prayer, recited one line at a time. Each line's opacity is a direct
// function of scroll position (not a timed animation), so every line is seen in
// order however fast you scroll — the earlier keyed CSS fade got outrun.
const RAW: [string, boolean][] = [
  ['掛ケマクモ畏キ', false],
  ['稲荷大神ノ御前ニ▓▓▓▓', false],
  ['恐ミ恐ミモ白ス', false],
  ['此ノ郷ノ稔リヲ守リ給ヘ', false],
  ['八百萬ノ神等ト共ニ▓▓▓', false],
  ['祓ヘ給ヒ　清メ給ヘ', false],
  ['▓▓▓▓御守リ幸ヘ給ヘ', false],
  ['届カヌ言ノ葉モ、ナオ──', false],
  ['[Connection Lost]', true],
]
const FIRST_CENTER = 0.1
const LAST_CENTER = 0.86
const prayer = RAW.map(([text, lost], i) => ({
  text,
  lost,
  center: FIRST_CENTER + ((LAST_CENTER - FIRST_CENTER) * i) / (RAW.length - 1),
}))

// The prayer scene. The miko stands against a warm, blurred still
// (save the reference art to public/assets/story/miko.jpg); scattered norito
// fragments drift behind while the core prayer fades in, line by line.

const MIKO = '/assets/story/miko.jpg'

// A few gold motes to sit in the air like drifting foxfire / incense embers.
const MOTES = [
  { x: 16, y: 30, d: 0.2 },
  { x: 78, y: 24, d: 1.1 },
  { x: 32, y: 66, d: 1.8 },
  { x: 66, y: 58, d: 0.7 },
  { x: 88, y: 44, d: 2.3 },
  { x: 10, y: 72, d: 1.4 },
  { x: 52, y: 20, d: 2.0 },
]

const NoritoSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const distance = Math.max(1, rect.height - window.innerHeight)
      const next = Math.min(1, Math.max(0, -rect.top / distance))
      setProgress((prev) => (Math.abs(prev - next) > 0.001 ? next : prev))
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
    <Box ref={containerRef} height="480vh" position="relative" backgroundColor="#040302">
      <Box position="sticky" top="0" height="100vh" overflow="hidden">
        {/* Warm fallback behind the still */}
        <Box
          position="absolute"
          inset="0"
          background="radial-gradient(ellipse at 50% 42%, #3a2415, #0a0705 72%)"
        />
        {/* Miko still: soft-focus, darkened cover so the prayer reads over it */}
        <Box
          position="absolute"
          inset="-5%"
          backgroundImage={`url('${MIKO}')`}
          backgroundSize="cover"
          backgroundPosition="center 28%"
          animation="kenBurns 34s ease-in-out infinite alternate"
          style={{ filter: 'blur(7px) brightness(.5) saturate(1.05)' }}
        />
        {/* Warm halo glow behind the figure */}
        <Box
          position="absolute"
          inset="0"
          background="radial-gradient(circle at 50% 40%, rgba(255,196,110,.26), transparent 42%)"
          style={{ animation: 'hudPulse 6s ease-in-out infinite' }}
        />
        {/* Gold god-ray sheen from above */}
        <Box
          position="absolute"
          top="-20%"
          left="50%"
          width="60%"
          height="120%"
          transform="translateX(-50%) rotate(6deg)"
          background="linear-gradient(rgba(255,214,150,.14), transparent 62%)"
          filter="blur(24px)"
          pointerEvents="none"
        />

        {/* Drifting embers */}
        {MOTES.map((m, i) => (
          <Box
            key={i}
            position="absolute"
            left={`${m.x}%`}
            top={`${m.y}%`}
            width={{ base: '7px', md: '10px' }}
            height={{ base: '14px', md: '20px' }}
            borderRadius="50% 50% 45% 45% / 62% 62% 38% 38%"
            background="radial-gradient(ellipse at 50% 70%, #fff2b5, #d89528 46%, transparent 72%)"
            filter="blur(.4px)"
            boxShadow="0 0 16px #d89528, 0 0 38px rgba(216,149,40,.32)"
            pointerEvents="none"
            animation={`foxfireFloat ${3.6 + (i % 3) * 0.7}s ease-in-out ${m.d}s infinite`}
          />
        ))}

        {/* Core prayer — all lines stacked; scroll position picks which shows */}
        <Box position="absolute" inset="0" display="flex" alignItems="center" justifyContent="center" zIndex="4">
          <Box position="relative" width="min(900px, calc(100vw - 40px))" textAlign="center">
            {prayer.map((line) => {
              // Opacity is a direct function of scroll position — no timed
              // animation to outrun, so every line appears in its turn.
              let opacity: number
              let shift: number
              if (line.lost) {
                const approach = Math.max(0, line.center - progress) // rises then holds
                opacity = Math.min(1, Math.max(0, 1 - approach * 11))
                shift = approach * 40
              } else {
                const d = Math.abs(progress - line.center)
                opacity = Math.max(0, 1 - d * 11)
                shift = (line.center - progress) * 40
              }
              return (
                <Text
                  key={line.text}
                  position="absolute"
                  left="0"
                  right="0"
                  top="50%"
                  willChange="opacity, transform"
                  fontFamily={line.lost ? 'nixie' : 'huninn'}
                  fontSize={{
                    base: line.lost ? '14px' : '20px',
                    md: line.lost ? '18px' : '32px',
                  }}
                  letterSpacing=".16em"
                  color={line.lost ? 'rgba(255,120,96,.86)' : 'rgba(224,247,238,.95)'}
                  textShadow={
                    line.lost
                      ? '0 0 18px rgba(255,60,40,.6)'
                      : '0 0 10px rgba(190,255,233,.55), 0 0 30px rgba(75,224,184,.35)'
                  }
                  style={{
                    opacity,
                    transform: `translateY(calc(-50% + ${shift.toFixed(1)}px))`,
                  }}
                >
                  {line.text}
                </Text>
              )
            })}
          </Box>
        </Box>

        {/* Vignette */}
        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          background="radial-gradient(ellipse 72% 72% at 50% 50%, transparent 42%, rgba(0,0,0,.7) 100%)"
        />

        <Text
          position="absolute"
          left="0"
          right="0"
          bottom="7%"
          textAlign="center"
          fontFamily="nixie"
          fontSize="10px"
          letterSpacing=".2em"
          color="rgba(229,188,99,.5)"
          animation="hudPulse 1.8s ease-in-out infinite"
        >
          POWER LEVEL / 03% — ARCHIVE COLLAPSING
        </Text>
      </Box>
    </Box>
  )
}

export default NoritoSection
