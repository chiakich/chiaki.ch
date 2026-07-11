import { useEffect, useRef } from 'react'
import { Box } from 'styled-system/jsx'

const StoryAtmosphere = () => {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let frame = 0
    const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const target = { ...position }

    const render = () => {
      position.x += (target.x - position.x) * 0.08
      position.y += (target.y - position.y) * 0.08
      glow.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`
      frame = window.requestAnimationFrame(render)
    }

    const handlePointerMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    frame = window.requestAnimationFrame(render)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <Box
      position="fixed"
      inset="0"
      pointerEvents="none"
      zIndex="6"
      overflow="hidden"
      aria-hidden="true"
    >
      <Box
        ref={glowRef}
        position="absolute"
        top="0"
        left="0"
        width={{ base: '260px', md: '420px' }}
        height={{ base: '260px', md: '420px' }}
        borderRadius="50%"
        background="radial-gradient(circle, rgba(133, 226, 213, 0.12) 0%, rgba(98, 156, 255, 0.04) 42%, transparent 72%)"
        filter="blur(8px)"
        transform="translate3d(50vw, 50vh, 0)"
        marginLeft={{ base: '-130px', md: '-210px' }}
        marginTop={{ base: '-130px', md: '-210px' }}
        willChange="transform"
      />
      <Box
        position="absolute"
        inset="0"
        opacity="0.28"
        backgroundImage="radial-gradient(rgba(255,255,255,.2) .55px, transparent .65px)"
        backgroundSize="4px 4px"
        mixBlendMode="soft-light"
      />
      <Box
        position="absolute"
        inset="0"
        boxShadow="inset 0 0 18vw rgba(0, 0, 0, 0.78)"
      />
    </Box>
  )
}

export default StoryAtmosphere
