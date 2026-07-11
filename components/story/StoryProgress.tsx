import { useEffect, useRef } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'

const Text = styled.span

const StoryProgress = () => {
  const progressRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleY(${progress})`
      }
      if (counterRef.current) {
        counterRef.current.textContent = String(Math.round(progress * 100)).padStart(2, '0')
      }
      frame = 0
    }
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <Flex
      position="fixed"
      right={{ base: '12px', md: '24px' }}
      top="50%"
      transform="translateY(-50%)"
      zIndex="9"
      alignItems="center"
      gap="10px"
      pointerEvents="none"
      color="white"
      aria-hidden="true"
    >
      <Text
        ref={counterRef}
        display={{ base: 'none', md: 'inline' }}
        fontFamily="nixie"
        fontSize="9px"
        letterSpacing=".15em"
        color="rgba(255,255,255,.52)"
      >
        00
      </Text>
      <Box width="1px" height="120px" background="rgba(255,255,255,.16)">
        <Box
          ref={progressRef}
          width="100%"
          height="100%"
          transformOrigin="top"
          transform="scaleY(0)"
          background="linear-gradient(to bottom, #d7fff5, #7dc7ff)"
          boxShadow="0 0 8px rgba(150,225,255,.5)"
        />
      </Box>
    </Flex>
  )
}

export default StoryProgress
