import { useEffect, useRef } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import SampleCounterPanel from './SampleCounterPanel'
import NoritoEmbers from './NoritoEmbers'

const Text = styled.p

const debris = [
  { x: 12, y: 18, size: 28, tone: 'green' },
  { x: 82, y: 24, size: 52, tone: 'gold' },
  { x: 24, y: 68, size: 42, tone: 'gold' },
  { x: 72, y: 74, size: 22, tone: 'green' },
  { x: 91, y: 52, size: 32, tone: 'green' },
  { x: 8, y: 48, size: 18, tone: 'gold' },
]

const foxfires = [
  { x: 18, y: 28, delay: 0.2, tone: 'gold' },
  { x: 76, y: 22, delay: 1.1, tone: 'green' },
  { x: 31, y: 58, delay: 1.8, tone: 'green' },
  { x: 67, y: 66, delay: 0.7, tone: 'gold' },
  { x: 88, y: 46, delay: 2.4, tone: 'gold' },
  { x: 9, y: 74, delay: 1.4, tone: 'green' },
  { x: 54, y: 35, delay: 2.1, tone: 'gold' },
]

const TokoyoParallaxSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const farRef = useRef<HTMLDivElement>(null)
  const middleRef = useRef<HTMLDivElement>(null)
  const nearRef = useRef<HTMLDivElement>(null)
  const embersRef = useRef<HTMLDivElement>(null)
  const chamberRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const distance = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / distance))

      if (farRef.current) {
        farRef.current.style.transform = `translate3d(0, ${progress * -90}px, 0) scale(${1 + progress * 0.18})`
      }
      if (middleRef.current) {
        middleRef.current.style.transform = `translate3d(0, ${progress * -170}px, 0) scale(${1 + progress * 0.3})`
      }
      if (nearRef.current) {
        nearRef.current.style.transform = `translate3d(0, ${progress * -280}px, 0) scale(${1 + progress * 0.55})`
      }
      if (embersRef.current) {
        // The prayer fragments sink downward into the earth as we descend
        embersRef.current.style.transform = `translate3d(0, ${progress * 260}px, 0)`
        embersRef.current.style.opacity = String(Math.max(0, 1 - progress * 0.5))
      }
      if (chamberRef.current) {
        const entrance = Math.min(1, Math.max(0, (progress - 0.42) * 2.2))
        chamberRef.current.style.transform = `translate3d(-50%, ${120 - entrance * 120}px, 0) scale(${0.78 + entrance * 0.22})`
        chamberRef.current.style.opacity = String(entrance)
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
    <Box ref={containerRef} height="420vh" position="relative" backgroundColor="#010302">
      <Box position="sticky" top="0" height="100vh" overflow="hidden" color="white">
        <Box
          position="absolute"
          inset="0"
          background="radial-gradient(ellipse at 50% 62%, rgba(35,117,99,.28), transparent 30%), radial-gradient(ellipse at 50% 100%, rgba(147,53,34,.18), transparent 42%), linear-gradient(#010302, #020908 58%, #010202)"
        />

        <Box ref={farRef} position="absolute" inset="0" willChange="transform">
          {[0, 1, 2, 3, 4].map((index) => (
            <Box
              key={index}
              position="absolute"
              left="50%"
              top={`${12 + index * 19}%`}
              width={`${34 + index * 12}vw`}
              maxWidth={`${460 + index * 90}px`}
              height={`${8 + index * 2}vw`}
              maxHeight={`${100 + index * 18}px`}
              transform="translate(-50%, -50%) rotate(-2deg)"
              border="1px solid rgba(104,211,184,.14)"
              borderRadius="50%"
              boxShadow="0 0 36px rgba(59,177,148,.04), inset 0 0 24px rgba(59,177,148,.04)"
            />
          ))}
          {[0, 1, 2].map((index) => {
            const scale = 0.58 + index * 0.34
            return (
              <Box
                key={`torii-${index}`}
                position="absolute"
                left="50%"
                top={`${24 + index * 25}%`}
                width="360px"
                height="230px"
                transform={`translate(-50%, -50%) scale(${scale})`}
                opacity={0.22 + index * 0.08}
                filter={`blur(${Math.max(0, 2 - index)}px)`}
              >
                <Box
                  position="absolute"
                  top="18px"
                  left="0"
                  right="0"
                  height="18px"
                  borderRadius="3px"
                  background="linear-gradient(90deg, transparent, #6f241b 8%, #a6402b 50%, #6f241b 92%, transparent)"
                  boxShadow="0 0 28px rgba(152,57,39,.3)"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    left: '34px',
                    right: '34px',
                    top: '27px',
                    height: '10px',
                    background: 'linear-gradient(90deg, #5d2019, #9d3d2b, #5d2019)',
                  }}
                />
                <Box position="absolute" top="46px" bottom="0" left="76px" width="17px" background="linear-gradient(#9d3d2b, #381612)" />
                <Box position="absolute" top="46px" bottom="0" right="76px" width="17px" background="linear-gradient(#9d3d2b, #381612)" />
              </Box>
            )
          })}
        </Box>

        <Box ref={middleRef} position="absolute" inset="0" willChange="transform">
          {debris.map((item, index) => (
            <Box
              key={index}
              position="absolute"
              left={`${item.x}%`}
              top={`${item.y}%`}
              width={`${item.size}px`}
              height="1px"
              transform={`rotate(${index % 2 ? -38 : 32}deg)`}
              background={item.tone === 'gold' ? 'rgba(226,190,105,.34)' : 'rgba(83,210,180,.28)'}
              boxShadow={item.tone === 'gold' ? '0 0 12px rgba(226,190,105,.25)' : '0 0 12px rgba(83,210,180,.22)'}
            />
          ))}
          {foxfires.map((fire, index) => (
            <Box
              key={`fire-${index}`}
              position="absolute"
              left={`${fire.x}%`}
              top={`${fire.y}%`}
              width={{ base: '8px', md: '12px' }}
              height={{ base: '18px', md: '26px' }}
              borderRadius="50% 50% 45% 45% / 62% 62% 38% 38%"
              background={fire.tone === 'gold' ? 'radial-gradient(ellipse at 50% 70%, #fff2b5, #d89528 46%, transparent 72%)' : 'radial-gradient(ellipse at 50% 70%, #c7ffeb, #4dd3ad 46%, transparent 72%)'}
              filter="blur(.4px)"
              boxShadow={fire.tone === 'gold' ? '0 0 18px #d89528, 0 0 42px rgba(216,149,40,.35)' : '0 0 18px #4dd3ad, 0 0 42px rgba(77,211,173,.3)'}
              animation={`foxfireFloat ${3.4 + (index % 3) * 0.8}s ease-in-out ${fire.delay}s infinite`}
            />
          ))}
          <Box
            position="absolute"
            left="50%"
            top="12%"
            bottom="-20%"
            width="1px"
            background="linear-gradient(transparent, rgba(221,186,104,.72) 34%, rgba(80,207,177,.5) 76%, transparent)"
            boxShadow="0 0 16px rgba(104,221,193,.32)"
          />
        </Box>

        <Box ref={nearRef} position="absolute" inset="-8%" willChange="transform">
          <svg
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
            width="100%"
            height="100%"
            aria-hidden="true"
          >
            <defs>
              <filter id="root-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="root-tone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7d2d22" stopOpacity="0" />
                <stop offset=".5" stopColor="#a74730" stopOpacity=".45" />
                <stop offset="1" stopColor="#5bd0b3" stopOpacity=".3" />
              </linearGradient>
            </defs>
            <g fill="none" stroke="url(#root-tone)" filter="url(#root-glow)">
              <path d="M600 -40 C580 120 670 220 610 380 C560 520 650 650 590 860" strokeWidth="7" />
              <path d="M585 210 C480 260 420 340 310 390 C210 438 170 540 70 610" strokeWidth="3" />
              <path d="M620 330 C740 370 790 450 930 500 C1030 540 1090 630 1170 690" strokeWidth="3" />
              <path d="M580 510 C470 570 430 660 340 760" strokeWidth="2" />
              <path d="M620 610 C720 670 780 720 850 850" strokeWidth="2" />
            </g>
          </svg>
        </Box>
        <Box
          position="absolute"
          top="0"
          bottom="0"
          left="50%"
          width="28vw"
          maxWidth="360px"
          transform="translateX(-50%)"
          background="linear-gradient(90deg, transparent, rgba(73,220,184,.035), transparent)"
          boxShadow="0 0 100px rgba(57,201,166,.09)"
          pointerEvents="none"
        />

        {/* Prayer fragments sinking into the earth — on top of the strata */}
        <Box ref={embersRef} position="absolute" inset="0" zIndex="3" willChange="transform, opacity" pointerEvents="none">
          <NoritoEmbers />
        </Box>

        <Flex
          position="absolute"
          top={{ base: '116px', md: '136px' }}
          left={{ base: '24px', md: '7vw' }}
          right={{ base: '24px', md: '7vw' }}
          justifyContent="space-between"
          fontFamily="nixie"
          fontSize="9px"
          letterSpacing=".2em"
          color="rgba(173,210,200,.42)"
        >
          <Text>TOKOYO RELAY / B4</Text>
          <Text>STANDBY NODE</Text>
        </Flex>

        <Flex
          ref={chamberRef}
          position="absolute"
          left="50%"
          bottom={{ base: '14%', md: '13%' }}
          width="100%"
          zIndex="5"
          transform="translate3d(-50%, 120px, 0) scale(.78)"
          opacity="0"
          willChange="transform, opacity"
          justifyContent="center"
          px="16px"
        >
          <SampleCounterPanel />
        </Flex>

      </Box>
    </Box>
  )
}

export default TokoyoParallaxSection
