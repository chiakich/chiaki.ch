import { useEffect, useRef, useState } from 'react'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { track } from 'lib/analytics'
import { DUSK_SONG, INK, LINE_LIGHT, MIST, NIGHT, ORANGE, PLAY_EVENT, SNOW, STARS } from './chiakiData'
import { LINES, SONG_ART, SONG_SRC, STANZAS, type SongLine } from './songData'
import { GLOW, LANTERN, LyricStage, SHADOW, charStyle, tagOf } from './songPv'
import { Container, Reveal } from './parts'
import SectionTitle from './SectionTitle'

const Text = styled.p
const Span = styled.span
const Button = styled.button
const Input = styled.input
const Details = styled.details
const Summary = styled.summary

const PLAYER_ID = 'song'
// Fallback until metadata loads, since the audio is only fetched on first play
const DURATION = 259.5
// Consonants sound before the note position and the fade reads late, so text leads the audio slightly
const LEAD_IN = 0.25
// How long a finished line stays lit before it fades
const HOLD = 1.2

// Seeded so server and client scatter the same motes over the whole illustration
const MOTES = (() => {
  let seed = 11
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  // A few soft bokeh give the field depth, the rest are fine embers
  return Array.from({ length: 32 }, (_, i) => {
    const bokeh = i % 6 === 0
    return {
      bokeh,
      left: (rand() * 100).toFixed(1),
      top: (rand() * 100).toFixed(1),
      size: (bokeh ? 6 + rand() * 4 : 2 + rand() * 2).toFixed(1),
      seconds: (6 + rand() * 9).toFixed(1),
      delay: (-rand() * 15).toFixed(1),
      dx: `${Math.round((rand() - 0.5) * 90)}px`,
      dy: `${-Math.round(30 + rand() * 110)}px`,
    }
  })
})()

const LAST = LINES.length - 1

const lineAt = (time: number) => {
  let found = -1
  LINES.forEach((line, i) => { if (line.start <= time) found = i })
  return found
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

// Phones have no room for the PV stage, so the subtitle keeps its lettering without the motion
const StillLine = ({ line }: { line: SongLine }) => (
  <>
    {[...line.text].map((char, index) => (
      <Span key={index} style={{ ...charStyle(char), ...(index === 0 ? { fontSize: '1.3em', color: LANTERN, textShadow: GLOW } : null) }}>{char}</Span>
    ))}
  </>
)

const ChiakiSong = () => {
  const { t, locale } = useI18n()
  const audioRef = useRef<HTMLAudioElement>(null)
  // Counts listeners, not every pause/resume
  const playedRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(DURATION)

  const translate = (stanzaId: string, index: number) => {
    // The song is sung in Japanese, and a missing ja key would otherwise fall back to the tw translation
    if (locale === 'ja') return ''
    const key = `chiakiPage.song.lyrics.${stanzaId}.${index}`
    const value = t(key)
    return value === key ? '' : value
  }

  useEffect(() => {
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== PLAYER_ID) audioRef.current?.pause()
    }
    window.addEventListener(PLAY_EVENT, onOther)
    return () => window.removeEventListener(PLAY_EVENT, onOther)
  }, [])

  // timeupdate only fires about four times a second, too coarse for the per-character reveal
  useEffect(() => {
    if (!playing) return
    let frame = 0
    const tick = () => {
      if (audioRef.current) setTime(audioRef.current.currentTime)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      if (!playedRef.current) {
        playedRef.current = true
        track('song-play')
      }
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: PLAYER_ID }))
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }

  const seek = (value: number) => {
    if (audioRef.current) audioRef.current.currentTime = value
    setTime(value)
  }

  const lyricTime = time + LEAD_IN
  const active = lineAt(lyricTime)
  // The closing おやすみ stays up through the outro
  const cur = active >= 0 && (lyricTime <= LINES[active].end + HOLD || active === LAST) ? active : -1
  const line = cur >= 0 ? LINES[cur] : null
  const progress = Math.min(1, time / duration)

  return (
    <Box as="section" id="song" scrollMarginTop="72px" position="relative" overflow="hidden" pt={{ base: '110px', md: '140px' }} pb={{ base: 20, md: '120px' }} style={{ color: SNOW, backgroundColor: NIGHT }}>
      {/* Finishes the sky the terms section started: blue hour, then the night footer */}
      <Box aria-hidden position="absolute" left="0" right="0" top="0" height={{ base: '170px', md: '240px' }} style={{ backgroundImage: DUSK_SONG }} />
      <Box aria-hidden position="absolute" inset="0" pointerEvents="none" maskImage={{ base: 'linear-gradient(180deg, transparent 60px, black 170px)', md: 'linear-gradient(180deg, transparent 80px, black 240px)' }} style={{ backgroundImage: STARS.image, backgroundSize: `${STARS.width}px ${STARS.height}px` }} />
      <audio
        ref={audioRef}
        src={SONG_SRC}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || DURATION)}
        onEnded={() => {
          setTime(duration)
          track('song-complete')
        }}
      />

      <Container position="relative">
        <Reveal>
          <SectionTitle index="07" sub={t('chiakiPage.sections.song')} dark gap="44px">SONG</SectionTitle>
        </Reveal>

        <Reveal display="flex" flexWrap="wrap" alignItems="baseline" columnGap={8} rowGap={3} mb={{ base: 8, md: 12 }}>
          <Text lang="ja" fontWeight="black" fontSize={{ base: '2.5rem', md: 'clamp(2.5rem, 5vw, 4.5rem)' }} lineHeight="1.1" letterSpacing=".12em">渡し歌</Text>
          <Text fontFamily="mono" fontSize="13px" letterSpacing=".3em" style={{ color: ORANGE }}>WATASHI-UTA</Text>
          <Text flex="1 1 320px" fontSize={{ base: '15px', md: '17px' }} lineHeight="1.9" style={{ color: MIST }}>{t('chiakiPage.song.desc')}</Text>
        </Reveal>

        <Reveal>
          <Box position="relative" overflow="hidden" containerType="inline-size" style={{ border: `1px solid ${LINE_LIGHT}` }}>
            {/* The frame is everything drawn over the illustration; on phones the controls sit under it, as in a video player */}
            <Box position="relative">
              <picture>
                <source media="(max-width: 767px)" srcSet={SONG_ART.small} />
                <styled.img src={SONG_ART.large} loading="lazy" decoding="async" alt={t('chiakiPage.song.artAlt')} display="block" width="100%" height="auto" aspectRatio="2000 / 1116" objectFit="cover" />
              </picture>
              {/* Positions are percentages of the illustration so they stay on the lantern at any width */}
              <Box aria-hidden position="absolute" inset="0" pointerEvents="none" mixBlendMode="screen" animation="chiakiFlicker 2.6s linear infinite" _motionReduce={{ animation: 'none' }} backgroundImage="radial-gradient(circle at 41.5% 14%, rgba(255,205,130,.6) 0%, rgba(255,175,95,.26) 6%, rgba(255,150,80,.1) 15%, transparent 30%), radial-gradient(38% 48% at 34% 46%, rgba(255,170,95,.14), transparent 70%)" />
              <Box aria-hidden position="absolute" inset="0" pointerEvents="none" _motionReduce={{ display: 'none' }}>
                {MOTES.map((mote, index) => (
                  <Span
                    key={index}
                    position="absolute"
                    borderRadius="50%"
                    mixBlendMode="screen"
                    style={{
                      left: `${mote.left}%`,
                      top: `${mote.top}%`,
                      width: `${mote.size}px`,
                      height: `${mote.size}px`,
                      background: mote.bokeh ? 'radial-gradient(circle, rgba(255,214,160,.45), transparent 70%)' : '#fff1d8',
                      boxShadow: mote.bokeh ? undefined : '0 0 5px 1px rgba(255,185,110,.75), 0 0 12px 2px rgba(255,160,80,.25)',
                      filter: mote.bokeh ? 'blur(1px)' : undefined,
                      animation: `chiakiMote ${mote.seconds}s ${mote.delay}s ease-in-out infinite`,
                      ['--dx' as string]: mote.dx,
                      ['--dy' as string]: mote.dy,
                    }}
                  />
                ))}
              </Box>

              {/* PV-style lyrics across the open sky; visual only, the full text lives in the details below */}
              <Box aria-hidden display={{ base: 'block', _motionReduce: 'none' }} position="absolute" inset="0" pointerEvents="none" backgroundImage="linear-gradient(270deg, rgba(8,10,24,.6) 0%, rgba(8,10,24,.34) 30%, transparent 56%)" />
              <LyricStage cur={cur} active={active} time={lyricTime} />

              {/* One scrim under the subtitles and the controls keeps both readable over the grass */}
              <Box aria-hidden position="absolute" left="0" right="0" bottom="0" height={{ base: '34%', md: '46%' }} pointerEvents="none" backgroundImage="linear-gradient(180deg, transparent, rgba(10,12,22,.5) 45%, rgba(10,12,22,.85))" />

              {/* Every subtitle is stacked in one grid cell so a change crossfades instead of popping */}
              <Box aria-hidden position="absolute" left="0" right="0" bottom={{ base: '8px', md: '118px' }} px={{ base: 4, md: 16 }} pointerEvents="none" transition="opacity .6s ease" style={{ opacity: line ? 1 : 0 }}>
                <Grid display={{ base: 'none', _motionReduce: 'grid' }} justifyItems="center" textAlign="center">
                  {LINES.map((item, index) => (
                    <Text key={index} lang={tagOf(item)} gridArea="1 / 1" fontWeight="black" fontSize={{ base: '19px', md: '28px' }} lineHeight="1.3" letterSpacing=".06em" transition="opacity .6s ease" style={{ opacity: index === cur ? 1 : 0, textShadow: SHADOW }}><StillLine line={item} /></Text>
                  ))}
                </Grid>
                <Grid justifyItems="center" textAlign="center">
                  {LINES.map((item, index) => {
                    const tr = translate(item.stanzaId, item.index)
                    return tr && <Text key={index} gridArea="1 / 1" fontSize={{ base: '14px', md: '24px' }} fontWeight="medium" lineHeight="1.5" letterSpacing=".04em" transition="opacity .6s ease" style={{ opacity: index === cur ? 1 : 0, color: '#f6e6d2', textShadow: SHADOW }}>{tr}</Text>
                  })}
                </Grid>
              </Box>
            </Box>

            <Flex position={{ base: 'relative', md: 'absolute' }} left="0" right="0" bottom="0" alignItems="center" gap={{ base: 3, md: 6 }} px={{ base: 3, md: 7 }} pt={{ base: 3, md: 0 }} pb={{ base: 3, md: 6 }}>
              <Button type="button" onClick={toggle} aria-label={t(playing ? 'chiakiPage.song.pause' : 'chiakiPage.song.play')} flexShrink={0} width={{ base: '44px', md: '72px' }} height={{ base: '44px', md: '72px' }} borderRadius="50%" display="flex" alignItems="center" justifyContent="center" cursor="pointer" boxShadow="0 6px 24px rgba(8,10,24,.45)" animation={playing ? 'chiakiPulse 1.8s ease-out infinite' : 'none'} _motionReduce={{ animation: 'none' }} style={{ backgroundColor: ORANGE, color: INK }}>
                <styled.svg width={{ base: '18px', md: '26px' }} height={{ base: '18px', md: '26px' }} viewBox="0 0 22 22" aria-hidden>
                  <path d={playing ? 'M5 3h4v16H5zM13 3h4v16h-4z' : 'M6 3v16l13-8z'} fill="currentColor" />
                </styled.svg>
              </Button>
              <Flex flex="1" minW="0" flexDirection="column" gap={{ base: 0, md: 1 }}>
                <Flex alignItems="center" columnGap="12px" fontFamily="mono" fontSize={{ base: '10px', md: 'xs' }} letterSpacing=".2em" style={{ color: MIST, textShadow: SHADOW }}>
                  <Span aria-hidden width="7px" height="7px" animation={playing ? 'chiakiLed 1.6s ease-in-out infinite' : 'none'} _motionReduce={{ animation: 'none' }} style={{ backgroundColor: playing ? ORANGE : 'rgba(238,242,245,.5)' }} />
                  <Span display={{ base: 'none', md: 'inline' }}>{playing ? 'NOW SINGING' : 'STAND BY'}</Span>
                  <Span ml="auto" letterSpacing=".1em">{clock(time)} / {clock(duration)}</Span>
                </Flex>
                {/* A transparent native range keeps keyboard seeking; the track underneath is drawn to match SPEC's faders */}
                <Box position="relative" height="28px" _focusWithin={{ outline: `2px solid ${ORANGE}`, outlineOffset: '4px' }}>
                  <Span aria-hidden position="absolute" left="0" right="0" top="8px" height="12px" backgroundImage="repeating-linear-gradient(90deg, rgba(238,242,245,.4) 0 1px, transparent 1px 5%)" borderRight="1px solid rgba(238,242,245,.4)" />
                  <Span aria-hidden position="absolute" left="0" right="0" top="13.5px" height="1px" style={{ backgroundColor: 'rgba(238,242,245,.55)' }} />
                  <Span aria-hidden position="absolute" left="0" top="13px" height="2px" style={{ width: `${progress * 100}%`, backgroundColor: ORANGE }} />
                  <Span aria-hidden position="absolute" top="7px" width="14px" height="14px" ml="-7px" transform="rotate(45deg)" style={{ left: `${progress * 100}%`, backgroundColor: ORANGE }} />
                  <Input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={Math.min(time, duration)}
                    onChange={(event) => seek(Number(event.currentTarget.value))}
                    aria-label={t('chiakiPage.song.seek')}
                    aria-valuetext={`${clock(time)} / ${clock(duration)}`}
                    position="absolute"
                    inset="0"
                    width="100%"
                    height="100%"
                    m="0"
                    opacity={0}
                    cursor="pointer"
                  />
                </Box>
              </Flex>
            </Flex>
          </Box>
        </Reveal>

        <Reveal mt={{ base: 10, md: 14 }}>
          <Details style={{ borderTop: `1px solid ${LINE_LIGHT}`, borderBottom: `1px solid ${LINE_LIGHT}` }}>
            <Summary display="flex" alignItems="center" justifyContent="space-between" gap={4} minH="64px" fontSize="17px" fontWeight="bold" cursor="pointer" listStyle="none" css={{ '&::-webkit-details-marker': { display: 'none' } }}>
              {t('chiakiPage.song.fullLyrics')}
              <Span aria-hidden display="flex" transition="transform .3s ease" css={{ 'details[open] &': { transform: 'rotate(180deg)' } }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" /></svg>
              </Span>
            </Summary>
            <Box columnCount={{ base: 1, md: 2, xl: 3 }} columnGap={16} pt={4} pb={10}>
              {STANZAS.map((item, s) => (
                <Box key={s} breakInside="avoid" mb={8}>
                  {item.lines.map((entry, index) => {
                    const tr = translate(item.id, index)
                    return (
                      <Box key={index} mb={2}>
                        <Text lang={tagOf(entry)} fontSize="15px" lineHeight="1.8">
                          {entry.code && <Span fontFamily="mono" fontSize="11px" mr={3} style={{ color: ORANGE }}>{entry.code}</Span>}
                          {entry.text}
                        </Text>
                        {tr && <Text fontSize="13px" lineHeight="1.7" style={{ color: MIST }}>{tr}</Text>}
                      </Box>
                    )
                  })}
                </Box>
              ))}
            </Box>
          </Details>
        </Reveal>
      </Container>
    </Box>
  )
}

export default ChiakiSong
