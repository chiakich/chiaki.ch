import React, { useEffect, useRef } from 'react'
import { Box } from '@chakra-ui/react'

// Add type definition for window.PIXI
declare global {
  interface Window {
    PIXI: typeof import('pixi.js')
    Live2DCubismCore: any
  }
}

interface Live2DModelClientProps {
  width?: number
  height?: number
}

const Live2DModelClient: React.FC<Live2DModelClientProps> = ({
  width: fixedWidth,
  height: fixedHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<any>(null)
  const modelRef = useRef<any>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const isInitializingRef = useRef(false)

  // Calculate model positioning
  const calculateModelPosition = (width: number, height: number) => {
    const modelOriginalWidth = 774
    const modelOriginalHeight = 1593
    const scaleFactor = 0.3
    const paddingFactor = 0.8
    const maxScale = 0.25

    const scaleByWidth = (width / modelOriginalWidth) * scaleFactor
    const scaleByHeight = (height / modelOriginalHeight) * scaleFactor
    let modelScale = Math.min(scaleByWidth, scaleByHeight) * paddingFactor
    modelScale = Math.min(modelScale, maxScale)

    return {
      modelScale,
      anchorX: 0.5,
      anchorY: 0,
      positionX: width / 2,
      positionY: -modelScale * 2300,
    }
  }

  // Update model position and scale
  const updateModelPosition = (width: number, height: number) => {
    if (!modelRef.current || !appRef.current) return

    const { modelScale, anchorX, anchorY, positionX, positionY } =
      calculateModelPosition(width, height)

    modelRef.current.scale.set(modelScale)
    modelRef.current.x = positionX
    modelRef.current.y = positionY
    modelRef.current.anchor.set(anchorX, anchorY)
    appRef.current.renderer.resize(width, height)
  }

  // Get container dimensions
  const getContainerDimensions = () => {
    if (!containerRef.current) return { width: 0, height: 0 }

    if (fixedWidth && fixedHeight) {
      return { width: fixedWidth, height: fixedHeight }
    }

    return {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    }
  }

  // Handle resize events
  const handleResize = () => {
    const { width, height } = getContainerDimensions()
    if (width > 0 && height > 0 && modelRef.current) {
      updateModelPosition(width, height)
    }
  }

  // Load external scripts
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      document.head.appendChild(script)
    })
  }

  // Initialize Live2D
  const initializeLive2D = async () => {
    if (isInitializingRef.current) return

    const { width, height } = getContainerDimensions()
    if (width <= 0 || height <= 0) {
      setTimeout(initializeLive2D, 50)
      return
    }

    isInitializingRef.current = true

    // Cleanup previous instance
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }

    // Clear container
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
    }

    try {
      // Load dependencies
      if (!window.Live2DCubismCore) {
        await loadScript(
          'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
        )
      }

      const PIXI = await import('pixi.js')
      window.PIXI = PIXI

      await loadScript(
        'https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/cubism4.min.js'
      )

      const Live2DModel = (window as any).PIXI.live2d.Live2DModel
      if (!Live2DModel) {
        throw new Error('Live2DModel not found')
      }

      if (!containerRef.current) {
        isInitializingRef.current = false
        return
      }

      // Create PIXI app
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

      // Load model
      const model = await Live2DModel.from(
        '/assets/about/chiakiL2Dv2/chiaki.model3.json',
        { autoInteract: false }
      )

      modelRef.current = model

      // Position model
      const { modelScale, anchorX, anchorY, positionX, positionY } =
        calculateModelPosition(width, height)

      model.scale.set(modelScale)
      model.x = positionX
      model.y = positionY
      model.anchor.set(anchorX, anchorY)
      app.stage.addChild(model)

      // Setup expressions and animations
      setupModelAnimations(model)

      // Setup mouse/touch interactions
      setupModelInteractions(model, canvas)

      isInitializingRef.current = false
    } catch (error) {
      isInitializingRef.current = false
    }
  }

  // Setup model animations
  const setupModelAnimations = (model: any) => {
    // Initial smile
    setTimeout(() => {
      try {
        const coreModel = model.internalModel.coreModel as any
        if (coreModel && typeof coreModel.setParameterValueById === 'function') {
          coreModel.setParameterValueById('PARAM_MOUTH_FORM', 0.3)
          coreModel.setParameterValueById('PARAM_MOUTH_OPEN_Y', 0.0)
        }
      } catch (error) {
        // Silent error handling
      }
    }, 1000)

    // Mouth expressions
    const mouthExpressions = [
      { mouth_form: 0.3, mouth_open: 0.0 },
      { mouth_form: 0.6, mouth_open: 0.0 },
      { mouth_form: 0.9, mouth_open: 0.2 },
      { mouth_form: 0.2, mouth_open: 0.3 },
      { mouth_form: 0.1, mouth_open: 0.5 },
      { mouth_form: 0.0, mouth_open: 0.8 },
      { mouth_form: -0.2, mouth_open: 1.0 },
      { mouth_form: 0.8, mouth_open: 0.6 },
      { mouth_form: 0.0, mouth_open: 0.0 },
      { mouth_form: 0.4, mouth_open: 0.1 },
    ]

    let lastMouthTime = Date.now()
    let currentMouthForm = 0.3
    let currentMouthOpen = 0.0
    let targetMouthForm = 0.3
    let targetMouthOpen = 0.0

    const animateMouth = () => {
      const lerpFactor = 0.05
      const deltaForm = targetMouthForm - currentMouthForm
      const deltaOpen = targetMouthOpen - currentMouthOpen
      const distance = Math.sqrt(deltaForm * deltaForm + deltaOpen * deltaOpen)

      if (distance > 0.01) {
        currentMouthForm += deltaForm * lerpFactor
        currentMouthOpen += deltaOpen * lerpFactor

        try {
          const coreModel = model.internalModel.coreModel as any
          if (coreModel && typeof coreModel.setParameterValueById === 'function') {
            coreModel.setParameterValueById('PARAM_MOUTH_FORM', currentMouthForm)
            coreModel.setParameterValueById('PARAM_MOUTH_OPEN_Y', currentMouthOpen)
          }
        } catch (error) {
          // Silent error handling
        }
      }

      if (model && model.internalModel) {
        requestAnimationFrame(animateMouth)
      }
    }

    const changeMouthExpression = () => {
      const now = Date.now()
      if (now - lastMouthTime > 4000) {
        const randomMouth =
          mouthExpressions[Math.floor(Math.random() * mouthExpressions.length)]
        targetMouthForm = randomMouth.mouth_form
        targetMouthOpen = randomMouth.mouth_open
        lastMouthTime = now
      }
    }

    requestAnimationFrame(animateMouth)
    const mouthInterval = setInterval(changeMouthExpression, 500)

    // Face expressions
    const expressions = ['wtm.exp3.json', 'shy.exp3.json', 'scare.exp3.json']
    let lastExpressionTime = Date.now()

    const playRandomExpression = () => {
      const now = Date.now()
      if (now - lastExpressionTime > 8000) {
        const randomExpression =
          expressions[Math.floor(Math.random() * expressions.length)]
        try {
          if (model.expression) {
            model.expression(null)
            setTimeout(() => {
              try {
                model.expression(randomExpression)
                setTimeout(() => {
                  const coreModel = model.internalModel.coreModel as any
                  if (
                    coreModel &&
                    typeof coreModel.setParameterValueById === 'function'
                  ) {
                    coreModel.setParameterValueById('PARAM_MOUTH_FORM', 0.3)
                    coreModel.setParameterValueById('PARAM_MOUTH_OPEN_Y', 0.0)
                  }
                }, 2000)
              } catch (error) {
                // Silent error handling
              }
            }, 100)
          }
          lastExpressionTime = now
        } catch (error) {
          // Silent error handling
        }
      }
    }

    const expressionInterval = setInterval(playRandomExpression, 1000)

    // Store cleanup for animations
    const originalCleanup = cleanupRef.current
    cleanupRef.current = () => {
      clearInterval(mouthInterval)
      clearInterval(expressionInterval)
      if (originalCleanup) originalCleanup()
    }
  }

  // Setup model interactions
  const setupModelInteractions = (model: any, canvas: HTMLCanvasElement) => {
    let targetHeadX = 0
    let targetHeadY = 0
    let currentHeadX = 0
    let currentHeadY = 0

    const animateHead = () => {
      const lerpFactor = 0.02
      const deltaX = targetHeadX - currentHeadX
      const deltaY = targetHeadY - currentHeadY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance > 0.05) {
        currentHeadX += deltaX * lerpFactor
        currentHeadY += deltaY * lerpFactor

        try {
          const coreModel = model.internalModel.coreModel as any
          if (coreModel && typeof coreModel.setParameterValueById === 'function') {
            coreModel.setParameterValueById('PARAM_ANGLE_X', currentHeadX * 25)
            coreModel.setParameterValueById('PARAM_ANGLE_Y', -currentHeadY * 25)
          }
        } catch (error) {
          // Silent error handling
        }
      }

      if (model && model.internalModel) {
        requestAnimationFrame(animateHead)
      }
    }

    const updateLook = (x: number, y: number) => {
      if (!model || !model.internalModel) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = (x - rect.left) / rect.width - 0.5
      const mouseY = (y - rect.top) / rect.height - 0.5

      targetHeadX = mouseX
      targetHeadY = mouseY

      try {
        const coreModel = model.internalModel.coreModel as any
        if (coreModel && typeof coreModel.setParameterValueById === 'function') {
          coreModel.setParameterValueById('PARAM_EYE_BALL_X', mouseX * 2)
          coreModel.setParameterValueById('PARAM_EYE_BALL_Y', -mouseY * 2)
        }
      } catch (error) {
        // Silent error handling
      }
    }

    const handleMouseMove = (e: MouseEvent) => updateLook(e.clientX, e.clientY)
    const handleClick = (e: MouseEvent) => updateLook(e.clientX, e.clientY)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateLook(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateLook(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768

    if (isMobile) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
      canvas.addEventListener('click', handleClick)
    } else {
      window.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('click', handleClick)
    }

    requestAnimationFrame(animateHead)

    // Store cleanup for interactions
    const originalCleanup = cleanupRef.current
    cleanupRef.current = () => {
      if (isMobile) {
        canvas.removeEventListener('touchstart', handleTouchStart)
        canvas.removeEventListener('touchmove', handleTouchMove)
        canvas.removeEventListener('click', handleClick)
      } else {
        window.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('click', handleClick)
      }
      if (appRef.current) {
        appRef.current.destroy(true, true)
        appRef.current = null
      }
      modelRef.current = null
      if (originalCleanup) originalCleanup()
    }
  }

  // Main effect for initialization and resize handling
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout

    const debouncedResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 150)
    }

    // Initialize
    setTimeout(initializeLive2D, 100)

    // Setup resize listeners
    window.addEventListener('resize', debouncedResize)

    let resizeObserver: ResizeObserver | null = null
    if (containerRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(handleResize, 100)
      })
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener('resize', debouncedResize)
      if (resizeObserver) resizeObserver.disconnect()
      clearTimeout(resizeTimer)
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [fixedWidth, fixedHeight])

  return (
    <Box
      ref={containerRef}
      width="100vw"
      height="80vh"
      position="relative"
      overflow="hidden"
      backgroundColor="transparent"
      display="flex"
      justifyContent="center"
      alignItems="center"
    />
  )
}

export default Live2DModelClient
