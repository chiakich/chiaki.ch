import { Box, Flex, styled } from 'styled-system/jsx'
import Barcode from 'components/profile/Barcode'
import { useI18n } from 'i18n'
import { PORTRAIT_SRC } from './voicebankData'
import { DownloadPill } from './VoicebankDownloads'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const Ruby = styled.ruby
const Rt = styled.rt
const Img = styled.img
const Link = styled.a

const INK = '#1b2430'

// Distant ruins, drawn low-contrast so they read as haze behind the snow
const Ruins = () => (
  <svg aria-hidden viewBox="0 0 1240 360" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 120, width: '100%', height: 340 }}>
    <path fill="#9fadbb" opacity=".55" d="M0 360V250h40v-60h26v-40h18v100h30v-70l22-14v84h40V170h12l10-30 10 30h14v190zM300 360V230l40-20v-30h24v170zM420 360V150h22l6-40 8 40h20v40l30 10v160zM600 360V240h60v-50l14-8 16 20v158zM760 360V180l26-30 24 18v40h40v152zM930 360V120h8v-30h6v30h8v40h30v200zM1060 360V220h36l18-40h22v70l40 10v100zM1180 360V200h60v160z" />
    <path fill="#b5c1cc" opacity=".7" d="M0 360V300h120v-30h80v90zM240 360v-50l70-20 60 10v60zM470 360v-70h90l20 30h60v40zM700 360v-40l80-30 90 20v50zM900 360v-60h140v60zM1080 360v-40l80-10 80 10v40z" />
  </svg>
)

const SnowDrift = ({ height, paths, zIndex }: { height: number; paths: [string, string][]; zIndex?: number }) => (
  <svg aria-hidden viewBox={`0 0 1240 ${height}`} preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height, zIndex }}>
    {paths.map(([fill, d]) => <path key={d} fill={fill} d={d} />)}
  </svg>
)

const Figure = () => {
  const { t } = useI18n()
  return (
    <Box flex="1 1 380px" minW="0" position="relative" zIndex={1} minH={{ base: '620px', md: '680px' }}>
      <Box aria-hidden position="absolute" top="-5%" right="-5%" width="70%" height="115%" background="linear-gradient(200deg, rgba(223,138,66,.32) 0%, rgba(223,138,66,.08) 65%, transparent 100%)" clipPath="polygon(28% 0, 100% 0, 100% 100%, 0 100%)" />
      <Box aria-hidden position="absolute" inset="0" backgroundImage="radial-gradient(rgba(27,36,48,.14) 1px, transparent 1.5px)" backgroundSize="22px 22px" maskImage="linear-gradient(115deg, transparent 30%, black 75%)" />
      <Text aria-hidden position="absolute" top="2%" right="76px" fontFamily="'Jost', sans-serif" fontWeight="bold" fontSize={{ base: '5rem', lg: '7.5rem' }} lineHeight=".95" letterSpacing=".02em" color="transparent" whiteSpace="nowrap" userSelect="none" style={{ WebkitTextStroke: '1px rgba(169,79,15,.5)', writingMode: 'vertical-rl' }}>CHIAKI</Text>

      <Flex aria-hidden position="absolute" top="26px" left={{ base: '20px', md: '28px' }} zIndex={3} alignItems="center" gap={2}>
        <Barcode seed="VOICE-UNIT" width={52} height={16} color={INK} />
        <Box>
          <Text fontFamily="'Jost', sans-serif" fontWeight="bold" fontSize=".62rem" letterSpacing=".18em">VOICE UNIT</Text>
          <Text fontFamily="mono" fontSize=".56rem" letterSpacing=".16em" color="#3a4552">CHIAKI.CH - DS01</Text>
        </Box>
      </Flex>

      <Flex aria-hidden position="absolute" top="26px" right={{ base: '20px', md: '28px' }} zIndex={3} alignItems="center" gap="5px" backgroundColor="#ffb400" color="black" px="9px" py="3px" fontFamily="'Jost', sans-serif" fontWeight="bold" fontSize=".62rem" letterSpacing=".12em" clipPath="polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 1L9.2 9H.8z" /><path d="M5 4v2.4M5 7.6v.2" /></svg>
        COLD STORAGE
      </Flex>

      <Flex aria-hidden position="absolute" top="62px" right={{ base: '20px', md: '28px' }} zIndex={3} gap={2} alignItems="flex-start">
        <Span lang="ja" backgroundColor="white" fontWeight="bold" letterSpacing=".22em" fontSize=".75rem" px="3px" py={2} whiteSpace="nowrap" style={{ writingMode: 'vertical-rl' }}>千亜紀</Span>
        <Span fontFamily="'Jost', sans-serif" fontWeight="bold" fontSize="1.25rem" letterSpacing=".12em" lineHeight="1.1" whiteSpace="nowrap" style={{ writingMode: 'vertical-rl' }}>
          CHIAKI.CH
          <Span color="#4a5563" mt=".4em">VOICE ARCHIVE</Span>
        </Span>
      </Flex>

      <Box position="absolute" left="50%" bottom="44px" height="calc(100% - 64px)" maxH="860px" aspectRatio="609 / 1200" transform="translateX(-50%)">
        <Img src={PORTRAIT_SRC} alt={t('voicebankPage.portraitAlt')} width="100%" height="100%" display="block" />
      </Box>

      <Flex aria-hidden position="absolute" left={{ base: '20px', md: '26px' }} bottom="96px" zIndex={3} direction="column" alignItems="center" gap={2}>
        <Barcode seed="CHIAKI-DS01" vertical width={104} height={13} color={INK} />
        <Text fontFamily="mono" fontSize=".56rem" letterSpacing=".22em" color="#2c3644" style={{ writingMode: 'vertical-rl' }}>CHIAKI.CH - DS01</Text>
      </Flex>

    </Box>
  )
}

const VoicebankHero = () => {
  const { t } = useI18n()
  return (
    <Box
      as="section"
      position="relative"
      mt={{ base: 3, md: 7 }}
      borderRadius="28px"
      overflow="hidden"
      display="flex"
      flexWrap="wrap"
      alignItems="stretch"
      minH={{ base: 'auto', md: 'clamp(720px, 68vw, 940px)' }}
      backgroundImage="linear-gradient(180deg, #a9b7c5 0%, #c9d3dc 55%, #e6ecf0 78%)"
    >
      <Ruins />
      <Box
        aria-hidden
        position="absolute"
        inset="0"
        backgroundImage="radial-gradient(circle, rgba(255,255,255,.95) 1.6px, transparent 2.2px), radial-gradient(circle, rgba(255,255,255,.75) 1.1px, transparent 1.6px), radial-gradient(circle, rgba(255,255,255,.55) .8px, transparent 1.2px)"
        backgroundSize="120px 100px, 80px 65px, 46px 45px"
        animation="snowfall 14s linear infinite"
        _motionReduce={{ animation: 'none' }}
      />
      <SnowDrift height={180} paths={[['#dfe6ec', 'M0 70C160 30 300 60 460 48s320-40 480-10 220 20 300 10V180H0z'], ['#f6f8fa', 'M0 120c140-30 280-10 420-20s260-40 420-24 260 30 400 4V180H0z']]} />

      <Flex flex="1 1 440px" minW="0" direction="column" gap="22px" position="relative" zIndex={2} px={{ base: '24px', md: '64px' }} pt={{ base: '40px', md: '80px' }} pb="40px">
        <Heading fontFamily="'Jost', sans-serif" fontWeight="medium" fontSize={{ base: '2.75rem', md: 'clamp(2.75rem, 4.8vw, 5rem)' }} lineHeight="1.02" letterSpacing=".04em">
          DIFFSINGER<br /><Span color="#a94f0f">VOICE ARCHIVE</Span>
        </Heading>
        <Flex flexWrap="wrap" alignItems="flex-end" columnGap={5} rowGap={1}>
          <Text lang="ja" fontSize="2.75rem" fontWeight="bold" lineHeight="1.2" letterSpacing=".12em">
            <Ruby>千亜紀<Rt fontSize=".8rem" letterSpacing=".3em">チアキ</Rt></Ruby>
          </Text>
          <Text mb="6px" fontSize="lg" fontWeight="bold">{t('voicebankPage.subtitle')}</Text>
        </Flex>
        <Box>
          <Text fontSize="lg" fontWeight="bold" lineHeight="1.6">{t('voicebankPage.languages')}</Text>
          <Text fontSize="xs" lineHeight="1.7" color="#2c3644">
            {t('voicebankPage.accuracyNote')} · <Link href="#improve" color="#7d3a0b" textDecoration="underline">{t('voicebankPage.improveLink')}</Link>
          </Text>
        </Box>
        <Flex flexWrap="wrap" gap="14px" mt="6px">
          <DownloadPill href="#download" label={t('voicebankPage.downloadApp')} dark />
          <DownloadPill href="#download" label={t('voicebankPage.downloadZip')} />
        </Flex>
        <Text maxW="34em" fontSize="xs" lineHeight="1.8" color="#2c3644">{t('voicebankPage.forkNote')}</Text>
      </Flex>

      <Figure />
      <SnowDrift height={60} zIndex={1} paths={[['#f6f8fa', 'M0 30c120-12 260 8 400 0s240-22 380-10 160 22 300 12 120-8 160-6V60H0z']]} />
      <Span position="absolute" right="20px" bottom="16px" zIndex={4} fontFamily="'Jost', sans-serif" fontSize="xs" letterSpacing=".1em" backgroundColor="rgba(255,255,255,.85)" px="10px" py="4px" borderRadius="12px">Illustration by shONe</Span>
    </Box>
  )
}

export default VoicebankHero
