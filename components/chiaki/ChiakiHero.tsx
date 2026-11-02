import { Box, Flex, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { PORTRAIT_SRC } from 'components/works/voicebank/voicebankData'
import { INK, ORANGE, ORANGE_TEXT, NAVY } from './chiakiData'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const Ruby = styled.ruby
const Rt = styled.rt
const Img = styled.img
const Link = styled.a

const PROFILE_KEYS = ['birthday', 'age', 'height', 'voice', 'illust', 'design']

// Each fall distance is a multiple of its tile height so the loop is seamless
const SNOW_LAYERS = [
  { dot: 'rgba(255,255,255,.95) 1.6px, transparent 2.2px', size: '120px 100px', x: 0, fall: 400 },
  { dot: 'rgba(255,255,255,.75) 1.1px, transparent 1.6px', size: '80px 65px', x: 40, fall: 260 },
  { dot: 'rgba(255,255,255,.55) .8px, transparent 1.2px', size: '46px 45px', x: 10, fall: 180 },
]

const Ruins = () => (
  <svg aria-hidden viewBox="0 0 1240 360" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 120, width: '100%', height: 340 }}>
    <path fill="#9fadbb" opacity=".55" d="M0 360V250h40v-60h26v-40h18v100h30v-70l22-14v84h40V170h12l10-30 10 30h14v190zM300 360V230l40-20v-30h24v170zM420 360V150h22l6-40 8 40h20v40l30 10v160zM600 360V240h60v-50l14-8 16 20v158zM760 360V180l26-30 24 18v40h40v152zM930 360V120h8v-30h6v30h8v40h30v200zM1060 360V220h36l18-40h22v70l40 10v100zM1180 360V200h60v160z" />
    <path fill="#b5c1cc" opacity=".7" d="M0 360V300h120v-30h80v90zM240 360v-50l70-20 60 10v60zM470 360v-70h90l20 30h60v40zM700 360v-40l80-30 90 20v50zM900 360v-60h140v60zM1080 360v-40l80-10 80 10v40z" />
  </svg>
)

const Backdrop = () => (
  <Box aria-hidden position="absolute" inset="0" borderRadius="40px" overflow="hidden" backgroundImage="linear-gradient(180deg, #a9b7c5 0%, #c9d3dc 55%, #e6ecf0 78%)">
    <Box position="absolute" top="-5%" right="-3%" width="44%" height="115%" background="linear-gradient(200deg, rgba(223,138,66,.34) 0%, rgba(223,138,66,.08) 65%, transparent 100%)" clipPath="polygon(28% 0, 100% 0, 100% 100%, 0 100%)" />
    <Box position="absolute" inset="0" backgroundImage="radial-gradient(rgba(27,36,48,.14) 1px, transparent 1.5px)" backgroundSize="22px 22px" maskImage="linear-gradient(115deg, transparent 45%, black 85%)" />
    <Ruins />
    {/* Animating background-position repaints every frame and makes the blurred top bar flicker on scroll */}
    {SNOW_LAYERS.map((layer) => (
      <Box
        key={layer.size}
        position="absolute"
        left="0"
        right="0"
        bottom="0"
        willChange="transform"
        animation="snowDrift 14s linear infinite"
        _motionReduce={{ animation: 'none' }}
        style={{ top: -layer.fall, backgroundImage: `radial-gradient(circle, ${layer.dot})`, backgroundSize: layer.size, backgroundPosition: `${layer.x}px 0`, ['--fall' as string]: `${layer.fall}px` }}
      />
    ))}
    <svg viewBox="0 0 1240 180" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 180 }}>
      <path fill="#dfe6ec" d="M0 70C160 30 300 60 460 48s320-40 480-10 220 20 300 10V180H0z" />
      <path fill="#f6f8fa" d="M0 120c140-30 280-10 420-20s260-40 420-24 260 30 400 4V180H0z" />
    </svg>
    <Text position="absolute" top="40px" right="84px" fontFamily="'Jost', var(--cjk), sans-serif" fontWeight="bold" fontSize={{ base: '5rem', md: '7.5rem' }} lineHeight=".95" letterSpacing=".02em" color="transparent" whiteSpace="nowrap" style={{ WebkitTextStroke: '1px rgba(169,79,15,.5)', writingMode: 'vertical-rl' }}>CHIAKI</Text>
  </Box>
)

const ChiakiHero = () => {
  const { t, locale } = useI18n()
  const nameLang = locale === 'tw' ? undefined : 'ja'
  return (
    <Flex as="section" position="relative" mt={{ base: 6, md: '96px' }} mb={{ base: 16, md: '112px' }} flexWrap="wrap" alignItems="stretch" color={INK}>
      <Backdrop />

      <Flex aria-hidden position="absolute" right={{ base: '16px', md: '28px' }} top={{ base: '16px', md: '28px' }} zIndex={3} gap={2} alignItems="flex-start" pointerEvents="none">
        <Span lang={nameLang} backgroundColor="white" fontWeight="bold" letterSpacing=".22em" fontSize="xs" px="3px" py={2} whiteSpace="nowrap" style={{ writingMode: 'vertical-rl' }}>{t('chiakiPage.name')}</Span>
        <Span fontFamily="'Jost', var(--cjk), sans-serif" fontWeight="bold" fontSize="1.25rem" letterSpacing=".12em" lineHeight="1.1" whiteSpace="nowrap" style={{ writingMode: 'vertical-rl' }}>
          CHIAKI.CH
          <Span color="#4a5563" mt=".4em">VOICE ARCHIVE</Span>
        </Span>
      </Flex>

      <Box flex="1 1 440px" minW="0" position="relative" zIndex={{ base: 3, md: 1 }} mt={{ base: '-130%', md: 0 }} px={{ base: 6, md: 'clamp(24px, 4vw, 64px)' }} pt={{ base: 0, md: 14 }} pb={{ base: 6, md: 14 }}>
        <Heading mb={5} fontFamily="'Jost', var(--cjk), sans-serif" fontWeight="medium" fontSize={{ base: '2.75rem', md: 'clamp(2.75rem, 5vw, 5rem)' }} lineHeight="1.02" letterSpacing=".04em">
          DIFFSINGER<br /><Span color={ORANGE_TEXT}>VOICE ARCHIVE</Span>
        </Heading>
        <Flex flexWrap="wrap" alignItems="flex-end" columnGap={5} rowGap={1}>
          <Text lang={nameLang} fontSize={{ base: '2.75rem', md: '3.5rem' }} fontWeight="black" lineHeight="1.2" letterSpacing=".12em">
            <Ruby>{t('chiakiPage.name')}<Rt fontSize=".875rem" fontWeight="medium" letterSpacing=".3em" color={ORANGE_TEXT}>チアキ</Rt></Ruby>
          </Text>
          <Text mb="6px" fontFamily="'Jost', var(--cjk), sans-serif" fontSize={{ base: '2rem', md: '2.75rem' }} fontWeight="medium" lineHeight="1.1" letterSpacing=".1em">CHIAKI</Text>
        </Flex>
        <Text lang="ja" mt={6} mb={4} fontSize={{ base: 'xl', md: '1.625rem' }} fontWeight="bold" color={ORANGE_TEXT}>どこにいても、歌を届けるね。</Text>
        <Text mb={7} fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" maxW="32em">{t('chiakiPage.intro')}</Text>

        <Link href="#download" display="inline-flex" alignItems="center" gap="10px" minH="52px" mb={10} pl="18px" pr={6} borderRadius="26px" fontWeight="bold" textDecoration="none" style={{ backgroundColor: ORANGE, color: NAVY }}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></svg>
          {t('chiakiPage.freeDownload')}
        </Link>

        <Box as="dl" maxW={{ base: 'none', md: '420px' }} display="grid" gridTemplateColumns={{ base: 'repeat(3, minmax(0, 1fr))', md: '1fr' }} borderTop="1px solid rgba(27,36,48,.18)" borderBottom="1px solid rgba(27,36,48,.18)">
          {PROFILE_KEYS.map((key, index) => (
            <Box
              key={key}
              display={{ base: 'block', md: 'grid' }}
              gridTemplateColumns="120px minmax(0, 1fr)"
              alignItems="baseline"
              gap={4}
              py={{ base: 4, md: 3 }}
              px={{ base: 4, md: 0 }}
              borderBottom={{ base: index < 3 ? '1px solid rgba(27,36,48,.08)' : 'none', md: index < PROFILE_KEYS.length - 1 ? '1px solid rgba(27,36,48,.10)' : 'none' }}
            >
              <Box as="dt" fontFamily="'Jost', var(--cjk), sans-serif" fontSize="xs" letterSpacing=".18em" color="rgba(27,36,48,.65)">{key.toUpperCase()}</Box>
              <Box as="dd" mt={{ base: 1, md: 0 }} fontSize={index < 3 ? 'xl' : 'md'} fontWeight="bold">{t(`chiakiPage.profile.${key}`)}</Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        flex={{ base: '1 1 100%', md: '1 1 380px' }}
        order={{ base: -1, md: 0 }}
        minW="0"
        position="relative"
        zIndex={2}
        pointerEvents="none"
        minH={{ md: '1020px' }}
        aspectRatio={{ base: '1 / 2', md: 'auto' }}
        overflow={{ base: 'hidden', md: 'visible' }}
        borderTopRadius={{ base: '40px', md: '0' }}
      >
        <Img
          src={PORTRAIT_SRC}
          alt={t('chiakiPage.portraitAlt')}
          position="absolute"
          left="50%"
          transform={{ base: 'translateX(-38%)', md: 'translateX(-50%)' }}
          display="block"
          maxW="none"
          top={{ base: '24px', md: 'auto' }}
          bottom={{ base: 'auto', md: '32px' }}
          width={{ base: '100%', md: 'auto' }}
          height={{ base: 'auto', md: 'calc(100% - 56px)' }}
          aspectRatio="609 / 1200"
          maskImage={{ base: 'linear-gradient(180deg, black 22%, rgba(0,0,0,.3) 50%)', md: 'none' }}
          transformOrigin="50% 100%"
          animation="breathe 4.8s ease-in-out infinite"
          _motionReduce={{ animation: 'none' }}
        />
      </Box>
    </Flex>
  )
}

export default ChiakiHero
