/**
 * VHS tape post pass, in two passes.
 *
 * The scene is drawn into an offscreen target and read back as though it had
 * been through a tape. Pass one encodes it as a composite waveform on an fs/4
 * subcarrier and decodes it straight back out, which is where the luma/chroma
 * cross-talk comes from. Pass two plays that signal back: band-limit chroma far
 * harder than luma and only horizontally, lag it, then tracking jitter, grain
 * and dropouts. Horizontal because that is the axis a tape is soft on —
 * vertical resolution is the line count, which is why VHS smears sideways but
 * keeps its scanlines.
 *
 * The split exists for a budget reason. A tape's chroma bandwidth is ~0.3 MHz
 * out of a 14.3 MHz clock, so the chroma kernel has to span around forty
 * samples; recomputing the composite inside a kernel that long is unaffordable,
 * so pass one computes it once per sample and writes YIQ for pass two to filter.
 *
 * Modelled on ntsc-rs (https://ntsc.rs, Apache-2.0/MIT/ISC) — its stage order,
 * its units and its constants — but these are real-time approximations, not a
 * port. The notable ones: its filters are causal IIR evaluated sequentially
 * along each scanline, which a fragment shader cannot do, so they are truncated
 * one-sided FIR kernels using the analytic impulse response of a cascade of
 * single poles, where ntsc-rs defaults to Butterworth; and its chroma lowpass
 * runs three times in a cascade where this runs once. Because those two differ
 * in shape, the cutoffs in lappdefine are fitted to the step response of
 * ntsc-rs' chain rather than copied from it — see the comments there.
 *
 * One limitation worth knowing: the model is drawn on transparency, so noise
 * can only exist where she is. A real tape puts it across the whole frame.
 */

import * as LAppDefine from './lappdefine';

const SIGNAL_UNIFORMS = ['time'] as const;

const PLAYBACK_UNIFORMS = [
  'history',
  'time',
  'chromaCutI',
  'chromaCutQ',
  'chromaLag',
  'lumaCut',
  'lumaLag',
  'lumaEdge',
  'sharpening',
  'saturation',
  'spillDecay',
  'phaseNoise',
  'gainNoise',
  'chromaLoss',
  'chromaNoise',
  'chromaNoiseScale',
  'grain',
  'snowChance',
  'snowStrength',
  'knee',
  'jitter',
  'dropoutChance',
  'dropoutStrength',
  'headSwitchLines',
  'headSwitchShift',
  'historyMix',
  'historyShift',
] as const;

const VERTEX_SHADER = `
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** Shared by both passes: signal geometry, colour matrices, noise. */
const COMMON = `
precision highp float;

const float PI = 3.14159265;

// One active scanline is this many samples of a clock running at four times the
// colour subcarrier. Every cutoff below is in MHz against that clock, so the
// look no longer depends on how wide the canvas happens to be.
const float SIGNAL_WIDTH = ${(
  LAppDefine.NtscSamplesPerLine * LAppDefine.HorizontalScale
).toFixed(2)};
const float SAMPLE_RATE = ${(
  LAppDefine.NtscSampleRate * LAppDefine.HorizontalScale
).toFixed(5)};
const float FIELD_RATE = ${LAppDefine.FieldRate.toFixed(1)};
const float NOISE_RATE = ${LAppDefine.NoiseRate.toFixed(1)};

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Straight colour from a premultiplied sample — reading the premultiplied
// value would resolve every semi-transparent pixel as darker than it is.
vec3 unpremultiply(vec4 texel) {
  return texel.a > 0.0 ? texel.rgb / texel.a : vec3(0.0);
}

// FCC YIQ, the same pair ntsc-rs uses. Applied to gamma-encoded values on
// purpose: YIQ is defined on R'G'B', so there is no linearisation anywhere here.
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

// The subcarrier advances a quarter cycle per sample, flips 180 degrees every
// line and flips again every field. Both alternations are what turn residual
// chroma into a crawling dot pattern instead of a stationary texture.
float carrier(float x, float line, float field) {
  return 0.5 * PI * (x + 2.0 * mod(line + field, 2.0));
}

#ifdef ENCODED_SIGNAL
// No float render targets available, so the intermediate signal is packed into
// 8 bits. Y needs headroom for edge overshoot and I/Q are signed. Quantisation
// lands around 0.01, which is below the grain and chroma noise added later.
vec4 encodeSignal(vec4 s) {
  return vec4(s.x * 0.5 + 0.25, s.y * 0.4 + 0.5, s.z * 0.4 + 0.5, s.w);
}

vec4 decodeSignal(vec4 s) {
  return vec4((s.x - 0.25) * 2.0, (s.y - 0.5) * 2.5, (s.z - 0.5) * 2.5, s.w);
}
#else
vec4 encodeSignal(vec4 s) { return s; }
vec4 decodeSignal(vec4 s) { return s; }
#endif
`;

/**
 * Pass one. Modulate onto the subcarrier and demodulate straight back, so luma
 * and chroma genuinely share one channel and have to be separated imperfectly.
 */
const SIGNAL_SHADER = `
uniform sampler2D u_scene;
uniform float u_time;

in vec2 v_uv;
out vec4 fragColor;

// This window's bandwidth is the width of the notch that comes out of luma
// below, so it decides how much horizontal detail survives — see DemodTaps.
const int DEMOD_TAPS = ${LAppDefine.DemodTaps};
const int DEMOD_HALF = ${(LAppDefine.DemodTaps - 1) / 2};

void main() {
  float sampleStep = 1.0 / SIGNAL_WIDTH;
  float x = v_uv.x * SIGNAL_WIDTH;
  float line = floor(gl_FragCoord.y);
  float field = mod(floor(u_time * FIELD_RATE), 2.0);

  vec2 projected = vec2(0.0);
  vec2 carrierSum = vec2(0.0);
  float compositeSum = 0.0;
  float total = 0.0;
  float centre = 0.0;
  float centreAlpha = 0.0;

  for (int i = 0; i < DEMOD_TAPS; i++) {
    float n = float(i - DEMOD_HALF);
    vec4 texel = texture(u_scene, vec2(v_uv.x + n * sampleStep, v_uv.y));
    vec3 yiq = rgbToYiq(unpremultiply(texel));
    float phase = carrier(x + n, line, field);

    // One real-valued waveform with chroma riding on the subcarrier, exactly as
    // a composite signal carries it.
    float composite = yiq.x + yiq.y * cos(phase) + yiq.z * sin(phase);

    // Alpha-weighted, so a silhouette edge does not average in the black of the
    // transparent pixels beside it.
    float weight = (0.54 + 0.46 * cos(PI * n / float(DEMOD_HALF))) * texel.a;
    vec2 axis = vec2(cos(phase), sin(phase));
    projected += composite * axis * weight;
    carrierSum += axis * weight;
    compositeSum += composite * weight;
    total += weight;

    if (i == DEMOD_HALF) {
      centre = composite;
      centreAlpha = texel.a;
    }
  }

  // Take the window's own response to a constant off before projecting onto the
  // carrier. The window does not sum to zero against the subcarrier, so without
  // this it leaks luma into chroma — and subtracting that back out below then
  // darkened every flat area by a few percent. Doubled because multiplying
  // against the carrier a second time halves the amplitude.
  vec2 chroma = vec2(0.0);
  if (total > 1e-4) {
    chroma = 2.0 * (projected - (compositeSum / total) * carrierSum) / total;
  }

  // Luma is the composite with the recovered subcarrier taken back out — a
  // notch exactly as wide as the demodulator. Chroma detail finer than that
  // stays behind, which is both the dot crawl and the brightness lift that
  // makes saturated colour read as glowing.
  float phase = carrier(x, line, field);
  float luma = centre - (chroma.x * cos(phase) + chroma.y * sin(phase));

  fragColor = encodeSignal(vec4(luma, chroma, centreAlpha));
}
`;

/** Pass two. Play the signal back off a tape. */
const PLAYBACK_SHADER = `
uniform sampler2D u_signal;
uniform sampler2D u_history;
uniform float u_time;
uniform float u_chromaCutI;
uniform float u_chromaCutQ;
uniform float u_chromaLag;
uniform float u_lumaCut;
uniform float u_lumaLag;
uniform float u_lumaEdge;
uniform float u_sharpening;
uniform float u_saturation;
uniform float u_spillDecay;
uniform float u_phaseNoise;
uniform float u_gainNoise;
uniform float u_chromaLoss;
uniform float u_chromaNoise;
uniform float u_chromaNoiseScale;
uniform float u_grain;
uniform float u_snowChance;
uniform float u_snowStrength;
uniform float u_knee;
uniform float u_jitter;
uniform float u_dropoutChance;
uniform float u_dropoutStrength;
uniform float u_headSwitchLines;
uniform float u_headSwitchShift;
uniform float u_historyMix;
uniform float u_historyShift;

in vec2 v_uv;
out vec4 fragColor;

const int LUMA_TAPS = ${LAppDefine.LumaTaps};
const int CHROMA_TAPS = ${LAppDefine.ChromaTaps};
const float CHROMA_STRIDE = ${LAppDefine.ChromaTapStride.toFixed(1)};

// Coefficient of a single-pole RC lowpass at this cutoff, in samples.
float poleAlpha(float cutoffMHz) {
  float tau = SAMPLE_RATE / (2.0 * PI * cutoffMHz);
  return 1.0 / (tau + 1.0);
}

// Impulse response of three of those cascaded — ntsc-rs' constant-k filter.
// One-sided, which is the point: a causal filter smears content rightward,
// where a symmetric kernel would only blur it evenly and read as a gaussian.
float poleKernel3(float alpha, float k) {
  return alpha * alpha * alpha * (k + 1.0) * (k + 2.0) * 0.5
    * pow(1.0 - alpha, k);
}

// Six of them, for the second, wider luma tap set the edge term needs.
float poleKernel6(float alpha, float k) {
  return pow(alpha, 6.0)
    * (k + 1.0) * (k + 2.0) * (k + 3.0) * (k + 4.0) * (k + 5.0) / 120.0
    * pow(1.0 - alpha, k);
}

// Mean group delay of the triple pole, so the filter can be centred back on
// the sample it belongs to.
float poleDelay3(float alpha) {
  return 3.0 * (1.0 - alpha) / alpha;
}

float smoothNoise(float x, float seed) {
  float cell = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(vec2(cell, seed)), hash(vec2(cell + 1.0, seed)), f) - 0.5;
}

void main() {
  vec2 texel = 1.0 / vec2(textureSize(u_signal, 0));
  float sampleStep = 1.0 / SIGNAL_WIDTH;
  float line = floor(gl_FragCoord.y);

  // The tape's noise field resamples at roughly field rate, not at whatever the
  // monitor happens to run at, so quantise time before seeding anything.
  float tick = floor(u_time * NOISE_RATE);

  // Head switching. gl_FragCoord.y counts from the bottom, which is where the
  // outgoing head loses contact, so the last few lines shear hard and lose
  // their colour. Squared, so the tear has a sharp boundary and not a ramp.
  float headSwitch = 0.0;
  if (gl_FragCoord.y < u_headSwitchLines) {
    float t = 1.0 - gl_FragCoord.y / u_headSwitchLines;
    headSwitch = t * t;
  }

  // Tracking error: each scanline reads back a hair early or late. Applied to
  // the read position rather than the output, so her silhouette shears with the
  // line instead of the picture sliding inside a fixed outline.
  float jitter = (hash(vec2(line, tick)) - 0.5) * u_jitter;
  jitter += headSwitch * u_headSwitchShift
    * (0.6 + 0.8 * hash(vec2(line, tick + 17.0)));
  vec2 uv = v_uv + vec2(jitter * sampleStep, 0.0);

  vec4 centre = decodeSignal(texture(u_signal, uv));
  float sourceMask = smoothstep(0.02, 0.14, centre.a);

  // --- Luma: the VHS band-limit, then part of the edge put back ---
  //
  // Both tap sets share one fetch. The wide one lags further than the narrow
  // one, so their difference is an edge term skewed rightward — which is how
  // the bright fringe ends up trailing a dark-to-light edge rather than
  // haloing it symmetrically.
  float alphaY = poleAlpha(u_lumaCut);
  float delayY = poleDelay3(alphaY) - u_lumaLag;
  float narrow = 0.0;
  float wide = 0.0;
  float narrowTotal = 0.0;
  float wideTotal = 0.0;
  for (int i = 0; i < LUMA_TAPS; i++) {
    float k = float(i);
    vec4 s = decodeSignal(
      texture(u_signal, vec2(uv.x + (delayY - k) * sampleStep, uv.y))
    );
    float narrowWeight = poleKernel3(alphaY, k) * s.a;
    float wideWeight = poleKernel6(alphaY, k) * s.a;
    narrow += s.x * narrowWeight;
    wide += s.x * wideWeight;
    narrowTotal += narrowWeight;
    wideTotal += wideWeight;
  }
  float luma = narrowTotal > 1e-4 ? narrow / narrowTotal : centre.x;
  // Masked to painted pixels. Off the silhouette both kernels normalise over
  // whatever alpha their taps happened to reach, so their difference stops being
  // an edge term and just amplifies the brightest thing in range.
  if (wideTotal > 1e-4) {
    luma += u_lumaEdge * (luma - wide / wideTotal) * sourceMask;
  }

  // --- Chroma: band-limited to a fraction of luma's, and late ---
  //
  // Half a texel up, which is chroma_vert_blend for free: with linear
  // filtering, a sample on the boundary between two rows *is* their average.
  // Only chroma gets it — a tape's vertical chroma resolution is half its luma
  // resolution, and blending luma the same way would just soften the drawing.
  float alphaI = poleAlpha(u_chromaCutI);
  float alphaQ = poleAlpha(u_chromaCutQ);
  float delayC = poleDelay3(alphaI) - u_chromaLag;
  float blendRow = uv.y - 0.5 * texel.y;
  vec2 chroma = vec2(0.0);
  vec2 chromaTotal = vec2(0.0);

  // A real composite signal has no alpha channel. The model does, so build a
  // matte from the chroma kernel itself: colour is allowed to escape the
  // silhouette instead of every fringe clipping to nothing at the edge.
  float signalAlpha = centre.a;

  for (int i = 0; i < CHROMA_TAPS; i++) {
    float k = float(i) * CHROMA_STRIDE;
    vec4 s = decodeSignal(
      texture(u_signal, vec2(uv.x + (delayC - k) * sampleStep, blendRow))
    );
    vec2 weight = vec2(poleKernel3(alphaI, k), poleKernel3(alphaQ, k)) * s.a;
    chroma += s.yz * weight;
    chromaTotal += weight;
    signalAlpha = max(signalAlpha, s.a * exp(-k * u_spillDecay));
  }
  chroma = vec2(
    chromaTotal.x > 1e-5 ? chroma.x / chromaTotal.x : 0.0,
    chromaTotal.y > 1e-5 ? chroma.y / chromaTotal.y : 0.0
  );

  // Colour-under. A tape heterodynes chroma down to a low carrier to record it
  // and converts it back on playback; an error in that oscillator's phase
  // rotates the recovered vector, and a rotation in the I/Q plane is a hue
  // shift. Each line is its own pass of the conversion, hence the banding; the
  // sine term is the slow servo wander that makes the bands drift.
  float hueError = (hash(vec2(line, tick + 53.0)) - 0.5) * u_phaseNoise;
  hueError += sin(line * 0.03 + u_time * 0.7) * u_phaseNoise * 0.4;
  float cs = cos(hueError);
  float sn = sin(hueError);
  chroma = vec2(cs * chroma.x - sn * chroma.y, sn * chroma.x + cs * chroma.y);

  // The same conversion is not level-stable either, so saturation breathes.
  chroma *= 1.0 + (hash(vec2(line, tick + 77.0)) - 0.5) * u_gainNoise;

  // Composite sharpening. The high-pass is applied to the composite waveform
  // before demodulation, where its gain at the subcarrier is essentially flat,
  // so on this side of the decoder it is a chroma gain — the frequency-domain
  // equivalent, at a fraction of the cost. This is where the saturation comes
  // from; the AGC that follows is nearly unity on purpose.
  chroma *= (1.0 + u_sharpening * 0.94) * u_saturation;

  // The colour-under carrier drops out entirely on the odd line.
  if (hash(vec2(line * 5.0 + 3.0, tick + 131.0)) < u_chromaLoss) {
    chroma = vec2(0.0);
  }

  // Chroma noise survives a filter an order of magnitude narrower than luma's,
  // so it arrives as slow blotches. Two octaves, per line, like ntsc-rs'.
  float noiseX = v_uv.x * SIGNAL_WIDTH / u_chromaNoiseScale;
  float noiseSeed = line * 7.0 + tick * 31.0;
  chroma += vec2(
    smoothNoise(noiseX, noiseSeed) + 0.5 * smoothNoise(noiseX * 2.3, noiseSeed + 11.0),
    smoothNoise(noiseX, noiseSeed + 97.0) + 0.5 * smoothNoise(noiseX * 2.3, noiseSeed + 173.0)
  ) * u_chromaNoise * sourceMask;

  // Colour is the first thing a failing head gives up.
  chroma *= mix(1.0, 0.15, headSwitch);

  // Grain, weighted toward the shadows — tape noise sits in the darks, and
  // spreading it evenly is what makes fake VHS read as a photoshop overlay.
  float grain = hash(vec2(gl_FragCoord.x * 1.7 + line * 13.0, tick)) - 0.5;
  luma += grain * u_grain * mix(1.0, 0.25, clamp(luma, 0.0, 1.0))
    * (1.0 + headSwitch * 7.0) * sourceMask;

  // Snow: the head reads pure noise for a sample or two.
  if (sourceMask > 0.0
      && hash(vec2(gl_FragCoord.x * 3.0 + line * 71.0, tick + 211.0))
        < u_snowChance) {
    luma += u_snowStrength;
  }

  // Dropouts: a head loses contact and a short run of the line reads as a
  // bright scratch. Rare, per line, and gone by the next field.
  float dropoutSeed = hash(vec2(line * 3.0 + 7.0, tick));
  if (sourceMask > 0.0 && dropoutSeed < u_dropoutChance) {
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

  vec3 colour = clamp(yiqToRgb(vec3(luma, chroma)), 0.0, 1.0);

  // NTSC is field-based. Pull a weak, oppositely shifted copy of the last field
  // from the history texture. New signal always wins, so this reads as
  // persistence on movement rather than a permanently translucent duplicate.
  float field = mod(floor(u_time * FIELD_RATE), 2.0);
  float fieldShift = field < 0.5 ? -u_historyShift : u_historyShift;
  vec4 history = texture(u_history, v_uv + vec2(fieldShift * texel.x, 0.0));
  float historyAlpha = history.a * u_historyMix;
  float remaining = 1.0 - signalAlpha;
  float alpha = signalAlpha + historyAlpha * remaining;
  vec3 premultiplied = colour * signalAlpha
    + unpremultiply(history) * historyAlpha * remaining;

  fragColor = vec4(premultiplied, alpha);
}
`;

export class CrtPostProcess {
  public initialize(
    gl: WebGL2RenderingContext,
    width: number,
    height: number
  ): boolean {
    this._gl = gl;

    // The intermediate signal carries signed chroma and luma that overshoots,
    // so a float target is the honest place to put it. Fall back to packing it
    // into 8 bits where rendering to float is unavailable.
    this._float = gl.getExtension('EXT_color_buffer_float') !== null;

    this._signalProgram = this.buildProgram(SIGNAL_SHADER);
    this._playbackProgram = this.buildProgram(PLAYBACK_SHADER);
    if (!this._signalProgram || !this._playbackProgram) {
      return false;
    }

    this._sceneLocation = gl.getUniformLocation(this._signalProgram, 'u_scene');
    for (const name of SIGNAL_UNIFORMS) {
      this._signalUniforms[name] = gl.getUniformLocation(
        this._signalProgram,
        `u_${name}`
      );
    }
    this._signalPosition = gl.getAttribLocation(
      this._signalProgram,
      'a_position'
    );

    this._signalLocation = gl.getUniformLocation(
      this._playbackProgram,
      'u_signal'
    );
    for (const name of PLAYBACK_UNIFORMS) {
      this._playbackUniforms[name] = gl.getUniformLocation(
        this._playbackProgram,
        `u_${name}`
      );
    }
    this._playbackPosition = gl.getAttribLocation(
      this._playbackProgram,
      'a_position'
    );

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
    this._signalFramebuffer = gl.createFramebuffer();
    this._signalTexture = gl.createTexture();
    this._historyFramebuffer = gl.createFramebuffer();
    this._historyTexture = gl.createTexture();
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
    // LINEAR throughout, which sounds wrong for a pixel look but is what makes
    // the fractional sample offsets mean anything — NEAREST would snap every
    // tap back onto a texel centre and collapse the whole signal model.
    this.setSampling();

    // RGBA16F is filterable in ES 3.0, so the vertical chroma blend can still
    // ride on linear interpolation here.
    gl.bindTexture(gl.TEXTURE_2D, this._signalTexture);
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
    );
    this.setSampling();

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._signalFramebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this._signalTexture,
      0
    );

    // Resolved frames are copied here after presentation and become the next
    // field's very short persistence trail.
    gl.bindTexture(gl.TEXTURE_2D, this._historyTexture);
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
    this.setSampling();

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._historyFramebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this._historyTexture,
      0
    );
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Cubism draws with DEPTH_TEST on, so the scene target needs real depth.
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
    const time = performance.now() / 1000.0;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quad);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._signalFramebuffer);
    gl.viewport(0, 0, this._width, this._height);
    gl.useProgram(this._signalProgram);
    gl.enableVertexAttribArray(this._signalPosition);
    gl.vertexAttribPointer(this._signalPosition, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.uniform1i(this._sceneLocation, 0);
    gl.uniform1f(this._signalUniforms.time, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(this._signalPosition);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this._width, this._height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this._playbackProgram);
    gl.enableVertexAttribArray(this._playbackPosition);
    gl.vertexAttribPointer(this._playbackPosition, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._signalTexture);
    gl.uniform1i(this._signalLocation, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._historyTexture);
    gl.uniform1i(this._playbackUniforms.history, 1);

    const set = (name: (typeof PLAYBACK_UNIFORMS)[number], value: number) =>
      gl.uniform1f(this._playbackUniforms[name], value);
    set('time', time);
    set('chromaCutI', LAppDefine.ChromaCutI);
    set('chromaCutQ', LAppDefine.ChromaCutQ);
    set('chromaLag', LAppDefine.ChromaLag);
    set('lumaCut', LAppDefine.LumaCut);
    set('lumaLag', LAppDefine.LumaLag);
    set('lumaEdge', LAppDefine.LumaEdge);
    set('sharpening', LAppDefine.CompositeSharpening);
    set('saturation', LAppDefine.Saturation);
    set('spillDecay', LAppDefine.ChromaSpillDecay);
    set('phaseNoise', LAppDefine.ChromaPhaseNoise);
    set('gainNoise', LAppDefine.ChromaGainNoise);
    set('chromaLoss', LAppDefine.ChromaLossChance);
    set('chromaNoise', LAppDefine.ChromaNoise);
    set('chromaNoiseScale', LAppDefine.ChromaNoiseScale);
    set('grain', LAppDefine.TapeGrain);
    set('snowChance', LAppDefine.SnowChance);
    set('snowStrength', LAppDefine.SnowStrength);
    set('knee', LAppDefine.HighlightKnee);
    set('jitter', LAppDefine.TrackingJitter);
    set('dropoutChance', LAppDefine.DropoutChance);
    set('dropoutStrength', LAppDefine.DropoutStrength);
    set('headSwitchLines', LAppDefine.HeadSwitchLines);
    set('headSwitchShift', LAppDefine.HeadSwitchShift);
    set('historyMix', LAppDefine.HistoryMix);
    set('historyShift', LAppDefine.HistoryShift);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Copy the resolved, premultiplied frame after drawing. Reading the old
    // history and replacing it only after this pass avoids a feedback loop in
    // one draw call while retaining one field of analogue persistence.
    gl.bindTexture(gl.TEXTURE_2D, this._historyTexture);
    gl.copyTexSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      0,
      0,
      this._width,
      this._height
    );

    gl.disableVertexAttribArray(this._playbackPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.enable(gl.BLEND);
  }

  public release(): void {
    const gl = this._gl;
    if (!gl) {
      return;
    }

    gl.deleteFramebuffer(this._framebuffer);
    gl.deleteFramebuffer(this._signalFramebuffer);
    gl.deleteFramebuffer(this._historyFramebuffer);
    gl.deleteRenderbuffer(this._depth);
    gl.deleteTexture(this._texture);
    gl.deleteTexture(this._signalTexture);
    gl.deleteTexture(this._historyTexture);
    gl.deleteBuffer(this._quad);
    gl.deleteProgram(this._signalProgram);
    gl.deleteProgram(this._playbackProgram);

    this._framebuffer = null;
    this._signalFramebuffer = null;
    this._historyFramebuffer = null;
    this._depth = null;
    this._texture = null;
    this._signalTexture = null;
    this._historyTexture = null;
    this._quad = null;
    this._signalProgram = null;
    this._playbackProgram = null;
    this._gl = null;
  }

  private setSampling(): void {
    const gl = this._gl;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  private buildProgram(fragment: string): WebGLProgram {
    const gl = this._gl;
    const header = `#version 300 es\n${this._float ? '' : '#define ENCODED_SIGNAL\n'}`;

    const vertexShader = this.compile(gl.VERTEX_SHADER, header + VERTEX_SHADER);
    const fragmentShader = this.compile(
      gl.FRAGMENT_SHADER,
      header + COMMON + fragment
    );
    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

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
  private _float = false;
  private _signalProgram: WebGLProgram = null;
  private _playbackProgram: WebGLProgram = null;
  private _framebuffer: WebGLFramebuffer = null;
  private _signalFramebuffer: WebGLFramebuffer = null;
  private _historyFramebuffer: WebGLFramebuffer = null;
  private _texture: WebGLTexture = null;
  private _signalTexture: WebGLTexture = null;
  private _historyTexture: WebGLTexture = null;
  private _depth: WebGLRenderbuffer = null;
  private _quad: WebGLBuffer = null;
  private _sceneLocation: WebGLUniformLocation = null;
  private _signalLocation: WebGLUniformLocation = null;
  private _signalUniforms: Record<string, WebGLUniformLocation> = {};
  private _playbackUniforms: Record<string, WebGLUniformLocation> = {};
  private _signalPosition = -1;
  private _playbackPosition = -1;
  private _width = 0;
  private _height = 0;
}
