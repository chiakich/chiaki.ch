import Head from 'next/head'
import { Box, Grid, styled } from 'styled-system/jsx'
import VoicebankHero from './VoicebankHero'
import VoicebankDownloads from './VoicebankDownloads'
import VoicebankGuidelines, { VoicebankImprove } from './VoicebankGuidelines'

const Text = styled.p

const CREDITS: [string, string][] = [
  ['VOICE', 'Chiaki'],
  ['ILLUSTRATION', 'shONe'],
  ['EDITOR', 'OpenUtau-Chiaki — based on OpenUtau'],
  ['VOCODER', 'PC-NSF-HiFiGAN — OpenVPI'],
  ['ENGINE', 'DiffSinger — Team OpenVPI'],
]

const EdgeStripe = ({ side }: { side: 'left' | 'right' }) => (
  <Box aria-hidden position="absolute" top="0" bottom="0" width="10px" backgroundImage="repeating-linear-gradient(-45deg, #df8a42 0 5px, #ffffff 5px 10px)" style={{ [side]: 0 }} />
)

const VoicebankPage = () => (
  <Box position="relative" backgroundColor="#edf1f4" color="#1b2430" minHeight="100vh" overflow="hidden" pt={{ base: '52px', md: '96px' }} px={{ base: 4, md: 7 }}>
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- Jost is only used on this page */}
      <link href="https://fonts.googleapis.com/css2?family=Jost:wght@500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <EdgeStripe side="left" />
    <EdgeStripe side="right" />
    <Box maxW="1240px" mx="auto">
      <VoicebankHero />
      <VoicebankDownloads />
      <VoicebankImprove />
      <VoicebankGuidelines />
      <Box as="footer" mt={{ base: 20, md: '120px' }} pt={10} pb={12} borderTop="2px solid #1b2430" display="flex" flexWrap="wrap" justifyContent="space-between" columnGap={12} rowGap={6}>
        <Grid as="dl" gridTemplateColumns="auto 1fr" columnGap={6} rowGap={2} fontSize="sm">
          {CREDITS.map(([label, value]) => [
            <Box as="dt" key={`${label}-dt`} fontFamily="'Jost', sans-serif" letterSpacing=".14em">{label}</Box>,
            <Box as="dd" key={`${label}-dd`}>{value}</Box>,
          ])}
        </Grid>
        <Text alignSelf="flex-end" fontFamily="'Jost', sans-serif" fontSize="xs" letterSpacing=".1em">
          © Chiaki / chiaki.ch
        </Text>
      </Box>
    </Box>
  </Box>
)

export default VoicebankPage
