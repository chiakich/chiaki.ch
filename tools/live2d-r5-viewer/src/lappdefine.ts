/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LogLevel } from '@framework/live2dcubismframework';

/**
 * Sample Appで使用する定数
 */

// Canvas width and height pixel values, or dynamic screen size ('auto').
export const CanvasSize: { width: number; height: number } | 'auto' = 'auto';

// Scan lines the tape resolves. The canvas renders into this many rows and CSS
// upscales it to fill the panel, and that upscale is pure resampling loss with
// nothing analogue behind it — a tape's vertical resolution is its line count
// and that stays crisp. At a real 480 the panel stretches it by about 1.7x on a
// laptop, which blurs everything the filters were just tuned to keep, so the
// line count is traded up. This is the most expensive knob here: cost scales
// with its square, since the canvas widens to match.
export const RenderVerticalResolution = 600;

// --- Tape playback ---
//
// Modelled on ntsc-rs' default preset (composite + VHS at LP speed) and, more
// importantly, expressed in its units: a 14.318 MHz sample clock — four times
// the colour subcarrier — with one active scanline being 754 of those samples.
// The canvas is resampled onto that grid, so every cutoff below is a real
// frequency and the look stops changing when the window is resized. The
// previous version measured everything in canvas pixels, which meant the
// subcarrier and the chroma bandwidth drifted with the viewport.

// Samples per active line and the clock they arrive at. Raise the scale
// together and the picture keeps more horizontal detail than a real tape;
// 1.0 is what ntsc-rs runs at, and it is genuinely this soft sideways.
export const HorizontalScale = 1.0;
export const NtscSamplesPerLine = 754;
export const NtscSampleRate = 14.31818;

// Fields per second, for the per-line subcarrier phase flip. Dot crawl only
// crawls because this alternates; freeze it and the residue sits still.
export const FieldRate = 30;

// Width of the demodulator window, in samples. This is the sharpness control,
// which is not obvious: luma comes back as the composite minus whatever the
// demodulator recovered, so the window's bandwidth *is* the width of the notch
// taken out of luma. At 9 taps that notch was 0.27 cycles/sample against
// ntsc-rs' 0.12 — it kept only 14% of the detail at 0.20 where ntsc-rs keeps
// 62%, and that, not any of the lowpasses, was what made the picture mushy.
// 21 lands at 0.11. Raising it further sharpens and costs a tap per sample.
export const DemodTaps = 21;

// Chroma bandwidth, in MHz — but read these as fitted, not as quoted. ntsc-rs
// cascades three Butterworth stages here (1.3/0.6 MHz in, its VHS colour-under
// cut at 0.30, then 1.3/0.6 again), and a cascade of single poles has a much
// longer tail than a Butterworth of the same nominal cutoff. So these were
// fitted to that cascade's step response instead of copied off it: the shader's
// colour transition lands within ~2 samples of ntsc-rs' on both channels.
// Q stays narrower than I, as it is in broadcast NTSC.
export const ChromaCutI = 0.9;
export const ChromaCutQ = 0.8;
export const ChromaTaps = 20;
export const ChromaTapStride = 2;

// Net rightward colour lag, in samples, subtracted from the kernel's own group
// delay. ntsc-rs compensates its chroma filters by far less than that delay
// (2, 4 and 5 samples against ~11 of it), which is why VHS colour arrives
// visibly late; at 8.5 the recovered colour crosses halfway 6.5 samples past a
// hard edge against ntsc-rs' 6.3. Raising it pulls colour back onto its edges.
export const ChromaLag = 8.5;

// VHS luma, in MHz. Above Nyquist on purpose, which is to say this filter is
// very nearly a pass-through: after ntsc-rs' -1.6 edge enhancement its own luma
// path comes out almost transparent, a 10-90 transition of 1.8 samples. All the
// horizontal softness in this look belongs to the notch above and to chroma —
// a genuinely soft luma filter here does not reproduce the look, it just makes
// the picture mushy. Fitted to that 1.8; lower it and she goes blurry.
export const LumaCut = 10.0;
export const LumaTaps = 8;

// Shifts the luma window back onto the sample it belongs to. The edge term
// below pulls the apparent transition earlier, and luma sitting left of where
// it belongs would corrupt the chroma lag above, which is measured against it.
export const LumaLag = 1.5;

// Composite sharpening: a high-pass on the composite waveform, so it lifts the
// subcarrier sidebands as hard as it lifts luma edges. This is where saturation
// comes from — ntsc-rs' easy mode wires its "Saturation" slider straight to it,
// which is why the hue-picked warm boost that used to live here is gone.
// The single knob for how hot the colour runs. ntsc-rs' standard-mode default
// is 1.0, which drives red to pure #ff0000 and pushes everything warm in the
// frame to the same clipped hue — on artwork this orange to begin with, that
// reads as one red mass rather than as saturated. At 0.65 the hair still lands
// near #ff8109 with the tonal separation intact.
export const CompositeSharpening = 0.65;

// The luma half of that same high-pass, plus ntsc-rs' fixed -1.6 VHS edge
// enhancement. Deliberately well short of its 42% overshoot — a cascade of real
// poles cannot overshoot on its own, so reaching that took a coefficient large
// enough to blow every highlight on her. Sharpness comes from LumaCut instead;
// this only supplies the fringe, and at 0.7 it overshoots an edge by 4%.
export const LumaEdge = 0.7;

// Chroma AGC in the player. Nearly unity: the saturation is meant to come out
// of the signal chain above, not out of a grade.
export const Saturation = 1.04;

// Alpha is normally confined to the model's geometry. Let the recovered chroma
// carry a diminishing matte beyond it, so colour can bleed onto the transparent
// pixels around an edge. Per sample, and the chroma kernel is forty samples
// long, so this has to fall off fast: the luma the taps drag into those pixels
// comes from her brightest parts, and a slow decay puts a near-opaque blown-out
// halo around her whole silhouette rather than a few samples of colour bleed.
export const ChromaSpillDecay = 0.18;

// Colour-under instability: phase error in radians per line (a rotation of the
// recovered I/Q vector, which is exactly a hue shift) and level error as a
// fraction of saturation. ntsc-rs' defaults are almost nothing — 0.001 turns
// of phase — so this is deliberately only a little hotter than that.
export const ChromaPhaseNoise = 0.03;
export const ChromaGainNoise = 0.05;

// Chroma loss: the odd line where the colour-under carrier drops out entirely
// and the line plays back greyscale. Per line per field.
export const ChromaLossChance = 0.0012;

// Luma above this compresses instead of clipping. Kept high: it exists to
// absorb edge-enhancement overshoot, not to grade the picture.
export const HighlightKnee = 0.9;

// How often the noise field resamples, in Hz. Tape noise moves at field rate,
// not at the monitor's refresh — running it per frame reads as digital sparkle.
export const NoiseRate = 24;

// Grain, biased into the shadows where tape noise actually lives.
export const TapeGrain = 0.045;

// Chroma noise, and the sample count of one noise cell. ntsc-rs runs this at a
// tenth of the luma noise frequency: colour noise survives a far narrower
// filter, so it arrives as slow blotches rather than as speckle.
export const ChromaNoise = 0.06;
export const ChromaNoiseScale = 18;

// Snow: sparse specks where the head reads pure noise. Chance is per sample,
// so it has to be tiny.
export const SnowChance = 0.00018;
export const SnowStrength = 0.9;

// The previous field is faintly visible after its successor. This is blended
// only where the new signal is transparent, so a resting model stays stable
// while movement leaves a short analogue afterimage.
export const HistoryMix = 0.06;
export const HistoryShift = 0.75;

// Per-line tracking error, in samples of horizontal shear.
export const TrackingJitter = 1.4;

// Dropouts: the odd line where a head loses contact and reads back as a bright
// scratch. Chance is per line per field, so keep it small.
export const DropoutChance = 0.004;
export const DropoutStrength = 0.5;

// Head switching: the bottom few lines are read by a head that is losing
// contact, so they shear sideways and go noisy. Shift is in samples.
// Only partly visible here — the chat panel sits over the bottom of the frame.
export const HeadSwitchLines = 14;
export const HeadSwitchShift = 10;

// キャンバスの数
export const CanvasNum = 1;

// 画面
export const ViewScale = 1.0;
export const ViewMaxScale = 2.0;
export const ViewMinScale = 0.8;

export const ViewLogicalLeft = -1.0;
export const ViewLogicalRight = 1.0;
export const ViewLogicalBottom = -1.0;
export const ViewLogicalTop = 1.0;

export const ViewLogicalMaxLeft = -2.0;
export const ViewLogicalMaxRight = 2.0;
export const ViewLogicalMaxBottom = -2.0;
export const ViewLogicalMaxTop = 2.0;

// 相対パス
export const ResourcesPath = '/assets/story/character/live2d/r5/Resources/';

// シェーダー相対パス
export const ShaderPath = '/assets/story/character/live2d/r5/Framework/Shaders/WebGL/';

// モデルの後ろにある背景の画像ファイル
export const BackImageName = 'back_class_normal.png';

// 歯車
export const GearImageName = 'icon_gear.png';

// 終了ボタン
export const PowerImageName = 'CloseNormal.png';

// モデル定義---------------------------------------------
// モデルを配置したディレクトリ名の配列
// ディレクトリ名とmodel3.jsonの名前を一致させておくこと
export const ModelDir: string[] = [
  'chiaki'
];
export const ModelDirSize: number = ModelDir.length;

// 外部定義ファイル（json）と合わせる
export const MotionGroupIdle = 'Idle'; // アイドリング
export const MotionGroupTapBody = 'TapBody'; // 体をタップしたとき

// 外部定義ファイル（json）と合わせる
export const HitAreaNameHead = 'Head';
export const HitAreaNameBody = 'Body';

// モーションの優先度定数
export const PriorityNone = 0;
export const PriorityIdle = 1;
export const PriorityNormal = 2;
export const PriorityForce = 3;

// MOC3の整合性検証オプション
export const MOCConsistencyValidationEnable = true;
// motion3.jsonの整合性検証オプション
export const MotionConsistencyValidationEnable = true;

// デバッグ用ログの表示オプション
export const DebugLogEnable = true;
export const DebugTouchLogEnable = false;

// Frameworkから出力するログのレベル設定
export const CubismLoggingLevel: LogLevel = LogLevel.LogLevel_Verbose;

// デフォルトのレンダーターゲットサイズ
export const RenderTargetWidth = 1900;
export const RenderTargetHeight = 1000;
