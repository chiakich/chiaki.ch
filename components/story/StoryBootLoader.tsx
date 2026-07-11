import { useEffect, useState } from 'react'
import { Box, styled } from 'styled-system/jsx'
import LoaderAsciiDome from './LoaderAsciiDome'

const Text = styled.p

const StoryBootLoader = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const startedAt = Date.now()
    let cancelled = false
    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(92, value + Math.max(1, (92 - value) * 0.08)))
    }, 90)

    const preload = ['/assets/index/2x-2.jpg', '/assets/index/2x-2-depthmap.jpg'].map(
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
  }, [onComplete])

  if (hidden) return null

  return (
    <Box
      position="fixed"
      inset="0"
      zIndex="9"
      backgroundColor="black"
      color="rgba(197, 225, 217, .72)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      pointerEvents={done ? 'none' : 'auto'}
      opacity={done ? 0 : 1}
      transition="opacity .7s ease"
      fontFamily="nixie"
    >
      <Box width="min(520px, calc(100vw - 48px))">
        <LoaderAsciiDome progress={progress} />
        <Text fontSize="10px" letterSpacing=".22em" mb="22px">
          CHIAKI INARI SHRINE / MEMORY TERMINAL
        </Text>
        <Box
          height="1px"
          width="100%"
          background="rgba(115, 210, 188, .16)"
          mb="18px"
        >
          <Box
            height="100%"
            width={`${Math.round(progress)}%`}
            background="#79d9c1"
            boxShadow="0 0 12px rgba(121,217,193,.65)"
            transition="width .1s linear"
          />
        </Box>
        <Text fontSize="12px" letterSpacing=".12em">
          {'>'} RECONSTRUCTING MEMORY FRAME… {String(Math.round(progress)).padStart(3, '0')}%
        </Text>
        <Text mt="12px" fontSize="10px" color="rgba(232,203,132,.48)">
          掛けまくも畏き ▓▓▓▓ / PACKET INCOMPLETE
        </Text>
      </Box>
    </Box>
  )
}

export default StoryBootLoader
