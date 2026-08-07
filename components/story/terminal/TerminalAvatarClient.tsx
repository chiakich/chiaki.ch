import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, styled } from 'styled-system/jsx'
import type { Emotion } from 'lib/terminal/types'
import { loadLive2DRuntime } from 'lib/live2d/runtime'

const Img = styled.img

// A driven version of components/character/Live2DModelClient — same model and
// loading path, but the expression is commanded by the chat engine instead of
// cycling at random, and the mouth flaps while a line is being typed out.

export type TerminalAvatarHandle = {
  setEmotion: (emotion: Emotion) => void
  speakBeat: (open: number, form: number, duration: number) => void
  stopSpeaking: () => void
}

type Pose = {
  /** exp3 file to layer on top, or null to clear. */
  expression: string | null
  params: Record<string, number>
}

type IdleMoment = {
  params: Record<string, number>
  gazeX: number
  gazeY: number
  endsAt: number
  nextAt: number
}

type Reaction = {
  expression: string | null
  params: Record<string, number>
  endsAt: number
}

const BASE: Record<string, number> = {
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

const POSES: Record<Emotion, Pose> = {
  neutral: { expression: null, params: {} },
  happy: {
    expression: null,
    params: {
      PARAM_MOUTH_FORM: 0.32,
      PARAM_EYE_L_SMILE: 0.12,
      PARAM_EYE_R_SMILE: 0.12,
      PARAM_BROW_L_Y: 0.04,
      PARAM_BROW_R_Y: 0.04,
    },
  },
  shy: {
    expression: null,
    params: {
      PARAM_MOUTH_FORM: 0.18,
      PARAM_EYE_L_OPEN: 0.88,
      PARAM_EYE_R_OPEN: 0.88,
      PARAM_ANGLE_Z: -3,
      PARAM_BODY_ANGLE_Z: -1,
    },
  },
  surprised: {
    expression: null,
    params: {
      PARAM_MOUTH_FORM: 0.08,
      PARAM_BROW_L_Y: 0.32,
      PARAM_BROW_R_Y: 0.32,
    },
  },
  sad: {
    expression: null,
    params: {
      PARAM_MOUTH_FORM: -0.08,
      PARAM_BROW_L_Y: -0.28,
      PARAM_BROW_R_Y: -0.28,
      PARAM_EYE_L_OPEN: 0.9,
      PARAM_EYE_R_OPEN: 0.9,
    },
  },
  thinking: {
    expression: null,
    params: { PARAM_MOUTH_FORM: 0.08, PARAM_ANGLE_Z: 3, PARAM_BODY_ANGLE_Z: 1 },
  },
  proud: {
    expression: null,
    params: {
      PARAM_MOUTH_FORM: 0.28,
      PARAM_EYE_L_SMILE: 0.1,
      PARAM_EYE_R_SMILE: 0.1,
      PARAM_ANGLE_Z: 2,
    },
  },
}

const emptyIdleMoment = (nextAt = 0): IdleMoment => ({
  params: {},
  gazeX: 0,
  gazeY: 0,
  endsAt: 0,
  nextAt,
})

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min)

const damp = (current: number, target: number, seconds: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-dt / seconds))

// next/dynamic doesn't forward refs, so the imperative handle is published into
// a ref object the parent owns and passes down as a plain prop.
type TerminalAvatarClientProps = {
  controls: React.MutableRefObject<TerminalAvatarHandle | null>
}

const TerminalAvatarClient = ({ controls }: TerminalAvatarClientProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<any>(null)
  const modelRef = useRef<any>(null)
  const disposeRef = useRef<(() => void) | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  // Live2D restores its authored parameter values after each frame. These refs
  // are therefore composed again immediately before its physics pass, which
  // keeps conversation, breathing, tail physics, and small idle behaviour alive
  // at the same time.
  const poseRef = useRef<Pose>(POSES.neutral)
  const currentParams = useRef<Record<string, number>>({ ...BASE })
  const mouthTargetRef = useRef(0)
  const mouthCurrentRef = useRef(0)
  const mouthFormTargetRef = useRef(0)
  const mouthFormCurrentRef = useRef(0)
  const mouthTimerRef = useRef<number | null>(null)
  const speakingRef = useRef(false)
  const idleRef = useRef<IdleMoment>(emptyIdleMoment())
  const reactionRef = useRef<Reaction | null>(null)
  const expressionRef = useRef<string | null>(null)
  const blinkRef = useRef({ startAt: 0, nextAt: 0, double: false })
  const timingRef = useRef({ startedAt: 0, lastAt: 0 })
  const lookRef = useRef({
    targetX: 0,
    targetY: 0,
    eyeX: 0,
    eyeY: 0,
    headX: 0,
    headY: 0,
    bodyX: 0,
    bodyY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastMovedAt: -Infinity,
  })

  useEffect(() => {
    controls.current = {
      setEmotion: (emotion) => {
        const pose = POSES[emotion] ?? POSES.neutral
        poseRef.current = pose
      },
      speakBeat: (open, form, duration) => {
        if (mouthTimerRef.current !== null)
          window.clearTimeout(mouthTimerRef.current)
        mouthTargetRef.current = Math.min(0.62, Math.max(0, open))
        // The authored mouth curve is intentionally delicate. Keep phonetic
        // shaping small so a syllable reads as speech rather than a grin.
        mouthFormTargetRef.current = Math.min(0.34, Math.max(-0.34, form * 0.48))
        speakingRef.current = true
        mouthTimerRef.current = window.setTimeout(
          () => {
            mouthTargetRef.current = 0
            mouthFormTargetRef.current = 0
            speakingRef.current = false
          },
          Math.max(28, duration * 0.66)
        )
      },
      stopSpeaking: () => {
        if (mouthTimerRef.current !== null)
          window.clearTimeout(mouthTimerRef.current)
        mouthTimerRef.current = null
        mouthTargetRef.current = 0
        mouthFormTargetRef.current = 0
        speakingRef.current = false
      },
    }
    const published = controls
    return () => {
      published.current = null
    }
  }, [controls])

  const sizeOf = useCallback(() => {
    const element = containerRef.current
    return element
      ? { width: element.offsetWidth, height: element.offsetHeight }
      : { width: 0, height: 0 }
  }, [])

  // Frame the model as a chest-up call portrait on both wide and narrow screens.
  const layout = useCallback((width: number, height: number) => {
    const narrow = width < 720
    const fittedScale =
      Math.min((width / 774) * 0.3, (height / 1593) * 0.3, 0.22) *
      (narrow ? 0.75 : 0.92)
    const scale = fittedScale * (narrow ? 1.9 : 1.68)
    return {
      scale,
      // Keep the desktop portrait on the left, while bringing the face closer
      // to the visual centre of its own composition instead of its old offset.
      x: width * (narrow ? 0.5 : 0.46),
      y: -scale * (narrow ? 2520 : 2480),
    }
  }, [])

  const applyLayout = useCallback(
    (width: number, height: number) => {
      const model = modelRef.current
      const app = appRef.current
      if (!model || !app) return
      const { scale, x, y } = layout(width, height)
      model.scale.set(scale)
      model.x = x
      model.y = y
      model.anchor.set(0.5, 0)
      app.renderer.resize(width, height)
    },
    [layout]
  )

  useEffect(() => {
    let cancelled = false
    let retry = 0

    const boot = async () => {
      const { width, height } = sizeOf()
      if (width <= 0 || height <= 0) {
        retry = window.setTimeout(boot, 60)
        return
      }

      const { PIXI, Live2DModel } = await loadLive2DRuntime()
      if (cancelled || !containerRef.current) return

      const canvas = document.createElement('canvas')
      const app = new PIXI.Application({
        view: canvas,
        backgroundAlpha: 0,
        autoStart: true,
        width,
        height,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })
      appRef.current = app
      containerRef.current.appendChild(canvas)

      const model = await Live2DModel.from(
        '/assets/story/character/live2d/chiaki.model3.json',
        { autoInteract: false }
      )
      if (cancelled) {
        app.destroy(true, true)
        return
      }
      modelRef.current = model
      app.stage.addChild(model)
      applyLayout(width, height)
      setStatus('ready')

      const internal = model.internalModel as any
      const scheduleIdleMoment = (now: number) => {
        const choices: Array<Pick<IdleMoment, 'params' | 'gazeX' | 'gazeY'>> = [
          {
            params: { PARAM_ANGLE_Z: 1.25, PARAM_BROW_L_Y: 0.06, PARAM_BROW_R_Y: 0.06 },
            gazeX: -0.23,
            gazeY: 0.04,
          },
          {
            params: { PARAM_ANGLE_Z: -0.9, PARAM_EYE_L_OPEN: 0.96, PARAM_EYE_R_OPEN: 0.96 },
            gazeX: 0.24,
            gazeY: -0.06,
          },
          {
            params: { PARAM_MOUTH_FORM: 0.05, PARAM_EYE_L_SMILE: 0.025, PARAM_EYE_R_SMILE: 0.025 },
            gazeX: 0,
            gazeY: 0,
          },
          {
            params: { PARAM_ANGLE_Z: 1.8, PARAM_MOUTH_FORM: 0.06 },
            gazeX: -0.16,
            gazeY: 0.13,
          },
        ]
        const selected = choices[Math.floor(Math.random() * choices.length)]
        idleRef.current = {
          ...selected,
          endsAt: now + randomBetween(1700, 3600),
          nextAt: now + randomBetween(7400, 12_400),
        }
      }

      const setExpression = (expression: string | null) => {
        if (expressionRef.current === expression) return
        expressionRef.current = expression
        try {
          model.expression(undefined)
          if (expression) window.setTimeout(() => model.expression(expression), 36)
        } catch {
          // The expression manager can be disposing while a route changes.
        }
      }

      const reactToTap = (area: 'head' | 'chest') => {
        const now = performance.now()
        if (area === 'head') {
          reactionRef.current = {
            expression: null,
            params: {
              PARAM_MOUTH_FORM: 0.2,
              PARAM_EYE_L_SMILE: 0.1,
              PARAM_EYE_R_SMILE: 0.1,
              PARAM_ANGLE_Z: -1.2,
            },
            endsAt: now + 2400,
          }
          return
        }

        reactionRef.current = {
          expression: 'shy',
          params: {
            PARAM_MOUTH_FORM: 0.1,
            PARAM_EYE_L_OPEN: 0.87,
            PARAM_EYE_R_OPEN: 0.87,
            PARAM_BROW_L_Y: -0.1,
            PARAM_BROW_R_Y: -0.1,
            PARAM_ANGLE_Z: 2.6,
            PARAM_BODY_ANGLE_Z: 1.2,
          },
          endsAt: now + 2800,
        }
      }

      const updateBehaviour = () => {
        const now = performance.now()
        const core = internal?.coreModel as any
        if (!core?.setParameterValueById) return

        const timing = timingRef.current
        if (!timing.startedAt) {
          timing.startedAt = now
          timing.lastAt = now
          blinkRef.current.nextAt = now + randomBetween(1900, 4100)
          idleRef.current = emptyIdleMoment(now + randomBetween(4200, 8000))
        }
        const dt = clamp((now - timing.lastAt) / 1000, 0.001, 0.05)
        timing.lastAt = now
        const elapsed = now - timing.startedAt
        const look = lookRef.current
        const pointerIsInteresting = now - look.lastMovedAt < 1350

        if (!pointerIsInteresting && now >= idleRef.current.endsAt && idleRef.current.endsAt) {
          idleRef.current = emptyIdleMoment(now + randomBetween(4500, 9000))
        }
        if (!pointerIsInteresting && now >= idleRef.current.nextAt && !idleRef.current.endsAt) {
          scheduleIdleMoment(now)
        }

        const reaction = reactionRef.current
        if (reaction && now >= reaction.endsAt) reactionRef.current = null
        const activeReaction = reactionRef.current
        setExpression(activeReaction?.expression ?? poseRef.current.expression)

        const idle = idleRef.current
        // The cursor earns attention only while it moves. Afterwards her eyes
        // settle back through the damped head and torso chain instead of snapping.
        const desiredGazeX = pointerIsInteresting ? look.targetX : idle.gazeX
        const desiredGazeY = pointerIsInteresting ? look.targetY : idle.gazeY
        look.eyeX = damp(look.eyeX, desiredGazeX, 0.19, dt)
        look.eyeY = damp(look.eyeY, desiredGazeY, 0.19, dt)
        look.headX = damp(look.headX, desiredGazeX, 0.82, dt)
        look.headY = damp(look.headY, desiredGazeY, 0.88, dt)
        look.bodyX = damp(look.bodyX, desiredGazeX, 1.65, dt)
        look.bodyY = damp(look.bodyY, desiredGazeY, 1.8, dt)

        const desiredParams = {
          ...BASE,
          ...poseRef.current.params,
          ...idle.params,
          ...(activeReaction?.params ?? {}),
        }
        for (const [id, target] of Object.entries(desiredParams)) {
          const current = currentParams.current[id] ?? 0
          const next = damp(current, target, id.includes('ANGLE') ? 0.72 : 0.42, dt)
          currentParams.current[id] = next
          core.setParameterValueById(id, next)
        }

        mouthCurrentRef.current = damp(
          mouthCurrentRef.current,
          mouthTargetRef.current,
          0.075,
          dt
        )
        mouthFormCurrentRef.current = damp(
          mouthFormCurrentRef.current,
          mouthFormTargetRef.current,
          0.12,
          dt
        )

        const blink = blinkRef.current
        if (now >= blink.nextAt) {
          blink.startAt = now
          blink.double = Math.random() < 0.16
          blink.nextAt = now + randomBetween(2900, 6200)
        }
        const blinkPulse = (offset: number) => {
          const progress = (now - blink.startAt - offset) / 145
          return progress > 0 && progress < 1 ? Math.sin(progress * Math.PI) : 0
        }
        const blinkAmount = Math.max(blinkPulse(0), blink.double ? blinkPulse(230) : 0)
        const eyeOpen = 1 - blinkAmount

        // A slow primary breath plus a much smaller secondary rhythm keeps the
        // chest alive. Angle movement is intentional: the tail physics receives
        // it before physics is evaluated, so it continues during speech too.
        const breathWave = Math.sin(elapsed / 860)
        const breath = clamp(0.5 + breathWave * 0.5 + Math.sin(elapsed / 2550) * 0.08, 0, 1)
        const restSway = Math.sin(elapsed / 4700) * 0.48 + Math.sin(elapsed / 2200) * 0.12
        // The dedicated tail parameter lets her tail sweep behind her from
        // side to side without borrowing (and visibly moving) the head.
        const tailSway = Math.sin(elapsed / 1480) * 14 + Math.sin(elapsed / 3980) * 3.2
        const speakingNod = speakingRef.current ? Math.sin(elapsed / 170) * mouthCurrentRef.current * 0.48 : 0

        core.setParameterValueById('PARAM_MOUTH_OPEN_Y', mouthCurrentRef.current)
        core.setParameterValueById(
          'PARAM_MOUTH_FORM',
          clamp((currentParams.current.PARAM_MOUTH_FORM ?? 0) + mouthFormCurrentRef.current, -1, 1)
        )
        core.setParameterValueById(
          'PARAM_EYE_L_OPEN',
          (currentParams.current.PARAM_EYE_L_OPEN ?? 1) * eyeOpen
        )
        core.setParameterValueById(
          'PARAM_EYE_R_OPEN',
          (currentParams.current.PARAM_EYE_R_OPEN ?? 1) * eyeOpen
        )
        core.setParameterValueById('PARAM_EYE_BALL_X', look.eyeX)
        core.setParameterValueById('PARAM_EYE_BALL_Y', -look.eyeY)
        core.setParameterValueById('PARAM_ANGLE_X', look.headX * 13 + restSway)
        core.setParameterValueById('PARAM_ANGLE_Y', -look.headY * 12 + breathWave * 1.75 + speakingNod)
        core.setParameterValueById('PARAM_TAIL_SWAY', tailSway)
        core.setParameterValueById('PARAM_BODY_ANGLE_X', look.bodyX * 5 + restSway * 0.24)
        core.setParameterValueById('PARAM_BREATH', breath)
        core.setParameterValueById(
          'PARAM_BODY_ANGLE_Y',
          -look.bodyY * 3 + breathWave * 1.45 + speakingNod * 0.42
        )
      }

      // This hook runs after motions but before the framework saves parameters,
      // applies breath/physics, and draws. rAF writes happened too late and were
      // discarded by the framework's loadParameters call on the next frame.
      internal?.on?.('afterMotionUpdate', updateBehaviour)

      const onPointer = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        const look = lookRef.current
        const distance = Math.hypot(
          event.clientX - look.lastPointerX,
          event.clientY - look.lastPointerY
        )
        look.lastPointerX = event.clientX
        look.lastPointerY = event.clientY
        if (distance < 2) return

        look.targetX = clamp(
          ((event.clientX - rect.left) / rect.width - 0.5) * 1.35,
          -0.68,
          0.68
        )
        look.targetY = clamp(
          ((event.clientY - rect.top) / rect.height - 0.5) * 1.1,
          -0.5,
          0.5
        )
        look.lastMovedAt = performance.now()
      }
      const onTap = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const narrow = width < 720
        const { x: centerX } = layout(width, height)
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const headY = height * (narrow ? 0.24 : 0.235)
        const headHit =
          Math.pow((x - centerX) / (narrow ? width * 0.3 : width * 0.16), 2) +
            Math.pow((y - headY) / (narrow ? height * 0.19 : height * 0.22), 2) <
          1
        const chestHit =
          Math.pow((x - centerX) / (narrow ? width * 0.34 : width * 0.22), 2) +
            Math.pow((y - height * (narrow ? 0.53 : 0.57)) / (narrow ? height * 0.27 : height * 0.3), 2) <
          1
        if (headHit) reactToTap('head')
        else if (chestHit) reactToTap('chest')
      }
      window.addEventListener('pointermove', onPointer)
      canvas.addEventListener('pointerup', onTap)

      disposeRef.current = () => {
        window.removeEventListener('pointermove', onPointer)
        canvas.removeEventListener('pointerup', onTap)
        internal?.off?.('afterMotionUpdate', updateBehaviour)
        app.destroy(true, true)
        appRef.current = null
        modelRef.current = null
      }
    }

    boot().catch((error) => {
      console.error('[terminal-live2d]', error)
      if (!cancelled) setStatus('error')
    })

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      if (mouthTimerRef.current !== null) window.clearTimeout(mouthTimerRef.current)
      resizeTimer = setTimeout(() => {
        const { width, height } = sizeOf()
        if (width > 0 && height > 0) applyLayout(width, height)
      }, 120)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      clearTimeout(retry)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      disposeRef.current?.()
      disposeRef.current = null
    }
  }, [applyLayout, layout, sizeOf])

  return (
    <Box position="relative" width="100%" height="100%" overflow="hidden">
      <Img
        src="/assets/story/character/gallery/portrait-5.webp"
        alt=""
        position="absolute"
        left={{ base: '50%', md: '46%' }}
        bottom={{ base: '-86%', md: '-68%' }}
        height={{ base: '190%', md: '168%' }}
        maxWidth="none"
        transform="translateX(-50%)"
        objectFit="contain"
        opacity={status === 'ready' ? 0 : 0.88}
        filter="saturate(.72) contrast(1.08) drop-shadow(0 0 34px rgba(247,97,89,.18))"
        transition="opacity .45s ease"
      />
      <Box
        ref={containerRef}
        position="absolute"
        inset="0"
        opacity={status === 'ready' ? 1 : 0}
        transition="opacity .45s ease"
      />
      {status === 'error' && (
        <Box
          position="absolute"
          right={{ base: '16px', md: '28px' }}
          top={{ base: '76px', md: '96px' }}
          fontFamily="mono"
          fontSize="9px"
          letterSpacing=".18em"
          color="rgba(247,97,89,.72)"
        >
          MOTION LINK / FALLBACK
        </Box>
      )}
    </Box>
  )
}

export default TerminalAvatarClient
