import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { demoSrc } from './voicebankData'
import { INK, JOST, LANGS, LINE_LIGHT, MIST, NIGHT, ORANGE, PICK_EVENT, PLAY_EVENT, SNOW, type Tier } from './chiakiData'
import { Container, Reveal, Snow } from './parts'
import SectionTitle from './SectionTitle'

const Button = styled.button
const Text = styled.p
const Span = styled.span

const BAR_COUNT = 56
const TICK = 'rgba(238,242,245,.7)'

const TICKS: Record<Tier, { width: number; height: number; dotted?: boolean }> = {
  native: { width: 2, height: 26 },
  fluent: { width: 1, height: 18 },
  learning: { width: 1, height: 12, dotted: true },
}

const BRACKETS: { tier: Tier; border: string }[] = [
  { tier: 'native', border: `2px solid ${ORANGE}` },
  { tier: 'fluent', border: '2px solid rgba(238,242,245,.75)' },
  { tier: 'learning', border: '2px dotted rgba(238,242,245,.75)' },
]

// Seeded per station so each song gets its own fixed silhouette
const barHeights = (seed: number) => {
  let s = seed * 13 + 5
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    s = (s * 9301 + 49297) % 233280
    return Math.max(6, 8 + Math.round((s / 233280) * 44 * (0.55 + 0.45 * Math.sin(i / 6))))
  })
}

const RoundButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) => (
  <Button type="button" onClick={onClick} aria-label={label} width="56px" height="56px" borderRadius="50%" border="1px solid rgba(238,242,245,.6)" display="flex" alignItems="center" justifyContent="center" cursor="pointer" color="inherit">
    {children}
  </Button>
)

const ChiakiDemo = () => {
  const { t } = useI18n()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const loadedRef = useRef<number | null>(null)
  const playRef = useRef<(next: number) => void>(() => {})
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
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: 'demo' }))
    audio.play().then(() => setPlaying(true), () => setPlaying(false))
  }
  useEffect(() => {
    playRef.current = play
  })

  // The language list dispatches this inside its click, so play() still counts as user-initiated
  useEffect(() => {
    const onPick = (event: Event) => {
      const next = LANGS.findIndex((lang) => lang.code === (event as CustomEvent<string>).detail)
      if (next >= 0) playRef.current(next)
    }
    window.addEventListener(PICK_EVENT, onPick)
    return () => window.removeEventListener(PICK_EVENT, onPick)
  }, [])

  useEffect(() => {
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail === 'demo') return
      audioRef.current?.pause()
      setPlaying(false)
    }
    window.addEventListener(PLAY_EVENT, onOther)
    return () => window.removeEventListener(PLAY_EVENT, onOther)
  }, [])

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
    <Box as="section" id="listen" scrollMarginTop="72px" position="relative" overflow="hidden" py={{ base: 20, md: '130px' }} pb={{ md: '150px' }} style={{ backgroundColor: NIGHT, color: SNOW }}>
      <Snow />
      <Container>
        <Reveal>
          <SectionTitle index="01" sub={t('chiakiPage.sections.listen')} dark gap="44px">LISTEN</SectionTitle>
        </Reveal>

        <Reveal position="relative" backgroundColor="rgba(16,21,29,.86)" style={{ border: `1px solid ${LINE_LIGHT}` }}>
          <Flex flexWrap="wrap" alignItems="center" columnGap={16} rowGap={8} px={{ base: 5, md: 12 }} pt={{ base: 6, md: 11 }} pb={{ base: 5, md: '30px' }}>
            <Flex flex="1 1 520px" minW="0" flexDirection="column" gap={2} aria-live="polite">
              <Flex flexWrap="wrap" alignItems="center" columnGap="14px" rowGap="6px" fontFamily="mono" fontSize="xs" letterSpacing=".2em" style={{ color: MIST }}>
                <Span aria-hidden width="8px" height="8px" animation={playing ? 'chiakiLed 1.6s ease-in-out infinite' : 'none'} _motionReduce={{ animation: 'none' }} style={{ backgroundColor: playing ? ORANGE : 'rgba(238,242,245,.4)' }} />
                <Span>{playing ? 'NOW SINGING' : 'STAND BY'}</Span>
                <Span aria-hidden>/</Span>
                <Span>RECORD {String(idx + 1).padStart(2, '0')} OF {LANGS.length}</Span>
                <Span aria-hidden>/</Span>
                <Span letterSpacing={{ _en: '.06em' }} style={{ color: ORANGE }}>{t(`chiakiPage.tier.${current.tier}`)}</Span>
              </Flex>
              <Flex flexWrap="wrap" alignItems="baseline" columnGap={6}>
                <Span fontWeight="medium" fontSize={{ base: '4rem', md: 'clamp(4rem, 8vw, 7rem)' }} lineHeight="1.08" style={{ fontFamily: JOST, color: ORANGE }}>{current.code}</Span>
                <Span fontSize="22px" fontWeight="medium" letterSpacing={{ base: '.14em', _en: '.01em' }}>{t(`chiakiPage.lang.${current.code}`)}</Span>
                {t(`chiakiPage.lang.${current.code}`) !== current.native && <Span lang={current.tag} fontSize="17px" style={{ color: MIST }}>{current.native}</Span>}
              </Flex>
              <Text lang={current.tag} fontSize={{ base: '1.875rem', md: 'clamp(1.875rem, 4vw, 3.375rem)' }} fontWeight="medium" lineHeight="1.35" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{current.song}</Text>
            </Flex>

            <Flex flex="0 1 380px" minW="0" flexDirection="column" alignItems="center" gap="30px">
              <Flex alignItems="center" gap="26px">
                <RoundButton label={t('chiakiPage.demo.prev')} onClick={() => step(-1)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 2h1.5v12H3zM14 2v12L6 8z" fill="currentColor" /></svg>
                </RoundButton>
                <Button type="button" onClick={toggle} aria-label={t(playing ? 'chiakiPage.demo.pause' : 'chiakiPage.demo.play')} width="108px" height="108px" borderRadius="50%" display="flex" alignItems="center" justifyContent="center" cursor="pointer" animation={playing ? 'chiakiPulse 1.8s ease-out infinite' : 'none'} _motionReduce={{ animation: 'none' }} style={{ backgroundColor: ORANGE, color: INK }}>
                  <svg width="36" height="36" viewBox="0 0 22 22" aria-hidden>
                    <path d={playing ? 'M5 3h4v16H5zM13 3h4v16h-4z' : 'M6 3v16l13-8z'} fill="currentColor" />
                  </svg>
                </Button>
                <RoundButton label={t('chiakiPage.demo.next')} onClick={() => step(1)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M11.5 2H13v12h-1.5zM2 2v12l8-6z" fill="currentColor" /></svg>
                </RoundButton>
              </Flex>
              <Flex aria-hidden alignItems="flex-end" gap="4px" width="100%" height="56px">
                {bars.map((height, i) => (
                  <Span key={i} flex="1" style={{ height, backgroundColor: i / BAR_COUNT < progress ? ORANGE : 'rgba(238,242,245,.34)' }} />
                ))}
              </Flex>
            </Flex>
          </Flex>

          <Box overflowX="auto" px={{ base: 5, md: 12 }} pb={9} style={{ scrollbarColor: 'rgba(238,242,245,.35) transparent' }}>
            <Box minW="980px">
              <Box aria-hidden position="relative" height="30px">
                <Box position="absolute" top="0" width="0" height="30px" transition="left .8s cubic-bezier(.2,.7,.2,1)" style={{ left: `${((idx + 0.5) / LANGS.length) * 100}%` }}>
                  <Span position="absolute" left="-5px" top="4px" width="10px" height="10px" transform="rotate(45deg)" style={{ backgroundColor: ORANGE }} />
                  <Span position="absolute" left="-.5px" top="14px" width="1px" height="46px" style={{ backgroundColor: ORANGE }} />
                </Box>
              </Box>
              <Flex borderTop="1px solid rgba(238,242,245,.7)">
                {LANGS.map((lang, i) => {
                  const on = i === idx
                  const tick = TICKS[lang.tier]
                  return (
                    <Button
                      key={lang.code}
                      type="button"
                      onClick={() => play(i)}
                      aria-pressed={on}
                      aria-label={`${lang.code} ${t(`chiakiPage.lang.${lang.code}`)}`}
                      flex="1 1 0"
                      minW="0"
                      minH="66px"
                      pb="6px"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={2}
                      cursor="pointer"
                      color="rgba(238,242,245,.72)"
                      _hover={{ color: 'white' }}
                      style={on ? { color: ORANGE } : undefined}
                    >
                      <Span
                        aria-hidden
                        style={{
                          width: on ? 2 : tick.width,
                          height: tick.height,
                          background: on ? ORANGE : tick.dotted ? `repeating-linear-gradient(180deg, ${TICK} 0 2px, transparent 2px 4px)` : TICK,
                        }}
                      />
                      <Span fontFamily="mono" fontSize="11px" style={{ fontWeight: on ? 700 : 400 }}>{lang.code}</Span>
                    </Button>
                  )
                })}
              </Flex>
              <Flex fontFamily="mono" fontSize="11px" letterSpacing={{ base: '.16em', _en: '.06em' }} lineHeight="1.6" style={{ color: MIST }}>
                {BRACKETS.map(({ tier, border }, i) => (
                  <Box key={tier} minW="0" pt={2} style={{ flex: `${LANGS.filter((lang) => lang.tier === tier).length} 1 0`, marginRight: i < BRACKETS.length - 1 ? 8 : 0, borderTop: border }}>{t(`chiakiPage.tier.${tier}`)}</Box>
                ))}
              </Flex>
            </Box>
          </Box>
        </Reveal>
      </Container>
    </Box>
  )
}

export default ChiakiDemo
