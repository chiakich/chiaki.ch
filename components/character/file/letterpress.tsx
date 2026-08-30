// 鉛字質感層。紙紋、混色與 writing-mode 全是任意值，走 Panda 會在 cssgen 沒跑到時整條消失，
// 所以集中成字串由頁面注入一次。

const PAPER = '#efe9db'
const RED = '#a2372a'
export const RULE = '#16130f'
export const HAIRLINE = '#c7bda8'
export const PANEL_BG = 'rgba(255, 255, 255, .18)'

const grainUri = (size: number, freq: string, octaves: number, opacity: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${octaves}' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='${size}' height='${size}' filter='url(%23n)' opacity='${opacity}'/%3E%3C/svg%3E")`

export const letterpressCss = `
/* 日星宋體沒有直排替代字形，標點碼位改用自家子集出的 Noto Serif TC（含 vert/vrt2），
   其餘字照用日星。 */
@font-face {
  font-family: 'lp-punct';
  src: url('/fonts/lp-punct.woff2') format('woff2');
  font-weight: 600;
  font-display: block;
  unicode-range: U+2013-2015, U+2018-201D, U+2025-2026, U+3001-3011, U+3014-301F, U+30FB, U+FF01-FF0F, U+FF1A-FF20, U+FF3B-FF40, U+FF5B-FF65;
}
/* SSR 先送出橫排備援；寬螢幕會在水合後換直排，先藏住免得閃一下橫排。
   JS 沒跑起來的話 1.3 秒後自己現身。 */
@keyframes lp-boot-in { to { opacity: 1; } }
@media (min-width: 62em) and (prefers-reduced-motion: no-preference) {
  .lp-stack.lp-boot { opacity: 0; animation: lp-boot-in .3s ease 1.3s forwards; }
}
.lp {
  --paper: ${PAPER};
  --ink: #000;
  --ink3: #000;
  --rule: #c7bda8;
  --red: ${RED};
  --amber: #df8a42;
  --song: 'lp-punct', 'rixingsong-semibold', 'Noto Serif TC', 'Songti TC', serif;
  --type: 'Courier New', ui-monospace, monospace;
  --hand: 'huninn', 'Noto Sans TC', sans-serif;
  --pitch: 46px;
  --lp-s: url(#lp-s);
  --lp-t: url(#lp-t);
  --lp-d: url(#lp-d);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--song);
}
.lp *, .lp *::before, .lp *::after { box-sizing: border-box; }

.lp .sg, .lp .tp, .lp .hand, .lp p { filter: var(--lp-t); }
.lp .lbl { filter: var(--lp-s); }
.lp h1, .lp h2, .lp h1.sg, .lp h2.sg, .lp .stamp, .lp .bar { filter: var(--lp-d); }
.lp .stamp .sg, .lp .bar .sg { filter: none; }

.lp .sg { font-family: var(--song); text-shadow: 0 0 .6px rgba(0, 0, 0, .6); }
.lp .tp { font-family: var(--type); text-shadow: .35px .3px 0 rgba(0, 0, 0, .2), 1.3px 1.2px 0 rgba(0, 0, 0, .1); }
.lp .hand { font-family: var(--hand); color: var(--red); }
.lp .lbl {
  font-family: var(--type);
  font-size: 10px;
  letter-spacing: .2em;
  color: var(--ink3);
  text-transform: uppercase;
}
.lp h1, .lp h2 { margin: 0; font-weight: 600; }

.lp .bar {
  display: inline-block;
  inline-size: var(--bar-w, 42px);
  block-size: .95em;
  background: var(--ink);
  border-radius: 1px;
  vertical-align: -.12em;
}

.lp-fibre, .lp-expose, .lp-grain, .lp-dirt, .lp-spine { position: absolute; inset: 0; pointer-events: none; }
.lp-fibre {
  z-index: 0;
  background-image:
    repeating-linear-gradient(0deg, rgba(22, 19, 15, .03) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, rgba(22, 19, 15, .02) 0 1px, transparent 1px 4px);
}
.lp-expose {
  z-index: 0;
  background:
    radial-gradient(115% 62% at 50% 26%, rgba(255, 255, 255, .2), transparent 62%),
    radial-gradient(100% 70% at 50% 104%, rgba(22, 19, 15, .12), transparent 72%);
}
.lp-spine {
  z-index: 0;
  right: auto;
  width: 118px;
  opacity: .24;
  background: linear-gradient(90deg, rgba(22, 19, 15, .85), rgba(22, 19, 15, .16) 46%, transparent);
}
.lp-grain {
  z-index: 2;
  mix-blend-mode: multiply;
  opacity: .34;
  background-image: ${grainUri(170, '0.82', 4, '0.62')};
}
.lp-dirt { z-index: 2; }
.lp-dirt i {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: rgba(22, 19, 15, .46);
}
.lp-dirt i.hair { border-radius: 0; height: 1px; background: rgba(22, 19, 15, .28); }

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
  font-family: var(--type);
  font-size: 9px;
  letter-spacing: .24em;
  color: rgba(214, 233, 255, .82);
}

  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  z-index: 1;
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
  font-family: var(--song);
}
.lp-btn:hover { background: rgba(255, 255, 255, .5); }

.lp-v { writing-mode: vertical-rl; }
.lp-ch { opacity: 1; }
.lp-ch.cj { display: inline-block; }
.lp-ch:not(.cj) { position: relative; }
.lp-ch:not(.cj):nth-child(19n+8) { top: .6px; }
.lp-ch:not(.cj):nth-child(29n+3) { top: -.6px; color: rgba(0, 0, 0, .88); }
.lp-ch:not(.cj):nth-child(5n+1) { color: rgba(8, 8, 8, .92); }
.lp-ch:not(.cj):nth-child(7n+4) { color: rgba(12, 12, 12, .8); }
.lp-ch:not(.cj):nth-child(13n+6) { color: rgba(0, 0, 0, .68); }
.lp-ch:not(.cj):nth-child(11n+2) { text-shadow: .5px 0 0 rgba(0, 0, 0, .85), 0 .5px 0 rgba(0, 0, 0, .7); }
.lp-ch:not(.cj):nth-child(43n+17) { display: inline-block; transform: rotate(2.4deg); }
.lp-ch:not(.cj):nth-child(59n+31) { display: inline-block; transform: rotate(-2.8deg); top: .4px; }
.lp-flat .lp-ch { transform: none !important; top: 0 !important; }
.lp-ch.pending { opacity: 0; }
.lp-ch.cj:nth-child(3n+1) { transform: rotate(.45deg) translateX(.3px); }
.lp-ch.cj:nth-child(5n+2) { transform: rotate(-.55deg) translateX(-.35px); }
.lp-ch.cj:nth-child(7n+4) { transform: translateY(.5px) rotate(.25deg); }
.lp-ch.cj:nth-child(11n+6) { color: rgba(0, 0, 0, .84); }
.lp-ch.cj:nth-child(13n+8) { text-shadow: .45px 0 0 #000, -.45px 0 0 #000, 0 .45px .3px #000; }
.lp-ch.cj:nth-child(17n+3) { color: rgba(0, 0, 0, .92); transform: rotate(-.3deg) translateY(-.4px); }
.lp-ch.cj:nth-child(23n+11) { text-shadow: .35px .35px 0 #000; transform: rotate(.2deg); }
.lp-ch.cj:nth-child(19n+7) { transform: rotate(2.6deg) translateY(.7px); }
.lp-ch.cj:nth-child(29n+17) { transform: rotate(-3.2deg) translateX(.6px); }
.lp-ch.cj:nth-child(31n+5) { transform: rotate(1.9deg) translateX(-.9px) translateY(.6px); }
.lp-ch.cj:nth-child(41n+23) { transform: rotate(-2.3deg) translateY(-.7px); }
/* 直排格子：把「標籤＋內容」當一組，沿水平（區塊軸）置中，才會坐在格線正中間。 */
.lp-cell { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }
.lp-typed, .lp-typed p { line-height: var(--pitch); }
.lp-typed p { margin: 0; }
.lp-ruled { background-image: repeating-linear-gradient(270deg, transparent 0 calc(var(--pitch) - 1px), rgba(162, 55, 42, .15) calc(var(--pitch) - 1px) var(--pitch)); }
.lp-track > .lp-fibre, .lp-track > .lp-grain, .lp-track > .lp-dirt { position: absolute; top: 0; bottom: 0; left: 0; right: -100vw; }

.lp-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }
.lp-stage { background: var(--paper); }
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

@keyframes lp-press {
  0% { opacity: 0; transform: scale(1.55) rotate(var(--press-rot, -6deg)); }
  55% { opacity: .95; transform: scale(.94) rotate(var(--press-rot, -6deg)); }
  75% { transform: scale(1.03) rotate(var(--press-rot, -6deg)); }
  100% { opacity: .84; transform: scale(1) rotate(var(--press-rot, -6deg)); }
}
.lp-press { opacity: 0; }
.lp-press.pressed { animation: lp-press .42s cubic-bezier(.2, .9, .3, 1) forwards; }

@media (prefers-reduced-motion: reduce) {
  .lp-press { opacity: .84; animation: none; }
  .lp-ch.pending { opacity: 1; }
}
`

/**
 * 濾鏡本體。整頁只掛一份，class 用 var(--lp-*) 指過來。
 */
export const LetterpressFilters = () => (
  <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
    <filter id="lp-s" x="-14%" y="-14%" width="128%" height="128%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={2} seed={4} result="fib" />
      <feDisplacementMap in="SourceGraphic" in2="fib" scale={0.55} xChannelSelector="R" yChannelSelector="G" result="rough" />
      <feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves={3} seed={31} result="mot" />
      <feColorMatrix in="mot" type="luminanceToAlpha" result="motl" />
      <feComponentTransfer in="motl" result="chip">
        <feFuncA type="discrete" tableValues="0 0 0 0 0 0 1" />
      </feComponentTransfer>
      <feComposite in="rough" in2="chip" operator="out" result="chipped" />
      <feGaussianBlur in="chipped" stdDeviation={0.2} result="b" />
      <feComponentTransfer in="b">
        <feFuncA type="linear" slope={2.7} intercept={-0.1} />
      </feComponentTransfer>
    </filter>

    <filter id="lp-t" x="-16%" y="-16%" width="132%" height="132%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.88" numOctaves={3} seed={9} result="fib" />
      <feDisplacementMap in="SourceGraphic" in2="fib" scale={1.1} xChannelSelector="R" yChannelSelector="G" result="rough" />
      <feTurbulence type="fractalNoise" baseFrequency="1.05" numOctaves={4} seed={27} result="mot" />
      <feColorMatrix in="mot" type="luminanceToAlpha" result="motl" />
      <feComponentTransfer in="motl" result="chip">
        <feFuncA type="discrete" tableValues="0 0 0 0 0 0 1" />
      </feComponentTransfer>
      <feComposite in="rough" in2="chip" operator="out" result="chipped" />
      <feGaussianBlur in="chipped" stdDeviation={0.28} result="b" />
      <feComponentTransfer in="b">
        <feFuncA type="linear" slope={3.2} intercept={-0.12} />
      </feComponentTransfer>
    </filter>

    <filter id="lp-d" x="-22%" y="-22%" width="144%" height="144%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} seed={13} result="fib" />
      <feDisplacementMap in="SourceGraphic" in2="fib" scale={1.5} xChannelSelector="R" yChannelSelector="G" result="rough" />
      <feMorphology in="rough" operator="dilate" radius={0.2} result="gain" />
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={4} seed={19} result="mot" />
      <feColorMatrix in="mot" type="luminanceToAlpha" result="motl" />
      <feComponentTransfer in="motl" result="chip">
        <feFuncA type="discrete" tableValues="0 0 0 1" />
      </feComponentTransfer>
      <feComposite in="gain" in2="chip" operator="out" result="chipped" />
      <feGaussianBlur in="chipped" stdDeviation={0.22} result="b" />
      <feComponentTransfer in="b">
        <feFuncA type="linear" slope={5.6} intercept={-0.14} />
      </feComponentTransfer>
    </filter>
  </svg>
)

/** 注入質感層的規則。每頁一次就好。 */
export const LetterpressStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: letterpressCss }} />
)
