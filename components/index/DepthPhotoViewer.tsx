import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { View } from '@react-three/drei'
import { useRef, Suspense, useState, useEffect, useMemo } from 'react'
import {
  TextureLoader,
  Vector2,
  Mesh,
  ClampToEdgeWrapping,
  Float32BufferAttribute,
  Points,
  BufferGeometry,
  ShaderMaterial,
} from 'three'
import { Box } from '@chakra-ui/react'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uImage;
  uniform sampler2D uDepthMap;
  uniform vec2 uMouse;
  uniform float uThreshold;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    vec4 depth = texture2D(uDepthMap, uv);
    float displacement = depth.r * uThreshold;
    vec2 displacedUv = uv + uMouse * displacement;
    vec4 color = texture2D(uImage, displacedUv);

    gl_FragColor = color;
  }
`
const snowVertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  attribute float aScale;
  attribute float aSpeed;
  attribute float aOpacity;
  varying float vOpacity;
  void main() {
    vec3 pos = position;
    // Animate falling
    pos.y = mod(pos.y - uTime * aSpeed, 20.0) - 10.0;
    // Add parallax effect based on depth (z)
    pos.xy += uMouse * pos.z * 2.0;
    vec4 modelViewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
    gl_PointSize = aScale * (200.0 / -modelViewPosition.z);
    vOpacity = aOpacity;
  }
`

const snowFragmentShader = `
  varying float vOpacity;
  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    // A wider range in smoothstep creates a blurrier edge
    float strength = 1.0 - smoothstep(0.1, 0.5, distanceToCenter);
    gl_FragColor = vec4(1.0, 1.0, 1.0, strength * vOpacity);
  }
`

function Snow() {
  const pointsRef = useRef<Points>(null!)
  const materialRef = useRef<ShaderMaterial>(null!)

  const [isMobile, setIsMobile] = useState(false)
  const orientation = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const checkMobile = /Mobi|Android/i.test(navigator.userAgent)
    if (checkMobile) {
      setIsMobile(true)
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.gamma === null || event.beta === null) return

        const gamma = Math.max(-45, Math.min(45, event.gamma)) // left-to-right tilt
        const beta = Math.max(-45, Math.min(45, event.beta)) // front-to-back tilt

        const isPortrait = window.innerHeight > window.innerWidth

        // Remap tilt to camera offset
        if (isPortrait) {
          orientation.current.x = -gamma / 45
          orientation.current.y = -beta / 45
        } else {
          orientation.current.x = -beta / 45
          orientation.current.y = -gamma / 45
        }
      }
      window.addEventListener('deviceorientation', handleOrientation)
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [])

  const particles = useMemo(() => {
    const count = 5000
    const positions = new Float32Array(count * 3)
    const attributes = new Float32Array(count * 3) // scale, speed, opacity

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      attributes[i * 3] = Math.random() * 0.5 + 0.2 // scale
      attributes[i * 3 + 1] = Math.random() * 0.4 + 0.2 // speed
      attributes[i * 3 + 2] = Math.random() * 0.5 + 0.2 // opacity
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geometry.setAttribute(
      'aScale',
      new Float32BufferAttribute(
        attributes.filter((_, i) => i % 3 === 0),
        1
      )
    )
    geometry.setAttribute(
      'aSpeed',
      new Float32BufferAttribute(
        attributes.filter((_, i) => i % 3 === 1),
        1
      )
    )
    geometry.setAttribute(
      'aOpacity',
      new Float32BufferAttribute(
        attributes.filter((_, i) => i % 3 === 2),
        1
      )
    )
    return geometry
  }, [])

  useFrame(({ clock, mouse }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()

      const uniform = materialRef.current.uniforms.uMouse.value
      const intensity = 0.05
      let targetX, targetY

      if (isMobile) {
        targetX = orientation.current.x * intensity
        targetY = orientation.current.y * intensity
      } else {
        targetX = mouse.x * intensity
        targetY = mouse.y * intensity
      }
      // Ease the movement
      const easeFactor = 0.1
      uniform.x += (targetX - uniform.x) * easeFactor
      uniform.y += (targetY - uniform.y) * easeFactor
    }
  })

  return (
    <points ref={pointsRef} geometry={particles}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={snowVertexShader}
        fragmentShader={snowFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new Vector2(0, 0) },
        }}
        transparent
        depthWrite={false}
      />
    </points>
  )
}

function DepthImage() {
  const [imageTexture, depthTexture] = useLoader(TextureLoader, [
    '/assets/index/2x-2.jpg',
    '/assets/index/2x-2-depthmap.jpg',
  ])

  // Set textures to clamp to edge to prevent artifacts from displacement
  imageTexture.wrapS = imageTexture.wrapT = ClampToEdgeWrapping
  depthTexture.wrapS = depthTexture.wrapT = ClampToEdgeWrapping

  const shaderRef = useRef<any>()
  const meshRef = useRef<Mesh>(null!)

  const [isMobile, setIsMobile] = useState(false)
  const orientation = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const checkMobile = /Mobi|Android/i.test(navigator.userAgent)
    if (checkMobile) {
      setIsMobile(true)
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.gamma === null || event.beta === null) return

        const gamma = Math.max(-45, Math.min(45, event.gamma)) // left-to-right tilt
        const beta = Math.max(-45, Math.min(45, event.beta)) // front-to-back tilt

        const isPortrait = window.innerHeight > window.innerWidth

        // Remap tilt to camera offset
        if (isPortrait) {
          orientation.current.x = -gamma / 45
          orientation.current.y = -beta / 45
        } else {
          orientation.current.x = -beta / 45
          orientation.current.y = -gamma / 45
        }
      }
      window.addEventListener('deviceorientation', handleOrientation)
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [])

  useFrame(({ mouse, viewport }) => {
    const { width, height } = viewport
    if (shaderRef.current) {
      const uniform = shaderRef.current.uniforms.uMouse.value
      const intensity = 0.1
      let targetX, targetY

      if (isMobile) {
        targetX = orientation.current.x * intensity
        targetY = orientation.current.y * intensity
      } else {
        targetX = mouse.x * intensity
        targetY = mouse.y * intensity
      }

      // Ease the movement
      const easeFactor = 0.1
      uniform.x += (targetX - uniform.x) * easeFactor
      uniform.y += (targetY - uniform.y) * easeFactor
    }

    // Calculate scale to cover viewport while maintaining aspect ratio
    const imageAspect = imageTexture.image.width / imageTexture.image.height
    const viewportAspect = width / height

    let scaleX, scaleY
    if (viewportAspect > imageAspect) {
      // Viewport is wider, scale to fit width
      scaleX = width
      scaleY = width / imageAspect
    } else {
      // Viewport is taller, scale to fit height
      scaleX = height * imageAspect
      scaleY = height
    }

    meshRef.current.scale.set(scaleX, scaleY, 1)
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uImage: { value: imageTexture },
          uDepthMap: { value: depthTexture },
          uMouse: { value: new Vector2(0, 0) },
          uThreshold: { value: 0.1 },
        }}
      />
    </mesh>
  )
}

const DepthPhotoViewer = () => {
  const viewRef = useRef<HTMLDivElement>(null!)

  return (
    <Box position="relative" height="200vh" width="100%">
      <Box ref={viewRef} position="sticky" top="0" height="100vh" width="100%" />
      <Canvas
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
        eventSource={viewRef}
      >
        <View track={viewRef}>
          <Suspense fallback={null}>
            <DepthImage />
            <Snow />
          </Suspense>
        </View>
      </Canvas>
    </Box>
  )
}

export default DepthPhotoViewer
