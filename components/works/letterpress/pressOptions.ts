import type { LetterpressOptions } from 'kappan'

/**
 * 見本帖用的設定：白紙黑墨，一點明體當正文。
 *
 * 一點明體是開源的（IPA 授權），字體檔自己放在 public/fonts；
 * 見本帖用的是照本頁字集切出來的子集，見 scripts/subsetIMing.py。
 * 要換成別套字（日星、思源黑體、或申請 justfont 的 webfont 服務）只要改 typeFamily。
 */
export const DEMO_OPTIONS: LetterpressOptions = {
  paper: '#ffffff',
  ink: '#000000',
  inkMuted: '#000000',
  // 見本帖走黑白，只有程式碼那塊用硃色當第二次落版 —— 傳統雙色刷就是這麼來的。
  red: '#9d3327',
  typeFamily: "'I.Ming', 'Chiaki IMing Subset', 'Noto Serif TC', 'Songti TC', serif",
  latinFamily: "'Courier Prime', 'Courier New', ui-monospace, monospace",
  // 傳統書：字排實，行間留半個到四分之三個字身。
  pitch: '1.9em',
  punctFont: { family: 'lp-punct', src: '/fonts/lp-punct.woff2', weight: 600 },
}

/** 只有這個示範頁需要的規則：西文字體與一點明體的 @font-face。 */
export const demoCss = `
/* Courier Prime：Google Fonts 上的 Courier 重製，字面乾淨，破壞交給濾鏡去做。
   @import 必須排在整份樣式最前面。 */
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

/* 一點明體 I.Ming 的子集，IPA Font License 1.0。授權要求派生程式改名，
   所以字型名稱是 Chiaki IMing Subset；授權全文在 /fonts/IMing-IPA-LICENSE.md。
   訪客本機若裝了完整版就直接用完整版，子集只是備援。 */
@font-face {
  font-family: 'Chiaki IMing Subset';
  src: url('/fonts/iming-subset.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
`
