/**
 * The tape's parameter set, split from the shader that consumes it.
 *
 * Modelled on ntsc-rs' default preset (composite + VHS at LP speed) and, more
 * importantly, expressed in its units: a 14.318 MHz sample clock — four times
 * the colour subcarrier — with one active scanline being 754 of those samples.
 * The source is resampled onto that grid, so every cutoff below is a real
 * frequency and the look stops changing when the window is resized. Measuring
 * in canvas pixels instead would let the subcarrier and the chroma bandwidth
 * drift with the viewport.
 */

/**
 * Signal geometry. These are interpolated into the GLSL as constants — a loop
 * bound cannot be a uniform — so changing one rebuilds both programs.
 */
export type NtscGeometry = {
  /** Raise it and the picture keeps more horizontal detail than a real tape;
   *  1.0 is what ntsc-rs runs at, and it is genuinely this soft sideways. */
  horizontalScale: number
  samplesPerLine: number
  /** MHz. */
  sampleRate: number
  /** Fields per second, for the per-line subcarrier phase flip. Dot crawl only
   *  crawls because this alternates; freeze it and the residue sits still. */
  fieldRate: number
  /** How often the noise field resamples, in Hz. Tape noise moves at field
   *  rate, not at the monitor's refresh — per frame reads as digital sparkle. */
  noiseRate: number
  /** Width of the demodulator window, in samples. This is the sharpness
   *  control, which is not obvious: luma comes back as the composite minus
   *  whatever the demodulator recovered, so the window's bandwidth *is* the
   *  width of the notch taken out of luma. At 9 taps that notch was 0.27
   *  cycles/sample against ntsc-rs' 0.12 — it kept only 14% of the detail at
   *  0.20 where ntsc-rs keeps 62%, and that, not any of the lowpasses, was what
   *  made the picture mushy. 21 lands at 0.11. Raising it costs a tap per
   *  sample. Must be odd. */
  demodTaps: number
  lumaTaps: number
  chromaTaps: number
  chromaTapStride: number
}

/** Everything the player does to that signal. All of it is a live uniform. */
export type NtscTape = {
  /** Chroma bandwidth, in MHz — but read these as fitted, not as quoted.
   *  ntsc-rs cascades three Butterworth stages here (1.3/0.6 MHz in, its VHS
   *  colour-under cut at 0.30, then 1.3/0.6 again), and a cascade of single
   *  poles has a much longer tail than a Butterworth of the same nominal
   *  cutoff. So these were fitted to that cascade's step response instead of
   *  copied off it: the shader's colour transition lands within ~2 samples of
   *  ntsc-rs' on both channels. Q stays narrower than I, as in broadcast NTSC. */
  chromaCutI: number
  chromaCutQ: number
  /** Net rightward colour lag, in samples, subtracted from the kernel's own
   *  group delay. ntsc-rs compensates its chroma filters by far less than that
   *  delay (2, 4 and 5 samples against ~11 of it), which is why VHS colour
   *  arrives visibly late; at 8.5 the recovered colour crosses halfway 6.5
   *  samples past a hard edge against ntsc-rs' 6.3. Raise it to pull colour
   *  back onto its edges. */
  chromaLag: number
  /** VHS luma, in MHz. Above Nyquist on purpose, which is to say this filter is
   *  very nearly a pass-through: after ntsc-rs' -1.6 edge enhancement its own
   *  luma path comes out almost transparent, a 10-90 transition of 1.8 samples.
   *  All the horizontal softness in this look belongs to the demodulator notch
   *  and to chroma — a genuinely soft luma filter here does not reproduce the
   *  look, it just makes the picture mushy. Fitted to that 1.8. */
  lumaCut: number
  /** Shifts the luma window back onto the sample it belongs to. The edge term
   *  pulls the apparent transition earlier, and luma sitting left of where it
   *  belongs would corrupt the chroma lag, which is measured against it. */
  lumaLag: number
  /** The luma half of the composite high-pass, plus ntsc-rs' fixed -1.6 VHS
   *  edge enhancement. Deliberately well short of its 42% overshoot — a cascade
   *  of real poles cannot overshoot on its own, so reaching that took a
   *  coefficient large enough to blow every highlight. Sharpness comes from
   *  lumaCut instead; this only supplies the fringe, and at 0.7 it overshoots
   *  an edge by 4%. */
  lumaEdge: number
  /** Composite sharpening: a high-pass on the composite waveform, so it lifts
   *  the subcarrier sidebands as hard as it lifts luma edges. This is where
   *  saturation comes from — ntsc-rs' easy mode wires its "Saturation" slider
   *  straight to it. Its standard-mode default is 1.0, which drives red to pure
   *  #ff0000 and pushes everything warm in the frame to the same clipped hue. */
  sharpening: number
  /** Chroma AGC in the player. Nearly unity: the saturation is meant to come
   *  out of the signal chain, not out of a grade. */
  saturation: number
  /** Alpha is normally confined to the source's own geometry. Let the recovered
   *  chroma carry a diminishing matte beyond it, so colour can bleed onto the
   *  transparent pixels around an edge. Per sample, and the chroma kernel is
   *  forty samples long, so this has to fall off fast: the luma the taps drag
   *  into those pixels comes from the brightest parts of the source, and a slow
   *  decay puts a near-opaque blown-out halo around the whole silhouette rather
   *  than a few samples of colour bleed. Inert on an opaque source. */
  spillDecay: number
  /** Colour-under instability: phase error in radians per line (a rotation of
   *  the recovered I/Q vector, which is exactly a hue shift) and level error as
   *  a fraction of saturation. ntsc-rs' defaults are almost nothing — 0.001
   *  turns of phase — so these are deliberately only a little hotter. */
  phaseNoise: number
  gainNoise: number
  /** The odd line where the colour-under carrier drops out entirely and the
   *  line plays back greyscale. Per line per field. */
  chromaLoss: number
  /** Chroma noise, and the sample count of one noise cell. ntsc-rs runs this at
   *  a tenth of the luma noise frequency: colour noise survives a far narrower
   *  filter, so it arrives as slow blotches rather than as speckle. */
  chromaNoise: number
  chromaNoiseScale: number
  /** Grain, biased into the shadows where tape noise actually lives. */
  grain: number
  /** Sparse specks where the head reads pure noise. Chance is per sample, so it
   *  has to be tiny. */
  snowChance: number
  snowStrength: number
  /** Luma above this compresses instead of clipping. Kept high: it exists to
   *  absorb edge-enhancement overshoot, not to grade the picture. */
  knee: number
  /** Per-line tracking error, in samples of horizontal shear. */
  jitter: number
  /** The odd line where a head loses contact and reads back as a bright
   *  scratch. Chance is per line per field, so keep it small. */
  dropoutChance: number
  dropoutStrength: number
  /** The bottom few lines are read by a head that is losing contact, so they
   *  shear sideways and go noisy. Shift is in samples. */
  headSwitchLines: number
  headSwitchShift: number
  /** The previous field, faintly visible after its successor. Blended only
   *  where the new signal is transparent, so a resting source stays stable
   *  while movement leaves a short analogue afterimage. */
  historyMix: number
  historyShift: number
}

export type NtscParams = NtscGeometry & NtscTape

/** Uniform names, which are also the key names: `chromaCutI` → `u_chromaCutI`. */
export const NTSC_TAPE_KEYS = [
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
] as const satisfies readonly (keyof NtscTape)[]

export const NTSC_GEOMETRY_KEYS = [
  'horizontalScale',
  'samplesPerLine',
  'sampleRate',
  'fieldRate',
  'noiseRate',
  'demodTaps',
  'lumaTaps',
  'chromaTaps',
  'chromaTapStride',
] as const satisfies readonly (keyof NtscGeometry)[]

/**
 * The clock is wrapped to this many seconds before it reaches the shader.
 *
 * Every stochastic term is seeded through `fract(sin(dot(p, k)) * 43758.5453)`,
 * and that hash needs its argument to stay small: the noise seeds already
 * multiply the tick by the line number, so an unbounded clock walks `sin()`
 * into the range where float32 has no precision left, the hash collapses to a
 * near-constant, and dropouts and chroma noise fire across whole lines at once
 * — a tab left in the background for an hour comes back to a solid colour
 * block. Wrapping is seamless rather than a visible reset because 600 s is a
 * whole number of both field and noise periods, and 600 × FieldRate is even, so
 * the subcarrier's per-field phase flip lands on the same parity either side.
 */
export const NTSC_TIME_WRAP = 600

/**
 * Scan lines the tape resolves. Everything is rendered into this many rows and
 * scaled back up to fill the surface, and that upscale is pure resampling loss
 * with nothing analogue behind it — a tape's vertical resolution is its line
 * count and that stays crisp. At a real 480 a full-height panel stretches it by
 * about 1.7x on a laptop, which blurs everything the filters were tuned to
 * keep, so the line count is traded up. This is the most expensive knob here:
 * cost scales with its square, since the surface widens to match.
 */
export const NTSC_LINES = 600

/**
 * The backing-store size for a surface of this CSS size, capped to the line
 * count.
 *
 * `pixelRatio` is what stops a dense display from being the worst case. The
 * ceiling used to be one backing pixel per CSS pixel, which on a phone at 3x
 * meant the device stretched every rendered line across three of its own — the
 * picture came out soft and every per-line artefact came out three times as
 * thick as it was designed to be. Bounded at 2: past that the cost, which is
 * quadratic, buys less than the line cap gives away.
 */
export const ntscSurfaceSize = (
  width: number,
  height: number,
  pixelRatio = 1,
  lines = NTSC_LINES
): { width: number; height: number } => {
  const ceiling = Math.min(2, Math.max(1, pixelRatio))
  const scale = height > 0 ? Math.min(ceiling, lines / height) : 1
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/**
 * The tape as tuned on the Live2D portrait: a drawing on transparency, where
 * noise can only exist where the source is painted.
 */
export const NTSC_SPRITE: NtscParams = {
  horizontalScale: 1.0,
  samplesPerLine: 754,
  sampleRate: 14.31818,
  fieldRate: 30,
  noiseRate: 24,
  demodTaps: 21,
  lumaTaps: 8,
  chromaTaps: 20,
  chromaTapStride: 2,

  chromaCutI: 0.9,
  chromaCutQ: 0.8,
  chromaLag: 8.5,
  lumaCut: 10.0,
  lumaLag: 1.5,
  lumaEdge: 0.7,
  sharpening: 0.65,
  saturation: 1.04,
  spillDecay: 0.18,
  phaseNoise: 0.03,
  gainNoise: 0.05,
  chromaLoss: 0.0012,
  chromaNoise: 0.06,
  chromaNoiseScale: 18,
  grain: 0.045,
  snowChance: 0.00018,
  snowStrength: 0.9,
  knee: 0.9,
  jitter: 1.4,
  dropoutChance: 0.004,
  dropoutStrength: 0.5,
  headSwitchLines: 14,
  headSwitchShift: 10,
  historyMix: 0.06,
  historyShift: 0.75,
}

/**
 * The same chain on an opaque source — a photograph, a rendered scene.
 *
 * Nothing in the model changes, but the alpha it was tuned against does: with
 * alpha 1 everywhere, the silhouette masks are all-pass and every artefact that
 * used to be confined to the character now covers the frame corner to corner.
 * That is what a real tape does, and it is also several times as much visible
 * noise, so the additive terms come down. spillDecay is inert here — there is
 * no transparent edge for colour to bleed onto.
 */
export const NTSC_FULL_FRAME: NtscParams = {
  ...NTSC_SPRITE,
  grain: 0.03,
  chromaNoise: 0.04,
  snowChance: 0.000006,
  dropoutChance: 0.0015,
  // A full frame ends at the bottom of the picture rather than behind a panel,
  // so the head-switching tear is fully visible and reads much stronger.
  headSwitchShift: 6,
}
