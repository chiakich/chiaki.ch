import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, styled } from 'styled-system/jsx'
import type { GestureKey, MouthKey } from 'lib/terminal/speech'
import type { Emotion } from 'lib/terminal/types'

const Img = styled.img

export type TerminalAvatarHandle = {
  setEmotion: (emotion: Emotion) => void
  /** Hands the whole utterance over; the viewer samples it on its own clock. */
  speak: (keys: MouthKey[], gestures: GestureKey[]) => void
  stopSpeaking: () => void
  /** Glance at the input box — called when the visitor starts typing. */
  notice: () => void
}

type TerminalAvatarClientProps = {
  controls: React.MutableRefObject<TerminalAvatarHandle | null>
}

// PARAM_MOUTH_OPEN_Y is deliberately absent: the utterance timeline owns it.
const BASE_PARAMS: Record<string, number> = {
  PARAM_MOUTH_FORM: 0,
  PARAM_EYE_L_SMILE: 0,
  PARAM_EYE_R_SMILE: 0,
  PARAM_EYE_L_OPEN: 1,
  PARAM_EYE_R_OPEN: 1,
  PARAM_BROW_L_Y: 0,
  PARAM_BROW_R_Y: 0,
  PARAM_ANGLE_Z: 0,
  PARAM_BODY_ANGLE_Z: 0,
  face2: 0,
  face3: 0,
  face7: 0,
}

const EMOTION_PARAMS: Record<Emotion, Record<string, number>> = {
  neutral: {},
  happy: {
    PARAM_MOUTH_FORM: 0.24,
    PARAM_EYE_L_SMILE: 0.1,
    PARAM_EYE_R_SMILE: 0.1,
    face7: 0.723,
  },
  shy: {
    PARAM_MOUTH_FORM: 0.12,
    PARAM_EYE_L_OPEN: 0.9,
    PARAM_EYE_R_OPEN: 0.9,
    PARAM_ANGLE_Z: -2.4,
    face2: 1,
  },
  surprised: {
    PARAM_MOUTH_FORM: 0.06,
    PARAM_BROW_L_Y: 0.3,
    PARAM_BROW_R_Y: 0.3,
    face3: 1,
  },
  sad: { PARAM_MOUTH_FORM: -0.08, PARAM_BROW_L_Y: -0.24, PARAM_BROW_R_Y: -0.24 },
  thinking: { PARAM_MOUTH_FORM: 0.04, PARAM_ANGLE_Z: 2.4 },
  proud: {
    PARAM_MOUTH_FORM: 0.18,
    PARAM_EYE_L_SMILE: 0.06,
    PARAM_EYE_R_SMILE: 0.06,
    face7: 0.723,
  },
}

// Tail amplitude and rate per emotion — tucked when shy or sad, a startled
// flick on surprise. Her own dialogue claims the tail gives her away.
const EMOTION_TAIL: Record<Emotion, { amp: number; rate: number }> = {
  neutral: { amp: 1, rate: 1 },
  happy: { amp: 1.5, rate: 1.35 },
  shy: { amp: 0.55, rate: 0.8 },
  surprised: { amp: 1.7, rate: 1.6 },
  sad: { amp: 0.45, rate: 0.65 },
  thinking: { amp: 0.8, rate: 0.85 },
  proud: { amp: 1.35, rate: 1.2 },
}

// Exponential attack rate per emotion. A face that arrives at one speed no
// matter what it is reads as a dial being turned rather than a reaction.
const EMOTION_SPEED: Record<Emotion, number> = {
  neutral: 5,
  happy: 8,
  shy: 6,
  surprised: 22,
  sad: 3.2,
  thinking: 5,
  proud: 8,
}

// Grading, quantising and convergence all live in the viewer's post-process
// shader now. Anything applied here would run after it and push the palette's
// hand-picked colours back off the palette.

const TerminalAvatarClient = ({ controls }: TerminalAvatarClientProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const paramsRef = useRef<Record<string, number>>({ ...BASE_PARAMS })
  const pointerRef = useRef({ x: 0, y: 0 })
  const [ready, setReady] = useState(false)

  const speedRef = useRef(EMOTION_SPEED.neutral)
  const tailRef = useRef(EMOTION_TAIL.neutral)

  const publish = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      {
        type: 'chiaki-terminal-params',
        params: paramsRef.current,
        speed: speedRef.current,
        tail: tailRef.current,
      },
      window.location.origin
    )
  }, [])

  const speak = useCallback((keys: MouthKey[], gestures: GestureKey[]) => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'chiaki-terminal-speech', keys, gestures },
      window.location.origin
    )
  }, [])

  useEffect(() => {
    controls.current = {
      setEmotion: (emotion) => {
        paramsRef.current = { ...BASE_PARAMS, ...EMOTION_PARAMS[emotion] }
        speedRef.current = EMOTION_SPEED[emotion]
        tailRef.current = EMOTION_TAIL[emotion]
        publish()
      },
      speak,
      stopSpeaking: () => speak([], []),
      // Reuses the gaze system rather than adding a channel: aiming the pointer
      // target low and centre makes her look down at the input for its lifetime.
      notice: () =>
        frameRef.current?.contentWindow?.postMessage(
          { type: 'chiaki-terminal-pointer', targetX: 0, targetY: 0.42 },
          window.location.origin
        ),
    }

    return () => {
      controls.current = null
    }
  }, [controls, publish, speak])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const frame = frameRef.current
      const rect = frame?.parentElement?.getBoundingClientRect()
      if (!frame || !rect?.width || !rect.height) return

      const previous = pointerRef.current
      if (Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 2) return
      pointerRef.current = { x: event.clientX, y: event.clientY }

      frame.contentWindow?.postMessage(
        {
          type: 'chiaki-terminal-pointer',
          targetX: Math.min(0.68, Math.max(-0.68, ((event.clientX - rect.left) / rect.width - 0.5) * 1.35)),
          targetY: Math.min(0.5, Math.max(-0.5, ((event.clientY - rect.top) / rect.height - 0.5) * 1.1)),
        },
        window.location.origin
      )
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  return (
    <Box position="relative" width="100%" height="100%" overflow="hidden">
      <Img
        src="/assets/story/character/gallery/portrait-5.webp"
        alt=""
        position="absolute"
        left={{ base: '50%', md: '31%' }}
        bottom={{ base: '-79%', md: '-68%' }}
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
        insetX="0"
        top="0"
        bottom="0"
        width="100%"
        // Lifted further on a phone: the panel is portrait, so the same offset
        // that frames her on a desktop leaves her sitting under the transcript.
        transform={{ base: 'translateY(-10%)', md: 'translateY(-3%)', lg: 'translateY(-6%)' }}
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
