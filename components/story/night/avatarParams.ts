import type { Face } from 'lib/night/types'

// PARAM_MOUTH_OPEN_Y is absent: the stage drives the mouth itself.
export const BASE_PARAMS: Record<string, number> = {
  PARAM_MOUTH_FORM: 0,
  PARAM_EYE_L_SMILE: 0,
  PARAM_EYE_R_SMILE: 0,
  PARAM_EYE_L_OPEN: 1,
  PARAM_EYE_R_OPEN: 1,
  PARAM_BROW_L_Y: 0,
  PARAM_BROW_R_Y: 0,
  PARAM_ANGLE_Z: 0,
  PARAM_BODY_ANGLE_Z: 0,
  face2: 0,
  face3: 0,
  face7: 0,
}

export const EMOTION_PARAMS: Record<Face, Record<string, number>> = {
  neutral: {},
  happy: {
    PARAM_MOUTH_FORM: 0.24,
    PARAM_EYE_L_SMILE: 0.1,
    PARAM_EYE_R_SMILE: 0.1,
    face7: 0.723,
  },
  shy: {
    PARAM_MOUTH_FORM: 0.12,
    PARAM_EYE_L_OPEN: 0.9,
    PARAM_EYE_R_OPEN: 0.9,
    PARAM_ANGLE_Z: -2.4,
    face2: 1,
  },
  surprised: {
    PARAM_MOUTH_FORM: 0.06,
    PARAM_BROW_L_Y: 0.3,
    PARAM_BROW_R_Y: 0.3,
    face3: 1,
  },
  sad: { PARAM_MOUTH_FORM: -0.08, PARAM_BROW_L_Y: -0.24, PARAM_BROW_R_Y: -0.24 },
  thinking: { PARAM_MOUTH_FORM: 0.04, PARAM_ANGLE_Z: 2.4 },
  proud: {
    PARAM_MOUTH_FORM: 0.18,
    PARAM_EYE_L_SMILE: 0.06,
    PARAM_EYE_R_SMILE: 0.06,
    face7: 0.723,
  },
}

// Tail amplitude and rate per emotion — tucked when shy or sad, a startled
// flick on surprise. Her own dialogue claims the tail gives her away.
export const EMOTION_TAIL: Record<Face, { amp: number; rate: number }> = {
  neutral: { amp: 1, rate: 1 },
  happy: { amp: 1.5, rate: 1.35 },
  shy: { amp: 0.55, rate: 0.8 },
  surprised: { amp: 1.7, rate: 1.6 },
  sad: { amp: 0.45, rate: 0.65 },
  thinking: { amp: 0.8, rate: 0.85 },
  proud: { amp: 1.35, rate: 1.2 },
}

// Exponential attack rate per emotion. A face that arrives at one speed no
// matter what it is reads as a dial being turned rather than a reaction.
export const EMOTION_SPEED: Record<Face, number> = {
  neutral: 5,
  happy: 8,
  shy: 6,
  surprised: 22,
  sad: 3.2,
  thinking: 5,
  proud: 8,
}
