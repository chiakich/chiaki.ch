import Head from 'next/head'
import { css } from 'styled-system/css'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { IMPROVE_EMAIL } from './voicebankData'
import { useI18n } from 'i18n'
import { CREAM, NAVY, ORANGE_TEXT } from './chiakiData'
import ChiakiHero from './ChiakiHero'
import ChiakiDemo from './ChiakiDemo'
import ChiakiSing from './ChiakiSing'
import ChiakiSpec from './ChiakiSpec'
import ChiakiTerms from './ChiakiTerms'
import ChiakiDesign from './ChiakiDesign'

const Text = styled.p
const Span = styled.span
const Link = styled.a

// Han glyphs differ between TC and JP, so Japanese text (and the whole ja locale) swaps the CJK face
const pageFont = css({
  '--cjk': "'Noto Sans TC'",
  fontFamily: 'var(--cjk), sans-serif',
  'html:lang(ja) &': { '--cjk': "'Noto Sans JP', 'Noto Sans TC'" },
  '& [lang=ja]': { '--cjk': "'Noto Sans JP', 'Noto Sans TC'", fontFamily: 'var(--cjk), sans-serif' },
})

const CREDITS: [string, string][] = [
  ['VOICE', 'Chiaki'],
  ['ILLUSTRATION', 'shONe'],
  ['EDITOR', 'OpenUtau-Chiaki — based on OpenUtau'],
  ['VOCODER', 'PC-NSF-HiFiGAN — OpenVPI'],
  ['ENGINE', 'DiffSinger — Team OpenVPI'],
]

const EdgeStripe = ({ side }: { side: 'left' | 'right' }) => (
  <Box aria-hidden position="absolute" top="0" bottom="0" width="10px" zIndex={5} backgroundImage="repeating-linear-gradient(-45deg, #df8a42 0 5px, #ffffff 5px 10px)" style={{ [side]: 0 }} />
)

const ChiakiPage = () => {
  const { t } = useI18n()
  return (
    // Long page exceeds justfont's per-font subset cap, so skip the loader and use Google's Noto
    <Box data-jf-skip className={pageFont} position="relative" minHeight="100vh" overflowX="clip" pt={{ base: '52px', md: '56px' }} style={{ backgroundColor: CREAM, color: NAVY }}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Jost and Noto Sans are only used on this page */}
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;600;700;900&family=Noto+Sans+JP:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </Head>
      <EdgeStripe side="left" />
      <EdgeStripe side="right" />
      <Box maxW="1320px" mx="auto" px={{ base: 5, md: 'clamp(20px, 3vw, 40px)' }}>
        <ChiakiHero />
        <ChiakiDemo />
        <ChiakiSing />
        <ChiakiSpec />
        <ChiakiDesign />
        <ChiakiTerms />
        <Box as="footer" mt={{ base: 24, md: '140px' }} pb={10}>
          <Text aria-hidden fontFamily="'Jost', var(--cjk), sans-serif" fontWeight="bold" fontSize={{ base: '4.5rem', md: 'clamp(4.5rem, 15vw, 13.75rem)' }} lineHeight=".8" color="transparent" whiteSpace="nowrap" style={{ WebkitTextStroke: '1.5px rgba(34,48,90,.3)' }}>CHIAKI</Text>
          <Grid as="dl" gridTemplateColumns="auto 1fr" columnGap={6} rowGap={2} mt={8} fontSize="sm">
            {CREDITS.map(([label, value]) => [
              <Box as="dt" key={`${label}-dt`} fontFamily="'Jost', var(--cjk), sans-serif" fontSize="xs" letterSpacing=".14em" lineHeight="1.8" color="rgba(34,48,90,.6)">{label}</Box>,
              <Box as="dd" key={`${label}-dd`} lineHeight="1.6">{value}</Box>,
            ])}
            <Box as="dt" fontFamily="'Jost', var(--cjk), sans-serif" fontSize="xs" letterSpacing=".14em" lineHeight="1.8" color="rgba(34,48,90,.6)">CONTACT</Box>
            <Box as="dd" lineHeight="1.6">
              <Link href={`mailto:${IMPROVE_EMAIL}`} fontWeight="bold" textDecoration="underline" textUnderlineOffset="3px" style={{ color: ORANGE_TEXT }}>{IMPROVE_EMAIL}</Link>
              <Span ml={3} color="rgba(34,48,90,.72)">{t('chiakiPage.contact')}</Span>
            </Box>
          </Grid>
          <Flex flexWrap="wrap" justifyContent="space-between" columnGap={6} rowGap={2} mt={8} pt={4} fontSize="13px" color="rgba(34,48,90,.72)" style={{ borderTop: `1px solid rgba(34,48,90,.18)` }}>
            <Span lang="ja">どこにいても、歌を届けるね。</Span>
            <Span>© 千秋稻荷社</Span>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default ChiakiPage
