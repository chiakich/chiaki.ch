/**
 * The tape model on raw WebGL2. Two fullscreen passes (see shaders.ts) plus the
 * targets they need, and nothing that knows what drew the source.
 *
 * Two ways in. Either hand it a texture per frame — an uploaded image, a video,
 * another renderer's output — or call `bind()` and draw into its own offscreen
 * target first, which is what a scene renderer that wants depth needs.
 */

import { buildNtscShaders } from './shaders'
import {
  NTSC_TAPE_KEYS,
  NTSC_TIME_WRAP,
  type NtscGeometry,
  type NtscParams,
  type NtscTape,
} from './params'

export type NtscPipelineOptions = {
  /** Allocate the offscreen target that `bind()` draws into. Off when the
   *  source arrives as a texture, which saves a full-size RGBA surface. */
  sceneTarget?: boolean
  /** Give that target a depth buffer. Cubism draws with DEPTH_TEST on. */
  depth?: boolean
}

export type NtscRenderOptions = {
  /** Source for pass one. Defaults to the offscreen target `bind()` fills. */
  source?: WebGLTexture | null
  /** Where the resolved frame lands. Defaults to the drawing buffer. */
  target?: WebGLFramebuffer | null
  /** Seconds. Defaults to the page clock. Wrapped to NTSC_TIME_WRAP either
   *  way — the hash in the shader cannot take an unbounded one. */
  time?: number
}

export class NtscPipeline {
  public constructor(params: NtscParams, options: NtscPipelineOptions = {}) {
    this._params = { ...params }
    this._options = { sceneTarget: true, depth: false, ...options }
  }

  public initialize(
    gl: WebGL2RenderingContext,
    width: number,
    height: number
  ): boolean {
    this._gl = gl

    // The intermediate signal carries signed chroma and luma that overshoots,
    // so a float target is the honest place to put it. Fall back to packing it
    // into 8 bits where rendering to float is unavailable.
    this._float = gl.getExtension('EXT_color_buffer_float') !== null

    const sources = buildNtscShaders(this._params, {
      encodeSignal: !this._float,
    })
    this._signalProgram = this.buildProgram(sources.vertex, sources.signal)
    this._playbackProgram = this.buildProgram(sources.vertex, sources.playback)
    if (!this._signalProgram || !this._playbackProgram) return false

    this._sceneLocation = gl.getUniformLocation(this._signalProgram, 'u_scene')
    this._signalTime = gl.getUniformLocation(this._signalProgram, 'u_time')
    this._signalPosition = gl.getAttribLocation(this._signalProgram, 'a_position')

    this._signalLocation = gl.getUniformLocation(this._playbackProgram, 'u_signal')
    this._historyLocation = gl.getUniformLocation(this._playbackProgram, 'u_history')
    this._playbackTime = gl.getUniformLocation(this._playbackProgram, 'u_time')
    for (const name of NTSC_TAPE_KEYS) {
      this._tapeUniforms[name] = gl.getUniformLocation(
        this._playbackProgram,
        `u_${name}`
      )
    }
    this._playbackPosition = gl.getAttribLocation(
      this._playbackProgram,
      'a_position'
    )

    this._quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quad)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    this._signalFramebuffer = gl.createFramebuffer()
    this._signalTexture = gl.createTexture()
    this._historyFramebuffer = gl.createFramebuffer()
    this._historyTexture = gl.createTexture()
    if (this._options.sceneTarget) {
      this._framebuffer = gl.createFramebuffer()
      this._texture = gl.createTexture()
      if (this._options.depth) this._depth = gl.createRenderbuffer()
    }
    this.resize(width, height)

    return true
  }

  /** Live tape settings. Geometry is compiled in, so it is not accepted here. */
  public setTape(tape: Partial<NtscTape>): void {
    Object.assign(this._params, tape)
  }

  public resize(width: number, height: number): void {
    const gl = this._gl
    if (!gl || (width === this._width && height === this._height)) return

    this._width = width
    this._height = height

    if (this._texture) {
      gl.bindTexture(gl.TEXTURE_2D, this._texture)
      // prettier-ignore
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      // LINEAR throughout, which sounds wrong for a pixel look but is what makes
      // the fractional sample offsets mean anything — NEAREST would snap every
      // tap back onto a texel centre and collapse the whole signal model.
      this.setSampling()
    }

    // RGBA16F is filterable in ES 3.0, so the vertical chroma blend can still
    // ride on linear interpolation here.
    gl.bindTexture(gl.TEXTURE_2D, this._signalTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this._float ? gl.RGBA16F : gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      this._float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
      null
    )
    this.setSampling()

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._signalFramebuffer)
    // prettier-ignore
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._signalTexture, 0)

    // Resolved frames are copied here after presentation and become the next
    // field's very short persistence trail.
    gl.bindTexture(gl.TEXTURE_2D, this._historyTexture)
    // prettier-ignore
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    this.setSampling()

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._historyFramebuffer)
    // prettier-ignore
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._historyTexture, 0)
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    if (this._framebuffer) {
      if (this._depth) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._depth)
        // prettier-ignore
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)
      // prettier-ignore
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0)
      if (this._depth) {
        // prettier-ignore
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depth)
      }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  }

  public getFramebuffer(): WebGLFramebuffer | null {
    return this._framebuffer
  }

  /** Point rendering at the offscreen target. */
  public bind(): void {
    const gl = this._gl
    if (!gl) return
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)
    gl.viewport(0, 0, this._width, this._height)
  }

  /** Resolve the source to the target as a tape playback. */
  public render(options: NtscRenderOptions = {}): void {
    const gl = this._gl
    if (!gl) return
    const time = (options.time ?? performance.now() / 1000.0) % NTSC_TIME_WRAP
    const source = options.source ?? this._texture
    const target = options.target ?? null

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quad)

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._signalFramebuffer)
    gl.viewport(0, 0, this._width, this._height)
    gl.useProgram(this._signalProgram)
    gl.enableVertexAttribArray(this._signalPosition)
    gl.vertexAttribPointer(this._signalPosition, 2, gl.FLOAT, false, 0, 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, source)
    gl.uniform1i(this._sceneLocation, 0)
    gl.uniform1f(this._signalTime, time)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.disableVertexAttribArray(this._signalPosition)

    gl.bindFramebuffer(gl.FRAMEBUFFER, target)
    gl.viewport(0, 0, this._width, this._height)
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(this._playbackProgram)
    gl.enableVertexAttribArray(this._playbackPosition)
    gl.vertexAttribPointer(this._playbackPosition, 2, gl.FLOAT, false, 0, 0)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this._signalTexture)
    gl.uniform1i(this._signalLocation, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this._historyTexture)
    gl.uniform1i(this._historyLocation, 1)

    gl.uniform1f(this._playbackTime, time)
    for (const name of NTSC_TAPE_KEYS) {
      gl.uniform1f(this._tapeUniforms[name] ?? null, this._params[name])
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3)

    // Copy the resolved, premultiplied frame after drawing. Reading the old
    // history and replacing it only after this pass avoids a feedback loop in
    // one draw call while retaining one field of analogue persistence.
    gl.bindTexture(gl.TEXTURE_2D, this._historyTexture)
    // prettier-ignore
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, this._width, this._height)

    gl.disableVertexAttribArray(this._playbackPosition)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.activeTexture(gl.TEXTURE0)
    gl.enable(gl.BLEND)
  }

  public release(): void {
    const gl = this._gl
    if (!gl) return

    gl.deleteFramebuffer(this._framebuffer)
    gl.deleteFramebuffer(this._signalFramebuffer)
    gl.deleteFramebuffer(this._historyFramebuffer)
    gl.deleteRenderbuffer(this._depth)
    gl.deleteTexture(this._texture)
    gl.deleteTexture(this._signalTexture)
    gl.deleteTexture(this._historyTexture)
    gl.deleteBuffer(this._quad)
    gl.deleteProgram(this._signalProgram)
    gl.deleteProgram(this._playbackProgram)

    this._framebuffer = null
    this._signalFramebuffer = null
    this._historyFramebuffer = null
    this._depth = null
    this._texture = null
    this._signalTexture = null
    this._historyTexture = null
    this._quad = null
    this._signalProgram = null
    this._playbackProgram = null
    this._gl = null
  }

  private setSampling(): void {
    const gl = this._gl
    if (!gl) return
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  private buildProgram(vertex: string, fragment: string): WebGLProgram | null {
    const gl = this._gl
    if (!gl) return null
    const header = '#version 300 es\n'

    const vertexShader = this.compile(gl.VERTEX_SHADER, header + vertex)
    const fragmentShader = this.compile(gl.FRAGMENT_SHADER, header + fragment)
    if (!vertexShader || !fragmentShader) return null

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`NTSC link failed: ${gl.getProgramInfoLog(program)}`)
      gl.deleteProgram(program)
      return null
    }

    return program
  }

  private compile(type: number, source: string): WebGLShader | null {
    const gl = this._gl
    if (!gl) return null
    const shader = gl.createShader(type)
    if (!shader) return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`NTSC compile failed: ${gl.getShaderInfoLog(shader)}`)
      gl.deleteShader(shader)
      return null
    }

    return shader
  }

  private readonly _params: NtscGeometry & NtscTape
  private readonly _options: NtscPipelineOptions
  private _gl: WebGL2RenderingContext | null = null
  private _float = false
  private _signalProgram: WebGLProgram | null = null
  private _playbackProgram: WebGLProgram | null = null
  private _framebuffer: WebGLFramebuffer | null = null
  private _signalFramebuffer: WebGLFramebuffer | null = null
  private _historyFramebuffer: WebGLFramebuffer | null = null
  private _texture: WebGLTexture | null = null
  private _signalTexture: WebGLTexture | null = null
  private _historyTexture: WebGLTexture | null = null
  private _depth: WebGLRenderbuffer | null = null
  private _quad: WebGLBuffer | null = null
  private _sceneLocation: WebGLUniformLocation | null = null
  private _signalLocation: WebGLUniformLocation | null = null
  private _historyLocation: WebGLUniformLocation | null = null
  private _signalTime: WebGLUniformLocation | null = null
  private _playbackTime: WebGLUniformLocation | null = null
  private _tapeUniforms: Partial<Record<keyof NtscTape, WebGLUniformLocation | null>> = {}
  private _signalPosition = -1
  private _playbackPosition = -1
  private _width = 0
  private _height = 0
}
