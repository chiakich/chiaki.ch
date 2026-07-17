import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import {
  BufferGeometry,
  ClampToEdgeWrapping,
  Float32BufferAttribute,
  Mesh,
  Points,
  ShaderMaterial,
  TextureLoader,
  Vector2,
} from 'three'
import { Box } from 'styled-system/jsx'
import SnowHudOverlay from 'components/story/SnowHudOverlay'

const imageVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const imageFragmentShader = `
  uniform sampler2D uImage;
  uniform sampler2D uDepthMap;
  uniform vec2 uDrift;
  varying vec2 vUv;

  void main() {
    float depth = texture2D(uDepthMap, vUv).r;
    vec2 coverUv = vUv + uDrift * depth;
    vec3 color = texture2D(uImage, coverUv).rgb;
    float edge = smoothstep(0.9, 0.18, distance(vUv, vec2(0.5)));
    color *= mix(0.78, 1.03, edge);
    gl_FragColor = vec4(color, 1.0);
  }
`

const snowVertexShader = `
  uniform float uTime;
  uniform float uWind;
  attribute float aScale;
  attribute float aSpeed;
  attribute float aOpacity;
  attribute float aSeed;
  varying float vOpacity;

  void main() {
    vec3 pos = position;
    pos.y = mod(pos.y - uTime * aSpeed + 4.5, 9.0) - 4.5;
    pos.x += sin(uTime * (0.35 + aSeed * 0.45) + pos.y * 1.4 + aSeed * 9.0) * 0.16;
    pos.x += uWind * (1.6 + aSeed * 2.8);
    pos.y += uWind * sin(aSeed * 18.0 + uTime * 2.2) * 0.42;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * (145.0 / -mv.z) * (1.0 + uWind * 0.35);
    vOpacity = aOpacity * (0.86 + uWind * 0.14);
  }
`

const snowFragmentShader = `
  varying float vOpacity;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float shape = 1.0 - smoothstep(0.12, 0.5, d);
    gl_FragColor = vec4(0.95, 0.98, 1.0, shape * vOpacity);
  }
`

const AutonomousDepthImage = () => {
  const [imageTexture, depthTexture] = useLoader(TextureLoader, [
    '/assets/index/2x-2.webp',
    '/assets/index/2x-2-depthmap.webp',
  ])
  const materialRef = useRef<ShaderMaterial>(null!)
  const meshRef = useRef<Mesh>(null!)

  imageTexture.wrapS = imageTexture.wrapT = ClampToEdgeWrapping
  depthTexture.wrapS = depthTexture.wrapT = ClampToEdgeWrapping

  const uniforms = useMemo(
    () => ({
      uImage: { value: imageTexture },
      uDepthMap: { value: depthTexture },
      uDrift: { value: new Vector2() },
    }),
    [depthTexture, imageTexture]
  )

  useFrame(({ clock, viewport }) => {
    const time = clock.getElapsedTime()
    uniforms.uDrift.value.set(
      Math.sin(time * 1.28) * 0.0042 + Math.sin(time * 2.65) * 0.0018,
      Math.cos(time * 1.46) * 0.0032 + Math.sin(time * 3.08) * 0.0014
    )

    const imageAspect = imageTexture.image.width / imageTexture.image.height
    const viewportAspect = viewport.width / viewport.height
    const scaleX = viewportAspect > imageAspect ? viewport.width : viewport.height * imageAspect
    const scaleY = viewportAspect > imageAspect ? viewport.width / imageAspect : viewport.height
    meshRef.current.scale.set(scaleX * 1.055, scaleY * 1.055, 1)
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={imageVertexShader}
        fragmentShader={imageFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

const WindSnow = () => {
  const materialRef = useRef<ShaderMaterial>(null!)
  const pointsRef = useRef<Points>(null!)
  const count = 820

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scale = new Float32Array(count)
    const speed = new Float32Array(count)
    const opacity = new Float32Array(count)
    const seed = new Float32Array(count)

    for (let index = 0; index < count; index++) {
      positions[index * 3] = (Math.random() - 0.5) * 13
      positions[index * 3 + 1] = (Math.random() - 0.5) * 9
      positions[index * 3 + 2] = 0.2 + Math.random() * 3.85
      scale[index] = 0.22 + Math.random() * 0.52
      speed[index] = 0.1 + Math.random() * 0.26
      opacity[index] = 0.22 + Math.random() * 0.48
      seed[index] = Math.random()
    }

    const value = new BufferGeometry()
    value.setAttribute('position', new Float32BufferAttribute(positions, 3))
    value.setAttribute('aScale', new Float32BufferAttribute(scale, 1))
    value.setAttribute('aSpeed', new Float32BufferAttribute(speed, 1))
    value.setAttribute('aOpacity', new Float32BufferAttribute(opacity, 1))
    value.setAttribute('aSeed', new Float32BufferAttribute(seed, 1))
    return value
  }, [])

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uWind: { value: 0 } }),
    []
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const gust = Math.pow(Math.max(0, Math.sin(time * 0.31 - 0.9)), 9)
    uniforms.uTime.value = time
    uniforms.uWind.value += (gust - uniforms.uWind.value) * 0.035
  })

  return (
    <points ref={pointsRef} geometry={geometry} renderOrder={3}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={snowVertexShader}
        fragmentShader={snowFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </points>
  )
}

interface DepthScrollSectionProps {
  started?: boolean
}

const DepthScrollSection = ({ started = true }: DepthScrollSectionProps) => (
  <Box
    position="relative"
    height="100vh"
    minHeight="100svh"
    width="100%"
    overflow="hidden"
    backgroundColor="#0a1114"
    backgroundImage="url('/assets/index/2x-2.webp')"
    backgroundSize="cover"
    backgroundPosition="center"
  >
    <Canvas
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <AutonomousDepthImage />
        <WindSnow />
      </Suspense>
    </Canvas>

    {/* Lens: blurred, darkened edges (a soft frame that fades to sharp centre) */}
    <Box
      position="absolute"
      inset="0"
      pointerEvents="none"
      zIndex="2"
      backdropFilter="blur(7px)"
      style={{
        WebkitMaskImage:
          'radial-gradient(ellipse 62% 62% at 50% 50%, transparent 46%, black 88%)',
        maskImage:
          'radial-gradient(ellipse 62% 62% at 50% 50%, transparent 46%, black 88%)',
      }}
    />
    {/* Vignette: dark corners like a camera */}
    <Box
      position="absolute"
      inset="0"
      pointerEvents="none"
      zIndex="2"
      background="radial-gradient(ellipse 75% 75% at 50% 48%, transparent 42%, rgba(0,0,0,.55) 82%, rgba(0,0,0,.86) 100%)"
    />
    <SnowHudOverlay started={started} />
  </Box>
)

export default DepthScrollSection
