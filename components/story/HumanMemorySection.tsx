import { useEffect, useRef } from 'react'
import { Box, styled } from 'styled-system/jsx'

const Text = styled.p

const lines = [
  '儀器說土壤沒有問題。',
  '儀器說天空沒有問題。',
  '可是爺爺說，',
  '以前的雨落下來之前，',
  '你會先聞到它的味道。',
  '如果我努力祈禱的話，神明會再次回應我們嗎？',
]

const HumanMemorySection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<HTMLParagraphElement[]>([])

  useEffect(() => {
    let frame = 0
    const update = () => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const distance = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / distance))

      // Explicit beats; the gap before the final line is wider — a held pause
      // before "如果我努力祈禱的話……"
      const centers = [0.06, 0.18, 0.3, 0.42, 0.55, 0.9]
      lineRefs.current.forEach((line, index) => {
        const center = centers[index] ?? 0.06 + index * 0.14
        const distanceFromCenter = Math.abs(progress - center)
        const opacity = Math.max(0, 1 - distanceFromCenter * 7)
        line.style.opacity = String(opacity)
        line.style.transform = `translate3d(0, ${(center - progress) * 90}px, 0)`
      })
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
    <Box ref={containerRef} height="340vh" position="relative" backgroundColor="#010202">
      <Box
        position="sticky"
        top="0"
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        background="radial-gradient(circle at 50% 55%, rgba(69,92,84,.12), transparent 32%)"
      >
        <Box textAlign="center" px="24px">
          {lines.map((line, index) => (
            <Text
              key={line}
              ref={(element: HTMLParagraphElement | null) => {
                if (element) lineRefs.current[index] = element
              }}
              color={
                index === lines.length - 1
                  ? 'rgba(245,214,150,.95)'
                  : index < 2
                    ? 'rgba(181,195,190,.6)'
                    : 'rgba(244,232,203,.9)'
              }
              textShadow={
                index === lines.length - 1
                  ? '0 0 24px rgba(240,190,110,.4)'
                  : 'none'
              }
              fontSize={
                index === lines.length - 1
                  ? { base: '1.15rem', md: '1.9rem' }
                  : { base: '1.3rem', md: '2.25rem' }
              }
              lineHeight="1.65"
              letterSpacing=".08em"
              opacity="0"
              willChange="transform, opacity"
              position={index === 0 ? 'relative' : 'absolute'}
              left={index === 0 ? 'auto' : '0'}
              right={index === 0 ? 'auto' : '0'}
              top={index === 0 ? 'auto' : '50%'}
            >
              {line}
            </Text>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default HumanMemorySection
