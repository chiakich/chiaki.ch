import Head from 'next/head'
import { Box, Container, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import WorksSubNav from 'components/works/WorksSubNav'
import KumikoHero from './KumikoHero'
import KumikoWorkflow from './KumikoWorkflow'

const Heading = styled.h3
const Text = styled.p

const features = [
  ['ZERO INSTALL', '真正零安裝', '純前端運作，不需要在本地架設字體編輯器後端。'],
  ['IDS ENGINE', '部件驅動組字', '以 IDS 拆解漢字，從可重用部件快速補齊缺少的字。'],
  ['QUALITY LINT', '量化品質建議', '把灰階預覽與統計式設計提示直接放進畫布。'],
  ['OFFLINE DRAFT', '離線草稿', '工作保存在 IndexedDB，稍後回來仍能繼續編輯。'],
]

const KumikoPage = () => (
  <Box backgroundColor="#101114" color="white" minHeight="100vh">
    <Head><title>Kumiko Font Editor - Works</title><meta name="description" content="完全在瀏覽器運作、以 GitHub 為核心的 CJK 補字工具。" /></Head>
    <TopBar /><WorksSubNav /><KumikoHero />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 20 }}><Stack gap={20}>
      <MotionSection><SectionHeading en="WHY KUMIKO" accent="#ffea2f">把補字的門檻降到一個網址</SectionHeading><Text maxW="760px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.78}>開源 CJK 字體往往需要補上數以千計的字。Kumiko 讓貢獻者從 GitHub 載入 UFO、在瀏覽器編輯 glyph，再把成果送回 pull request；不用安裝工具鏈，也不用啟動後端。</Text></MotionSection>
      <MotionSection><SectionHeading en="WORKFLOW" accent="#ffea2f">從字庫到 Pull Request</SectionHeading><Box overflowX="auto"><Box minW="680px"><KumikoWorkflow /></Box></Box></MotionSection>
      <Box><SectionHeading en="PRINCIPLES" accent="#ffea2f">為開源中文字體而設計</SectionHeading><Grid columns={{ base: 1, md: 2 }} gap={4}>{features.map(([en, title, description], index) => <MotionSection key={en} delay={index * .06}><Box backgroundColor="#18191d" border="1px solid #2c2e33" borderLeft="3px solid #ffea2f" p={6} height="100%"><Text fontFamily="mono" color="#ffea2f" letterSpacing=".18em" fontSize="xs">{en}</Text><Heading mt={3} mb={3} fontSize="xl">{title}</Heading><Text lineHeight="1.8" opacity={.7}>{description}</Text></Box></MotionSection>)}</Grid></Box>
      <MotionSection><SectionHeading en="OPEN SOURCE" accent="#ffea2f">現在就打開一個字</SectionHeading><HStack gap={3} flexWrap="wrap"><ProjectLink href="https://kumiko.chiaki.ch" label="線上試用 Kumiko" accent="#ffea2f" /><ProjectLink href="https://github.com/chiakich/kumiko-font-editor" label="查看原始碼" detail="MIT" accent="#fff" /></HStack></MotionSection>
    </Stack></Container>
  </Box>
)

export default KumikoPage
