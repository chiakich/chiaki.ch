/**
 * VHS tape post pass, in two passes.
 *
 * A source frame is read back as though it had been through a tape. Pass one
 * encodes it as a composite waveform on an fs/4 subcarrier and decodes it
 * straight back out, which is where the luma/chroma cross-talk comes from. Pass
 * two plays that signal back: band-limit chroma far harder than luma and only
 * horizontally, lag it, then tracking jitter, grain and dropouts. Horizontal
 * because that is the axis a tape is soft on — vertical resolution is the line
 * count, which is why VHS smears sideways but keeps its scanlines.
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
 * in shape, the cutoffs in params.ts are fitted to the step response of
 * ntsc-rs' chain rather than copied from it — see the comments there.
 *
 * The GLSL here is ES 3.00 with no version directive and no attribute or
 * uniform declared that a host cannot supply, so it can be handed either to raw
 * WebGL2 (pipeline.ts) or to a three.js RawShaderMaterial (three.ts).
 */

import type { NtscGeometry } from './params'

export type NtscShaderOptions = {
  /**
   * No float render targets available, so pack the intermediate signal into 8
   * bits. Y needs headroom for edge overshoot and I/Q are signed. Quantisation
   * lands around 0.01, which is below the grain and chroma noise added later.
   */
  encodeSignal?: boolean
}

/** Fullscreen triangle in clip space; the raw pipeline's only vertex input. */
export const NTSC_VERTEX_SHADER = `
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

/** Shared by both passes: signal geometry, colour matrices, noise. */
const common = (geometry: NtscGeometry, options: NtscShaderOptions) => `
precision highp float;
// Not optional. A fragment shader's default integer precision in ES 3.00 is
// mediump, which guarantees only 16 bits, and the hash below is a 32-bit
// avalanche — at mediump it would fold in on itself and stop being a hash.
precision highp int;

const float PI = 3.14159265;

// One active scanline is this many samples of a clock running at four times the
// colour subcarrier. A wider render target adds samples rather than stretching
// these across more pixels, so the picture does not get softer as the surface
// grows while its on-screen height stays the same.
const float SIGNAL_WIDTH = ${(geometry.samplesPerLine * geometry.horizontalScale).toFixed(2)};
const float SAMPLE_RATE = ${(geometry.sampleRate * geometry.horizontalScale).toFixed(5)};
const float FIELD_RATE = ${geometry.fieldRate.toFixed(1)};
const float NOISE_RATE = ${geometry.noiseRate.toFixed(1)};

// An integer hash, not the usual fract(sin(dot(p, k)) * c). That one needs its
// argument to stay small and these seeds do not: they multiply the field
// counter by the line number, so the argument reaches the millions within
// minutes, float32 has well under a radian of precision left, and the hash
// degenerates into runs of identical values — whole spans of a line fire their
// dropouts and snow together and the picture blows out, from the top down,
// because the seeds grow with the line number. This one is exact for every
// input the shader can produce. Inputs are floored: every seed below is already
// integral, or strictly increasing per column, so nothing collides.
uint hashInt(uvec2 p) {
  uint h = p.x * 2654435761u + p.y * 2246822519u;
  h ^= h >> 15;
  h *= 2246822519u;
  h ^= h >> 13;
  h *= 3266489917u;
  return h ^ (h >> 16);
}

float hash(vec2 p) {
  return float(hashInt(uvec2(abs(floor(p)))) >> 8) / 16777216.0;
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

${
  options.encodeSignal
    ? `vec4 encodeSignal(vec4 s) {
  return vec4(s.x * 0.5 + 0.25, s.y * 0.4 + 0.5, s.z * 0.4 + 0.5, s.w);
}

vec4 decodeSignal(vec4 s) {
  return vec4((s.x - 0.25) * 2.0, (s.y - 0.5) * 2.5, (s.z - 0.5) * 2.5, s.w);
}`
    : `vec4 encodeSignal(vec4 s) { return s; }
vec4 decodeSignal(vec4 s) { return s; }`
}
`

/**
 * Pass one. Modulate onto the subcarrier and demodulate straight back, so luma
 * and chroma genuinely share one channel and have to be separated imperfectly.
 */
const signal = (geometry: NtscGeometry) => `
uniform sampler2D u_scene;
uniform float u_time;

in vec2 v_uv;
out vec4 fragColor;

// This window's bandwidth is the width of the notch that comes out of luma
// below, so it decides how much horizontal detail survives — see demodTaps.
const int DEMOD_TAPS = ${geometry.demodTaps};
const int DEMOD_HALF = ${(geometry.demodTaps - 1) / 2};

void main() {
  float signalWidth = max(SIGNAL_WIDTH, float(textureSize(u_scene, 0).x));
  float sampleStep = 1.0 / signalWidth;
  float x = v_uv.x * signalWidth;
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
`

/** Pass two. Play the signal back off a tape. */
const playback = (geometry: NtscGeometry) => `
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

const int LUMA_TAPS = ${geometry.lumaTaps};
const int CHROMA_TAPS = ${geometry.chromaTaps};
const float CHROMA_STRIDE = ${geometry.chromaTapStride.toFixed(1)};

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
  float signalWidth = max(SIGNAL_WIDTH, float(textureSize(u_signal, 0).x));
  float sampleStep = 1.0 / signalWidth;
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
  // the read position rather than the output, so a silhouette shears with the
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

  // A real composite signal has no alpha channel. A transparent source does, so
  // build a matte from the chroma kernel itself: colour is allowed to escape the
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
  float noiseX = v_uv.x * signalWidth / u_chromaNoiseScale;
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
`

export type NtscShaderSources = {
  vertex: string
  signal: string
  playback: string
}

export const buildNtscShaders = (
  geometry: NtscGeometry,
  options: NtscShaderOptions = {}
): NtscShaderSources => ({
  vertex: NTSC_VERTEX_SHADER,
  signal: common(geometry, options) + signal(geometry),
  playback: common(geometry, options) + playback(geometry),
})
