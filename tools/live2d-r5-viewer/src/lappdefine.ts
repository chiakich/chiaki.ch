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

// Scan lines the tape resolves. The canvas renders into this many rows and is
// then upscaled by CSS. Kept high enough that the upscale is a small step:
// vertical softness is pure resampling loss with nothing analogue behind it,
// since a tape's vertical resolution is its line count and that stays crisp.
export const RenderVerticalResolution = 480;

// --- Tape playback. All horizontal, all measured in tube pixels ---

// Luma cutoff as a fraction of Nyquist. This is a windowed sinc, not a blur:
// detail below the cutoff survives intact and the kernel's sidelobes supply
// the ringing, the way an actual band-limited signal does. Lower = softer.
export const LumaCutoff = 0.62;
export const LumaTaps = 9;

// Colour subcarrier, in cycles per tube pixel. Deliberately just above the
// luma cutoff: close enough that the luma filter cannot fully reject it, so
// saturated colour leaks brightness — the reason orange reads as glowing —
// and the leftovers crawl as dots. Move it further out for a cleaner picture.
export const SubcarrierFreq = 0.33;

// Chroma amplitude on the subcarrier. Raising it saturates the picture and
// increases the leak into luma at the same time, exactly as it would on a real
// signal, so this is the main knob for how hot the colours run.
export const ChromaGain = 1.25;

// Chroma is squeezed far harder than luma — a fraction of its bandwidth — so
// colour visibly runs off the edges it belongs to.
export const ChromaBandwidth = 5.0;
export const ChromaTaps = 19;

// How far chroma lags luma.
export const ChromaDelay = 1.9;

// Colour-under phase error, in radians per line. Rotating the recovered I/Q
// vector is exactly what an error in the heterodyne oscillator does, and a
// rotation there is a hue shift — this is the source of VHS colour banding.
export const ColourUnderPhase = 0.22;

// Level instability in the same conversion, as a fraction of saturation.
export const ColourUnderGain = 0.18;

// Chroma AGC in the player, compensating for what the tape lost. Above 1 on
// purpose: saturated colour is pushed out of gamut and clips, and that clip is
// what makes orange read as glowing instead of muddy.
export const Saturation = 1.8;

// Preemphasis ringing: the fringe trailing a sharp edge. Decay sets how many
// times the echo bounces before it dies.
export const RingStrength = 0.1;
export const RingDecay = 0.6;
export const RingTaps = 6;

// Luma above this compresses instead of clipping. Kept high: it exists to
// absorb ringing overshoot, not to grade the picture. Pulling it down muted
// the highlights, and clipped highlights are most of why tape footage reads
// as bright rather than washed.
export const HighlightKnee = 0.9;

// How often the noise field resamples, in Hz. Tape noise moves at field rate,
// not at the monitor's refresh — running it per frame reads as digital sparkle.
export const NoiseRate = 24;

// Grain, biased into the shadows where tape noise actually lives.
export const TapeGrain = 0.055;

// Blotchy colour speckle, seeded on a coarser grid than the luma grain.
export const ChromaNoise = 0.05;

// Per-line tracking error, in tube pixels of horizontal shear.
export const TrackingJitter = 0.9;

// Dropouts: the odd line where a head loses contact and reads back as a bright
// scratch. Chance is per line per field, so keep it small.
export const DropoutChance = 0.004;
export const DropoutStrength = 0.5;

// Head switching: the bottom few lines are read by a head that is losing
// contact, so they shear sideways and go noisy. Measured in tube pixels.
// Only partly visible here — the chat panel sits over the bottom of the frame.
export const HeadSwitchLines = 14;
export const HeadSwitchShift = 16;

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
