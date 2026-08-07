import React, { useCallback, useEffect, useRef } from 'react'
import { Box } from 'styled-system/jsx'
import type { Emotion } from 'lib/terminal/types'

// A driven version of components/character/Live2DModelClient — same model and
// loading path, but the expression is commanded by the chat engine instead of
// cycling at random, and the mouth flaps while a line is being typed out.

export type TerminalAvatarHandle = {
  setEmotion: (emotion: Emotion) => void
  setSpeaking: (speaking: boolean) => void
}

type Pose = {
  /** exp3 file to layer on top, or null to clear. */
  expression: string | null
  params: Record<string, number>
}

const BASE: Record<string, number> = {
  PARAM_MOUTH_FORM: 0.3,
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
      PARAM_MOUTH_FORM: 1,
      PARAM_MOUTH_OPEN_Y: 0.3,
      PARAM_EYE_L_SMILE: 1,
      PARAM_EYE_R_SMILE: 1,
      PARAM_BROW_L_Y: 0.4,
      PARAM_BROW_R_Y: 0.4,
    },
  },
  shy: {
    expression: 'shy.exp3.json',
    params: {
      PARAM_MOUTH_FORM: -0.2,
      PARAM_EYE_L_OPEN: 0.55,
      PARAM_EYE_R_OPEN: 0.55,
      PARAM_ANGLE_Z: -7,
      PARAM_BODY_ANGLE_Z: -4,
    },
  },
  surprised: {
    expression: 'scare.exp3.json',
    params: {
      PARAM_MOUTH_FORM: -0.4,
      PARAM_MOUTH_OPEN_Y: 0.85,
      PARAM_BROW_L_Y: 1,
      PARAM_BROW_R_Y: 1,
    },
  },
  sad: {
    expression: null,
    params: {
      PARAM_MOUTH_FORM: -0.7,
      PARAM_BROW_L_Y: -1,
      PARAM_BROW_R_Y: -1,
      PARAM_EYE_L_OPEN: 0.72,
      PARAM_EYE_R_OPEN: 0.72,
    },
  },
  thinking: {
    expression: 'wtm.exp3.json',
    params: { PARAM_MOUTH_FORM: 0, PARAM_ANGLE_Z: 8, PARAM_BODY_ANGLE_Z: 4 },
  },
  proud: {
    expression: null,
    params: {
      PARAM_MOUTH_FORM: 0.85,
      PARAM_EYE_L_SMILE: 0.65,
      PARAM_EYE_R_SMILE: 0.65,
      PARAM_BROW_L_Y: 0.2,
      PARAM_BROW_R_Y: 0.2,
    },
  },
}

// Window.PIXI / Live2DCubismCore are declared in components/character/Live2DModelClient.

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })

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

  // Live2D resets its parameters every frame, so the pose has to be re-applied
  // continuously rather than set once. Refs (not state) keep the rAF loop stable.
  const targetParams = useRef<Record<string, number>>({ ...BASE })
  const currentParams = useRef<Record<string, number>>({ ...BASE })
  const speakingRef = useRef(false)
  const lookRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    controls.current = {
      setEmotion: (emotion) => {
        const pose = POSES[emotion] ?? POSES.neutral
        targetParams.current = { ...BASE, ...pose.params }
        const model = modelRef.current
        if (!model?.expression) return
        try {
          // Clearing first stops the previous exp3's additive blend from stacking.
          model.expression(null)
          if (pose.expression)
            window.setTimeout(() => model.expression(pose.expression), 60)
        } catch {
          // The expression manager throws if the model was torn down mid-flight.
        }
      },
      setSpeaking: (speaking) => {
        speakingRef.current = speaking
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

  // The model art is a tall full-body sheet; the terminal only wants the face,
  // so it is scaled up and pushed far above the frame with overflow clipped.
  const layout = useCallback((width: number, height: number) => {
    const scale = Math.min((width / 774) * 0.86, (height / 1593) * 1.5)
    return { scale, x: width / 2, y: -scale * 620 }
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
    let frame = 0
    let retry = 0

    const boot = async () => {
      const { width, height } = sizeOf()
      if (width <= 0 || height <= 0) {
        retry = window.setTimeout(boot, 60)
        return
      }

      if (!window.Live2DCubismCore) {
        await loadScript(
          'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
        )
      }
      const PIXI = await import('pixi.js')
      window.PIXI = PIXI
      await loadScript('https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/cubism4.min.js')
      if (cancelled || !containerRef.current) return

      const Live2DModel = (window as any).PIXI?.live2d?.Live2DModel
      if (!Live2DModel) throw new Error('Live2DModel unavailable')

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

      let mouthPhase = 0
      const tick = () => {
        const core = model.internalModel?.coreModel
        if (core?.setParameterValueById) {
          const look = lookRef.current
          look.x += (look.targetX - look.x) * 0.08
          look.y += (look.targetY - look.y) * 0.08

          for (const [id, target] of Object.entries(targetParams.current)) {
            const current = currentParams.current[id] ?? 0
            const next = current + (target - current) * 0.12
            currentParams.current[id] = next
            core.setParameterValueById(id, next)
          }

          if (speakingRef.current) {
            mouthPhase += 0.34
            // Two detuned sines read as syllables rather than a steady flap.
            const open = 0.35 + Math.sin(mouthPhase) * 0.22 + Math.sin(mouthPhase * 2.3) * 0.12
            core.setParameterValueById('PARAM_MOUTH_OPEN_Y', Math.max(0.05, open))
          }

          core.setParameterValueById('PARAM_ANGLE_X', look.x * 26)
          core.setParameterValueById('PARAM_ANGLE_Y', -look.y * 22)
          core.setParameterValueById('PARAM_EYE_BALL_X', look.x * 1.6)
          core.setParameterValueById('PARAM_EYE_BALL_Y', -look.y * 1.6)
          core.setParameterValueById('PARAM_BODY_ANGLE_X', look.x * 8)
        }
        frame = window.requestAnimationFrame(tick)
      }
      frame = window.requestAnimationFrame(tick)

      const onPointer = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        lookRef.current.targetX = (event.clientX - rect.left) / rect.width - 0.5
        lookRef.current.targetY = (event.clientY - rect.top) / rect.height - 0.5
      }
      window.addEventListener('pointermove', onPointer)

      disposeRef.current = () => {
        window.removeEventListener('pointermove', onPointer)
        window.cancelAnimationFrame(frame)
        app.destroy(true, true)
        appRef.current = null
        modelRef.current = null
      }
    }

    boot().catch(() => {
      // A CDN failure leaves the frame empty; the chat itself still works.
    })

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
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
  }, [applyLayout, sizeOf])

  return <Box ref={containerRef} width="100%" height="100%" overflow="hidden" />
}

export default TerminalAvatarClient
