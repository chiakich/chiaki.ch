import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { motion } from 'framer-motion'
import { Box, HStack, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'

const Button = styled.button
const Image = styled.img

const ThemeComparison = () => {
  const [position, setPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  const dark = position >= 50

  const setPositionFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = comparisonRef.current?.getBoundingClientRect()
    if (!bounds) return

    const nextPosition = ((event.clientX - bounds.left) / bounds.width) * 100
    setPosition(Math.min(100, Math.max(0, nextPosition)))
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
    setPositionFromPointer(event)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isDragging) setPositionFromPointer(event)
  }

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!isDragging) setPosition((value) => (value < 50 ? 100 : 0))
    }, 4200)
    return () => window.clearInterval(timer)
  }, [isDragging])

  return (
    <Box
      ref={comparisonRef}
      position="relative"
      borderRadius="16px"
      overflow="hidden"
      border="1px solid rgba(255,255,255,.22)"
      boxShadow="0 30px 90px rgba(2,14,24,.5)"
      cursor={isDragging ? 'ew-resize' : 'col-resize'}
      touchAction="none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <Image src="/assets/works/tokyono-sora/light.webp" alt={t('tokyonoPage.lightAlt')} width="100%" display="block" />
      <motion.div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} animate={{ clipPath: `inset(0 ${100 - position}% 0 0)` }} transition={{ duration: isDragging ? 0 : .8, ease: [0.22, 1, 0.36, 1] }}>
        <Image src="/assets/works/tokyono-sora/dark.webp" alt={t('tokyonoPage.darkAlt')} width="100%" height="100%" objectFit="cover" />
      </motion.div>
      <HStack position="absolute" top={4} right={4} zIndex={2} backgroundColor="rgba(10,22,31,.72)" backdropFilter="blur(12px)" borderRadius="full" p={1}>
        <Button type="button" aria-pressed={!dark} onPointerDown={(event) => event.stopPropagation()} onClick={() => setPosition(0)} px={4} py={2} borderRadius="full" border="0" cursor="pointer" backgroundColor={!dark ? '#f2f8fa' : 'transparent'} color={!dark ? '#243947' : 'white'}>{t('tokyonoPage.light')}</Button>
        <Button type="button" aria-pressed={dark} onPointerDown={(event) => event.stopPropagation()} onClick={() => setPosition(100)} px={4} py={2} borderRadius="full" border="0" cursor="pointer" backgroundColor={dark ? '#243947' : 'transparent'} color="white">{t('tokyonoPage.dark')}</Button>
      </HStack>
      <motion.div aria-hidden="true" style={{ position: 'absolute', zIndex: 1, top: 0, bottom: 0, width: 2, background: '#fff', boxShadow: '0 0 18px #fff', pointerEvents: 'none' }} animate={{ left: `${position}%` }} transition={{ duration: isDragging ? 0 : .8, ease: [0.22, 1, 0.36, 1] }} />
    </Box>
  )
}

export default ThemeComparison
