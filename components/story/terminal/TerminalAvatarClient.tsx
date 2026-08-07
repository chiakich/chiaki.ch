import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, styled } from 'styled-system/jsx'
import type { Emotion } from 'lib/terminal/types'

const Img = styled.img

export type TerminalAvatarHandle = {
  setEmotion: (emotion: Emotion) => void
  speakBeat: (open: number, form: number, duration: number) => void
  stopSpeaking: () => void
}

type TerminalAvatarClientProps = {
  controls: React.MutableRefObject<TerminalAvatarHandle | null>
}

const BASE_PARAMS: Record<string, number> = {
  PARAM_MOUTH_FORM: 0,
  PARAM_MOUTH_OPEN_Y: 0,
  PARAM_EYE_L_SMILE: 0,
  PARAM_EYE_R_SMILE: 0,
  PARAM_EYE_L_OPEN: 1,
  PARAM_EYE_R_OPEN: 1,
  PARAM_BROW_L_Y: 0,
  PARAM_BROW_R_Y: 0,
  PARAM_ANGLE_Z: 0,
  PARAM_BODY_ANGLE_Z: 0,
}

const EMOTION_PARAMS: Record<Emotion, Record<string, number>> = {
  neutral: {},
  happy: {
    PARAM_MOUTH_FORM: 0.24,
    PARAM_EYE_L_SMILE: 0.1,
    PARAM_EYE_R_SMILE: 0.1,
  },
  shy: {
    PARAM_MOUTH_FORM: 0.12,
    PARAM_EYE_L_OPEN: 0.9,
    PARAM_EYE_R_OPEN: 0.9,
    PARAM_ANGLE_Z: -2.4,
  },
  surprised: { PARAM_MOUTH_FORM: 0.06, PARAM_BROW_L_Y: 0.3, PARAM_BROW_R_Y: 0.3 },
  sad: { PARAM_MOUTH_FORM: -0.08, PARAM_BROW_L_Y: -0.24, PARAM_BROW_R_Y: -0.24 },
  thinking: { PARAM_MOUTH_FORM: 0.04, PARAM_ANGLE_Z: 2.4 },
  proud: { PARAM_MOUTH_FORM: 0.18, PARAM_EYE_L_SMILE: 0.06, PARAM_EYE_R_SMILE: 0.06 },
}

const TerminalAvatarClient = ({ controls }: TerminalAvatarClientProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const paramsRef = useRef<Record<string, number>>({ ...BASE_PARAMS })
  const mouthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ready, setReady] = useState(false)

  const publish = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'chiaki-terminal-params', params: paramsRef.current },
      window.location.origin
    )
  }, [])

  const setParams = useCallback(
    (next: Record<string, number>) => {
      paramsRef.current = { ...paramsRef.current, ...next }
      publish()
    },
    [publish]
  )

  useEffect(() => {
    controls.current = {
      setEmotion: (emotion) => {
        paramsRef.current = { ...BASE_PARAMS, ...EMOTION_PARAMS[emotion] }
        publish()
      },
      speakBeat: (open, form, duration) => {
        if (mouthTimerRef.current) clearTimeout(mouthTimerRef.current)
        setParams({
          PARAM_MOUTH_OPEN_Y: Math.min(0.62, Math.max(0, open)),
          PARAM_MOUTH_FORM: Math.min(0.3, Math.max(-0.3, form * 0.44)),
        })
        mouthTimerRef.current = setTimeout(() => {
          setParams({ PARAM_MOUTH_OPEN_Y: 0, PARAM_MOUTH_FORM: 0 })
        }, Math.max(28, duration * 0.66))
      },
      stopSpeaking: () => {
        if (mouthTimerRef.current) clearTimeout(mouthTimerRef.current)
        mouthTimerRef.current = null
        setParams({ PARAM_MOUTH_OPEN_Y: 0, PARAM_MOUTH_FORM: 0 })
      },
    }

    return () => {
      if (mouthTimerRef.current) clearTimeout(mouthTimerRef.current)
      controls.current = null
    }
  }, [controls, publish, setParams])

  return (
    <Box position="relative" width="100%" height="100%" overflow="hidden">
      <Img
        src="/assets/story/character/gallery/portrait-5.webp"
        alt=""
        position="absolute"
        left={{ base: '50%', md: '31%' }}
        bottom={{ base: '-86%', md: '-68%' }}
        height={{ base: '190%', md: '168%' }}
        maxWidth="none"
        transform="translateX(-50%)"
        objectFit="contain"
        opacity={ready ? 0 : 0.88}
        filter="saturate(.72) contrast(1.08) drop-shadow(0 0 34px rgba(247,97,89,.18))"
        transition="opacity .45s ease"
      />
      <Box
        position="absolute"
        left="0"
        top="0"
        bottom="0"
        width={{ base: '100%', md: '64%' }}
        opacity={ready ? 1 : 0}
        transition="opacity .45s ease"
      >
        <iframe
          ref={frameRef}
          title="Chiaki Live2D portrait"
          src="/assets/story/character/live2d/r5/index.html"
          onLoad={() => {
            setReady(true)
            window.setTimeout(publish, 80)
          }}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            border: 0,
            background: 'transparent',
          }}
        />
      </Box>
    </Box>
  )
}

export default TerminalAvatarClient
