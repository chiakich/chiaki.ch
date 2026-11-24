import Head from 'next/head'
import { css } from 'styled-system/css'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { IMPROVE_EMAIL } from './voicebankData'
import { useI18n } from 'i18n'
import { INK, JOST, LINE_LIGHT, MIST, NIGHT, ORANGE, RUINS_FAR, SNOW } from './chiakiData'
import { Container, Reveal, Snow } from './parts'
import ChiakiHero from './ChiakiHero'
import ChiakiProfile from './ChiakiProfile'
import ChiakiDemo from './ChiakiDemo'
import ChiakiLanguages from './ChiakiLanguages'
import ChiakiSing from './ChiakiSing'
import ChiakiSpec from './ChiakiSpec'
import ChiakiDesign from './ChiakiDesign'
import ChiakiTerms from './ChiakiTerms'
import ChiakiSong from './ChiakiSong'

const Text = styled.p
const Span = styled.span
const Link = styled.a

// Han glyphs differ between TC and JP, so Japanese text (and the whole ja locale) swaps the CJK faces
const pageFont = css({
  '--cjk': "'Noto Sans TC'",
  fontFamily: 'var(--cjk), sans-serif',
  'html:lang(ja) &': { '--cjk': "'Noto Sans JP', 'Noto Sans TC'" },
  // Noto CJK draws curly quotes full-width, so English pulls just those glyphs from Latin Noto Sans
  'html:lang(en) &': { '--cjk': "'Noto Sans', 'Noto Sans TC'" },
  '& [lang=ja]': { '--cjk': "'Noto Sans JP', 'Noto Sans TC'" },
})

const QUOTES = encodeURIComponent('‘’“”')

const CREDITS: [string, string][] = [
  ['VOICE', 'Chiaki'],
  ['ILLUSTRATION', 'shONe'],
  ['EDITOR', 'OpenUtau-Chiaki — based on OpenUtau'],
  ['VOCODER', 'Chiaki_Vocoder — Chiaki.C (Apache-2.0)'],
  ['ENGINE', 'DiffSinger — Team OpenVPI'],
]

const EdgeStripe = ({ side }: { side: 'left' | 'right' }) => (
  <Box aria-hidden position="absolute" top="0" bottom="0" width={{ base: '5px', md: '8px' }} zIndex={9} backgroundImage="repeating-linear-gradient(-45deg, #df8a42 0 5px, #f7f9fa 5px 10px)" style={{ [side]: 0 }} />
)

const Footer = () => {
  const { t } = useI18n()
  return (
    <Box as="footer" position="relative" overflow="hidden" pt={{ base: 20, md: '130px' }} style={{ backgroundColor: NIGHT, color: SNOW }}>
      <styled.svg aria-hidden viewBox="0 0 1240 360" preserveAspectRatio="none" position="absolute" left="0" bottom="0" width="100%" height="300px">
        <path fill="#27303d" d={RUINS_FAR} />
      </styled.svg>
      <Snow />
      <Container position="relative" zIndex={1} pb={10}>
        <Flex flexWrap="wrap" alignItems="flex-end" columnGap="96px" rowGap={10}>
          <Reveal flex="1 1 480px" minW="0">
            <Text lang="ja" fontWeight="medium" fontSize={{ base: 'xl', md: 'clamp(22px, 2.4vw, 34px)' }} lineHeight="1.7" letterSpacing=".1em">どこにいても、歌をお届けします。</Text>
          </Reveal>
          <Reveal flex="1 1 440px" minW="0" delay={0.15}>
            <Grid as="dl" gridTemplateColumns="auto minmax(0, 1fr)" columnGap={7} rowGap="9px" fontSize="15px" lineHeight="1.6">
              {CREDITS.map(([label, value]) => [
                <Box as="dt" key={`${label}-dt`} fontFamily="mono" fontSize="11px" letterSpacing=".2em" lineHeight="2.2" style={{ color: MIST }}>{label}</Box>,
                <Box as="dd" key={`${label}-dd`}>{value}</Box>,
              ])}
              <Box as="dt" fontFamily="mono" fontSize="11px" letterSpacing=".2em" lineHeight="2.2" style={{ color: MIST }}>CONTACT</Box>
              <Box as="dd">
                <Link href={`mailto:${IMPROVE_EMAIL}`} fontWeight="bold" textDecoration="underline" textUnderlineOffset="3px" style={{ color: ORANGE }}>{IMPROVE_EMAIL}</Link>
                <Span ml={3}>{t('chiakiPage.contact')}</Span>
              </Box>
            </Grid>
          </Reveal>
        </Flex>
        <Text aria-hidden mt={14} fontWeight="bold" fontSize={{ base: '4.5rem', md: 'clamp(4.5rem, 19vw, 17rem)' }} lineHeight="0.86" color="transparent" whiteSpace="nowrap" style={{ fontFamily: JOST, WebkitTextStroke: '1.5px rgba(238,242,245,.34)' }}>CHIAKI</Text>
        <Flex flexWrap="wrap" justifyContent="space-between" columnGap={6} rowGap="6px" mt="26px" pt={4} fontSize="13px" style={{ borderTop: `1px solid ${LINE_LIGHT}`, color: MIST }}>
          <Span fontFamily="mono" letterSpacing=".18em">CHIAKI.CH / VOICE ARCHIVE</Span>
          <Span>© 千秋稻荷社</Span>
        </Flex>
      </Container>
    </Box>
  )
}

const ChiakiPage = () => {
  const { locale } = useI18n()
  return (
    // Long page exceeds justfont's per-font subset cap, so skip the loader and use Google's Noto
    <Box data-jf-skip data-smooth-scroll className={pageFont} position="relative" minHeight="100vh" overflowX="clip" pt="44px" style={{ backgroundColor: SNOW, color: INK }}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Jost and the Noto faces are only used on this page */}
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;600;700;900&family=Noto+Sans+JP:wght@400;600;700;900&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- see above */}
        {locale === 'en' && <link href={`https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&text=${QUOTES}&display=swap`} rel="stylesheet" />}
      </Head>
      <EdgeStripe side="left" />
      <EdgeStripe side="right" />
      <ChiakiHero />
      <ChiakiProfile />
      <ChiakiDemo />
      <ChiakiLanguages />
      <ChiakiSing />
      <ChiakiSpec />
      <ChiakiDesign />
      <ChiakiTerms />
      <ChiakiSong />
      <Footer />
    </Box>
  )
}

export default ChiakiPage
