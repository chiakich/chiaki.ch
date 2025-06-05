import React, { useEffect, useRef, useState } from 'react'
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
  const [dimensions, setDimensions] = useState({ width: 700, height: 1000 })
  const appRef = useRef<any>(null) // Store PIXI app reference
  const cleanupRef = useRef<(() => void) | null>(null) // Store cleanup function
  const isInitializingRef = useRef(false) // Prevent multiple simultaneous initializations

  // Calculate responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Use fixed dimensions if provided, otherwise calculate responsive dimensions
      if (fixedWidth && fixedHeight) {
        setDimensions({ width: fixedWidth, height: fixedHeight })
        return
      }

      // Calculate responsive dimensions based on screen size
      let targetWidth, targetHeight

      if (viewportWidth <= 768) {
        // Mobile: use most of the screen width, maintain aspect ratio
        targetWidth = Math.min(viewportWidth * 0.95, 450)
        targetHeight = Math.min(viewportHeight * 0.8, 600)
      } else if (viewportWidth <= 1024) {
        // Tablet: medium size
        targetWidth = Math.min(viewportWidth * 0.6, 600)
        targetHeight = Math.min(viewportHeight * 0.7, 700)
      } else {
        // Desktop: larger size
        targetWidth = Math.min(containerWidth, 700)
        targetHeight = Math.min(containerHeight, 1000)
      }

      setDimensions({ width: targetWidth, height: targetHeight })
    }

    updateDimensions()

    // Debounce resize event to prevent too many updates
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(updateDimensions, 300)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [fixedWidth, fixedHeight])

  useEffect(() => {
    if (!containerRef.current || isInitializingRef.current) {
      return
    }

    // Set initialization flag
    isInitializingRef.current = true

    // Clean up previous instance completely
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }

    // Clear container completely - remove all children
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
    }

    const initializeLive2D = async () => {
      try {
        // Double check container still exists
        if (!containerRef.current) {
          isInitializingRef.current = false
          return
        }

        // Load Cubism Core first
        if (!window.Live2DCubismCore) {
          await loadScript(
            'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
          )
        }

        // Dynamic import PIXI
        const PIXI = await import('pixi.js')

        // Register PIXI globally
        window.PIXI = PIXI

        // Load pixi-live2d-display cubism4 version from CDN
        await loadScript(
          'https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/cubism4.min.js'
        )

        // Access Live2DModel from PIXI.live2d namespace
        const Live2DModel = (window as any).PIXI.live2d.Live2DModel
        if (!Live2DModel) {
          throw new Error('Live2DModel not found in PIXI.live2d namespace')
        }

        // Final check before creating canvas
        if (!containerRef.current) {
          isInitializingRef.current = false
          return
        }

        const canvas = document.createElement('canvas')
        const app = new PIXI.Application({
          view: canvas,
          backgroundAlpha: 0,
          autoStart: true,
          width: dimensions.width,
          height: dimensions.height,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })

        // Store app reference for cleanup
        appRef.current = app

        containerRef.current.appendChild(canvas)

        const model = await Live2DModel.from(
          '/assets/about/chiakiL2Dv2/chiaki.model3.json',
          { autoInteract: false }
        )

        // Calculate responsive scale based on screen size
        const isMobile = window.innerWidth <= 768
        const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768

        let modelScale, anchorX, anchorY, positionX, positionY
        if (isMobile) {
          modelScale = 0.08 // Fixed smaller scale for mobile
          anchorX = 0.5
          anchorY = 0
          positionX = dimensions.width / 2
          positionY = 10
        } else if (isTablet) {
          modelScale = Math.min(dimensions.width / 3500, dimensions.height / 5500)
          anchorX = 0.5
          anchorY = 1.0
          positionX = dimensions.width / 2
          positionY = dimensions.height - 100
        } else {
          modelScale = 0.15 // Original desktop scale
          anchorX = 0.5
          anchorY = 1.0
          positionX = dimensions.width / 2
          positionY = dimensions.height - 250
        }

        // Configure model with responsive positioning
        model.scale.set(modelScale)
        model.x = positionX
        model.y = positionY
        model.anchor.set(anchorX, anchorY)

        app.stage.addChild(model)

        // Set initial gentle smile
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

        // Setup random mouth expressions with smooth transitions
        const mouthExpressions = [
          { name: 'gentle_smile', mouth_form: 0.3, mouth_open: 0.0 },
          { name: 'happy_smile', mouth_form: 0.6, mouth_open: 0.0 },
          { name: 'big_smile', mouth_form: 0.9, mouth_open: 0.2 },
          { name: 'slight_open', mouth_form: 0.2, mouth_open: 0.3 },
          { name: 'talking', mouth_form: 0.1, mouth_open: 0.5 },
          { name: 'surprise', mouth_form: 0.0, mouth_open: 0.8 },
          { name: 'big_surprise', mouth_form: -0.2, mouth_open: 1.0 },
          { name: 'laugh', mouth_form: 0.8, mouth_open: 0.6 },
          { name: 'neutral', mouth_form: 0.0, mouth_open: 0.0 },
          { name: 'small_smile', mouth_form: 0.4, mouth_open: 0.1 },
        ]

        let lastMouthExpressionTime = Date.now()
        let currentMouthForm = 0.3
        let currentMouthOpen = 0.0
        let targetMouthForm = 0.3
        let targetMouthOpen = 0.0

        // Smooth mouth animation function
        const smoothMouthAnimation = () => {
          const lerpFactor = 0.05

          const deltaForm = targetMouthForm - currentMouthForm
          const deltaOpen = targetMouthOpen - currentMouthOpen
          const distance = Math.sqrt(deltaForm * deltaForm + deltaOpen * deltaOpen)

          if (distance > 0.01) {
            currentMouthForm += deltaForm * lerpFactor
            currentMouthOpen += deltaOpen * lerpFactor

            try {
              const coreModel = model.internalModel.coreModel as any
              if (
                coreModel &&
                typeof coreModel.setParameterValueById === 'function'
              ) {
                coreModel.setParameterValueById('PARAM_MOUTH_FORM', currentMouthForm)
                coreModel.setParameterValueById(
                  'PARAM_MOUTH_OPEN_Y',
                  currentMouthOpen
                )
              }
            } catch (error) {
              // Silent error handling
            }
          }

          if (model && model.internalModel) {
            requestAnimationFrame(smoothMouthAnimation)
          }
        }

        const changeMouthExpression = () => {
          const now = Date.now()
          if (now - lastMouthExpressionTime > 4000) {
            const randomMouth =
              mouthExpressions[Math.floor(Math.random() * mouthExpressions.length)]

            targetMouthForm = randomMouth.mouth_form
            targetMouthOpen = randomMouth.mouth_open

            lastMouthExpressionTime = now
          }
        }

        // Start smooth mouth animation
        requestAnimationFrame(smoothMouthAnimation)

        // Setup mouth expression timer
        const mouthExpressionInterval = setInterval(changeMouthExpression, 500)

        // Setup random full face expressions (less frequent)
        const expressions = ['wtm.exp3.json', 'shy.exp3.json', 'scare.exp3.json']
        let lastExpressionTime = Date.now()

        const playRandomExpression = () => {
          const now = Date.now()
          if (now - lastExpressionTime > 8000) {
            const randomExpression =
              expressions[Math.floor(Math.random() * expressions.length)]
            try {
              if (model.expression) {
                try {
                  model.expression(null)
                } catch (resetError) {
                  // Silent error handling
                }

                setTimeout(() => {
                  try {
                    model.expression(randomExpression)

                    // Reset back to gentle smile after expression
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
                  } catch (delayedError) {
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

        // Setup expression timer
        const expressionInterval = setInterval(playRandomExpression, 1000)

        // Mouse tracking with damping for head, immediate for eyes
        let targetHeadX = 0
        let targetHeadY = 0
        let currentHeadX = 0
        let currentHeadY = 0

        const smoothHeadTracking = () => {
          const lerpFactor = 0.02

          const deltaX = targetHeadX - currentHeadX
          const deltaY = targetHeadY - currentHeadY
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

          if (distance > 0.05) {
            currentHeadX += deltaX * lerpFactor
            currentHeadY += deltaY * lerpFactor

            try {
              const coreModel = model.internalModel.coreModel as any
              if (
                coreModel &&
                typeof coreModel.setParameterValueById === 'function'
              ) {
                coreModel.setParameterValueById('PARAM_ANGLE_X', currentHeadX * 25)
                coreModel.setParameterValueById('PARAM_ANGLE_Y', -currentHeadY * 25)
              }
            } catch (error) {
              // Silent error handling
            }
          }

          if (model && model.internalModel) {
            requestAnimationFrame(smoothHeadTracking)
          }
        }

        const handleMouseMove = (e: MouseEvent) => {
          if (!model || !model.internalModel) return

          const rect = canvas.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height

          const mouseX = x - 0.5
          const mouseY = y - 0.5

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

        // Add touch event support for mobile
        const handleTouchMove = (e: TouchEvent) => {
          if (!model || !model.internalModel || e.touches.length === 0) return

          const touch = e.touches[0]
          const rect = canvas.getBoundingClientRect()
          const x = (touch.clientX - rect.left) / rect.width
          const y = (touch.clientY - rect.top) / rect.height

          const mouseX = x - 0.5
          const mouseY = y - 0.5

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

        // Add touch start/click support for mobile
        const handleTouchStart = (e: TouchEvent) => {
          if (!model || !model.internalModel || e.touches.length === 0) return

          const touch = e.touches[0]
          const rect = canvas.getBoundingClientRect()
          const x = (touch.clientX - rect.left) / rect.width
          const y = (touch.clientY - rect.top) / rect.height

          const mouseX = x - 0.5
          const mouseY = y - 0.5

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

        // Add click support for all devices
        const handleClick = (e: MouseEvent) => {
          if (!model || !model.internalModel) return

          const rect = canvas.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height

          const mouseX = x - 0.5
          const mouseY = y - 0.5

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

        // Check if it's mobile for different event strategies
        const isMobileDevice =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ) || window.innerWidth <= 768

        if (isMobileDevice) {
          // Mobile: use touch events
          canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
          canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
          canvas.addEventListener('click', handleClick)
        } else {
          // Desktop: use mouse events
          window.addEventListener('mousemove', handleMouseMove)
          canvas.addEventListener('click', handleClick)
        }

        // Start smooth head tracking animation
        requestAnimationFrame(smoothHeadTracking)

        // Store cleanup function
        const canvasElement = canvas // Store canvas reference for cleanup
        cleanupRef.current = () => {
          if (isMobileDevice) {
            canvasElement.removeEventListener('touchstart', handleTouchStart)
            canvasElement.removeEventListener('touchmove', handleTouchMove)
            canvasElement.removeEventListener('click', handleClick)
          } else {
            window.removeEventListener('mousemove', handleMouseMove)
            canvasElement.removeEventListener('click', handleClick)
          }
          clearInterval(expressionInterval)
          clearInterval(mouthExpressionInterval)
          if (appRef.current) {
            appRef.current.destroy(true, true)
            appRef.current = null
          }
          isInitializingRef.current = false
        }

        // Mark initialization as complete
        isInitializingRef.current = false
      } catch (error) {
        // Silent error handling but reset flag
        isInitializingRef.current = false
      }
    }

    initializeLive2D()

    // Cleanup on unmount or dependency change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [dimensions])

  // Helper function to load external scripts
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      document.head.appendChild(script)
    })
  }

  return (
    <Box
      ref={containerRef}
      width={{ base: '95vw', md: '60vw', lg: dimensions.width }}
      height={{ base: '80vh', md: '70vh', lg: dimensions.height }}
      maxWidth="100vw"
      maxHeight="100vh"
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
