import React, { useId } from 'react'
import { AKITRA_CHE, HUNINN_FEN, NIXIE_EIGHT } from './fontGlyphPaths'

// flyout 用的圖示：統一 44x44 的視覺框，線條風格對齊 components/ui/icons.tsx
const svgProps = {
  width: '44',
  height: '44',
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

type IconProps = React.SVGProps<SVGSVGElement>

// 作品集／字體集共用的「總覽」圖示
export const CollectionIcon = (props: IconProps) => (
  <svg {...svgProps} {...props}>
    <rect x="8" y="8" width="14" height="14" rx="3" />
    <rect x="26" y="8" width="14" height="14" rx="3" />
    <rect x="8" y="26" width="14" height="14" rx="3" />
    <rect x="26" y="26" width="14" height="14" rx="3" />
  </svg>
)

/* ---------- Works ---------- */

// 千秋輸入法：鍵盤
export const ChiaKeyIcon = (props: IconProps) => (
  <svg {...svgProps} {...props}>
    <rect x="6" y="14" width="36" height="21" rx="3" />
    <path d="M12 20h3M19 20h3M26 20h3M33 20h3" />
    <path d="M12 26h3M19 26h3M26 26h3M33 26h3" />
    <path d="M16 31h16" />
  </svg>
)

// Kumiko：專案本身的組子六角 logo（取自 kumiko-font-editor 的 logo.svg）。
// 原檔用 <style> 寫死 stroke:#000，這裡改走 currentColor 才能跟著 nav 的深色底與 hover 變色。
export const KumikoIcon = (props: IconProps) => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 400 400"
    fill="none"
    stroke="currentColor"
    strokeWidth={13}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="200 33.33 344.34 116.67 344.34 283.33 200 366.67 55.66 283.33 55.66 116.67 200 33.33" />
    <line x1="200" y1="150.13" x2="200" y2="366.67" />
    <line x1="200" y1="33.33" x2="200" y2="107.27" strokeWidth={5.4} />
    <line x1="119.58" y1="246.45" x2="55.66" y2="283.33" strokeWidth={5.4} />
    <line x1="344.34" y1="116.67" x2="153.62" y2="226.78" />
    <line x1="248.98" y1="228.28" x2="59.13" y2="118.67" />
    <line x1="344.34" y1="283.33" x2="278.79" y2="245.49" strokeWidth={5.4} />
    <line x1="248.11" y1="116.67" x2="151.89" y2="283.33" />
    <line x1="296.22" y1="200" x2="103.78" y2="199.99" />
    <line x1="248.11" y1="283.33" x2="151.89" y2="116.67" />
    <polyline points="296.22 200 344.34 283.33 248.11 283.33" />
    <polyline points="151.89 116.67 200 33.33 248.11 116.67" />
    <polyline points="151.89 283.33 55.66 283.33 103.78 199.99" />
    <polyline points="248.11 283.33 200 366.67 151.89 283.33" />
    <polyline points="248.11 116.67 344.34 116.67 296.22 200" />
    <polyline points="103.78 199.99 55.66 116.67 151.89 116.67" />
    <circle cx="200" cy="107.27" r="11.41" fill="currentColor" stroke="none" />
    <circle
      cx="278.8"
      cy="245.49"
      r="11.41"
      transform="translate(-73.2 364.19) rotate(-60)"
      fill="currentColor"
      stroke="none"
    />
    <path
      d="M128.25,253.88c-6.03,6.72-16.39,4.51-19.41-3.48-1.69-4.48-.3-9.69,3.41-12.73,6.61-5.41,16.68-2.14,18.55,6.69.71,3.37-.24,6.94-2.55,9.51h0Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
)

// 東京乃空：噗浪面板與天空
export const TokyonoIcon = (props: IconProps) => (
  <svg {...svgProps} {...props}>
    <rect x="5" y="10" width="38" height="28" rx="4" />
    <path d="M5 18h38" />
    <circle cx="10.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
    <path
      d="M12 32h13a4.5 4.5 0 0 0 .6-8.9A6.4 6.4 0 0 0 12 24.6 3.7 3.7 0 0 0 12 32Z"
      opacity=".85"
    />
    <circle cx="35" cy="26" r="3.4" opacity=".7" />
  </svg>
)

// tg.jpg：Telegram 圓形標記疊在圖片框右下角。
// 用 mask 在圖片框上挖掉標記周圍一圈，兩者才會讀成前後重疊而不是兩個各自獨立的圖案。
export const TgJpgIcon = (props: IconProps) => {
  // useId() 會回傳帶冒號的值（:r0:），冒號在 url(#...) 這種片段參照裡不可靠，先清掉
  const maskId = `tg-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg {...svgProps} {...props}>
      <mask id={maskId}>
        <rect x="0" y="0" width="48" height="48" fill="white" />
        <circle cx="32.5" cy="31.5" r="10.5" fill="black" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect x="5" y="8" width="30" height="23" rx="3" />
        <circle cx="12" cy="14.5" r="2" />
        <path d="M5.5 26l5-4.5a2.2 2.2 0 0 1 3 0L22 31" />
      </g>
      <circle cx="32.5" cy="31.5" r="8.5" />
      <path
        d="M37.1 27.9 27.9 31.5l3.4 1.3 1.3 3.4 4.5-8.3Z"
        fill="currentColor"
        fillOpacity=".2"
      />
      <path d="M37.1 27.9 31.3 32.8" />
    </svg>
  )
}

// react-split-flap：翻頁字盤，中央一道翻頁接縫橫貫
export const SplitFlapIcon = (props: IconProps) => (
  <svg {...svgProps} {...props}>
    <rect x="5" y="13" width="38" height="22" rx="3" />
    <text
      x="24"
      y="24"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="13"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      特急
    </text>
    <path d="M5 24h38" />
  </svg>
)

/* ---------- Story ---------- */

// 故事：書本（外框封閉，左側為書背）
export const StoryIcon = (props: IconProps) => (
  <svg {...svgProps} {...props}>
    <rect x="9" y="6" width="30" height="36" rx="4" />
    <path d="M17 6v36" />
    <path d="M23 16h10M23 24h10M23 32h6" opacity=".7" />
  </svg>
)

// 角色介紹：一般使用者圖示
export const CharacterIcon = (props: IconProps) => (
  <svg {...svgProps} {...props}>
    <circle cx="24" cy="17" r="7.5" />
    <path d="M9.5 38.5a14.5 14.5 0 0 1 29 0" />
  </svg>
)

// 角色作品集：畫廊
export const ArtIcon = (props: IconProps) => (
  <svg {...svgProps} {...props}>
    <rect x="12" y="7" width="30" height="24" rx="3" />
    <circle cx="21" cy="15" r="2.4" />
    <path d="M12 26l7-6.5a2.6 2.6 0 0 1 3.6 0L32 29" />
    <path d="M35 36H10a4 4 0 0 1-4-4V13" opacity=".6" />
  </svg>
)

/* ---------- Fonts ---------- */

// 字體項目用烤好的字符外框（見 fontGlyphPaths.ts），不再即時載入字體。
// strokeWidth 用來補字重 —— 取代原本的 -webkit-text-stroke，數值換算到 viewBox 座標。
const GlyphIcon = ({ d, strokeWidth, ...props }: IconProps & { d: string }) => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 48 48"
    fill="currentColor"
    stroke={strokeWidth ? 'currentColor' : 'none'}
    strokeWidth={strokeWidth}
    strokeLinejoin="round"
    {...props}
  >
    <path d={d} />
  </svg>
)

export const AkitraIcon = (props: IconProps) => (
  <GlyphIcon d={AKITRA_CHE} {...props} />
)

// 0.7px 的字面描邊換算到 viewBox：0.7 * 48/44 ≈ 0.76
export const NixieIcon = (props: IconProps) => (
  <GlyphIcon d={NIXIE_EIGHT} strokeWidth={0.76} {...props} />
)

export const HuninnIcon = (props: IconProps) => (
  <GlyphIcon d={HUNINN_FEN} {...props} />
)
