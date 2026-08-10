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
  'lumaCutoff',
  'subcarrier',
  'chromaGain',
  'chromaBandwidth',
  'chromaDelay',
  'colourUnderPhase',
  'colourUnderGain',
  'saturation',
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
uniform float u_lumaCutoff;
uniform float u_subcarrier;
uniform float u_chromaGain;
uniform float u_chromaBandwidth;
uniform float u_chromaDelay;
uniform float u_colourUnderPhase;
uniform float u_colourUnderGain;
uniform float u_saturation;
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

const float PI = 3.14159265;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float sinc(float x) {
  return abs(x) < 1e-5 ? 1.0 : sin(PI * x) / (PI * x);
}

// Windowed sinc, so band-limiting behaves like band-limiting: everything under
// the cutoff stays sharp and the sidelobes ring. A gaussian has no sidelobes —
// it only smears, which is why the picture went soft without gaining the
// crispness a real band-limited signal keeps.
float lumaKernel(float n, float halfWidth) {
  float hamming = 0.54 + 0.46 * cos(PI * n / halfWidth);
  return u_lumaCutoff * sinc(u_lumaCutoff * n) * hamming;
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

// The subcarrier flips 180 degrees every line and walks through a four-field
// sequence, which is what turns residual chroma into a crawling dot pattern
// instead of a stationary texture.
float subcarrierPhase(float x, float line, float field) {
  return 2.0 * PI * (x * u_subcarrier + 0.5 * line + 0.25 * field);
}

// Encode a sample the way a composite signal carries it: one real-valued
// waveform with chroma riding on the subcarrier. Everything downstream reads
// this, so luma and chroma are genuinely sharing one channel and have to be
// separated back out imperfectly — which is the whole point.
float compositeAt(vec2 uv, float x, float line, float field, out float alpha) {
  vec4 sampled = texture(u_scene, uv);
  alpha = sampled.a;
  vec3 yiq = rgbToYiq(unpremultiply(sampled));
  float phase = subcarrierPhase(x, line, field);
  return yiq.x + u_chromaGain * (yiq.y * cos(phase) + yiq.z * sin(phase));
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
  float field = mod(tick, 4.0);
  float fragX = gl_FragCoord.x;

  // Luma recovery is just a low-pass over the composite. It sits close enough
  // to the subcarrier to leave some of it behind, and that residue is the
  // point: it crawls as dots, and on saturated colour — where the subcarrier
  // swings hardest — it lifts the brightness. That lift is why orange glows.
  float halfWidth = float((LUMA_TAPS - 1) / 2);
  float luma = 0.0;
  float lumaTotal = 0.0;
  for (int i = 0; i < LUMA_TAPS; i++) {
    float offset = float(i - (LUMA_TAPS - 1) / 2);
    float alpha;
    float composite = compositeAt(
      uv + vec2(offset * texel.x, 0.0), fragX + offset, line, field, alpha
    );
    float weight = lumaKernel(offset, halfWidth);
    luma += composite * weight * alpha;
    lumaTotal += weight * alpha;
  }
  // Sidelobes are negative, so the weights can cancel near a silhouette edge
  // where alpha masks most of the kernel. Fall back rather than divide by ~0.
  luma = abs(lumaTotal) > 1e-3 ? luma / lumaTotal : rgbToYiq(unpremultiply(centre)).x;

  // Chroma comes back by multiplying the composite against the subcarrier and
  // low-passing hard. The filter is wide because a tape's chroma bandwidth is
  // tiny, which is what makes colour run off the edges it belongs to.
  vec2 chroma = vec2(0.0);
  float chromaTotal = 0.0;
  for (int i = 0; i < CHROMA_TAPS; i++) {
    // The tap index drives the filter shape; the delay only moves where the
    // filter reads from. Folding the delay into both would centre the kernel
    // back on this pixel and cancel itself out.
    float tap = float(i - (CHROMA_TAPS - 1) / 2);
    float offset = tap - u_chromaDelay;
    float x = fragX + offset;
    float alpha;
    float composite = compositeAt(uv + vec2(offset * texel.x, 0.0), x, line, field, alpha);
    float phase = subcarrierPhase(x, line, field);
    float weight = exp(-0.5 * tap * tap / (u_chromaBandwidth * u_chromaBandwidth));
    chroma += vec2(composite * cos(phase), composite * sin(phase)) * weight * alpha;
    chromaTotal += weight * alpha;
  }
  // Doubled because multiplying two carriers halves the amplitude, and undoing
  // the gain applied at encode so saturation survives the round trip.
  chroma = chromaTotal > 0.0 ? chroma * 2.0 / (chromaTotal * u_chromaGain) : vec2(0.0);

  // Colour-under. A tape heterodynes chroma down to a low carrier to record it
  // and converts it back on playback, and an error in that oscillator's phase
  // rotates the recovered vector — a rotation in the I/Q plane is a hue shift,
  // so this is the error itself rather than an impression of it. Each line is
  // its own pass of the conversion, hence the banding; the sine term is the
  // slow servo wander that makes the bands drift instead of just fizzing.
  float hueError = (hash(vec2(line, tick + 53.0)) - 0.5) * u_colourUnderPhase;
  hueError += sin(line * 0.03 + u_time * 0.7) * u_colourUnderPhase * 0.4;
  float cs = cos(hueError);
  float sn = sin(hueError);
  chroma = vec2(cs * chroma.x - sn * chroma.y, sn * chroma.x + cs * chroma.y);

  // The same conversion is not level-stable either, so saturation breathes.
  chroma *= 1.0 + (hash(vec2(line, tick + 77.0)) - 0.5) * u_colourUnderGain;

  // Chroma AGC. A player pushes the recovered chroma back up because the tape
  // gave so much of it away, and it overshoots — which is the point. Saturated
  // colour ends up outside the gamut and clips on conversion, and that clip is
  // what reads as a glowing orange rather than a muted one.
  chroma *= u_saturation;

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
    gl.uniform1f(this._uniforms.lumaCutoff, LAppDefine.LumaCutoff);
    gl.uniform1f(this._uniforms.subcarrier, LAppDefine.SubcarrierFreq);
    gl.uniform1f(this._uniforms.chromaGain, LAppDefine.ChromaGain);
    gl.uniform1f(this._uniforms.chromaBandwidth, LAppDefine.ChromaBandwidth);
    gl.uniform1f(this._uniforms.chromaDelay, LAppDefine.ChromaDelay);
    gl.uniform1f(this._uniforms.colourUnderPhase, LAppDefine.ColourUnderPhase);
    gl.uniform1f(this._uniforms.colourUnderGain, LAppDefine.ColourUnderGain);
    gl.uniform1f(this._uniforms.saturation, LAppDefine.Saturation);
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
