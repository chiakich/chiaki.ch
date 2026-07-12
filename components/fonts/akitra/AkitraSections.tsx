import { Box, Flex, HStack, Stack, styled } from 'styled-system/jsx'
import DownloadButton from 'components/fonts/shared/DownloadButton'
import GlyphGrid from 'components/fonts/shared/GlyphGrid'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'
import { AKITRA_COLORS, glyphGroups } from './akitraData'

const Text = styled.p
const Span = styled.span

const AkitraSections = () => (
  <Stack gap={16}>
    <MotionSection><SectionHeading en="STORY" accent={AKITRA_COLORS.orange}>關於這套字</SectionHeading><Stack gap={4} maxW="720px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.9}><Text>古早的台鐵客貨車車身上，塗著車種代號、車號、自重與載重。這些由油漆工一筆一筆描出的字，有著手工時代特有的力道。</Text><Text>這套字體以那些表記文字為藍本重新繪製，收錄 284 個常用字符，希望保存逐漸消失在鐵道邊的視覺記憶。</Text></Stack></MotionSection>
    <MotionSection><SectionHeading en="IN USE" accent={AKITRA_COLORS.orange}>表記範例</SectionHeading><Flex gap={8} flexWrap="wrap" backgroundColor="#20242e" border="1px solid #333" px={{ base: 6, md: 10 }} py={9} alignItems="center" justifyContent="center"><Text fontFamily="akitra" fontSize={{ base: '3rem', md: '4rem' }}><Span fontSize=".5em" display="block">25BH</Span>2004</Text><Text fontFamily="akitra" lineHeight="1.8" style={{ color: AKITRA_COLORS.cream }}>ㄕㄊㄆ<br />重 43<br />空 18</Text><Text fontFamily="akitra" lineHeight="1.8" color="#7f9be0">郵便車<br />換算1.0</Text></Flex><Text fontSize="sm" opacity={.6} mt={3}>車種記號使用注音符號是台鐵獨有的傳統。</Text></MotionSection>
    <Box><SectionHeading en="GLYPHS" accent={AKITRA_COLORS.orange}>字符一覽</SectionHeading><Stack gap={10}>{glyphGroups.map((group) => <Box key={group.en}><HStack gap={3} mb={4} alignItems="baseline"><Text fontWeight="bold" fontSize="lg">{group.title}</Text><Text fontSize="xs" opacity={.5}>{group.en} · {Array.from(group.chars).length} GLYPHS</Text></HStack><GlyphGrid chars={group.chars} fontFamily="akitra" accent={AKITRA_COLORS.orange} /></Box>)}</Stack></Box>
    <MotionSection><SectionHeading en="DOWNLOAD" accent={AKITRA_COLORS.orange}>下載與授權</SectionHeading><Text fontSize="lg" lineHeight="1.9" opacity={.9} mb={6}>以 SIL Open Font License 1.1 釋出，歡迎自由使用於個人與商業專案。</Text><HStack gap={4} flexWrap="wrap"><DownloadButton href="/assets/fonts/AkiTRA-Regular.otf" download="AkiTRA-Regular.otf" label="DOWNLOAD" sub="OTF" accent={AKITRA_COLORS.orange} /><DownloadButton href="https://github.com/chiakich/Chiaki-Taiwan-Railway-font" label="GITHUB" sub="原始檔" accent={AKITRA_COLORS.cream} external /></HStack></MotionSection>
  </Stack>
)

export default AkitraSections
