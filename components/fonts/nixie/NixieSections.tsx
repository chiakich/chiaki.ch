import { Box, HStack, Stack, styled } from 'styled-system/jsx'
import DownloadButton from 'components/fonts/shared/DownloadButton'
import GlyphGrid from 'components/fonts/shared/GlyphGrid'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'
import { NIXIE_BRIGHT } from './nixieTheme'
import { useI18n } from 'i18n'

const Text = styled.p

const NixieSections = () => {
  const { t } = useI18n()
  return <Stack gap={16}>
    <MotionSection><SectionHeading en="STORY" accent={NIXIE_BRIGHT}>{t('nixiePage.story')}</SectionHeading><Stack gap={4} maxW="720px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.9}><Text>{t('nixiePage.storyP1')}</Text><Text>{t('nixiePage.storyP2')}</Text></Stack></MotionSection>
    <Box><SectionHeading en="GLYPHS" accent={NIXIE_BRIGHT}>{t('nixiePage.glyphs')}</SectionHeading><Text fontSize="sm" opacity={.6} mb={5}>{t('nixiePage.glyphsDescription')}</Text><GlyphGrid chars="0123456789-.$" fontFamily="nixie" accent={NIXIE_BRIGHT} glow minCell="88px" /></Box>
    <MotionSection><SectionHeading en="DOWNLOAD" accent={NIXIE_BRIGHT}>{t('nixiePage.download')}</SectionHeading><Text fontSize="lg" lineHeight="1.9" opacity={.9} mb={6}>{t('nixiePage.license')}</Text><HStack><DownloadButton href="/assets/fonts/AkiNixie.ttf" download="AkiNixie.ttf" label={t('nixiePage.downloadButton')} sub="TTF" accent={NIXIE_BRIGHT} /></HStack></MotionSection>
  </Stack>
}

export default NixieSections
