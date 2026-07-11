import { Box, HStack, Stack, styled } from 'styled-system/jsx'
import DownloadButton from 'components/fonts/shared/DownloadButton'
import GlyphGrid from 'components/fonts/shared/GlyphGrid'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'
import { NIXIE_BRIGHT } from './nixieTheme'

const Text = styled.p

const NixieSections = () => <Stack gap={16}>
  <MotionSection><SectionHeading en="STORY" accent={NIXIE_BRIGHT}>關於這套字</SectionHeading><Stack gap={4} maxW="720px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.9}><Text>輝光管是冷戰時期的數字顯示元件：玻璃管裡疊著 0–9 的金屬陰極，通電時氖氣在數字周圍發出溫暖橙光。</Text><Text>這套字體重現輝光管的字形與氛圍，另附「$」字符作為所有數字疊在一起的背景陰極。</Text></Stack></MotionSection>
  <Box><SectionHeading en="GLYPHS" accent={NIXIE_BRIGHT}>字符一覽</SectionHeading><Text fontSize="sm" opacity={.6} mb={5}>全部 13 個數字字符。</Text><GlyphGrid chars="0123456789-.$" fontFamily="nixie" accent={NIXIE_BRIGHT} glow minCell="88px" /></Box>
  <MotionSection><SectionHeading en="DOWNLOAD" accent={NIXIE_BRIGHT}>下載與授權</SectionHeading><Text fontSize="lg" lineHeight="1.9" opacity={.9} mb={6}>以 CC BY-SA 4.0 授權釋出，標註來源即可自由使用與改作。</Text><HStack><DownloadButton href="/assets/fonts/AkiNixie.ttf" download="AkiNixie.ttf" label="DOWNLOAD" sub="TTF" accent={NIXIE_BRIGHT} /></HStack></MotionSection>
</Stack>

export default NixieSections
