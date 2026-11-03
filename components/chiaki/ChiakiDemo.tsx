import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { demoSrc } from './voicebankData'
import { CREAM, LANGS, NAVY, ORANGE } from './chiakiData'
import SectionTitle from './SectionTitle'

const Button = styled.button
const Text = styled.p
const Span = styled.span

const BAR_COUNT = 72
const LEARNING_FROM = LANGS.findIndex((lang) => lang.tier === 'learning')

// Seeded per station so each song gets its own fixed silhouette
const barHeights = (seed: number) => {
  let s = seed * 13 + 5
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    s = (s * 9301 + 49297) % 233280
    return Math.max(6, 8 + Math.round((s / 233280) * 48 * (0.55 + 0.45 * Math.sin(i / 6))))
  })
}

const RoundButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) => (
  <Button type="button" onClick={onClick} aria-label={label} width="48px" height="48px" borderRadius="50%" border="1px solid rgba(255,248,239,.35)" display="flex" alignItems="center" justifyContent="center" cursor="pointer" color="inherit">
    {children}
  </Button>
)

const ChiakiDemo = () => {
  const { t } = useI18n()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const loadedRef = useRef<number | null>(null)
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const current = LANGS[idx]
  const bars = useMemo(() => barHeights(idx), [idx])

  useEffect(() => () => audioRef.current?.pause(), [])

  const play = (next: number) => {
    const audio = audioRef.current ?? (audioRef.current = new Audio())
    if (loadedRef.current !== next) {
      audio.src = demoSrc(LANGS[next].code)
      loadedRef.current = next
      setProgress(0)
    }
    setIdx(next)
    audio.ontimeupdate = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    audio.onended = () => play((next + 1) % LANGS.length)
    audio.play().then(() => setPlaying(true), () => setPlaying(false))
  }

  const toggle = () => {
    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
    } else {
      play(idx)
    }
  }

  const step = (delta: number) => {
    const next = (idx + delta + LANGS.length) % LANGS.length
    if (playing) play(next)
    else {
      loadedRef.current = null
      setProgress(0)
      setIdx(next)
    }
  }

  return (
    <Box as="section">
      <SectionTitle>DEMO</SectionTitle>
      <Box position="relative" borderRadius="40px" p={{ base: 6, md: 12 }} overflow="hidden" style={{ backgroundColor: NAVY, color: CREAM }}>
        <Box aria-hidden position="absolute" inset="0" backgroundImage="radial-gradient(rgba(255,248,239,.10) 1px, transparent 1px)" backgroundSize="14px 14px" />

        <Flex position="relative" flexWrap="wrap" alignItems="center" columnGap={7} rowGap={5}>
          <Flex alignItems="center" gap={3}>
            <RoundButton label={t('chiakiPage.demo.prev')} onClick={() => step(-1)}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 2h2v12H3zM14 2v12L6 8z" fill="currentColor" /></svg>
            </RoundButton>
            <Button type="button" onClick={toggle} aria-label={t(playing ? 'chiakiPage.demo.pause' : 'chiakiPage.demo.play')} width="76px" height="76px" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" cursor="pointer" style={{ backgroundColor: ORANGE, color: NAVY }}>
              <svg width="26" height="26" viewBox="0 0 22 22" aria-hidden>
                <path d={playing ? 'M5 3h4v16H5zM13 3h4v16h-4z' : 'M6 3v16l13-8z'} fill="currentColor" />
              </svg>
            </Button>
            <RoundButton label={t('chiakiPage.demo.next')} onClick={() => step(1)}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M11 2h2v12h-2zM2 2v12l8-6z" fill="currentColor" /></svg>
            </RoundButton>
          </Flex>
          <Box flex="1 1 260px" minW="0" aria-live="polite">
            <Text mb="6px" display="flex" alignItems="center" gap="10px" fontFamily="mono" fontSize="xs" letterSpacing=".2em">
              <Span aria-hidden width="8px" height="8px" borderRadius="50%" style={{ backgroundColor: playing ? ORANGE : 'rgba(255,248,239,.35)' }} />
              <Span color="#f2b47e">{current.code}</Span>
              <Span color="rgba(255,248,239,.4)">/</Span>
              <Span letterSpacing=".1em">{t(`chiakiPage.lang.${current.code}`)}</Span>
            </Text>
            <Text lang={current.tag} fontSize={{ base: '1.5rem', md: 'clamp(1.5rem, 3vw, 2.25rem)' }} fontWeight="bold" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{current.song}</Text>
          </Box>
          <Span fontFamily="'Jost', var(--cjk), sans-serif" fontSize="2.5rem" fontWeight="medium" letterSpacing=".02em">
            {String(idx + 1).padStart(2, '0')}
            <Span fontSize="lg" color="rgba(255,248,239,.6)"> / {LANGS.length}</Span>
          </Span>
        </Flex>

        <Flex aria-hidden position="relative" alignItems="center" gap="3px" height="64px" mt={8} mb={6}>
          {bars.map((height, i) => (
            <Span key={i} flex="1" borderRadius="2px" style={{ height, backgroundColor: i / BAR_COUNT < progress ? ORANGE : 'rgba(255,248,239,.2)' }} />
          ))}
        </Flex>

        <Box position="relative" overflowX="auto" mx="-8px" px="8px" pt={1} pb={1} style={{ scrollbarColor: 'rgba(255,248,239,.35) transparent' }}>
          <Grid minW="1100px" style={{ gridTemplateColumns: `repeat(${LANGS.length}, minmax(0, 1fr))` }}>
            {LANGS.map((lang, i) => {
              const on = i === idx
              return (
                <Button
                  key={lang.code}
                  type="button"
                  onClick={() => play(i)}
                  aria-pressed={on}
                  aria-label={`${lang.code} ${t(`chiakiPage.lang.${lang.code}`)}`}
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={2}
                  pb={1}
                  cursor="pointer"
                  style={{ color: on ? CREAM : 'rgba(255,248,239,.72)' }}
                >
                  <Span aria-hidden position="absolute" left="0" right="0" top="10px" style={{ borderTop: `5px ${i < LEARNING_FROM ? 'solid' : 'dotted'} ${ORANGE}` }} />
                  <Span
                    aria-hidden
                    position="relative"
                    borderRadius="50%"
                    style={{ width: on ? 30 : 20, height: on ? 30 : 20, marginTop: on ? -3 : 2, backgroundColor: on ? ORANGE : NAVY, border: `4px solid ${CREAM}` }}
                  />
                  <Span fontFamily="mono" fontSize="11px" style={{ fontWeight: on ? 700 : 400, color: on ? '#f2b47e' : 'rgba(255,248,239,.6)' }}>{lang.code}</Span>
                  <Span fontSize="13px" letterSpacing=".1em" style={{ writingMode: 'vertical-rl', fontWeight: on ? 700 : 400 }}>{t(`chiakiPage.lang.${lang.code}`)}</Span>
                </Button>
              )
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}

export default ChiakiDemo
