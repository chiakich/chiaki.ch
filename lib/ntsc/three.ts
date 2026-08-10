/**
 * The same tape model as a three.js pass, so a scene that is already being
 * rendered by three can go through it without a second WebGL context.
 *
 * The GLSL is the shared one in shaders.ts, unchanged — three only supplies the
 * quad, the render targets and the uniforms. It differs from pipeline.ts in one
 * mechanical way: rather than copying the drawing buffer back into a history
 * texture, the two history targets ping-pong and a blit puts the written one on
 * screen. Same result, one fewer full-surface copy.
 */

import {
  ClampToEdgeWrapping,
  GLSL3,
  HalfFloatType,
  LinearFilter,
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  RGBAFormat,
  Scene,
  UnsignedByteType,
  Vector2,
  WebGLRenderTarget,
  type Camera,
  type WebGLRenderer,
} from 'three'
import { buildNtscShaders } from './shaders'
import {
  NTSC_TAPE_KEYS,
  NTSC_TIME_WRAP,
  type NtscParams,
  type NtscTape,
} from './params'

// three's GLSL3 path injects nothing into a RawShaderMaterial, so the quad
// brings its own attribute. v_uv and the varying names match shaders.ts.
const QUAD_VERTEX = `
in vec3 position;
out vec2 v_uv;

void main() {
  v_uv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const BLIT_FRAGMENT = `
precision highp float;

uniform sampler2D u_source;

in vec2 v_uv;
out vec4 fragColor;

void main() {
  fragColor = texture(u_source, v_uv);
}
`

const colourTarget = (
  type: typeof UnsignedByteType | typeof HalfFloatType,
  depthBuffer = false
) =>
  new WebGLRenderTarget(1, 1, {
    format: RGBAFormat,
    type,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    depthBuffer,
  })

export class NtscThreePass {
  public constructor(params: NtscParams, renderer: WebGLRenderer) {
    this._params = { ...params }

    // Signed chroma and overshooting luma want a float target; where rendering
    // to one is unavailable the shader packs the signal into 8 bits instead.
    const float = renderer.extensions.has('EXT_color_buffer_float')
    this._signal = colourTarget(float ? HalfFloatType : UnsignedByteType)
    this._history = [colourTarget(UnsignedByteType), colourTarget(UnsignedByteType)]
    // The scene is drawn here, so this is the one target that needs depth.
    this._scene = colourTarget(UnsignedByteType, true)

    const sources = buildNtscShaders(this._params, { encodeSignal: !float })
    this._signalMaterial = new RawShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: QUAD_VERTEX,
      fragmentShader: sources.signal,
      uniforms: { u_scene: { value: null }, u_time: { value: 0 } },
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
    })
    this._playbackMaterial = new RawShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: QUAD_VERTEX,
      fragmentShader: sources.playback,
      uniforms: {
        u_signal: { value: null },
        u_history: { value: null },
        u_time: { value: 0 },
        ...Object.fromEntries(
          NTSC_TAPE_KEYS.map((name) => [`u_${name}`, { value: this._params[name] }])
        ),
      },
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
    })
    this._blitMaterial = new RawShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: QUAD_VERTEX,
      fragmentShader: BLIT_FRAGMENT,
      uniforms: { u_source: { value: null } },
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
    })

    this._quad = new Mesh(new PlaneGeometry(2, 2))
    this._quadScene = new Scene()
    this._quadScene.add(this._quad)
  }

  /** Live tape settings. Geometry is compiled in, so it is not accepted here. */
  public setTape(tape: Partial<NtscTape>): void {
    Object.assign(this._params, tape)
    for (const name of NTSC_TAPE_KEYS) {
      const uniform = this._playbackMaterial.uniforms[`u_${name}`]
      if (uniform) uniform.value = this._params[name]
    }
  }

  public setSize(width: number, height: number): void {
    if (width === this._size.x && height === this._size.y) return
    this._size.set(width, height)
    this._scene.setSize(width, height)
    this._signal.setSize(width, height)
    for (const target of this._history) target.setSize(width, height)
  }

  /** Draw the scene and resolve it to whatever the renderer is targeting. */
  public render(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    seconds: number
  ): void {
    // Wrapped, or the shader's hash walks out of float32 precision — see
    // NTSC_TIME_WRAP.
    const time = seconds % NTSC_TIME_WRAP
    const output = renderer.getRenderTarget()
    const [read, write] = this._history

    renderer.setRenderTarget(this._scene)
    renderer.clear()
    renderer.render(scene, camera)

    this._signalMaterial.uniforms.u_scene.value = this._scene.texture
    this._signalMaterial.uniforms.u_time.value = time
    this.draw(renderer, this._signalMaterial, this._signal)

    this._playbackMaterial.uniforms.u_signal.value = this._signal.texture
    this._playbackMaterial.uniforms.u_history.value = read.texture
    this._playbackMaterial.uniforms.u_time.value = time
    this.draw(renderer, this._playbackMaterial, write)

    this._blitMaterial.uniforms.u_source.value = write.texture
    this.draw(renderer, this._blitMaterial, output)

    // What was written this frame is the next frame's previous field.
    this._history = [write, read]
  }

  public dispose(): void {
    this._scene.dispose()
    this._signal.dispose()
    for (const target of this._history) target.dispose()
    this._signalMaterial.dispose()
    this._playbackMaterial.dispose()
    this._blitMaterial.dispose()
    this._quad.geometry.dispose()
  }

  private draw(
    renderer: WebGLRenderer,
    material: RawShaderMaterial,
    target: WebGLRenderTarget | null
  ): void {
    this._quad.material = material
    renderer.setRenderTarget(target)
    renderer.render(this._quadScene, this._camera)
  }

  private readonly _params: NtscParams
  private readonly _scene: WebGLRenderTarget
  private readonly _signal: WebGLRenderTarget
  private _history: WebGLRenderTarget[]
  private readonly _signalMaterial: RawShaderMaterial
  private readonly _playbackMaterial: RawShaderMaterial
  private readonly _blitMaterial: RawShaderMaterial
  private readonly _quad: Mesh
  private readonly _quadScene: Scene
  private readonly _camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private readonly _size = new Vector2(0, 0)
}
