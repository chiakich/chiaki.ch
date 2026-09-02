import type { LetterpressOptions } from 'kappan'

/**
 * blog 的排版設定，列表與內頁共用。刻意不掛墨壓濾鏡 —— 那組是為見本帖的展示級數
 * 調的，整篇套下去反而難讀。
 *
 * 正文走站上的 justfont 而不是 Google Fonts：後者按 unicode-range 切片，這篇 532 個
 * 相異字散在 21 片裡要 2.7MB，按實際用字切子集同一份只要 180KB。
 */
export const BLOG_OPTIONS: LetterpressOptions = {
  paper: '#ffffff',
  ink: '#16130f',
  inkMuted: '#6d6558',
  red: '#a2372a',
  typeFamily: "'notoserifcjktc', 'Noto Serif TC', 'Songti TC', serif",
  latinFamily: "'Courier Prime', 'Courier New', ui-monospace, monospace",
  pitch: '1.9em',
  punctFont: { family: 'lp-punct', src: '/fonts/lp-punct.woff2', weight: 600 },
}

/** per-face 的 class 照 justfont 文件掛著。沒有 .lp-paper —— 紙紋跟濾鏡是一組的。 */
export const SHEET_CLASS = 'lp notoserifcjktc_medium notoserifcjktc_bold'

/** 標籤與程式碼用的等寬體。@import 必須排在整份樣式最前面。 */
export const blogLetterpressCss = `
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
`
