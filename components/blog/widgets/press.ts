import { FILTER_DEFAULTS, type ChipTuning } from 'kappan'

/**
 * 用印刷的成因當旋鈕，不是用濾鏡參數。
 *
 * 一個成因會同時牽動好幾道濾鏡 —— 上墨量一動，脹開、缺塊、拉硬都得跟著改，
 * 因為墨多本來就同時讓筆畫變胖、少缺、邊緣更實。這個對應關係就是模型本身。
 *
 * 這裡先當原型養著。等比例調順了再考慮搬進 kappan 當公開 API ——
 * 沒有人想設 chipFrequency，大家想設的是「紙粗一點」。
 */

const D = FILTER_DEFAULTS.text
export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
/** 0→1→2 三點折線，1 一律落在套件預設值上。 */
export const ramp = (v: number, at0: number, at1: number, at2: number) =>
  v <= 1 ? at0 + (at1 - at0) * v : at1 + (at2 - at1) * (v - 1)

export interface Press {
  /** 上墨量。少了筆畫會斷，多了會糊成一團。 */
  ink: number
  /** 壓力。輕了印不滿，重了墨被擠出邊緣。 */
  pressure: number
  /** 紙的粗糙與吸墨程度。光滑塗佈紙 0，粗糙的手工紙 2。 */
  paper: number
  /** 鉛字用了多久。新字 0，崩角的舊字 2。 */
  wear: number
}

/** 成因 → 濾鏡參數。全部設 1 時要剛好落回套件預設。 */
export const pressToTuning = (p: Press): Partial<ChipTuning> => {
  // 缺墨、壓不足、紙太粗、字面磨損都會讓筆畫印不滿，疊加成同一個「印不滿」的量。
  const starve =
    (1 - p.ink) * 0.5 + (1 - p.pressure) * 0.4 + (p.paper - 1) * 0.25 + Math.max(0, p.wear - 1) * 0.5
  return {
    // 紙愈粗，纖維把筆畫推得愈歪；壓力愈大，紙被壓平，推歪反而變少。
    displace: clamp(D.displace * ramp(p.paper, 0.4, 1, 1.6) * ramp(p.pressure, 1.5, 1, 0.8), 0, 4),
    // 脹開不能用 feMorphology 做。它的半徑會被取整到整數裝置像素，所以滑桿推到
    // 0.24 沒事、0.27 突然粗一圈 —— 而且門檻隨螢幕的 DPR 跑，換台機器就跳在別的地方。
    // 墨往外擠改由「卷積核暈開 + 拉硬把那圈變實心」來做，見下面的 contrast/threshold：
    // 逐像素查表，沒有空間量化，要多胖就多胖。
    dilate: 0,
    // 崩角只跟字的年紀有關。新字的缺陷是表面細斑點，舊字是真的崩掉一角 ——
    // 所以年紀一大不只變多，尺度也要變大（頻率降低＝單個缺口變大）。
    // 只調 chipAmount 是看不出來的：那道砂眼的洞才 1px，本來就咬不斷任何東西。
    chipAmount: clamp(ramp(p.wear, 0, D.chipAmount, 0.32), 0, 0.4),
    chipFrequency: clamp(ramp(p.wear, 1.7, D.chipFrequency, 0.42), 0.2, 2.5),
    voidThreshold: clamp(D.voidThreshold - starve * 0.28, 0.35, 1),
    // 吸墨的紙會讓邊緣滲開；墨上太多的話，再光滑的紙也擋不住。
    // 一律 5：3 的暈圈只有 1px，拉硬到 6.5 就把它吃完了，上墨量再推也不會更胖。
    bleed: p.paper >= 0.5 || p.ink >= 1.3 ? 5 : false,
    // 拉硬同時管兩件事：墨少時把淡的部分吃掉（筆畫變細），墨多時把卷積暈出來的
    // 那一圈全部變實心（筆畫變胖）。threshold 到 0 為止 —— 再正下去連全透明的
    // 地方都會被拉起來，整個方框會發灰。
    contrast: clamp(ramp(p.ink, 2, D.contrast, 9), 1, 12),
    threshold: clamp(ramp(p.ink, -0.3, D.threshold, 0), -0.5, 0),
  }
}
