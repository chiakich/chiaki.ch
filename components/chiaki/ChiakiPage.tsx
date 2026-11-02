import Head from 'next/head'
import { css } from 'styled-system/css'
import { Box, Flex, styled } from 'styled-system/jsx'
import { CREAM, NAVY } from './chiakiData'
import ChiakiHero from './ChiakiHero'
import ChiakiDemo from './ChiakiDemo'
import ChiakiSing from './ChiakiSing'
import ChiakiSpec from './ChiakiSpec'
import ChiakiTerms from './ChiakiTerms'
import ChiakiDesign from './ChiakiDesign'

const Text = styled.p
const Span = styled.span

// Han glyphs differ between TC and JP, so Japanese text (and the whole ja locale) swaps the CJK face
const pageFont = css({
  '--cjk': "'Noto Sans TC'",
  fontFamily: 'var(--cjk), sans-serif',
  'html:lang(ja) &': { '--cjk': "'Noto Sans JP', 'Noto Sans TC'" },
  '& [lang=ja]': { '--cjk': "'Noto Sans JP', 'Noto Sans TC'", fontFamily: 'var(--cjk), sans-serif' },
})

const EdgeStripe = ({ side }: { side: 'left' | 'right' }) => (
  <Box aria-hidden position="absolute" top="0" bottom="0" width="10px" zIndex={5} backgroundImage="repeating-linear-gradient(-45deg, #df8a42 0 5px, #ffffff 5px 10px)" style={{ [side]: 0 }} />
)

const ChiakiPage = () => (
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
        <Flex flexWrap="wrap" justifyContent="space-between" columnGap={6} rowGap={2} mt={6} pt={4} fontSize="13px" color="rgba(34,48,90,.72)" style={{ borderTop: `1px solid rgba(34,48,90,.18)` }}>
          <Span lang="ja">どこにいても、歌を届けるね。</Span>
          <Span>© 千秋稻荷社</Span>
        </Flex>
      </Box>
    </Box>
  </Box>
)

export default ChiakiPage
