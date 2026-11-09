import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, styled } from 'styled-system/jsx'
import {
  BASE_PARAMS,
  EMOTION_PARAMS,
  EMOTION_SPEED,
  EMOTION_TAIL,
} from './avatarParams'
import type { Eyes, Face, HotSpot, Part } from 'lib/night/types'

const Button = styled.button
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace'
const VIEWER = '/assets/story/character/live2d/r5/index.html'

export type Rect = { left: number; top: number; width: number; height: number }

// Model-matrix framing inside the viewer; calibrated against the r5 export.
const FRAMING = {
  full: { width: 1.9, x: 0, y: 0.62 },
  face: { width: 4.8, x: 0, y: -0.1 },
}

// Measured on the full framing; the viewer scales by height, so both axes are in box heights.
const PART_POINT: Record<
  Part,
  { dx: number; v: number; label: string; side: 'left' | 'right' }
> = {
  eyes: { dx: -0.015, v: 0.19, label: '眼', side: 'left' },
  mouth: { dx: -0.015, v: 0.235, label: '口', side: 'right' },
  chest: { dx: -0.03, v: 0.35, label: '胸', side: 'left' },
  hands: { dx: -0.15, v: 0.56, label: '手', side: 'left' },
  waist: { dx: -0.015, v: 0.45, label: '腰', side: 'right' },
  crotch: { dx: -0.015, v: 0.62, label: '下身', side: 'right' },
  thighs: { dx: -0.05, v: 0.76, label: '腿', side: 'left' },
}
const PARTS = Object.keys(PART_POINT) as Part[]

const EYE_OPEN: Record<Eyes, number> = { open: 1, half: 0.55, closed: 0 }

// Same cyanotype sheet as the character dossier's .lp-bp, so the two read as one document set.
const INK = 'rgba(214,233,255,.75)'
const PAPER =
  'repeating-linear-gradient(0deg, rgba(214,233,255,.16) 0 1px, transparent 1px 13px),' +
  'repeating-linear-gradient(90deg, rgba(214,233,255,.16) 0 1px, transparent 1px 13px),' +
  'repeating-linear-gradient(0deg, rgba(214,233,255,.3) 0 1px, transparent 1px 65px),' +
  'repeating-linear-gradient(90deg, rgba(214,233,255,.3) 0 1px, transparent 1px 65px),' +
  'radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.13), transparent 62%)'

const Corner = ({ at, ink }: { at: 'tl' | 'br'; ink: string }) => (
  <Box
    position="absolute"
    width="15px"
    height="15px"
    zIndex="2"
    pointerEvents="none"
    style={
      at === 'tl'
        ? {
            top: 7,
            left: 7,
            borderTop: `1px solid ${ink}`,
            borderLeft: `1px solid ${ink}`,
          }
        : {
            bottom: 7,
            right: 7,
            borderBottom: `1px solid ${ink}`,
            borderRight: `1px solid ${ink}`,
          }
    }
  />
)

const HotButton = ({
  hot,
  onPress,
}: {
  hot: HotSpot
  onPress: (flag: string) => void
}) => {
  const [left, setLeft] = useState(hot.total)
  useEffect(() => {
    let frame = 0
    const tick = () => {
      setLeft(Math.max(0, hot.deadline - Date.now()))
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [hot.deadline])
  return (
    <Button
      type="button"
      onClick={() => onPress(hot.flag)}
      display="block"
      mt="4px"
      px="10px"
      py="6px"
      border="1px solid #ff8a4a"
      background="rgba(255,110,50,.22)"
      color="#fff"
      fontSize="12px"
      whiteSpace="nowrap"
      cursor="pointer"
      animation="lexiconReveal .25s ease both"
      position="relative"
      boxShadow="0 0 14px rgba(255,120,60,.45)"
      _hover={{ background: 'rgba(255,110,50,.4)' }}
    >
      {hot.label}
      <Box
        position="absolute"
        left="0"
        bottom="0"
        height="2px"
        width="100%"
        background="#ffb27a"
        transformOrigin="left"
        style={{ transform: `scaleX(${left / hot.total})` }}
      />
    </Button>
  )
}

type Props = {
  rect: Rect | null
  blueprint: boolean
  face: Face
  eyes: Eyes
  tremble: number
  nod: number
  thrust: number
  hots: HotSpot[]
  onPress: (flag: string) => void
}

const NightStage = ({
  rect,
  blueprint,
  face,
  eyes,
  tremble,
  nod,
  thrust,
  hots,
  onPress,
}: Props) => {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)

  const post = useCallback((message: Record<string, unknown>) => {
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin)
  }, [])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return
      if (event.data?.type === 'chiaki-live2d-ready') setReady(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Reframing is instant inside the viewer, so the model sits out the frame's glide and
  // comes back already framed for the new slot.
  const shown = useRef(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ready) return
    const glide = shown.current ? 600 : 0
    setVisible(false)
    const timer = setTimeout(() => {
      post({
        type: 'chiaki-night-framing',
        ...(blueprint ? FRAMING.full : FRAMING.face),
      })
      post({ type: 'chiaki-night-style', crt: false, still: blueprint })
      shown.current = true
      setVisible(true)
    }, glide)
    return () => clearTimeout(timer)
  }, [ready, blueprint, post])

  useEffect(() => {
    if (!ready) return
    const open = EYE_OPEN[eyes] * (EMOTION_PARAMS[face].PARAM_EYE_L_OPEN ?? 1)
    post({
      type: 'chiaki-terminal-params',
      params: {
        ...BASE_PARAMS,
        ...EMOTION_PARAMS[face],
        PARAM_EYE_L_OPEN: open,
        PARAM_EYE_R_OPEN: open,
      },
      speed: EMOTION_SPEED[face],
      tail: EMOTION_TAIL[face],
    })
  }, [ready, face, eyes, post])

  useEffect(() => {
    if (ready && tremble)
      post({ type: 'chiaki-night-tremble', intensity: 1, seconds: 0.9 })
  }, [ready, tremble, post])

  useEffect(() => {
    if (ready && nod) post({ type: 'chiaki-night-nod' })
  }, [ready, nod, post])

  useEffect(() => {
    if (ready) post({ type: 'chiaki-night-thrust', perMinute: thrust })
  }, [ready, thrust, post])

  const point = (part: Part) => {
    const { dx, v } = PART_POINT[part]
    if (!rect) return { x: 0, y: 0 }
    return { x: rect.width / 2 + dx * rect.height, y: v * rect.height }
  }
  const active = new Map(hots.map((hot) => [hot.part, hot]))

  return (
    <Box
      position="absolute"
      zIndex="1"
      pointerEvents="none"
      overflow="hidden"
      transition="left .6s ease, top .6s ease, width .6s ease, height .6s ease"
      border={blueprint ? 'none' : '1px solid rgba(238,150,98,.55)'}
      style={
        rect
          ? {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            }
          : { opacity: 0 }
      }
    >
      <Box
        position="absolute"
        inset="0"
        transition="opacity .6s ease"
        background="#17456f"
        boxShadow="inset 0 0 34px rgba(4,16,32,.42)"
        style={{ backgroundImage: PAPER, opacity: blueprint ? 1 : 0 }}
      />
      {!blueprint && (
        <Box
          position="absolute"
          inset="0"
          background="radial-gradient(circle at 50% 40%, #3a1a0a 0%, #120703 100%)"
        />
      )}
      <Box
        position="absolute"
        inset="0"
        transition="filter .8s ease, opacity .2s ease"
        style={{
          opacity: visible ? 1 : 0,
          // Inverted then screened onto the sheet: dark linework turns white, light fills sink into the blue.
          filter: blueprint
            ? 'grayscale(1) invert(1) brightness(.9) contrast(1.7)'
            : 'none',
          mixBlendMode: blueprint ? 'screen' : 'normal',
        }}
      >
        <iframe
          ref={frameRef}
          title="Chiaki Live2D"
          src={VIEWER}
          tabIndex={-1}
          onLoad={() => post({ type: 'chiaki-live2d-status-request' })}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            border: 0,
            background: 'transparent',
          }}
        />
      </Box>

      {blueprint && rect && (
        <>
          <svg
            width={rect.width}
            height={rect.height}
            style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          >
            {PARTS.map((part) => {
              const { x, y } = point(part)
              const edge = PART_POINT[part].side === 'left' ? 36 : rect.width - 36
              const hot = active.has(part)
              return (
                <g key={part} opacity={hot ? 1 : 0.6}>
                  <line
                    x1={edge}
                    y1={y}
                    x2={x}
                    y2={y}
                    stroke={hot ? '#ff8a4a' : INK}
                    strokeWidth="1"
                    strokeDasharray={hot ? undefined : '3 3'}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={hot ? 5 : 3}
                    fill="none"
                    stroke={hot ? '#ff8a4a' : INK}
                  />
                  {hot && (
                    <circle
                      cx={x}
                      cy={y}
                      r="11"
                      fill="none"
                      stroke="#ff8a4a"
                      opacity=".5"
                    />
                  )}
                </g>
              )
            })}
          </svg>
          {PARTS.map((part) => {
            const { y } = point(part)
            const hot = active.get(part)
            const left = PART_POINT[part].side === 'left'
            return (
              <Box
                key={part}
                position="absolute"
                pointerEvents={hot ? 'auto' : 'none'}
                display="flex"
                flexDirection="column"
                alignItems={left ? 'flex-start' : 'flex-end'}
                style={{
                  top: y - 8,
                  ...(left ? { left: 6 } : { right: 6 }),
                }}
              >
                <Box
                  fontSize="10px"
                  letterSpacing=".1em"
                  color={hot ? '#ffb27a' : 'rgba(214,233,255,.82)'}
                  style={{ fontFamily: MONO }}
                >
                  {PART_POINT[part].label}
                </Box>
                {hot && <HotButton hot={hot} onPress={onPress} />}
              </Box>
            )
          })}
          <Corner at="tl" ink={INK} />
          <Corner at="br" ink={INK} />
        </>
      )}
    </Box>
  )
}

export default NightStage
