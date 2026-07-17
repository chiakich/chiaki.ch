import { Box, Flex, HStack, Stack, styled } from 'styled-system/jsx'
import DownloadButton from 'components/fonts/shared/DownloadButton'
import GlyphGrid from 'components/fonts/shared/GlyphGrid'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'
import { AKITRA_COLORS, glyphGroups } from './akitraData'
import { useI18n } from 'i18n'

const Text = styled.p
const Span = styled.span

const AkitraSections = () => {
  const { t } = useI18n()
  return <Stack gap={16}>
    <MotionSection><SectionHeading en="STORY" accent={AKITRA_COLORS.orange}>{t('akitraPage.story')}</SectionHeading><Stack gap={4} maxW="720px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.9}><Text>{t('akitraPage.storyP1')}</Text><Text>{t('akitraPage.storyP2')}</Text></Stack></MotionSection>
    <MotionSection><SectionHeading en="IN USE" accent={AKITRA_COLORS.orange}>{t('akitraPage.inUse')}</SectionHeading><Flex gap={8} flexWrap="wrap" backgroundColor="#20242e" border="1px solid #333" px={{ base: 6, md: 10 }} py={9} alignItems="center" justifyContent="center"><Text fontFamily="akitra" fontSize={{ base: '3rem', md: '4rem' }}><Span fontSize=".5em" display="block">25BH</Span>2004</Text><Text fontFamily="akitra" lineHeight="1.8" style={{ color: AKITRA_COLORS.cream }}>ㄕㄊㄆ<br />重 43<br />空 18</Text><Text fontFamily="akitra" lineHeight="1.8" color="#7f9be0">郵便車<br />換算1.0</Text></Flex><Text fontSize="sm" opacity={.6} mt={3}>{t('akitraPage.inUseDescription')}</Text></MotionSection>
    <Box><SectionHeading en="GLYPHS" accent={AKITRA_COLORS.orange}>{t('akitraPage.glyphs')}</SectionHeading><Stack gap={10}>{glyphGroups.map((group, index) => <Box key={group.en}><HStack gap={3} mb={4} alignItems="baseline"><Text fontWeight="bold" fontSize="lg">{t(`akitraPage.groups.${index}`)}</Text><Text fontSize="xs" opacity={.5}>{group.en} · {Array.from(group.chars).length} GLYPHS</Text></HStack><GlyphGrid chars={group.chars} fontFamily="akitra" accent={AKITRA_COLORS.orange} /></Box>)}</Stack></Box>
    <MotionSection><SectionHeading en="DOWNLOAD" accent={AKITRA_COLORS.orange}>{t('akitraPage.download')}</SectionHeading><Text fontSize="lg" lineHeight="1.9" opacity={.9} mb={6}>{t('akitraPage.license')}</Text><HStack gap={4} flexWrap="wrap"><DownloadButton href="/assets/fonts/AkiTRA-Regular.otf" download="AkiTRA-Regular.otf" label="DOWNLOAD" sub="OTF" accent={AKITRA_COLORS.orange} /><DownloadButton href="https://github.com/chiakich/Chiaki-Taiwan-Railway-font" label="GITHUB" sub={t('akitraPage.sourceFiles')} accent={AKITRA_COLORS.cream} external /></HStack></MotionSection>
  </Stack>
}

export default AkitraSections
