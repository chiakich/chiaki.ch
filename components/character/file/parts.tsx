import React from 'react'
import { HAIRLINE, PANEL_BG, RULE } from './letterpress'
import { styled } from 'styled-system/jsx'

const Img = styled.img

/** 附錄面板的標題列。直排版與堆疊版共用，只差書寫方向。 */
export const AnnexHeading = ({
  title,
  tag,
  stacked,
}: {
  title: string
  tag: string
  stacked?: boolean
}) => (
  <div
    style={
      stacked
        ? {
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${HAIRLINE}`,
            paddingBottom: 10,
          }
        : {
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'baseline',
            gap: 14,
            borderBottom: `1px solid ${RULE}`,
            paddingBottom: 8,
          }
    }
  >
    <span className="sg" style={{ fontSize: stacked ? 18 : 22, fontWeight: 600, letterSpacing: '.16em' }}>
      {title}
    </span>
    <span className={stacked ? 'tp' : 'lbl'} style={{ fontSize: stacked ? 9 : 10, letterSpacing: '.18em' }}>
      {tag}
    </span>
  </div>
)

/** 附錄內的小標題（項目名＋編號）。 */
export const PanelTitle = ({ title, tag }: { title: string; tag: string }) => (
  <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'baseline', gap: 10 }}>
    <span className="sg" style={{ fontSize: 19, fontWeight: 600, letterSpacing: '.1em' }}>
      {title}
    </span>
    <span className="tp" style={{ fontSize: 9, letterSpacing: '.18em', color: '#000' }}>
      {tag}
    </span>
  </div>
)

/** 直排版附錄的內框：紙上壓一塊淡底，右起橫向分欄。 */
export const AnnexPanel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      border: `1px solid ${RULE}`,
      background: PANEL_BG,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'row-reverse',
      gap: 14,
      flexGrow: 1,
      minHeight: 0,
    }}
  >
    {children}
  </div>
)

// 中日字才吃鉛字歪斜；拉丁字太密，歪起來不自然。空格不包，包了會被 inline-block 吃掉。
const CJ = /[\u2E80-\u9FFF\u3000-\u30FF\uF900-\uFAFF\uFF00-\uFFEF]/

// 逐字包成 span，打字時才有辦法一個一個放出來；連續的 █ 換成黑條。
export const Redacted = ({ text }: { text: string }) => (
  <>
    {text.split(/(█+)/).map((chunk, i) =>
      chunk.startsWith('█') ? (
        <span
          key={i}
          className="lp-ch bar"
          style={{ '--bar-w': `${chunk.length * 14}px` } as React.CSSProperties}
        />
      ) : (
        Array.from(chunk).map((ch, j) =>
          ch === ' ' ? (
            ' '
          ) : (
            <span key={`${i}-${j}`} className={CJ.test(ch) ? 'lp-ch cj' : 'lp-ch'}>
              {ch}
            </span>
          )
        )
      )
    )}
  </>
)

export const Seal = ({
  lines,
  size = 118,
  fontSize = 19,
  rotate = -6,
  pressed,
}: {
  lines: string[]
  size?: number
  fontSize?: number
  rotate?: number
  pressed?: boolean
}) => (
  <div
    className={`stamp lp-seal lp-press${pressed ? ' pressed' : ''}`}
    style={{ width: size, height: size, '--press-rot': `${rotate}deg` } as React.CSSProperties}
  >
    <span style={{ width: size - 22, height: size - 22 }}>
      {lines.map((line) => (
        <span key={line} className="sg" style={{ fontSize }}>
          {line}
        </span>
      ))}
    </span>
  </div>
)

export const LoupeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15 L20.5 20.5" />
    <path d="M8 10.5h5M10.5 8v5" strokeWidth="1.2" />
  </svg>
)

interface PhotoPlateProps {
  src: string
  alt: string
  caption: string
  note?: string
  height?: number
  ratio?: string
  fill?: boolean
  rotate?: number
  tapes?: { left?: string; right?: string; width: number; angle: number }[]
  onOpen?: () => void
  openLabel?: string
}

export const PhotoPlate = ({
  src,
  alt,
  caption,
  note,
  height,
  ratio,
  fill,
  rotate = -1.2,
  tapes = [],
  onOpen,
  openLabel,
}: PhotoPlateProps) => (
  <div
    style={
      fill
        ? { position: 'relative', paddingTop: 14, flex: 1, minHeight: 0, display: 'flex' }
        : { position: 'relative', paddingTop: 14 }
    }
  >
    {tapes.map((tape, i) => (
      <span
        key={i}
        className="lp-tape"
        style={{
          top: 2 + i * 4,
          left: tape.left,
          right: tape.right,
          width: tape.width,
          transform: `rotate(${tape.angle}deg)`,
        }}
      />
    ))}
    <div
      className="lp-photo"
      style={
        fill
          ? {
              padding: '13px 13px 38px',
              transform: `rotate(${rotate}deg)`,
              flex: 1,
              minHeight: 0,
              width: 'fit-content',
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
            }
          : { padding: '13px 13px 44px', transform: `rotate(${rotate}deg)` }
      }
    >
      <div className="lp-ph" style={fill ? { flex: 1, minHeight: 0, width: 'fit-content' } : undefined}>
        <Img
          src={src}
          alt={alt}
          style={
            fill
              ? { width: '100%', height: '100%', objectFit: 'contain' }
              : ratio
                ? { width: '100%', aspectRatio: ratio, objectFit: 'contain' }
                : height
                  ? { height, objectFit: 'contain' }
                  : { display: 'block', width: '100%', height: 'auto' }
          }
          decoding="async" />
        <i className="lift" />
        <i className="warm" />
        <i className="emul" />
        <i className="vig" />
        <i className="gloss" />
        {onOpen && (
          <button type="button" className="lp-loupe" onClick={onOpen} aria-label={openLabel}>
            <LoupeIcon />
          </button>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 11,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <span className="sg" style={{ fontSize: 15, letterSpacing: '.08em' }}>
          {caption}
        </span>
        {note && (
          <span className="sg" style={{ fontSize: 12, letterSpacing: '.14em', opacity: 0.72 }}>
            {note}
          </span>
        )}
      </div>
    </div>
  </div>
)

interface ContactStripProps {
  images: string[]
  current: number
  onSelect: (index: number) => void
  alt: string
  frameRatio?: string
}

export const ContactStrip = ({
  images,
  current,
  onSelect,
  alt,
  frameRatio = '1 / 1',
}: ContactStripProps) => (
  <div className="lp-strip" style={{ transform: 'rotate(.5deg)', position: 'relative', zIndex: 3 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} style={{ width: 7, height: 5, background: '#d8d0bd' }} />
      ))}
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))`,
        gap: 5,
      }}
    >
      {images.map((src, index) => (
        <button
          key={src}
          type="button"
          onClick={() => onSelect(index)}
          aria-current={current === index}
          aria-label={`${alt} ${index + 1}`}
          style={{ aspectRatio: frameRatio }}
        >
          <Img src={src} alt="" loading="lazy" decoding="async" />
        </button>
      ))}
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))`,
        gap: 5,
        marginTop: 4,
      }}
    >
      {images.map((src, index) => (
        <span
          key={src}
          className="tp"
          style={{
            fontSize: 9,
            letterSpacing: '.16em',
            color: current === index ? '#df8a42' : '#8a8071',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      ))}
    </div>
  </div>
)

export const Blueprint = ({
  label,
  children,
  style,
}: {
  label: string
  children: React.ReactNode
  style?: React.CSSProperties
}) => (
  <div className="lp-bp" style={style}>
    {children}
    <span className="cap">{label}</span>
  </div>
)

export const ViewportLabel = ({ title, state }: { title: string; state?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="7.5" />
    </svg>
    <span className="tp" style={{ fontSize: 10, letterSpacing: '.26em', color: '#000' }}>
      {title}
    </span>
    {state && (
      <span className="tp" style={{ fontSize: 10, letterSpacing: '.18em', color: '#a2372a' }}>
        {state}
      </span>
    )}
  </div>
)

const SPECKS = [
  { top: '18%', left: '14%', size: 3 },
  { top: '62%', left: '31%', size: 2 },
  { top: '41%', left: '68%', size: 4 },
  { top: '77%', left: '84%', size: 3 },
  { top: '29%', left: '52%', size: 2 },
]
const HAIRS = [
  { top: '36%', left: '22%', width: 46, angle: 24 },
  { top: '69%', left: '58%', width: 62, angle: -12 },
]

export const CopierDirt = () => (
  <div className="lp-dirt" aria-hidden="true">
    {SPECKS.map((s, i) => (
      <i key={i} style={{ top: s.top, left: s.left, width: s.size, height: s.size }} />
    ))}
    {HAIRS.map((h, i) => (
      <i
        key={i}
        className="hair"
        style={{ top: h.top, left: h.left, width: h.width, transform: `rotate(${h.angle}deg)` }}
      />
    ))}
  </div>
)

export const PaperBase = () => (
  <>
    <div className="lp-fibre" aria-hidden="true" />
    <div className="lp-expose" aria-hidden="true" />
    <div className="lp-spine" aria-hidden="true" />
  </>
)
