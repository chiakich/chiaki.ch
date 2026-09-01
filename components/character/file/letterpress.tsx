// 角色檔案頁專屬的版面。鉛字質感本身已經抽到 packages/kappan，
// 這裡只留這一頁特有的東西：相片台紙、藍圖框、印章外框、橫向捲軸舞台。
//
// 這些規則跟質感層一樣走大量任意值，Panda 在 cssgen 沒掃到時會整條消失，
// 所以一併集中成字串由頁面注入一次。
import React from 'react'
import { grainUri, letterpressCss, type LetterpressOptions } from 'kappan'
import { LetterpressFilters } from 'kappan/react'

export const RULE = '#16130f'
export const HAIRLINE = '#c7bda8'
export const PANEL_BG = 'rgba(255, 255, 255, .18)'

/** 日星宋體當正文，直排標點交給自家子集出的 Noto Serif TC（含 vert/vrt2）。 */
const OPTIONS: LetterpressOptions = {
  typeFamily: "'rixingsong-semibold', 'Noto Serif TC', 'Songti TC', serif",
  punctFont: { family: 'lp-punct', src: '/fonts/lp-punct.woff2', weight: 600 },
}

const dossierCss = `
/* 細線色與選取用的琥珀色。套件不管這兩個 —— 它只有「紙、墨、硃」三個顏色，
   其餘都是使用端的介面配色，所以定義在這裡。 */
.lp { --rule: #c7bda8; --amber: #df8a42; }

/* 手寫批註。套件只管印刷，手寫是這一頁自己的東西，所以規則留在這裡。 */
.lp .hand { font-family: 'huninn', 'Noto Sans TC', sans-serif; color: var(--red); filter: var(--lp-t); }

/* 蓋章與逐字打字。同樣不屬於套件 —— 質感是靜態的，這兩個要 JS 切 class 才會動，
   而且只有這一頁在用。留在 kappan 裡會害它沒辦法宣稱自己不執行任何東西。
   .lp-ch 由 kappan 的 <Redacted> 產生，.pending 是這裡外掛上去的。 */
@keyframes lp-press {
  0% { opacity: 0; transform: scale(1.55) rotate(var(--press-rot, -6deg)); }
  55% { opacity: .95; transform: scale(.94) rotate(var(--press-rot, -6deg)); }
  75% { transform: scale(1.03) rotate(var(--press-rot, -6deg)); }
  100% { opacity: .84; transform: scale(1) rotate(var(--press-rot, -6deg)); }
}
.lp-press { opacity: 0; }
.lp-press.pressed { animation: lp-press .42s cubic-bezier(.2, .9, .3, 1) forwards; }
.lp-ch.pending { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .lp-press { opacity: .84; animation: none; }
  .lp-ch.pending { opacity: 1; }
}

/* SSR 先送出橫排備援；寬螢幕會在水合後換直排，先藏住免得閃一下橫排。
   JS 沒跑起來的話 1.3 秒後自己現身。 */
@keyframes lp-boot-in { to { opacity: 1; } }
@media (min-width: 62em) and (prefers-reduced-motion: no-preference) {
  .lp-stack.lp-boot { opacity: 0; animation: lp-boot-in .3s ease 1.3s forwards; }
}

.lp-photo {
  position: relative;
  z-index: 3;
  background: #fbf7ec;
  box-shadow: 0 1px 2px rgba(22, 19, 15, .28), 0 11px 24px rgba(22, 19, 15, .16);
}
.lp-ph { position: relative; overflow: hidden; isolation: isolate; background: #000; }
.lp-ph img { display: block; width: 100%; filter: sepia(.32) saturate(.7) contrast(.88) brightness(1.08) hue-rotate(-8deg); }
.lp-ph > i { position: absolute; inset: 0; display: block; pointer-events: none; }
.lp-ph .lift { background: #2c5c5a; mix-blend-mode: screen; opacity: .15; }
.lp-ph .warm {
  background: radial-gradient(125% 92% at 32% 10%, rgba(255, 216, 152, .6), rgba(213, 166, 108, .3) 54%, rgba(146, 116, 82, .34));
  mix-blend-mode: multiply;
  opacity: .52;
}
.lp-ph .emul { mix-blend-mode: soft-light; opacity: .38; background-image: ${grainUri(150, '0.9', 3, '0.7')}; }
.lp-ph .vig { box-shadow: inset 0 0 46px rgba(58, 42, 26, .36), inset 0 0 13px rgba(58, 42, 26, .22); }
.lp-ph .gloss { background: linear-gradient(112deg, rgba(255, 255, 255, .18), rgba(255, 255, 255, .04) 34%, transparent 55%); }

.lp-tape {
  position: absolute;
  height: 26px;
  z-index: 4;
  background: rgba(224, 206, 163, .5);
  box-shadow: 0 1px 2px rgba(22, 19, 15, .16);
  border-left: 1px solid rgba(255, 255, 255, .4);
  border-right: 1px solid rgba(255, 255, 255, .4);
}

.lp-loupe {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 6;
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--ink);
  background: rgba(251, 247, 236, .92);
  box-shadow: 0 2px 6px rgba(22, 19, 15, .3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.lp-loupe:hover { background: #fff; }

.lp-strip { background: #241f19; padding: 7px 8px; box-shadow: 0 4px 12px rgba(22, 19, 15, .22); }
.lp-strip button {
  display: block;
  padding: 0;
  border: 0;
  background: #0f0d0a;
  cursor: pointer;
  width: 100%;
}
.lp-strip button img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; }
.lp-strip button[aria-current='true'] { outline: 2px solid var(--amber); }
.lp-strip button:not([aria-current='true']) img { filter: brightness(.86); }

.lp-seal { border: 3px double var(--red); display: flex; align-items: center; justify-content: center; opacity: .82; }
.lp-seal > span { border: 1px solid rgba(162, 55, 42, .55); display: flex; align-items: center; justify-content: center; gap: 4px; }
.lp-seal .sg { writing-mode: vertical-rl; color: var(--red); font-weight: 600; letter-spacing: .18em; }

/* 藍圖：深藍曬圖紙＋細方格，圖本身反白後 screen 疊上去就成了白線稿。 */
.lp-bp {
  position: relative;
  overflow: hidden;
  background: #17456f;
  background-image:
    repeating-linear-gradient(0deg, rgba(214, 233, 255, .16) 0 1px, transparent 1px 13px),
    repeating-linear-gradient(90deg, rgba(214, 233, 255, .16) 0 1px, transparent 1px 13px),
    repeating-linear-gradient(0deg, rgba(214, 233, 255, .3) 0 1px, transparent 1px 65px),
    repeating-linear-gradient(90deg, rgba(214, 233, 255, .3) 0 1px, transparent 1px 65px),
    radial-gradient(120% 90% at 50% 0%, rgba(255, 255, 255, .13), transparent 62%);
  box-shadow: inset 0 0 34px rgba(4, 16, 32, .42);
  display: flex;
  align-items: center;
  justify-content: center;
}
.lp-bp::before, .lp-bp::after {
  content: '';
  position: absolute;
  width: 15px;
  height: 15px;
  z-index: 2;
  pointer-events: none;
}
.lp-bp::before { top: 7px; left: 7px; border-top: 1px solid rgba(214, 233, 255, .75); border-left: 1px solid rgba(214, 233, 255, .75); }
.lp-bp::after { bottom: 7px; right: 7px; border-bottom: 1px solid rgba(214, 233, 255, .75); border-right: 1px solid rgba(214, 233, 255, .75); }
.lp-bp .cap {
  position: absolute;
  left: 11px;
  bottom: 9px;
  z-index: 2;
  font-family: var(--latin);
  font-size: 9px;
  letter-spacing: .24em;
  color: rgba(214, 233, 255, .82);
}

.lp-credit { color: var(--red); text-decoration: underline; text-underline-offset: 2px; }
.lp-credit:hover { color: #16130f; }

.lp-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--ink);
  background: rgba(255, 255, 255, .24);
  padding: 14px 22px;
  color: inherit;
  cursor: pointer;
  font-family: var(--type);
}
.lp-btn:hover { background: rgba(255, 255, 255, .5); }

/* 橫向捲軸舞台：紙比視窗寬，質感層要跟著往右延伸，不然捲到後面就沒紙紋了。 */
.lp-track > .lp-fibre, .lp-track > .lp-grain, .lp-track > .lp-dirt { position: absolute; top: 0; bottom: 0; left: 0; right: -100vw; }

.lp-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; background: var(--paper); }
.lp-track {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--paper);
  width: max-content;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 48px;
  padding: 136px 56px 104px 268px;
  will-change: transform;
}
.lp-rail { position: absolute; left: 56px; right: 56px; bottom: 34px; z-index: 8; display: flex; flex-direction: row-reverse; align-items: center; gap: 14px; }
.lp-rail .bar-bg { flex-grow: 1; position: relative; height: 3px; background: rgba(22, 19, 15, .18); }
.lp-rail .bar-fg { position: absolute; right: 0; top: 0; height: 3px; background: var(--red); }

.lp-stack { max-width: 720px; margin: 0 auto; padding: 26px 20px 60px; border-left: 3px solid rgba(162, 55, 42, .32); }
.lp-row { display: flex; align-items: baseline; gap: 14px; padding: 12px 2px; border-bottom: 1px dotted var(--rule); }
.lp-row:last-child { border-bottom: 1px solid var(--ink); }
.lp-sec { display: flex; align-items: baseline; gap: 12px; margin-top: 46px; }
.lp-sec .line { flex-grow: 1; border-top: 1px solid var(--ink); opacity: .55; }
`

/** 質感層＋這一頁的版面，一次注入。 */
export const DossierStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: letterpressCss(OPTIONS) + dossierCss }} />
)

/** 濾鏡本體。整頁只掛一份。 */
export const DossierFilters = () => <LetterpressFilters {...OPTIONS} />
