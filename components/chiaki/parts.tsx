import type { ComponentProps, ReactNode } from 'react'
import { m } from 'framer-motion'
import { css, cx } from 'styled-system/css'
import { Box, styled } from 'styled-system/jsx'
import { INK, ORANGE, SNOW, SNOW_LAYERS } from './chiakiData'

const Span = styled.span
const Link = styled.a

const MotionBox = m.create(Box)

export const Reveal = ({ delay = 0, ...props }: ComponentProps<typeof MotionBox> & { delay?: number }) => (
  <MotionBox
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    transition={{ duration: 1, delay, ease: [0.2, 0.7, 0.2, 1] }}
    {...props}
  />
)

export const Container = (props: ComponentProps<typeof Box>) => (
  <Box position="relative" maxW="1440px" mx="auto" px={{ base: 5, md: 16 }} {...props} />
)

// Falling exactly one tile height keeps the loop seamless; sway runs on its own clock so flakes don't move in lockstep
export const Snow = () => (
  <Box aria-hidden position="absolute" inset="0" overflow="hidden" pointerEvents="none">
    {SNOW_LAYERS.map((layer, index) => (
      <Box
        key={layer.width}
        position="absolute"
        inset="0"
        _motionReduce={{ animation: 'none' }}
        style={{
          left: -layer.sway,
          right: -layer.sway,
          animation: `snowSway ${layer.seconds / 3}s ${-index * 2}s ease-in-out infinite alternate`,
          ['--sway' as string]: `${layer.sway}px`,
        }}
      >
        <Box
          position="absolute"
          left="0"
          right="0"
          bottom="0"
          willChange="transform"
          _motionReduce={{ animation: 'none' }}
          style={{
            top: -layer.height,
            animation: `snowDrift ${layer.seconds}s linear infinite`,
            backgroundImage: layer.image,
            backgroundSize: `${layer.width}px ${layer.height}px`,
            ['--fall' as string]: `${layer.height}px`,
          }}
        />
      </Box>
    ))}
  </Box>
)

const block = css({
  position: 'relative',
  display: 'inline-flex',
  '& > *': { opacity: 0 },
  _after: { content: '""', position: 'absolute', inset: '0', backgroundColor: 'currentColor', transform: 'scale(0)', pointerEvents: 'none' },
  '[data-ready] &': {
    '& > *': { animation: 'chiakiBlockText .9s var(--d, 0s) both' },
    _after: { animation: 'chiakiBlockX .9s var(--d, 0s) cubic-bezier(.7, 0, .3, 1) both' },
  },
  _motionReduce: { '& > *': { opacity: '1 !important', animation: 'none !important' }, _after: { display: 'none' } },
})
const blockY = css({ '[data-ready] &': { _after: { animationName: 'chiakiBlockY' } } })
const blockYMobile = css({ '[data-ready] &': { _after: { animationName: { base: 'chiakiBlockY', md: 'chiakiBlockX' } } } })

// Stays hidden until an ancestor gets data-ready, so text never shows in a fallback font first
export const BlockReveal = ({ delay = 0, axis = 'x', color, children }: { delay?: number; axis?: 'x' | 'y' | 'y-mobile'; color?: string; children: ReactNode }) => (
  <span className={cx('chiaki-block', block, axis === 'y' && blockY, axis === 'y-mobile' && blockYMobile)} style={{ ['--d' as string]: `${delay}s`, color }}>
    {children}
  </span>
)

export const Gauge =({ width = '56px' }: { width?: string }) => (
  <Span aria-hidden display="inline-block" height="8px" backgroundImage="repeating-linear-gradient(-60deg, currentColor 0 3px, transparent 3px 6px)" style={{ width }} />
)

export const DownArrow = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 4v13M6 12l6 6 6-6" /></svg>
)

export const RightArrow = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

type PillTone = 'ink' | 'outline'

const TONES: Record<PillTone, { pill: Record<string, string>; dot: Record<string, string> }> = {
  ink: { pill: { backgroundColor: INK, color: SNOW }, dot: { backgroundColor: ORANGE, color: INK } },
  outline: { pill: { backgroundColor: 'rgba(238,242,245,.7)', color: INK, border: `1px solid ${INK}` }, dot: { border: `1px solid ${INK}` } },
}

export const Pill = ({ href, tone = 'ink', dot, icon, children }: { href: string | null; tone?: PillTone; dot?: Record<string, string>; icon: ReactNode; children: ReactNode }) => {
  const shared = { display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: '22px', minH: '60px', pl: '30px', pr: '10px', borderRadius: '999px', fontWeight: 'bold', letterSpacing: { base: '.06em', _en: '.01em' }, textDecoration: 'none' } as const
  const mark = (
    <Span className="dot" aria-hidden display="inline-flex" alignItems="center" justifyContent="center" width="40px" height="40px" borderRadius="50%" transition="translate .3s cubic-bezier(.2,.7,.2,1)" style={dot ?? TONES[tone].dot}>{icon}</Span>
  )
  if (!href) {
    return <Span {...shared} opacity={.5} cursor="not-allowed" aria-disabled="true" style={TONES[tone].pill}>{children}{mark}</Span>
  }
  return <Link href={href} {...shared} css={{ '&:hover .dot': { translate: '5px 0' } }} style={TONES[tone].pill}>{children}{mark}</Link>
}
