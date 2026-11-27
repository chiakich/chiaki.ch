import type { CSSProperties, ReactNode } from 'react'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { JOST, LANGS, ORANGE, SNOW } from './chiakiData'
import { LINES, type Line, type SongLine } from './songData'

const Span = styled.span

export const LANTERN = '#ffb46b'
export const GLOW = '0 0 18px rgba(255,170,90,.5), 0 2px 6px rgba(8,10,24,.85)'
export const SHADOW = '0 1px 4px rgba(8,10,24,.85)'
const IGNITE = '0 0 26px rgba(255,170,90,.95), 0 0 8px rgba(255,200,130,.9)'
const EMBER = '#fff1d8'
const EASE = 'cubic-bezier(.2,.8,.2,1)'
const TONE = 'color 1.2s ease, text-shadow 1.2s ease'
const OUT = 'chiakiPvOut .6s ease forwards'
// The title lockup only completes on its last note, so it lingers a little into the next line
const OUT_SLOW = 'chiakiPvOut 1.1s ease forwards'

const LIT: CSSProperties = { color: LANTERN, textShadow: GLOW }
// Outline-only lettering stands for what is unsaid, unborn or gone
// The PV page thickens the stroke and adds a faint fill, since a hairline vanishes against a busy picture
const HOLLOW: CSSProperties = { color: 'var(--hollow-fill, transparent)', WebkitTextStroke: 'var(--hollow, 1px) rgba(238,242,245,.8)', textShadow: 'none' }

export const tagOf = (line: SongLine) => (line.code ? LANGS.find((lang) => lang.code === line.code)?.tag : 'ja')

// Kanji carry the meaning so they stand largest; particles shrink back, as in PV lettering
const PARTICLES = new Set([...'のがにをはへもでとねよ'])
export const charStyle = (char: string): CSSProperties => {
  if (/[一-鿿]/.test(char)) return { fontSize: '1.18em' }
  if (PARTICLES.has(char)) return { fontSize: '.6em', fontWeight: 700 }
  if (/[぀-ゟ]/.test(char)) return { fontSize: '.84em' }
  return {}
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const span = (time: number, from: number, to: number) => clamp((time - from) / (to - from))
const ease = (u: number) => 1 - (1 - u) ** 3

type Fx = 'drift' | 'glow' | 'pass' | 'scatter' | 'pop' | 'rise' | 'sit' | 'far' | 'type' | 'soft'

const TRANSITIONS: Record<Fx, string> = {
  drift: `opacity .5s ease, filter .7s ease, translate .7s ${EASE}, ${TONE}`,
  glow: 'opacity .3s ease, filter .5s ease, scale .7s cubic-bezier(.2,1.3,.4,1), color 1.8s ease, text-shadow 1.8s ease',
  pass: `opacity .5s ease, filter .6s ease, translate .8s ${EASE}, ${TONE}`,
  scatter: `opacity .5s ease, filter .8s ease, translate 1s ${EASE}, rotate 1s ${EASE}, ${TONE}`,
  pop: `opacity .2s ease, filter .3s ease, scale .5s cubic-bezier(.2,1.6,.4,1), ${TONE}`,
  rise: `opacity .6s ease, filter .8s ease, translate .9s ${EASE}, ${TONE}`,
  sit: `opacity .25s ease, translate .6s cubic-bezier(.3,1.5,.5,1), ${TONE}`,
  far: `opacity .8s ease, filter 1s ease, scale 1.2s ${EASE}, translate 1.2s ${EASE}, ${TONE}`,
  type: `opacity .05s linear, ${TONE}`,
  soft: `opacity 1.1s ease, filter 1.3s ease, scale 1.3s ease, ${TONE}`,
}

// The pose a character waits in before it is sung; showing it transitions back to rest
const hidden = (fx: Fx, k: number): CSSProperties => {
  switch (fx) {
    case 'glow': return { opacity: 0, scale: '.4', filter: 'blur(4px)' }
    case 'pass': return { opacity: 0, translate: '1.4em 0', filter: 'blur(3px)' }
    case 'scatter': {
      const angle = ((k * 137) % 360) * (Math.PI / 180)
      return { opacity: 0, translate: `${(Math.cos(angle) * 1.6).toFixed(2)}em ${(Math.sin(angle) * 1.6).toFixed(2)}em`, rotate: `${((k * 53) % 80) - 40}deg`, filter: 'blur(4px)' }
    }
    case 'pop': return { opacity: 0, scale: '1.9', filter: 'blur(2px)' }
    case 'rise': return { opacity: 0, translate: '0 .9em', filter: 'blur(5px)' }
    case 'sit': return { opacity: 0, translate: '0 -1.1em' }
    case 'far': return { opacity: 0, scale: '.5', translate: '0 -.2em', filter: 'blur(5px)' }
    case 'type': return { opacity: 0 }
    case 'soft': return { opacity: 0, scale: '1.15', filter: 'blur(10px)' }
    default: return { opacity: 0, translate: '0 -.45em', filter: 'blur(6px)' }
  }
}

const REST: CSSProperties = { opacity: 1, translate: '0 0', scale: '1', rotate: '0deg', filter: 'blur(0)' }

type Ctx = { line: Line; time: number; count: number; at: (index: number) => boolean }

const heldUntil = (c: Ctx, i: number) => c.line.times[i + 1] ?? c.line.end

// Long notes swell while they are held; the ambient keyframes use transform, so entrances keep the standalone properties
const swell = (c: Ctx, i: number): CSSProperties | null => {
  const from = c.line.times[i]
  const to = heldUntil(c, i)
  if (to - from < 1) return null
  const lift = Math.sin(span(c.time, from, to) * Math.PI)
  return { transform: `translateY(${(-0.05 * lift).toFixed(3)}em) scale(${(1 + 0.08 * lift).toFixed(3)})` }
}

// text-shadow paints over background-clip text, so the wipe carries its shadow as a filter instead
const wipe = (c: Ctx, i: number): CSSProperties => {
  const stop = `${(span(c.time, c.line.times[i], heldUntil(c, i)) * 100).toFixed(1)}%`
  return { color: 'transparent', backgroundImage: `linear-gradient(90deg, ${LANTERN} ${stop}, ${SNOW} ${stop})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', textShadow: 'none', filter: `blur(0) drop-shadow(${SHADOW})` }
}

const sway = (i: number, degrees: number, seconds = 3.6): CSSProperties => ({
  animation: `chiakiPvSway ${seconds}s ${(-i * 0.7).toFixed(1)}s ease-in-out infinite`,
  ['--sway' as string]: `${degrees}deg`,
})

const Orb = ({ x, y, o = 1, size = 0.2 }: { x: string; y: string; o?: number; size?: number }) => (
  <Span position="absolute" borderRadius="50%" style={{ left: x, top: y, width: `${size}em`, height: `${size}em`, margin: `${-size / 2}em`, opacity: o, backgroundColor: EMBER, boxShadow: '0 0 .3em .06em rgba(255,185,110,.9), 0 0 .9em .2em rgba(255,160,80,.35)' }} />
)

// Trailing copies sample the same path a little earlier, which reads as a comet tail
const trail = (u: number, path: (v: number) => [string, string], o = 1) =>
  [0, 1, 2, 3].map((n) => {
    const v = u - n * 0.05
    if (v < 0) return null
    const [x, y] = path(v)
    return <Orb key={n} x={x} y={y} o={o * (1 - n * 0.27)} size={0.2 - n * 0.035} />
  })

// Where the handed-over light is at a given moment: it waits over the first 人, crouches, leaps so that it
// lands as the second 人 is sung, bounces to rest, then takes off with 渡されて.
// Sampling this at earlier times gives a tail that stretches in flight and closes up at rest
const relay = (t: number[], time: number): [x: number, y: number, o: number] => {
  const bob = Math.sin(time * 3.4) * 0.035
  const leave = span(time, t[5] - 0.1, t[8])
  if (leave > 0) {
    const run = leave * leave
    const crouch = 0.14 * Math.sin(clamp(leave * 4) * Math.PI)
    return [74 + 85 * run, -0.15 + crouch + bob * (1 - clamp(leave * 4)) - 1.7 * Math.sin((run * Math.PI) / 2), 1 - run]
  }
  const hop = span(time, t[3] - 0.55, t[3])
  if (hop >= 1) {
    const settle = span(time, t[3], t[3] + 0.45)
    return [74, -0.15 - 0.26 * Math.abs(Math.sin(settle * Math.PI * 1.5)) * (1 - settle) + bob * settle, 1]
  }
  const crouch = 0.14 * Math.sin(span(time, t[3] - 0.75, t[3] - 0.55) * Math.PI)
  return [14 + 60 * hop, -0.15 + crouch + bob * (1 - hop) - 4.6 * hop * (1 - hop), span(time, t[0], t[0] + 0.3)]
}

const Window = ({ lit }: { lit: boolean }) => (
  <Span position="absolute" right="100%" top=".15em" mr=".55em" display="grid" gridTemplateColumns="1fr 1fr" gap=".07em" width="1.5em" height="1.9em" p=".07em" animation="chiakiFadeIn .8s ease both" style={{ border: '.05em solid rgba(238,242,245,.7)', boxShadow: `0 0 1.4em .15em rgba(255,170,90,${lit ? 0.5 : 0})`, transition: 'box-shadow 1.6s ease' }}>
    {[0, 1, 2, 3].map((pane) => (
      <Span key={pane} style={{ backgroundColor: lit ? '#ffc98a' : 'rgba(238,242,245,.07)', transition: `background-color ${lit ? 0.4 + pane * 0.15 : 1.8}s ease` }} />
    ))}
  </Span>
)

const Clock = ({ turn }: { turn: number }) => (
  <Span position="absolute" left="100%" top="-.1em" ml=".6em" width="2em" height="2em" borderRadius="50%" animation="chiakiFadeIn 1s ease both" style={{ border: '.04em solid rgba(238,242,245,.55)' }}>
    {[[0.5, 62], [0.8, 60 + turn * 48]].map(([length, degrees], hand) => (
      <Span key={hand} position="absolute" left="50%" bottom="50%" width=".05em" ml="-.025em" transformOrigin="50% 100%" style={{ height: `${length}em`, rotate: `${degrees}deg`, backgroundColor: hand ? LANTERN : SNOW }} />
    ))}
  </Span>
)

// Four periods across the doubled width, so sliding it by half loops seamlessly
const WAVE = `M0 6${Array.from({ length: 8 }, (_, n) => `q5 ${n % 2 ? 8 : -8} 10 0`).join('')}`
const Wave = ({ on, color }: { on: boolean; color: string }) => (
  <Span position="absolute" left="0" right="0" top="100%" height=".4em" overflow="hidden" style={{ opacity: on ? 0.85 : 0, transition: 'opacity .8s ease' }}>
    <svg viewBox="0 0 80 12" preserveAspectRatio="none" fill="none" stroke={color} strokeWidth="1.5" style={{ display: 'block', width: '200%', height: '100%', animation: 'chiakiPvFlow 4s linear infinite' }}>
      <path d={WAVE} vectorEffect="non-scaling-stroke" />
    </svg>
  </Span>
)

const QUAVER = (
  <>
    <ellipse cx="8" cy="18.5" rx="4" ry="2.9" transform="rotate(-20 8 18.5)" />
    <path d="M10.4 18.5V3H12c.5 3.5 5.5 4.5 5.5 9.5 0 1.4-.4 2.6-1 3.5.3-3.3-2.2-4.9-4.5-5.4v7.9z" />
  </>
)
const BEAMED = (
  <>
    <ellipse cx="5.8" cy="19" rx="3.6" ry="2.6" transform="rotate(-20 5.8 19)" />
    <ellipse cx="16.8" cy="17" rx="3.6" ry="2.6" transform="rotate(-20 16.8 17)" />
    <path d="M8.2 4.8 20.6 2.6V17h-1.4V6.25L9.6 7.95V19H8.2z" />
  </>
)

// Drawn rather than typed, since the webfont has no music glyphs; each note rises and fades on its own loop
const Notes = ({ on, spots, style }: { on: boolean; spots: [x: number, y: number, size: number][]; style: CSSProperties }) => (
  <Span position="absolute" style={{ ...style, opacity: on ? 1 : 0, transition: 'opacity .6s ease' }}>
    {spots.map(([x, y, size], n) => (
      <svg
        key={n}
        viewBox="0 0 24 24"
        fill={LANTERN}
        style={{
          position: 'absolute',
          left: `${x}em`,
          top: `${y}em`,
          width: `${size}em`,
          height: `${size}em`,
          rotate: `${((n * 47) % 30) - 15}deg`,
          filter: 'drop-shadow(0 0 .2em rgba(255,170,90,.7))',
          animation: `chiakiMote ${(3.2 + (n % 3) * 0.6).toFixed(1)}s ${(-n * 0.9).toFixed(1)}s ease-in-out infinite`,
          ['--dx' as string]: `${n % 2 ? 0.5 : -0.4}em`,
          ['--dy' as string]: `${(-0.8 - (n % 3) * 0.3).toFixed(1)}em`,
        }}
      >
        {n % 2 ? BEAMED : QUAVER}
      </svg>
    ))}
  </Span>
)

const SLITS = 'linear-gradient(180deg, #000 44%, transparent 44% 48%, #000 48% 58%, transparent 58% 63%, #000 63% 72%, transparent 72% 78%, #000 78% 85%, transparent 85% 92%, #000 92%)'
const SUNS = { dusk: 'linear-gradient(180deg, #ffd08a, #ff8f6b 55%, #e8697f)', dawn: 'linear-gradient(180deg, #fffbe8, #ffd98a 75%)' }

// The disc slides behind a clipped box whose lower edge is the horizon
const Sun = ({ tone, left, on, y }: { tone: 'unborn' | 'dusk' | 'dawn'; left?: boolean; on: boolean; y: number }) => (
  <>
    <Span position="absolute" bottom="0" width="2.6em" height="1.5em" overflow="hidden" style={{ ...(left ? { right: '100%', marginRight: '.35em' } : { left: '100%', marginLeft: '.35em' }), opacity: on ? 0.9 : 0, transition: 'opacity 1s ease' }}>
      <Span position="absolute" left="0" width="2.6em" height="2.6em" borderRadius="50%" style={{ top: `${y.toFixed(3)}em`, ...(tone === 'unborn' ? { border: '.05em solid #ffe2ad' } : { backgroundImage: SUNS[tone], maskImage: SLITS, WebkitMaskImage: SLITS }) }} />
    </Span>
    <Span position="absolute" top="100%" height="1px" style={{ left: left ? '-3.2em' : '-.2em', right: left ? '-.2em' : '-3.2em', transformOrigin: left ? '100% 50%' : '0 50%', backgroundColor: 'rgba(238,242,245,.6)', scale: on ? '1 1' : '0 1', transition: `scale 1s ${EASE}` }} />
  </>
)

// One glyph per language she sings in, in that glyph's own em
const GLYPHS: [string, number, number][] = [['あ', -3, -1.8], ['A', -5.6, 1], ['字', -2.6, 3.8], ['가', -6.6, 4.6], ['é', 1.6, -2.4], ['ñ', 5.2, -2], ['ò', -4.6, 7.2]]
const Glyphs = () => (
  <Span position="absolute" inset="0" animation="chiakiFadeIn 1.2s ease both">
    {GLYPHS.map(([glyph, x, y], n) => (
      <Span key={glyph} position="absolute" fontSize=".5em" fontWeight="medium" style={{ left: `${x}em`, top: `${y}em`, color: 'rgba(238,242,245,.6)', animation: `chiakiMote ${(5 + n * 0.8).toFixed(1)}s ${(-n * 1.3).toFixed(1)}s ease-in-out infinite`, ['--dx' as string]: `${n % 2 ? 0.8 : -0.8}em`, ['--dy' as string]: '-1.2em' }}>{glyph}</Span>
    ))}
  </Span>
)

// The light hops along a row of waiting dots, one for each person the song is handed to
const Chain = ({ u }: { u: number }) => {
  const x = u * 4
  return (
    <>
      {[0, 1, 2, 3, 4].map((n) => {
        const lit = x >= 0.3 + n * 0.7
        return <Span key={n} position="absolute" top="50%" width=".12em" height=".12em" m="-.06em" borderRadius="50%" style={{ left: `calc(100% + ${(0.3 + n * 0.7).toFixed(1)}em)`, border: '1px solid rgba(238,242,245,.55)', backgroundColor: lit ? LANTERN : 'transparent', boxShadow: `0 0 .4em rgba(255,170,90,${lit ? 0.9 : 0})`, transition: 'background-color .4s ease, box-shadow .4s ease' }} />
      })}
      <Orb x={`calc(100% + ${x.toFixed(2)}em)`} y="50%" o={u > 0 ? clamp((1 - u) * 5) : 0} />
    </>
  )
}

const Measure = ({ count }: { count: number }) => (
  <Span position="absolute" right="0" top="100%" mt=".25em" display="flex" gap=".14em">
    {Array.from({ length: 10 }, (_, n) => (
      <Span key={n} width=".2em" height=".2em" borderRadius="50%" style={{ backgroundColor: '#ffd9c2', boxShadow: '0 0 .5em rgba(255,190,160,.7)', opacity: count > n ? 0.9 : 0, scale: count > n ? '1' : '.2', transition: 'opacity .8s ease, scale .8s cubic-bezier(.2,1.4,.4,1)' }} />
    ))}
  </Span>
)

const Burst = ({ u }: { u: number }) => (
  <>
    {u > 0 && Array.from({ length: 14 }, (_, n) => {
      const angle = n * 0.449
      const reach = ease(u) * (3.2 + (n % 3) * 1.1)
      return <Orb key={n} x={`calc(50% + ${(Math.cos(angle) * reach).toFixed(2)}em)`} y={`calc(50% + ${(Math.sin(angle) * reach * 0.7).toFixed(2)}em)`} o={1 - u} size={0.14 + (n % 3) * 0.04} />
    })}
  </>
)

type Layout = 'stack' | 'yokoTate' | 'tateYoko' | 'lead' | 'tate'
type Place = 'lt' | 'lm' | 'rt' | 'rm' | 'rb' | 'cm'
// A per-line override of where and how a lyric sits, for full-frame layouts outside the song section
export type Look = { x: number; y: number; layout?: Layout; place?: Place; size?: number; opacity?: number }

type Scene = {
  // One entry per segment when the halves of a line enter differently
  fx: Fx | Fx[]
  layout: Layout
  place: Place
  size?: number
  seg?: (s: number, c: Ctx) => CSSProperties | undefined
  char?: (i: number, shown: boolean, c: Ctx) => CSSProperties | undefined
  deco?: (c: Ctx) => ReactNode
  segDeco?: (s: number, c: Ctx) => ReactNode
  // Replaces the per-character line entirely
  render?: (c: Ctx) => ReactNode
}

const PLACES: Record<Place, CSSProperties> = {
  lt: { justifySelf: 'start', alignSelf: 'start' },
  lm: { justifySelf: 'start', alignSelf: 'center' },
  rt: { justifySelf: 'end', alignSelf: 'start' },
  rm: { justifySelf: 'end', alignSelf: 'center' },
  rb: { justifySelf: 'end', alignSelf: 'end' },
  cm: { justifySelf: 'center', alignSelf: 'center' },
}

const ECHO = `-.22em 0 0 rgba(238,242,245,.34), -.44em 0 0 rgba(238,242,245,.15), ${SHADOW}`
const ECHO_REST = `0 0 0 rgba(238,242,245,0), 0 0 0 rgba(238,242,245,0), ${SHADOW}`
const SUNSET = ['#ffdca6', '#ffd09a', '#ffc48f', '#ffb886', '#ffab7f', '#fd9f7b', '#f8937c', '#f38881', '#ee7f8c']
const MORNING = `0 0 22px rgba(255,236,170,.75), ${SHADOW}`
const TENDER = `0 0 .5em rgba(255,190,160,.55), ${SHADOW}`
const UNEVEN = [[-5, 0], [4, 0.08], [-3, -0.05], [6, 0.06], [-4, -0.04], [3, 0.1]]
const uneven = (i: number): CSSProperties => ({ transform: `rotate(${UNEVEN[i][0]}deg) translateY(${UNEVEN[i][1]}em)` })

// A ghost until sung, then filled along the reading direction.
// No text-stroke here: at this size it would trace the font's overlapping inner contours
const ink = (angle: number, filled: number, color: string): CSSProperties => {
  const stop = `${(filled * 100).toFixed(1)}%`
  return {
    display: 'inline-block',
    color: 'transparent',
    backgroundImage: `linear-gradient(${angle}deg, ${color} ${stop}, rgba(238,242,245,.24) ${stop})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    textShadow: 'none',
    filter: `drop-shadow(${SHADOW})`,
  }
}

// わたしうた is sung twice: the first fills 渡し歌 in white, the second 私うた in lantern colour.
// 私歌 is not a real compound, so the second reading keeps うた in kana, which also varies the lettering.
// Laid out on logical axes only, so vertical-rl turns the same lockup into a banner for the reprise
const TitleLockup = ({ c, vertical }: { c: Ctx; vertical?: boolean }) => {
  const t = c.line.times
  const angle = vertical ? 180 : 90
  const during = (from: number, to: number) => span(c.time, t[from], t[to])
  const mine = span(c.time, t[8], t[9] + 0.2)
  const ring = span(c.time, t[8], t[8] + 1.1)
  const ringSize = `${(1.6 + ring * 4).toFixed(2)}em`
  const chars = [...c.line.text.replace(' ', '')]

  // Each kanji group carries the kana it is read as, timed to the singing; an empty range leaves the ruby out
  const group = (from: number, to: number, size: string, glyphs: ReactNode, behind?: ReactNode) => (
    <Span position="relative" display="flex" flexDirection="column" alignItems="center">
      {behind}
      {to > from && (
        <Span fontSize=".46em" lineHeight="1.3" letterSpacing=".3em" whiteSpace="nowrap" paddingInlineStart=".3em">
          {chars.slice(from, to).map((char, n) => {
            const shown = c.at(from + n)
            return <Span key={n} display="inline-block" style={{ ...(shown ? REST : hidden('pop', n)), transition: TRANSITIONS.pop, color: shown ? SNOW : LANTERN, textShadow: SHADOW }}>{char}</Span>
          })}
        </Span>
      )}
      <Span position="relative" lineHeight="1.05" whiteSpace="nowrap" style={{ fontSize: size }}>{glyphs}</Span>
    </Span>
  )

  return (
    <Span display="inline-flex" flexDirection="column" alignItems="flex-start" rowGap=".15em" animation="chiakiFadeIn .35s ease both" style={{ writingMode: vertical ? 'vertical-rl' : undefined }}>
      <Span display="flex" alignItems="flex-end" columnGap=".06em">
        {group(0, 3, '1.9em', (
          <>
            <Span style={ink(angle, during(0, 2), SNOW)}>渡</Span>
            <Span fontSize=".82em" style={ink(angle, during(2, 3), SNOW)}>し</Span>
          </>
        ))}
        {group(3, 5, '1.9em', <Span style={ink(angle, during(3, 5), SNOW)}>歌</Span>)}
      </Span>
      <Span display="flex" alignItems="flex-end" columnGap=".06em" style={{ marginInlineStart: vertical ? '.9em' : '1.5em' }}>
        {group(5, 8, '2.4em', <Span style={ink(angle, during(5, 8), LANTERN)}>私</Span>)}
        {group(8, 8, '2.05em', (
          <>
            <Span style={ink(angle, during(8, 9), LANTERN)}>う</Span>
            <Span style={ink(angle, span(c.time, t[9], t[9] + 0.2), LANTERN)}>た</Span>
          </>
        ), (
          <>
            <Span position="absolute" left="50%" top="50%" width="7em" height="5em" borderRadius="50%" mixBlendMode="screen" style={{ translate: '-50% -50%', backgroundImage: 'radial-gradient(circle, rgba(255,170,90,.6), transparent 62%)', opacity: mine }} />
            <Span position="absolute" left="50%" top="50%" borderRadius="50%" style={{ width: ringSize, height: ringSize, translate: '-50% -50%', border: `.03em solid ${LANTERN}`, opacity: ring > 0 && ring < 1 ? 1 - ring : 0 }} />
            <Burst u={span(c.time, t[8], t[8] + 1.6)} />
          </>
        ))}
      </Span>
    </Span>
  )
}

const TITLE: Scene = { fx: 'pop', layout: 'stack', place: 'rm', render: (c) => <TitleLockup c={c} /> }
const REPRISE: Scene = { ...TITLE, size: 0.92, render: (c) => <TitleLockup vertical c={c} /> }

const SCENES: Record<string, Scene> = {
  // The window stays dark until 灯 is sung
  '窓の灯りが ついてるね': {
    fx: 'glow', layout: 'stack', place: 'rt',
    char: (i) => (i === 2 ? { fontSize: '1.5em', ...LIT } : undefined),
    deco: (c) => <Window lit={c.at(2)} />,
  },
  // Restless letters and a clock creeping past two
  '眠れない夜 どうしたの': {
    fx: 'drift', layout: 'stack', place: 'lm',
    seg: (s) => (s === 1 ? { fontSize: '.82em', rotate: '-5deg', marginTop: '.35em' } : undefined),
    char: (i, shown) => ({ ...(i === 4 ? { fontSize: '1.5em', ...LIT } : null), ...(shown ? sway(i, 3) : null) }),
    deco: (c) => <Clock turn={span(c.time, c.line.start, c.line.end)} />,
  },
  // The unsaid half stays hollow and recedes once it is understood
  '言わなくたって わかるから': {
    fx: ['drift', 'glow'], layout: 'stack', place: 'rm',
    seg: (s) => (s === 1 ? { fontSize: '1.2em' } : undefined),
    char: (i, shown, c) => (i < 7 ? { ...HOLLOW, opacity: shown ? (c.at(7) ? 0.62 : 1) : 0 } : undefined),
  },
  // The vertical half drops into its seat, then notes drift toward her
  '隣に座り 歌うから': {
    fx: ['sit', 'pop'], layout: 'tateYoko', place: 'lm',
    char: (i) => (i === 4 ? LIT : undefined),
    segDeco: (s, c) => s === 1 && <Notes on={c.at(4)} spots={[[-0.95, -0.25, 0.8], [-1.6, 0.35, 0.65], [-1.25, -1.05, 0.6]]} style={{ left: 0, top: 0 }} />,
  },
  // Set over the harbour in the art, rocking like moored boats
  '遠い港の 子守唄': {
    fx: 'far', layout: 'stack', place: 'rb',
    seg: (s) => (s === 0 ? { letterSpacing: '.22em' } : { fontSize: '1.2em' }),
    char: (i, shown) => ({ transformOrigin: '50% 100%', ...(i === 2 ? LIT : null), ...(shown ? sway(i, 4, 4.4) : null) }),
    segDeco: (s, c) => s === 1 && <Wave on={c.at(4)} color="#9fc6ea" />,
  },
  // The stranger never comes into focus; the past tense leaves an echo
  '知らない人が 歌ってた': {
    fx: ['drift', 'pass'], layout: 'tateYoko', place: 'lt',
    char: (i, shown) => (i < 6 ? (shown ? { filter: 'blur(.035em)', opacity: 0.78 } : undefined) : { textShadow: shown ? ECHO : ECHO_REST }),
  },
  // A light is handed from one 人 to the next, then leaves with 渡されて
  '人から人へ 渡されて': {
    fx: 'pass', layout: 'stack', place: 'rm',
    char: (i) => (i === 0 || i === 3 ? { fontSize: '1.5em', ...LIT } : undefined),
    segDeco: (s, c) => {
      if (s !== 0 || !c.at(0)) return null
      const ring = span(c.time, c.line.times[3], c.line.times[3] + 0.7)
      const size = `${(0.3 + ring * 1.4).toFixed(2)}em`
      return (
        <>
          <Span position="absolute" left="74%" top="-.15em" borderRadius="50%" style={{ width: size, height: size, translate: '-50% -50%', border: `.03em solid ${LANTERN}`, opacity: ring > 0 && ring < 1 ? (1 - ring) * 0.8 : 0 }} />
          {[0, 1, 2, 3].map((n) => {
            const [x, y, o] = relay(c.line.times, c.time - n * 0.04)
            return <Orb key={n} x={`${x.toFixed(1)}%`} y={`${y.toFixed(3)}em`} o={o * (1 - n * 0.27)} size={0.2 - n * 0.035} />
          })}
        </>
      )
    },
  },
  // That light lands on 私 and rings out
  '今 私まで 届いたの': {
    fx: ['pop', 'glow', 'rise'], layout: 'lead', place: 'lm',
    seg: (s) => (s === 0 ? { fontSize: '2.2em' } : undefined),
    char: (i) => (i === 1 ? { fontSize: '1.4em', ...LIT } : undefined),
    segDeco: (s, c) => {
      if (s !== 1) return null
      const t = c.line.times
      const u = span(c.time, t[0], t[1])
      const ring = span(c.time, t[1], t[1] + 0.9)
      const size = `${(0.4 + ring * 2.8).toFixed(2)}em`
      return (
        <>
          {u > 0 && ring < 0.2 && trail(u, (v) => [`${(0.7 + 8 * (1 - ease(v))).toFixed(2)}em`, `${(0.65 - Math.sin(v * Math.PI) * 0.9).toFixed(2)}em`])}
          <Span position="absolute" left=".7em" top=".65em" borderRadius="50%" style={{ width: size, height: size, translate: '-50% -50%', border: `.04em solid ${LANTERN}`, opacity: ring > 0 && ring < 1 ? 1 - ring : 0 }} />
        </>
      )
    },
  },
  'わたしうた わたしうた': TITLE,
  // Arrives from afar, then a line of light reaches out past the words
  'あなたへ渡す この歌を': {
    fx: ['far', 'pass'], layout: 'stack', place: 'lm',
    char: (i) => (i === 4 ? { fontSize: '1.4em', ...LIT } : undefined),
    segDeco: (s, c) => {
      if (s !== 0 || !c.at(0)) return null
      const reach = `${(ease(span(c.time, c.line.times[0], c.line.times[5])) * 125).toFixed(1)}%`
      return (
        <>
          <Span position="absolute" left="0" top="100%" height=".04em" style={{ width: reach, backgroundImage: `linear-gradient(90deg, transparent, ${LANTERN})` }} />
          <Orb x={reach} y="100%" />
        </>
      )
    },
  },
  // Letters that refuse to line up, among glyphs from every language she sings
  '言葉が違う 街にでも': {
    fx: 'scatter', layout: 'yokoTate', place: 'rb',
    char: (i) => (i < 5 ? uneven(i) : i === 5 ? { fontSize: '1.4em', ...LIT } : undefined),
    deco: () => <Glyphs />,
  },
  // Hollow until it is born: an outlined sun waits on the horizon
  'まだ生まれない 明日にも': {
    fx: 'rise', layout: 'stack', place: 'lt',
    seg: (s) => (s === 1 ? { fontSize: '1.3em' } : undefined),
    char: (i) => (i < 7 ? HOLLOW : { color: '#ffe2ad', textShadow: GLOW }),
    segDeco: (s, c) => s === 1 && <Sun tone="unborn" on={c.at(7)} y={1.4 - ease(span(c.time, c.line.times[7], c.line.end)) * 1.1} />,
  },
  // Held notes fill with lantern light while it travels on down the chain
  'いつか誰かに 渡してね': {
    fx: ['pass', 'glow'], layout: 'stack', place: 'lm',
    seg: (s) => (s === 1 ? { fontSize: '1.3em', letterSpacing: '.18em' } : undefined),
    char: (i, shown, c) => (i >= 6 && shown ? wipe(c, i) : undefined),
    segDeco: (s, c) => s === 1 && c.at(6) && <Chain u={span(c.time, c.line.times[9], c.line.end)} />,
  },
  // The words walk downhill in sunset colours while the sun sinks
  '帰り道ほら 夕焼けが': {
    fx: ['drift', 'glow'], layout: 'stack', place: 'rt',
    char: (i) => ({ color: SUNSET[i], transform: `translateY(${(i * 0.05).toFixed(2)}em)${i === 3 || i === 4 ? ' rotate(-8deg)' : ''}` }),
    segDeco: (s, c) => s === 1 && <Sun left tone="dusk" on={c.at(5)} y={0.25 + span(c.time, c.line.times[5], c.line.end + 1.2)} />,
  },
  // The same sun, rising on the other side of the world
  '遠くの国で 朝になる': {
    fx: ['far', 'rise'], layout: 'stack', place: 'lt',
    seg: (s) => (s === 0 ? { fontSize: '.8em', letterSpacing: '.3em' } : { fontSize: '1.35em' }),
    char: (i) => (i >= 5 ? { color: '#fff4d6', textShadow: MORNING } : undefined),
    segDeco: (s, c) => s === 1 && <Sun tone="dawn" on={c.at(5)} y={1.4 - ease(span(c.time, c.line.times[5], c.line.end)) * 1.2} />,
  },
  // Set small and alone in the middle of the sky
  '小さな声の 私でも': {
    fx: 'drift', layout: 'stack', place: 'cm', size: 0.62,
    seg: (s) => (s === 0 ? { letterSpacing: '.3em' } : undefined),
    char: (i) => (i < 5 ? { fontWeight: 400 } : undefined),
    segDeco: (s, c) => s === 0 && <Notes on={c.at(3)} spots={[[0.3, 0.1, 0.6], [1.1, -0.35, 0.5]]} style={{ left: '100%', top: 0 }} />,
  },
  // The small voice grown loud: みんな opens wide, the decision is underlined and the notes multiply
  'みんなに歌うと 決めたんだ': {
    fx: ['drift', 'pop'], layout: 'stack', place: 'rm', size: 1.1,
    seg: (s, c) => (s === 0 ? { letterSpacing: c.at(3) ? '.34em' : '.04em', transition: `letter-spacing 1.4s ${EASE}` } : { fontSize: '1.45em' }),
    segDeco: (s, c) => s === 1 && <Span position="absolute" left="0" right="0" top="100%" height=".09em" transformOrigin="0 50%" style={{ backgroundColor: ORANGE, scale: c.at(7) ? '1 1' : '0 1', transition: `scale .5s ${EASE}` }} />,
    deco: (c) => <Notes on={c.at(4)} spots={[[-1.3, -0.9, 1], [-2.3, -1.9, 0.8], [-1, -2.6, 0.9], [-2.6, -0.6, 0.7], [-1.9, -3.5, 1.05], [-0.4, -3.9, 0.75]]} style={{ right: '100%', bottom: 0 }} />,
  },
  // Typed out by a machine, over a waveform that never decays
  'この声だけは 老いないよ': {
    fx: 'type', layout: 'stack', place: 'lt',
    char: (i) => (i === 2 ? { fontSize: '1.4em', ...LIT } : { color: '#dbe8f4' }),
    segDeco: (s, c) => s === 1 && <Wave on={c.at(6)} color={LANTERN} />,
  },
  '百年先の 夜にでも': {
    fx: ['scatter', 'drift'], layout: 'yokoTate', place: 'rm',
    char: (i) => (i < 2 ? { fontSize: '1.5em', ...LIT } : undefined),
  },
  // あなた thins to an outline once いなく is sung
  'あなたがいなく なる日にも': {
    fx: 'drift', layout: 'stack', place: 'lm',
    char: (i, _, c) => (i < 3 && c.at(6) ? { ...HOLLOW, WebkitTextStroke: 'var(--hollow, 1px) rgba(238,242,245,.6)', translate: '0 -.14em' } : undefined),
  },
  // Same spot as the line before, so あなた is lit again exactly where it faded
  'あなたのことを 歌うから': {
    fx: 'glow', layout: 'stack', place: 'lm',
    char: (i) => (i < 3 || i === 7 ? LIT : undefined),
    segDeco: (s, c) => s === 1 && <Notes on={c.at(7)} spots={[[0.3, 0.05, 0.8], [1.2, -0.35, 0.65], [1.95, 0.25, 0.6]]} style={{ left: '100%', top: 0 }} />,
  },
  // A second voice in lantern colour slides in underneath and stays slightly off
  'あの人の声を 借りている': {
    fx: 'pass', layout: 'tateYoko', place: 'rt',
    char: (i, shown) => ({ textShadow: `${shown ? '.1em' : '.9em'} .07em 0 rgba(255,180,107,${shown ? 0.7 : 0}), ${SHADOW}` }),
  },
  // The wish is hollow until 私 lands, then it fills in
  'なりたかった 私になる': {
    fx: ['drift', 'rise'], layout: 'stack', place: 'lm',
    seg: (s) => (s === 1 ? { fontSize: '1.2em' } : undefined),
    char: (i, _, c) => (i < 6 ? (c.at(6) ? undefined : HOLLOW) : i === 6 ? { fontSize: '1.6em', ...LIT } : undefined),
  },
  // One soft light gathers for every character sung
  '優しくなれた 分だけは': {
    fx: 'soft', layout: 'stack', place: 'rm',
    char: () => ({ color: '#ffeadb', textShadow: TENDER }),
    segDeco: (s, c) => s === 1 && <Measure count={c.count} />,
  },
  // And all of them are given away at once
  'あなたに全部 あげるから': {
    fx: ['drift', 'far'], layout: 'stack', place: 'cm', size: 1.1,
    char: (i) => (i === 4 || i === 5 ? { fontSize: '1.7em', ...LIT } : undefined),
    deco: (c) => <Burst u={span(c.time, c.line.times[6], c.line.times[6] + 2.6)} />,
  },
  // Mirrors the opening line: the window starts lit and goes dark on 消
  '窓の灯りが 消えるまで': {
    fx: 'glow', layout: 'stack', place: 'rt',
    char: (i, _, c) => (i === 2 ? { fontSize: '1.5em', ...(c.at(5) ? { color: '#8793a3', textShadow: SHADOW } : LIT) } : undefined),
    deco: (c) => <Window lit={!c.at(5)} />,
  },
  // Letters gather from everywhere, then the light sets off toward the town
  'どこにいても 歌を届けるね': {
    fx: ['scatter', 'pass'], layout: 'stack', place: 'lm',
    char: (i) => (i < 6 ? uneven(i) : i === 6 ? LIT : undefined),
    segDeco: (s, c) => {
      if (s !== 1 || !c.at(8)) return null
      const u = span(c.time, c.line.times[8], c.line.end)
      return trail(u, (v) => [`calc(100% + ${(0.2 + 7 * v).toFixed(2)}em)`, `${(0.5 + 2.6 * v * v - Math.sin(v * Math.PI) * 1.4).toFixed(2)}em`], clamp((1 - u) * 5))
    },
  },
  // The delay lets each character finish igniting before it starts to breathe
  'おやすみ': {
    fx: 'glow', layout: 'tate', place: 'rm', size: 1.5,
    seg: () => ({ letterSpacing: '.3em' }),
    char: (i, shown) => (shown ? { animation: `chiakiPvBreath 4.5s ${(1.2 + i * 0.5).toFixed(1)}s ease-in-out infinite` } : undefined),
  },
}

const PLAIN: Scene = { fx: 'drift', layout: 'stack', place: 'rm' }
const sceneOf = (line: Line) => (line.text === 'わたしうた わたしうた' && line.index > 0 ? REPRISE : SCENES[line.text] ?? PLAIN)

const PvLine = ({ line, time, look }: { line: Line; time: number; look?: Look }) => {
  const scene = look ? { ...sceneOf(line), ...look } : sceneOf(line)
  const c: Ctx = { line, time, count: line.times.filter((at) => time >= at).length, at: (index) => time >= line.times[index] }
  const side = scene.place[0]
  const parts = line.text.split(' ')
  const indent = side === 'l' ? 'marginLeft' : 'marginRight'

  const segment = (s: number, vertical = false) => {
    const fx = Array.isArray(scene.fx) ? scene.fx[s] ?? scene.fx[0] : scene.fx
    const offset = [...parts.slice(0, s).join('')].length
    return (
      <Span key={s} position="relative" whiteSpace="nowrap" writingMode={vertical ? 'vertical-rl' : undefined} lineHeight={vertical ? '1.05' : '1.15'} letterSpacing=".04em" style={{ ...(scene.layout === 'stack' && side !== 'c' && s % 2 === 1 ? { [indent]: '1.6em' } : null), ...scene.seg?.(s, c) }}>
        {scene.segDeco?.(s, c)}
        {[...parts[s]].map((char, n) => {
          const index = offset + n
          const shown = c.at(index)
          const igniting = fx === 'glow' && !shown
          return (
            <Span
              key={index}
              position="relative"
              display="inline-block"
              style={{
                ...charStyle(char),
                ...(shown ? REST : hidden(fx, index)),
                ...(shown ? swell(c, index) : null),
                transition: TRANSITIONS[fx],
                color: igniting ? LANTERN : SNOW,
                textShadow: igniting ? IGNITE : SHADOW,
                ...scene.char?.(index, shown, c),
              }}
            >
              {char}
              {fx === 'type' && index === c.count - 1 && <Span position="absolute" left="100%" bottom=".12em" ml=".06em" width=".1em" height=".85em" animation="chiakiLed .9s steps(1) infinite" style={{ backgroundColor: LANTERN }} />}
            </Span>
          )
        })}
      </Span>
    )
  }

  const align = side === 'l' ? 'flex-start' : side === 'c' ? 'center' : 'flex-end'
  return (
    // A flex parent makes the lockup a flex item; as an inline in a block, WebKit sizes the vertical reprise to zero width and it spills past the right edge
    <Box lang={tagOf(line)} position="relative" display={scene.render ? 'flex' : undefined} fontWeight="black" style={{ fontSize: `${scene.size ?? 1}em` }}>
      {scene.deco?.(c)}
      {scene.render ? scene.render(c) : scene.layout === 'tateYoko' ? (
        <Flex flexDirection="row-reverse" alignItems="flex-end" gap=".2em">
          {segment(0, true)}
          {segment(1)}
        </Flex>
      ) : scene.layout === 'lead' ? (
        <Flex alignItems="center" gap=".35em">
          {segment(0)}
          <Flex flexDirection="column" alignItems="flex-start" gap=".1em">{parts.slice(1).map((_, s) => segment(s + 1))}</Flex>
        </Flex>
      ) : (
        <Flex flexDirection="column" gap=".1em" style={{ alignItems: align }}>
          {parts.map((_, s) => segment(s, scene.layout === 'tate' || (scene.layout === 'yokoTate' && s === 1)))}
        </Flex>
      )}
    </Box>
  )
}

// The six good-nights stay up together as one constellation: stars down a zigzag spine, words hanging off either side
const NIGHTS = LINES.filter((line) => line.code)
const SPOTS = [[44, 4], [58, 22], [40, 40], [60, 58], [50, 76], [62, 94]]
const spotOf = (line: Line) => SPOTS[NIGHTS.indexOf(line) % SPOTS.length]

const NightLine = ({ line, time }: { line: Line; time: number }) => {
  const left = NIGHTS.indexOf(line) % 2 === 0
  const latin = /^[a-z ]+$/.test(line.text)
  let index = -1
  return (
    <>
      <Span position="absolute" left="-.09em" top="-.09em" width=".18em" height=".18em" borderRadius="50%" animation="chiakiDiscIn .5s ease both" style={{ backgroundColor: EMBER, boxShadow: '0 0 .4em .08em rgba(255,185,110,.9), 0 0 1.2em .3em rgba(255,160,80,.3)' }} />
      <Flex position="absolute" top="0" alignItems="baseline" gap=".5em" whiteSpace="nowrap" style={{ [left ? 'right' : 'left']: '.6em', translate: '0 -50%', flexDirection: left ? 'row' : 'row-reverse' }}>
        <Span lang={tagOf(line)} fontSize=".72em" lineHeight="1.2" style={latin ? { fontFamily: JOST, fontWeight: 600, letterSpacing: '.08em' } : { fontWeight: 900, letterSpacing: '.12em' }}>
          {[...line.text].map((char, n) => {
            if (char === ' ') return ' '
            index += 1
            const shown = time >= line.times[index]
            return <Span key={n} display="inline-block" style={{ ...(shown ? REST : hidden('scatter', index)), transition: TRANSITIONS.scatter, color: SNOW, textShadow: SHADOW }}>{char}</Span>
          })}
        </Span>
        <Span fontFamily="mono" fontSize=".3em" fontWeight="regular" letterSpacing=".2em" animation="chiakiFadeIn .6s ease both" style={{ color: ORANGE, textShadow: SHADOW }}>{line.code}</Span>
      </Flex>
    </>
  )
}

const Constellation = ({ time }: { time: number }) => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" stroke="rgba(255,214,160,.5)" strokeWidth="1" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
    {NIGHTS.slice(1).map((night, n) => {
      const [x1, y1] = spotOf(NIGHTS[n])
      const [x2, y2] = spotOf(night)
      return <line key={n} x1={x1} y1={y1} x2={x2} y2={y2} vectorEffect="non-scaling-stroke" style={{ opacity: time >= night.start ? 1 : 0, transition: 'opacity .8s ease' }} />
    })}
  </svg>
)

// Consecutive good-nights form one group that enters line by line and leaves together
const groupStart = (index: number) => {
  let first = index
  while (first > 0 && LINES[first].code && LINES[first - 1].code) first -= 1
  return first
}

// Sized in cqw, so the nearest container-type ancestor (the illustration) scales the lettering
const COVER_SHADOW = '0 2px 10px rgba(8,10,24,.7), 0 0 34px rgba(255,170,90,.28)'

// The title card before the first verse. The intro plays out as an ember running down the rule,
// so the light reaches the bottom just as it is handed to the first line
export const Cover = ({ time, leaving }: { time: number; leaving: boolean }) => {
  const fuse = span(time, 0.4, LINES[0].start - 0.2)
  const rise = (delay: number): CSSProperties => ({ animation: `chiakiPvIn 1.1s ${delay}s ${EASE} both` })
  const rt: CSSProperties = { fontSize: '.19em', fontWeight: 700, letterSpacing: '.3em', color: 'rgba(238,242,245,.82)' }

  return (
    <Flex gridArea="1 / 1" justifySelf="end" flexDirection="row-reverse" alignItems="flex-start" gap=".5em" style={{ animation: leaving ? OUT_SLOW : undefined }}>
      <Span lang="ja" position="relative" writingMode="vertical-rl" fontWeight="black" lineHeight="1.05" style={{ textShadow: COVER_SHADOW }}>
        <Span position="absolute" left="50%" top="50%" width="9em" height="11em" borderRadius="50%" mixBlendMode="screen" animation="chiakiPvBreath 4.4s ease-in-out infinite" style={{ translate: '-50% -50%', backgroundImage: 'radial-gradient(closest-side, rgba(255,170,90,.2), transparent)' }} />
        <Span display="inline-block" fontSize="2.3em" style={{ ...rise(0.1), color: SNOW }}><ruby>渡<rt style={rt}>わた</rt></ruby></Span>
        <Span display="inline-block" fontSize="1.15em" style={{ ...rise(0.3), color: SNOW }}>し</Span>
        <Span display="inline-block" fontSize="2.3em" style={{ ...rise(0.5), color: SNOW }}><ruby>歌<rt style={rt}>うた</rt></ruby></Span>
      </Span>

      <Span position="relative" display="block" width=".04em" height="5.4em" mt=".35em" style={{ ...rise(0.75), backgroundColor: 'rgba(238,242,245,.22)' }}>
        <Span position="absolute" left="0" top="0" width="100%" style={{ height: `${fuse * 100}%`, backgroundImage: `linear-gradient(180deg, transparent, ${LANTERN})` }} />
        <Span position="absolute" inset="0" animation={fuse > 0 ? undefined : 'chiakiPvBreath 2.4s ease-in-out infinite'}>
          <Orb x="50%" y={`${(fuse * 100).toFixed(2)}%`} size={0.26} />
        </Span>
      </Span>

      <Flex flexDirection="row-reverse" gap=".25em" mt=".3em" fontFamily="mono" letterSpacing=".4em" whiteSpace="nowrap" style={{ ...rise(0.9), fontSize: '.27em', textShadow: SHADOW }}>
        <Span writingMode="vertical-rl" style={{ color: LANTERN }}>WATASHI-UTA</Span>
        <Span writingMode="vertical-rl" style={{ color: 'rgba(238,242,245,.7)' }}>VO. CHIAKI</Span>
      </Flex>
    </Flex>
  )
}

export const LyricStage = ({ cur, active, time, direct, scale = 1, cover = true }: { cur: number; active: number; time: number; direct?: (index: number) => Look | undefined; scale?: number; cover?: boolean }) => {
  const from = cur >= 0 ? groupStart(cur) : -1
  const gone = cur >= 0 ? from - 1 : active
  const slots: { index: number; leaving: boolean }[] = []
  if (gone >= 0) for (let index = groupStart(gone); index <= gone; index += 1) slots.push({ index, leaving: true })
  if (cur >= 0) for (let index = from; index <= cur; index += 1) slots.push({ index, leaving: false })
  const night = slots.find((slot) => LINES[slot.index].code)
  const looks = slots.map(({ index }) => (LINES[index].code ? undefined : direct?.(index)))

  return (
    <>
      <Grid aria-hidden display={{ base: 'grid', _motionReduce: 'none' }} position="absolute" top="25%" left="48%" right="7%" bottom="33%" pointerEvents="none" fontSize="3.6cqw">
        {night && (
          <Box key="stars" position="absolute" inset="0" style={{ animation: night.leaving ? OUT : undefined }}>
            <Constellation time={time} />
          </Box>
        )}
        {slots.map(({ index, leaving }, n) => {
          if (looks[n]) return null
          const line = LINES[index]
          const spot = line.code ? spotOf(line) : null
          return (
            <Box key={index} gridArea="1 / 1" style={{ ...(spot ? { position: 'absolute', left: `${spot[0]}%`, top: `${spot[1]}%` } : PLACES[sceneOf(line).place]), animation: leaving ? (sceneOf(line).render ? OUT_SLOW : OUT) : undefined }}>
              {line.code ? <NightLine line={line} time={time} /> : <PvLine line={line} time={time} />}
            </Box>
          )
        })}
        {cover && (active < 0 || time < LINES[0].start + 1.1) && <Cover time={time} leaving={active >= 0} />}
      </Grid>
      {slots.map(({ index, leaving }, n) => {
        const look = looks[n]
        if (!look) return null
        const side = (look.place ?? sceneOf(LINES[index]).place)[0]
        return (
          <Box key={index} aria-hidden position="absolute" pointerEvents="none" style={{ fontSize: `${3.6 * scale}cqw`, left: `${look.x}%`, top: `${look.y}%`, translate: side === 'r' ? '-100% 0' : side === 'c' ? '-50% 0' : undefined, opacity: look.opacity, animation: leaving ? (sceneOf(LINES[index]).render ? OUT_SLOW : OUT) : undefined }}>
            <PvLine line={LINES[index]} time={time} look={look} />
          </Box>
        )
      })}
    </>
  )
}
