import { useEffect, useState, type MouseEvent } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { PORTRAIT_SRC } from './voicebankData'
import { INK, JOST, ORANGE, ORANGE_TEXT, RUINS_FAR, RUINS_NEAR, SNOW, TITLE_ORANGE } from './chiakiData'
import { BlockReveal, DownArrow, Gauge, Pill, Snow } from './parts'

const Text = styled.p
const Span = styled.span
const Link = styled.a

const NAV = ['listen', 'languages', 'download', 'spec', 'design', 'terms', 'song']

// Sized from the section height rather than vw, so her head stays at the same height whatever the width; a vw height in a taller section left it sinking.
// The slot starts at 52%, and when she is wider than what is left she overflows leftward instead of being cropped at the right edge.
// On mobile she sits off-centre to the right as at 375px, tracking the centre on wider phones instead of staying pinned left.
const SLOT = { position: 'absolute', left: { base: 'max(76px, calc(50% - 112px))', md: '52%' }, right: { md: '12px' }, top: { md: '76px' }, bottom: { base: '22px', md: '44px' }, height: { base: '720px', md: 'auto' }, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' } as const
const FIGURE = { position: 'relative', flexShrink: 0, marginRight: 'auto', height: '100%', maxHeight: '980px', aspectRatio: '609 / 1200' } as const

// The stage keeps this height even when longer copy stretches the section, so the figure never resizes with the text; the extra space below is plain snow
const STAGE_H = 'min(1100px, calc(350px + 58vw))'

const drift = (x: number, y: number) => ({ translate: `calc(var(--mx, 0) * ${x}px) calc(var(--my, 0) * ${y}px)`, transition: 'translate .5s ease-out' })

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
)

const Stage = () => {
  const { t } = useI18n()
  return (
    <Box position={{ base: 'relative', md: 'absolute' }} top={{ md: '0' }} left={{ md: '0' }} right={{ md: '0' }} height={{ base: '820px', md: STAGE_H }} overflow="hidden" backgroundImage="linear-gradient(180deg, #a3b1c0 0%, #c6d0da 46%, #e3e8ed 80%, #eef2f5 100%)">
      <Box aria-hidden {...SLOT} zIndex={0}>
        <Box {...FIGURE}>
          <Box position="absolute" left="50%" top="36%" width={{ base: '118%', md: '126%' }} aspectRatio="1 / 1" transform="translate(-50%, -50%)" style={drift(10, 6)}>
            <Box width="100%" height="100%" borderRadius="50%" animation="chiakiDiscIn 1.6s cubic-bezier(.2,.7,.2,1) both" _motionReduce={{ animation: 'none' }} style={{ backgroundColor: ORANGE }} />
          </Box>
          <Box position="absolute" left="50%" top="36%" width={{ base: '138%', md: '146%' }} aspectRatio="1 / 1" borderRadius="50%" border="1px solid rgba(22,28,38,.55)" transform="translate(-50%, -50%)" style={drift(22, 12)} />
        </Box>
      </Box>

      {/* Follows the copy column's left edge once it stops growing at 1440px and centres */}
      <Text
        aria-hidden
        position="absolute"
        zIndex={1}
        left={{ base: '14px', md: 'calc(max(0px, (100% - 1440px) / 2) + 64px)' }}
        top={{ base: '54px', md: '76px' }}
        fontWeight="bold"
        fontSize={{ base: '34px', md: 'clamp(40px, 6.6vw, 96px)' }}
        lineHeight="0.94"
        letterSpacing=".01em"
        whiteSpace="nowrap"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        style={{ fontFamily: JOST }}
      >
        <BlockReveal delay={0.1}><span>DIFFSINGER</span></BlockReveal>
        <BlockReveal delay={0.22} color={TITLE_ORANGE}><span>VOICE</span></BlockReveal>
        <BlockReveal delay={0.34} color={TITLE_ORANGE}><span>ARCHIVE</span></BlockReveal>
      </Text>

      <styled.svg aria-hidden viewBox="0 0 1240 360" preserveAspectRatio="none" position="absolute" zIndex={1} left="0" bottom={{ base: '56px', md: '84px' }} width="100%" height={{ base: '170px', md: '320px' }} maskImage={{ md: 'linear-gradient(90deg, transparent 0%, transparent 34%, black 56%)' }}>
        <path fill="#8695a5" opacity=".55" d={RUINS_FAR} />
        <path fill="#a7b4c1" opacity=".7" d={RUINS_NEAR} />
      </styled.svg>

      {/* Snow falls behind the drift and the figure so it never lands on her */}
      <Box position="absolute" inset="0" zIndex={1} pointerEvents="none"><Snow /></Box>

      <styled.svg aria-hidden viewBox="0 0 1240 180" preserveAspectRatio="none" position="absolute" zIndex={2} left="0" bottom="0" width="100%" height={{ base: '86px', md: '150px' }}>
        <path fill="#dfe5ea" d="M0 70C160 30 300 60 460 48s320-40 480-10 220 20 300 10V180H0z" />
        <path fill={SNOW} d="M0 120c140-30 280-10 420-20s260-40 420-24 260 30 400 4V180H0z" />
      </styled.svg>

      {/* Parallax lives on the wrapper because breathe animates the image's own translate */}
      <Box {...SLOT} zIndex={3} pointerEvents="none">
        <Box {...FIGURE} style={drift(-14, -6)}>
          <Span aria-hidden position="absolute" left="16%" right="12%" bottom="-1.2%" height="3.4%" borderRadius="50%" backgroundColor="rgba(22,28,38,.2)" filter="blur(7px)" />
          <styled.img
            src={PORTRAIT_SRC}
            alt={t('chiakiPage.portraitAlt')}
            display="block"
            width="100%"
            height="100%"
            transformOrigin="50% 100%"
            animation="chiakiFadeUp 1.4s .3s cubic-bezier(.2,.7,.2,1) both, breathe 5.5s 2s ease-in-out infinite"
            _motionReduce={{ animation: 'none' }}
          />
        </Box>
      </Box>

    </Box>
  )
}

const ChiakiHero = () => {
  const { t, locale } = useI18n()
  const nameLang = locale === 'ja' ? 'ja' : undefined
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const cjk = locale === 'ja' ? 'Noto Sans JP' : 'Noto Sans TC'
    const reveal = () => setReady(true)
    // A slow font shouldn't hold the title hidden for long
    const timer = setTimeout(reveal, 1500)
    Promise.all([
      document.fonts.load('700 1em Jost'),
      document.fonts.load('600 1em Jost'),
      document.fonts.load(`900 1em "${cjk}"`, '千亞亜紀'),
    ]).then(reveal, reveal)
    return () => clearTimeout(timer)
  }, [locale])

  const onMove = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget
    const box = el.getBoundingClientRect()
    el.style.setProperty('--mx', ((event.clientX - box.left) / box.width - 0.5).toFixed(3))
    el.style.setProperty('--my', ((event.clientY - box.top) / box.height - 0.5).toFixed(3))
  }

  return (
    <Box as="section" id="top" position="relative" overflow="hidden" minH={{ md: STAGE_H }} onMouseMove={onMove} data-ready={ready || undefined} style={{ backgroundColor: SNOW, color: INK }}>
      <noscript><style>{'.chiaki-block > * { opacity: 1 !important }'}</style></noscript>
      <Stage />

      <Flex as="nav" aria-label="Chiaki" display={{ base: 'none', md: 'flex' }} position="absolute" zIndex={6} top="14px" right="64px" flexWrap="wrap" columnGap={7} fontSize="sm" fontWeight="medium" style={{ fontFamily: JOST }}>
        {NAV.map((id) => (
          <Link key={id} href={`#${id}`} py={3} letterSpacing=".12em" textDecoration="none" _hover={{ color: '#9a4609' }}>{id.toUpperCase()}</Link>
        ))}
      </Flex>

      <Flex aria-hidden position="absolute" zIndex={5} right={{ base: '16px', md: '56px' }} top={{ base: '18px', md: '92px' }} gap={{ base: '6px', md: 2 }} alignItems="flex-start" pointerEvents="none">
        <BlockReveal axis="y" delay={0.5}>
          <Span lang={nameLang} backgroundColor="white" fontWeight="bold" letterSpacing=".22em" fontSize={{ base: '10px', md: 'xs' }} px={{ base: '2px', md: '3px' }} py={{ base: '6px', md: 2 }} whiteSpace="nowrap" style={{ writingMode: 'vertical-rl' }}>{t('chiakiPage.name')}</Span>
        </BlockReveal>
        <BlockReveal axis="y" delay={0.6}>
          <Span fontWeight="bold" fontSize={{ base: 'sm', md: '1.25rem' }} letterSpacing=".12em" lineHeight="1.1" whiteSpace="nowrap" style={{ fontFamily: JOST, writingMode: 'vertical-rl' }}>
            CHIAKI.CH
            <Span color="#3f4b58" mt=".4em">VOICE ARCHIVE</Span>
          </Span>
        </BlockReveal>
      </Flex>

      <Flex
        position={{ base: 'static', md: 'relative' }}
        zIndex={5}
        maxW="1440px"
        mx="auto"
        px={{ base: 5, md: 16 }}
        pt={{ base: '6px', md: 'calc(58px + clamp(150px, 24.5vw, 352px))' }}
        pb={{ base: '30px', md: '150px' }}
        flexDirection="column"
        alignItems={{ base: 'stretch', md: 'flex-start' }}
        gap={{ base: 4, md: '22px' }}
      >
        <Flex position={{ base: 'absolute', md: 'static' }} zIndex={6} left="20px" top="26px" flexWrap="wrap" alignItems="center" columnGap="18px" rowGap="6px" fontFamily="mono" fontSize={{ base: '10px', md: 'xs' }} letterSpacing=".2em">
          <Span>VIRTUAL SINGER</Span>
          <Gauge />
          <Span display={{ base: 'none', md: 'inline' }}>28 LANGUAGES</Span>
        </Flex>

        {/* The character name is the page's h1 so search engines key on it, not the decorative title */}
        <Flex as="h1" position={{ base: 'absolute', md: 'static' }} zIndex={5} left="22px" top="196px" flexDirection={{ base: 'row', md: 'column' }} alignItems="flex-start" gap={{ base: 2, md: '6px' }}>
          <Span lang="ja" display={{ base: 'none', md: 'block' }} fontFamily="mono" fontSize="13px" fontWeight="regular" letterSpacing=".5em" style={{ color: ORANGE_TEXT }}>チアキ</Span>
          <Flex as="span" flexWrap="wrap" alignItems={{ base: 'flex-start', md: 'baseline' }} columnGap={{ base: 2, md: 7 }}>
            <BlockReveal axis="y-mobile" delay={0.42}>
              <Span lang={nameLang} fontWeight="black" fontSize={{ base: '58px', md: 'clamp(64px, 6.6vw, 96px)' }} lineHeight="1.1" letterSpacing=".1em" writingMode={{ base: 'vertical-rl', md: 'horizontal-tb' }}>{t('chiakiPage.name')}</Span>
            </BlockReveal>
            <BlockReveal axis="y-mobile" delay={0.54}>
              <Span fontWeight="medium" fontSize={{ base: '22px', md: 'clamp(44px, 4.6vw, 66px)' }} lineHeight={{ base: '1', md: '1.1' }} letterSpacing={{ base: '.24em', md: '.1em' }} writingMode={{ base: 'vertical-rl', md: 'horizontal-tb' }} style={{ fontFamily: JOST }}>CHIAKI</Span>
            </BlockReveal>
          </Flex>
        </Flex>

        <Text lang="ja" fontWeight="medium" fontSize={{ base: 'xl', md: 'clamp(22px, 2.2vw, 31px)' }} lineHeight="1.6" letterSpacing={{ base: '.04em', md: '.08em' }}>どこにいても、歌をお届けします。</Text>

        {/* Kept left of the figure's 52% slot so on narrow screens the copy doesn't run under her */}
        {/* The extra top margin splits name and tagline from the copy, and at 1200px wide keeps the copy just below the 630px OG capture */}
        <Text mt={{ md: '40px' }} maxW={{ md: 'min(29em, calc(52vw - 64px))' }} fontSize={{ base: '15px', md: '17px' }} lineHeight="2">{t('chiakiPage.intro')}</Text>

        <Flex flexDirection={{ base: 'column', md: 'row' }} flexWrap="wrap" alignItems={{ base: 'stretch', md: 'center' }} gap={{ base: 3, md: '14px 18px' }} pt="6px">
          <Pill href="#download" track={['hero-cta', { target: 'download' }]} icon={<DownArrow />}>{t('chiakiPage.freeDownload')}</Pill>
          <Pill href="#listen" tone="outline" track={['hero-cta', { target: 'listen' }]} icon={<PlayIcon />}>{t('chiakiPage.listen')}</Pill>
        </Flex>

        <Link href="#song" display="inline-flex" alignItems="center" alignSelf="flex-start" gap="14px" minH="44px" fontFamily="mono" fontSize="xs" letterSpacing=".2em" textDecoration="none" _hover={{ color: '#9a4609' }}>
          THEME SONG
          <Span aria-hidden width="28px" height="1px" backgroundColor="currentColor" />
          <Span lang="ja" fontFamily="var(--cjk), sans-serif" fontSize="sm" fontWeight="bold" letterSpacing=".2em">渡し歌</Span>
          <PlayIcon />
        </Link>
      </Flex>
    </Box>
  )
}

export default ChiakiHero
