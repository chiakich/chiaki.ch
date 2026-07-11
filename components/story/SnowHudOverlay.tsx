import { useEffect, useRef, useState } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'

const Text = styled.p
const Image = styled.img
const CAPTION = '吶、以前的世界，到底是什麼樣子的呢？'

const SnowHudOverlay = ({ started }: { started: boolean }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<HTMLDivElement[]>([])
  const [typedCount, setTypedCount] = useState(0)

  useEffect(() => {
    if (!started) return
    let interval = 0
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setTypedCount((value) => {
          if (value >= CAPTION.length) {
            window.clearInterval(interval)
            return value
          }
          return value + 1
        })
      }, 105)
    }, 650)
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [started])

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const target = { ...current }
    const trails = trailRefs.current.map(() => ({ ...current }))
    let frame = 0

    const move = (event: PointerEvent) => {
      const rect = rootRef.current?.getBoundingClientRect()
      if (!rect) return
      target.x = event.clientX - rect.left
      target.y = event.clientY - rect.top
    }
    const render = () => {
      current.x += (target.x - current.x) * 0.2
      current.y += (target.y - current.y) * 0.2
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
      trails.forEach((point, index) => {
        const lead = index === 0 ? current : trails[index - 1]
        point.x += (lead.x - point.x) * (0.16 - index * 0.025)
        point.y += (lead.y - point.y) * (0.16 - index * 0.025)
        const element = trailRefs.current[index]
        if (element) element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`
      })
      frame = window.requestAnimationFrame(render)
    }
    window.addEventListener('pointermove', move, { passive: true })
    frame = window.requestAnimationFrame(render)
    return () => {
      window.removeEventListener('pointermove', move)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <Box ref={rootRef} position="absolute" inset="0" zIndex="4" pointerEvents="none" color="white">
      <Box
        position="absolute"
        inset={{ base: '112px 18px 22px', md: '122px 38px 34px' }}
        border="1px solid rgba(210,242,235,.3)"
        boxShadow="inset 0 0 42px rgba(38,105,94,.1)"
        _before={{
          content: '""',
          position: 'absolute',
          inset: '12px',
          border: '1px solid rgba(200,235,229,.05)',
        }}
      />
      <Flex
        position="absolute"
        top={{ base: '126px', md: '140px' }}
        left={{ base: '32px', md: '54px' }}
        alignItems="center"
        gap="12px"
        opacity={started ? 1 : 0}
        transition="opacity 1.2s ease"
      >
          <Image src="/assets/icon/logo_white.svg" alt="" width={{ base: '32px', md: '40px' }} height={{ base: '32px', md: '40px' }} opacity=".92" />
        <Box>
          <Text fontFamily="nixie" fontSize={{ base: '10px', md: '13px' }} letterSpacing=".16em" color="rgba(229,248,243,.92)" textShadow="0 0 10px rgba(93,225,194,.3)">
            MEMORY OBSERVATION / 00
          </Text>
          <Text fontFamily="nixie" fontSize={{ base: '8px', md: '10px' }} letterSpacing=".12em" mt="5px" color="rgba(153,230,211,.72)">
            OPTICAL LINK: UNSTABLE
          </Text>
        </Box>
      </Flex>
      <Box
        position="absolute"
        top={{ base: '130px', md: '144px' }}
        right={{ base: '32px', md: '54px' }}
        textAlign="right"
        fontFamily="nixie"
        fontSize={{ base: '9px', md: '11px' }}
        lineHeight="1.8"
        letterSpacing=".12em"
        color="rgba(221,241,235,.72)"
      >
        <Text>LAT 35.000 / ALT UNKNOWN</Text>
        <Text
          color="#ff4b38"
          fontWeight="bold"
          textShadow="0 0 8px #ff2b1b, 0 0 18px rgba(255,43,27,.8), 0 0 36px rgba(255,43,27,.45)"
          animation="hudPulse 1.15s ease-in-out infinite"
        >
          ● RECORDING
        </Text>
      </Box>
      <Flex
        position="absolute"
        left="24px"
        right="24px"
        bottom={{ base: '54px', md: '64px' }}
        justifyContent="center"
      >
        <Box
          px={{ base: '16px', md: '26px' }}
          py="9px"
          background="rgba(3,8,10,.58)"
          border="1px solid rgba(222,237,232,.12)"
          backdropFilter="blur(8px)"
          fontSize={{ base: '14px', md: '18px' }}
          letterSpacing=".12em"
          textShadow="0 2px 18px rgba(0,0,0,.9)"
        >
          {CAPTION.slice(0, typedCount)}
          <Box as="span" ml="4px" color="#e6c578" animation="cursorBlink .8s steps(1) infinite">
            ▌
          </Box>
        </Box>
      </Flex>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          ref={(element: HTMLDivElement | null) => {
            if (element) trailRefs.current[index] = element
          }}
          position="absolute"
          top="0"
          left="0"
          width={`${9 - index * 2}px`}
          height={`${9 - index * 2}px`}
          marginLeft={`${-4 + index}px`}
          marginTop={`${-4 + index}px`}
          borderRadius="50%"
          background={index === 0 ? 'rgba(109,239,209,.32)' : 'rgba(222,185,101,.18)'}
          boxShadow="0 0 12px rgba(99,225,198,.45)"
          willChange="transform"
        />
      ))}
      <Box
        ref={cursorRef}
        position="absolute"
        top="0"
        left="0"
        width="34px"
        height="34px"
        marginLeft="-17px"
        marginTop="-17px"
        border="1px solid rgba(132,239,214,.52)"
        borderRadius="50%"
        boxShadow="0 0 20px rgba(82,210,180,.16)"
        willChange="transform"
        _before={{
          content: '""',
          position: 'absolute',
          left: '50%',
          top: '-7px',
          bottom: '-7px',
          width: '1px',
          background: 'linear-gradient(transparent, rgba(132,239,214,.42), transparent)',
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '-7px',
          right: '-7px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(132,239,214,.42), transparent)',
        }}
      />
    </Box>
  )
}

export default SnowHudOverlay
