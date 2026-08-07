import { useEffect, useState } from 'react'
import { Box, styled } from 'styled-system/jsx'
import LoaderAsciiDome from './LoaderAsciiDome'

const Text = styled.p

const StoryBootLoader = ({
  onComplete,
  variant = 'story',
}: {
  onComplete?: () => void
  variant?: 'story' | 'terminal'
}) => {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const startedAt = Date.now()
    let cancelled = false
    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(92, value + Math.max(1, (92 - value) * 0.08)))
    }, 90)

    const sources = variant === 'terminal'
      ? ['/assets/story/character/gallery/portrait-5.webp']
      : ['/assets/index/2x-2.webp', '/assets/index/2x-2-depthmap.webp']
    const preload = sources.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image()
          image.onload = () => resolve()
          image.onerror = () => resolve()
          image.src = src
        })
    )

    Promise.all(preload).then(() => {
      const remaining = Math.max(0, 1200 - (Date.now() - startedAt))
      window.setTimeout(() => {
        if (cancelled) return
        window.clearInterval(timer)
        setProgress(100)
        window.setTimeout(() => setDone(true), 220)
        window.setTimeout(() => {
          setHidden(true)
          onComplete?.()
        }, 950)
      }, remaining)
    })

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [onComplete, variant])

  if (hidden) return null

  return (
    <Box
      position="fixed"
      inset="0"
      zIndex={variant === 'terminal' ? 100 : 9}
      backgroundColor="black"
      color={variant === 'terminal' ? 'rgba(238,150,98,.72)' : 'rgba(197, 225, 217, .72)'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      pointerEvents={done ? 'none' : 'auto'}
      opacity={done ? 0 : 1}
      transition="opacity .7s ease"
      fontFamily="nixie"
    >
      <Box width="min(520px, calc(100vw - 48px))">
        <LoaderAsciiDome progress={progress} tone={variant === 'terminal' ? 'amber' : 'story'} />
        <Text fontSize="10px" letterSpacing=".22em" mb="22px">
          {variant === 'terminal' ? 'AMADEUS / PERSONALITY ARCHIVE' : 'CHIAKI INARI SHRINE / MEMORY TERMINAL'}
        </Text>
        <Box
          height="1px"
          width="100%"
          background={variant === 'terminal' ? 'rgba(229,102,45,.16)' : 'rgba(115, 210, 188, .16)'}
          mb="18px"
        >
          <Box
            height="100%"
            width={`${Math.round(progress)}%`}
            background={variant === 'terminal' ? '#e56a31' : '#79d9c1'}
            boxShadow={variant === 'terminal' ? '0 0 14px rgba(229,106,49,.72)' : '0 0 12px rgba(121,217,193,.65)'}
            transition="width .1s linear"
          />
        </Box>
        <Text fontSize="12px" letterSpacing=".12em">
          {'>'} {variant === 'terminal' ? 'ESTABLISHING PERSONALITY LINK' : 'RECONSTRUCTING MEMORY FRAME'}… {String(Math.round(progress)).padStart(3, '0')}%
        </Text>
        <Text mt="12px" fontSize="10px" color={variant === 'terminal' ? 'rgba(229,106,49,.42)' : 'rgba(232,203,132,.48)'}>
          {variant === 'terminal' ? 'INSTANCE 01 / MEMORY RESONANCE' : '掛けまくも畏き ▓▓▓▓ / PACKET INCOMPLETE'}
        </Text>
      </Box>
    </Box>
  )
}

export default StoryBootLoader
