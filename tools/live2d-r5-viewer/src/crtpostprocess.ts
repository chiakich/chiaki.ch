/**
 * VHS tape post pass.
 *
 * The scene is drawn into an offscreen target at the canvas' (already low)
 * resolution and read back as though it had been through a tape: luma and
 * chroma split, both band-limited horizontally and chroma far harder than luma,
 * chroma lagging behind luma, preemphasis ringing on edges, then tracking
 * jitter, grain and dropouts on top. Everything is horizontal because that is
 * the axis a tape is soft on — vertical resolution is fixed by the line count,
 * which is why VHS looks smeared sideways but keeps its scanlines.
 *
 * The stage list is modelled on ntsc-rs (https://ntsc.rs, Apache-2.0/MIT/ISC),
 * but these are cheap real-time approximations, not a port of its filters.
 *
 * One limitation worth knowing: the model is drawn on transparency, so noise
 * can only exist where she is. A real tape puts it across the whole frame.
 */

import * as LAppDefine from './lappdefine';

const UNIFORMS = [
  'time',
  'lumaBandwidth',
  'chromaBandwidth',
  'chromaDelay',
  'ring',
  'ringDecay',
  'knee',
  'grain',
  'chromaNoise',
  'jitter',
  'dropoutChance',
  'dropoutStrength',
  'headSwitchLines',
  'headSwitchShift',
] as const;

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_scene;
uniform float u_time;
uniform float u_lumaBandwidth;
uniform float u_chromaBandwidth;
uniform float u_chromaDelay;
uniform float u_ring;
uniform float u_ringDecay;
uniform float u_knee;
uniform float u_grain;
uniform float u_chromaNoise;
uniform float u_jitter;
uniform float u_dropoutChance;
uniform float u_dropoutStrength;
uniform float u_headSwitchLines;
uniform float u_headSwitchShift;

in vec2 v_uv;
out vec4 fragColor;

const int LUMA_TAPS = ${LAppDefine.LumaTaps};
const int CHROMA_TAPS = ${LAppDefine.ChromaTaps};
const int RING_TAPS = ${LAppDefine.RingTaps};

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Straight colour from a premultiplied sample — reading the premultiplied
// value would resolve every semi-transparent pixel as darker than it is.
vec3 unpremultiply(vec4 texel) {
  return texel.a > 0.0 ? texel.rgb / texel.a : vec3(0.0);
}

vec3 rgbToYiq(vec3 c) {
  return vec3(
    dot(c, vec3(0.299, 0.587, 0.114)),
    dot(c, vec3(0.5959, -0.2746, -0.3213)),
    dot(c, vec3(0.2115, -0.5227, 0.3112))
  );
}

vec3 yiqToRgb(vec3 c) {
  return vec3(
    dot(c, vec3(1.0, 0.956, 0.619)),
    dot(c, vec3(1.0, -0.272, -0.647)),
    dot(c, vec3(1.0, -1.106, 1.703))
  );
}

float lumaAt(vec2 uv) {
  return rgbToYiq(unpremultiply(texture(u_scene, uv))).x;
}

void main() {
  vec2 texel = 1.0 / vec2(textureSize(u_scene, 0));

  // The tape's noise field resamples at roughly field rate, not at whatever the
  // monitor happens to run at, so quantise time before seeding anything.
  float tick = floor(u_time * ${LAppDefine.NoiseRate.toFixed(1)});
  float line = floor(gl_FragCoord.y);

  // Head switching. gl_FragCoord.y counts from the bottom, which is where the
  // outgoing head loses contact, so the last few lines shear hard and lose
  // their colour. Squared, so the tear has a sharp boundary and not a ramp.
  float headSwitch = 0.0;
  if (gl_FragCoord.y < u_headSwitchLines) {
    float t = 1.0 - gl_FragCoord.y / u_headSwitchLines;
    headSwitch = t * t;
  }

  // Tracking error: each scanline reads back a hair early or late. Applied to
  // the sample position rather than the output, so her silhouette shears with
  // the line instead of the picture sliding inside a fixed outline.
  float jitter = (hash(vec2(line, tick)) - 0.5) * u_jitter;
  jitter += headSwitch * u_headSwitchShift * (0.6 + 0.8 * hash(vec2(line, tick + 17.0)));
  vec2 uv = v_uv + vec2(jitter * texel.x, 0.0);

  vec4 centre = texture(u_scene, uv);
  if (centre.a < 0.004) {
    fragColor = vec4(0.0);
    return;
  }

  // Luma is band-limited too, just far less than chroma. This is the whole
  // reason VHS looks soft sideways while staying crisp line to line.
  float luma = 0.0;
  float lumaTotal = 0.0;
  for (int i = 0; i < LUMA_TAPS; i++) {
    float offset = float(i - (LUMA_TAPS - 1) / 2);
    float weight = exp(-0.5 * offset * offset / (u_lumaBandwidth * u_lumaBandwidth));
    vec4 tap = texture(u_scene, uv + vec2(offset * texel.x, 0.0));
    luma += rgbToYiq(unpremultiply(tap)).x * weight * tap.a;
    lumaTotal += weight * tap.a;
  }
  luma = lumaTotal > 0.0 ? luma / lumaTotal : 0.0;

  // Chroma is squeezed much harder and lags behind luma, which is what makes
  // colour visibly run off the edges it belongs to. Taps are alpha-weighted so
  // the transparent surround does not drag her outline toward grey.
  vec2 chroma = vec2(0.0);
  float chromaTotal = 0.0;
  for (int i = 0; i < CHROMA_TAPS; i++) {
    float offset = float(i - (CHROMA_TAPS - 1) / 2);
    float weight = exp(-0.5 * offset * offset / (u_chromaBandwidth * u_chromaBandwidth));
    vec4 tap = texture(u_scene, uv + vec2((offset - u_chromaDelay) * texel.x, 0.0));
    chroma += rgbToYiq(unpremultiply(tap)).yz * weight * tap.a;
    chromaTotal += weight * tap.a;
  }
  chroma = chromaTotal > 0.0 ? chroma / chromaTotal : vec2(0.0);

  // Preemphasis ringing: each earlier point on the scanline echoes into this
  // one with alternating sign, leaving a fringe trailing a sharp edge rather
  // than a symmetric halo around it.
  // Both sides of the difference have to come from the same signal. Comparing
  // the band-limited luma against raw neighbours leaves the low-pass residual
  // in the echo, which is a positive bias across anything textured rather than
  // an edge term — it washed her face out.
  float raw = lumaAt(uv);
  float echo = 0.0;
  for (int i = 1; i <= RING_TAPS; i++) {
    float parity = mod(float(i), 2.0) < 0.5 ? -1.0 : 1.0;
    float previous = lumaAt(uv - vec2(float(i) * texel.x, 0.0));
    echo += parity * pow(u_ringDecay, float(i)) * (raw - previous);
  }
  luma += u_ring * echo;

  // Grain, weighted toward the shadows — tape noise sits in the darks, and
  // spreading it evenly is what makes fake VHS read as a photoshop overlay.
  float grain = hash(vec2(gl_FragCoord.x * 1.7 + line * 13.0, tick)) - 0.5;
  luma += grain * u_grain * mix(1.0, 0.25, clamp(luma, 0.0, 1.0))
        * (1.0 + headSwitch * 7.0);

  // Dropouts: a head loses contact and a short run of the line reads as a
  // bright scratch. Rare, per line, and gone by the next field.
  float dropoutSeed = hash(vec2(line * 3.0 + 7.0, tick));
  if (dropoutSeed < u_dropoutChance) {
    float start = hash(vec2(line, tick + 91.0));
    float span = 0.04 + 0.12 * hash(vec2(line + 5.0, tick));
    if (uv.x > start && uv.x < start + span) {
      luma += u_dropoutStrength;
      chroma *= 0.2;
    }
  }

  if (luma > u_knee) {
    float headroom = 1.0 - u_knee;
    luma = u_knee + headroom * (1.0 - exp(-(luma - u_knee) / headroom));
  }

  // Chroma noise is blotchier than luma noise because it survives a much
  // narrower filter, so seed it on a coarser grid.
  vec2 chromaSeed = floor(vec2(gl_FragCoord.x, line) / 4.0);
  chroma += vec2(
    hash(chromaSeed + vec2(tick, 0.0)) - 0.5,
    hash(chromaSeed + vec2(0.0, tick + 31.0)) - 0.5
  ) * u_chromaNoise;

  // Colour is the first thing a failing head gives up.
  chroma *= mix(1.0, 0.15, headSwitch);

  vec3 colour = yiqToRgb(vec3(luma, chroma));

  fragColor = vec4(clamp(colour, 0.0, 1.0) * centre.a, centre.a);
}
`;

export class CrtPostProcess {
  public initialize(
    gl: WebGL2RenderingContext,
    width: number,
    height: number
  ): boolean {
    this._gl = gl;

    this._program = this.buildProgram();
    if (!this._program) {
      return false;
    }

    this._sceneLocation = gl.getUniformLocation(this._program, 'u_scene');
    for (const name of UNIFORMS) {
      this._uniforms[name] = gl.getUniformLocation(this._program, `u_${name}`);
    }
    this._positionLocation = gl.getAttribLocation(this._program, 'a_position');

    this._quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this._framebuffer = gl.createFramebuffer();
    this._texture = gl.createTexture();
    this._depth = gl.createRenderbuffer();
    this.resize(width, height);

    return true;
  }

  public resize(width: number, height: number): void {
    const gl = this._gl;
    if (!gl || (width === this._width && height === this._height)) {
      return;
    }

    this._width = width;
    this._height = height;

    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    // LINEAR, which sounds wrong for a pixel look but is what makes the
    // sub-texel convergence offsets mean anything — NEAREST would snap them
    // back to the same texel. The pass is 1:1, so green still lands exactly on
    // texel centres and stays sharp; only the shifted channels interpolate.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Cubism draws with DEPTH_TEST on, so the target needs real depth.
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this._texture,
      0
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this._depth
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  public getFramebuffer(): WebGLFramebuffer {
    return this._framebuffer;
  }

  /** Point rendering at the offscreen target. */
  public bind(): void {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
    gl.viewport(0, 0, this._width, this._height);
  }

  /** Resolve the offscreen target to the canvas as a tape playback. */
  public render(): void {
    const gl = this._gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this._width, this._height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    gl.useProgram(this._program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._quad);
    gl.enableVertexAttribArray(this._positionLocation);
    gl.vertexAttribPointer(this._positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.uniform1i(this._sceneLocation, 0);
    gl.uniform1f(this._uniforms.time, performance.now() / 1000.0);
    gl.uniform1f(this._uniforms.lumaBandwidth, LAppDefine.LumaBandwidth);
    gl.uniform1f(this._uniforms.chromaBandwidth, LAppDefine.ChromaBandwidth);
    gl.uniform1f(this._uniforms.chromaDelay, LAppDefine.ChromaDelay);
    gl.uniform1f(this._uniforms.ring, LAppDefine.RingStrength);
    gl.uniform1f(this._uniforms.ringDecay, LAppDefine.RingDecay);
    gl.uniform1f(this._uniforms.knee, LAppDefine.HighlightKnee);
    gl.uniform1f(this._uniforms.grain, LAppDefine.TapeGrain);
    gl.uniform1f(this._uniforms.chromaNoise, LAppDefine.ChromaNoise);
    gl.uniform1f(this._uniforms.jitter, LAppDefine.TrackingJitter);
    gl.uniform1f(this._uniforms.dropoutChance, LAppDefine.DropoutChance);
    gl.uniform1f(this._uniforms.dropoutStrength, LAppDefine.DropoutStrength);
    gl.uniform1f(this._uniforms.headSwitchLines, LAppDefine.HeadSwitchLines);
    gl.uniform1f(this._uniforms.headSwitchShift, LAppDefine.HeadSwitchShift);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.disableVertexAttribArray(this._positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.enable(gl.BLEND);
  }

  public release(): void {
    const gl = this._gl;
    if (!gl) {
      return;
    }

    gl.deleteFramebuffer(this._framebuffer);
    gl.deleteRenderbuffer(this._depth);
    gl.deleteTexture(this._texture);
    gl.deleteBuffer(this._quad);
    gl.deleteProgram(this._program);

    this._framebuffer = null;
    this._depth = null;
    this._texture = null;
    this._quad = null;
    this._program = null;
    this._gl = null;
  }

  private buildProgram(): WebGLProgram {
    const gl = this._gl;

    const vertex = this.compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = this.compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) {
      return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        `CRT post-process link failed: ${gl.getProgramInfoLog(program)}`
      );
      gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  private compile(type: number, source: string): WebGLShader {
    const gl = this._gl;
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        `CRT post-process compile failed: ${gl.getShaderInfoLog(shader)}`
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private _gl: WebGL2RenderingContext = null;
  private _program: WebGLProgram = null;
  private _framebuffer: WebGLFramebuffer = null;
  private _texture: WebGLTexture = null;
  private _depth: WebGLRenderbuffer = null;
  private _quad: WebGLBuffer = null;
  private _sceneLocation: WebGLUniformLocation = null;
  private _uniforms: Record<string, WebGLUniformLocation> = {};
  private _positionLocation = -1;
  private _width = 0;
  private _height = 0;
}
