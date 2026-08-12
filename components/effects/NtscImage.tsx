// Any image, played back off a tape. The signal model is lib/ntsc, shared with
// the Live2D portrait; all this owns is the canvas, the upload and the clock.
//
// It renders into NTSC_LINES rows and lets CSS scale that back up — the line
// count is the tape's vertical resolution, so this is not a saving, it is the
// look. The passes are ~50 taps a pixel, and at that price the difference
// between 600 rows and a retina backing store is roughly eightfold.
import { useEffect, useRef, useState } from 'react'
import { styled } from 'styled-system/jsx'
import { NtscPipeline } from 'lib/ntsc/pipeline'
import { NTSC_FULL_FRAME, ntscSurfaceSize, type NtscParams } from 'lib/ntsc/params'

// Draws the source into the pipeline's target with a cover/contain transform,
// since the passes themselves sample straight across the surface.
const FIT_VERTEX = `#version 300 es
in vec2 a_position;
uniform vec2 u_scale;
uniform vec2 u_offset;
out vec2 v_uv;

void main() {
  v_uv = (a_position * 0.5 + 0.5 - 0.5) / u_scale + 0.5 + u_offset;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FIT_FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D u_image;

in vec2 v_uv;
out vec4 fragColor;

void main() {
  // Outside the image is empty signal, not black: the tape model reads alpha.
  if (v_uv.x < 0.0 || v_uv.x > 1.0 || v_uv.y < 0.0 || v_uv.y > 1.0) {
    fragColor = vec4(0.0);
    return;
  }
  fragColor = texture(u_image, v_uv);
}
`

type NtscImageProps = {
  src: string
  alt?: string
  /** Tape settings. Defaults to the opaque-source preset. */
  params?: NtscParams
  /** 'cover' crops to fill, 'contain' fits the whole image in. */
  fit?: 'cover' | 'contain'
  /** When cover crops vertically, pin the image to its top edge. */
  fitPosition?: 'center' | 'top'
  /** Fired once the source is on the GPU — there is no <img> to listen to. */
  onLoad?: () => void
  className?: string
}

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

const Surface = styled.canvas
const Frame = styled.div
const Fallback = styled.img

const NtscImage = ({
  src,
  alt = '',
  params = NTSC_FULL_FRAME,
  fit = 'cover',
  fitPosition = 'center',
  onLoad,
  className,
}: NtscImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglReady, setWebglReady] = useState(false)
  // Held in a ref so a caller passing an inline arrow does not tear the whole
  // context down and rebuild it on every render.
  const onLoadRef = useRef(onLoad)
  onLoadRef.current = onLoad

  useEffect(() => {
    setWebglReady(false)
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    })
    if (!gl || gl.isContextLost()) return undefined

    const pipeline = new NtscPipeline(params, { sceneTarget: true })
    if (!pipeline.initialize(gl, 1, 1)) return undefined

    const vertex = compile(gl, gl.VERTEX_SHADER, FIT_VERTEX)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FIT_FRAGMENT)
    const program = gl.createProgram()
    if (!vertex || !fragment || !program) return undefined
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`NTSC fit link failed: ${gl.getProgramInfoLog(program)}`)
      return undefined
    }
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const scaleLocation = gl.getUniformLocation(program, 'u_scale')
    const offsetLocation = gl.getUniformLocation(program, 'u_offset')
    const imageLocation = gl.getUniformLocation(program, 'u_image')

    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    // prettier-ignore
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // With motion reduced the tape stops rolling: one frame is drawn and the
    // artefacts hold still until something invalidates it.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let aspect = 1
    let loaded = false
    let visible = true
    let frame = 0

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(draw)
    }

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      aspect = image.naturalWidth / image.naturalHeight
      gl.bindTexture(gl.TEXTURE_2D, texture)
      // The model unpremultiplies before reading colour, and the shader's UV
      // origin is bottom-left, so both conversions happen on upload.
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      // prettier-ignore
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      loaded = true
      setWebglReady(true)
      schedule()
      onLoadRef.current?.()
    }
    image.src = src

    const resize = () => {
      const surface = ntscSurfaceSize(
        canvas.clientWidth,
        canvas.clientHeight,
        window.devicePixelRatio
      )
      canvas.width = surface.width
      canvas.height = surface.height
      pipeline.resize(surface.width, surface.height)
      schedule()
    }

    const draw = () => {
      frame = 0
      // Not loaded yet: keep the frame pending. Not visible: stop, and let the
      // observer wake it back up.
      if (!loaded) return schedule()
      if (!visible) return

      const surfaceAspect = canvas.width / canvas.height
      const wide = surfaceAspect > aspect
      const cover = fit === 'cover'
      const scaleX = wide === cover ? 1 : aspect / surfaceAspect
      const scaleY = wide === cover ? surfaceAspect / aspect : 1
      // The flipped texture's top edge is at the high end of the UV axis. Pin
      // there for a portrait crop so the face remains visible on wide screens.
      const offsetY = fitPosition === 'top' && scaleY > 1 ? (1 - 1 / scaleY) / 2 : 0

      pipeline.bind()
      gl.disable(gl.DEPTH_TEST)
      gl.disable(gl.BLEND)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(scaleLocation, scaleX, scaleY)
      gl.uniform2f(offsetLocation, 0, offsetY)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(imageLocation, 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      gl.disableVertexAttribArray(positionLocation)

      pipeline.render()
      if (!still) schedule()
    }

    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    // A tape off screen is a tape nobody is watching.
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      schedule()
    })
    intersection.observe(canvas)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      image.onload = null
      pipeline.release()
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      gl.deleteBuffer(quad)
      gl.deleteTexture(texture)
      // Deliberately not WEBGL_lose_context here. A lost context stays lost for
      // the element, and getContext hands the same dead object back — so under
      // StrictMode's mount/unmount/mount, or any remount that reuses the node,
      // the second pass would draw into nothing and the canvas would stay blank.
    }
  }, [fit, fitPosition, params, src])

  return (
    <Frame position="relative" width="100%" height="100%">
      {!webglReady && (
        <Fallback
          src={src}
          alt={alt}
          position="absolute"
          inset="0"
          width="100%"
          height="100%"
          display="block"
          objectFit={fit}
          objectPosition={fitPosition === 'top' ? 'top' : 'center'}
          onLoad={() => onLoadRef.current?.()}
        />
      )}
      <Surface
        ref={canvasRef}
        className={className}
        width="100%"
        height="100%"
        display="block"
        position="relative"
        opacity={webglReady ? 1 : 0}
        role={alt ? 'img' : 'presentation'}
        aria-label={alt || undefined}
      />
    </Frame>
  )
}

export default NtscImage
