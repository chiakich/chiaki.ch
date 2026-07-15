import { Box, Container, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import KumikoHero from './KumikoHero'
import KumikoIdsDemo from './KumikoIdsDemo'
import KumikoWorkflow from './KumikoWorkflow'

const Heading = styled.h3
const Text = styled.p

const features = [
  ['ZERO INSTALL', '零安裝', '純網頁、本地運作。只需要瀏覽器就能開始。'],
  ['UNIVERSAL FORMAT', '支援各種格式', '支援 .ufo、.designspace、.glyphs、.glyphspackage 與二進位字型，或直接從 GitHub 載入 UFO。'],
  ['FONT COMPILE', '瀏覽器編譯技術', '以 Pyodide 執行 fontTools，字體編譯不需要本機 Python 環境。'],
  ['OFFLINE DRAFT', '離線草稿', '編輯進度存在瀏覽器 IndexedDB，斷線或關掉分頁都不會遺失。'],
]

const KumikoPage = () => (
  <Box backgroundColor="#101114" color="white" minHeight="100vh">
    <TopBar /><KumikoHero />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 20 }}><Stack gap={20}>
      <MotionSection><SectionHeading en="WHY KUMIKO" accent="#ffea2f">把補字的門檻降到一個網址</SectionHeading><Text maxW="760px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.78}>開源 CJK 字體動輒缺幾千個字，但願意補字的人未必想架整套字體工具鏈。Kumiko 的流程是：從 GitHub 載入 UFO 專案、在瀏覽器裡編輯字形、把變更推回去開 pull request。沒有安裝步驟，也沒有要自己跑的後端。</Text></MotionSection>
      <MotionSection><SectionHeading en="WORKFLOW" accent="#ffea2f">從字庫到 Pull Request</SectionHeading><Box overflowX="auto"><Box minW="680px"><KumikoWorkflow /></Box></Box></MotionSection>
      <MotionSection><SectionHeading en="IDS ENGINE" accent="#ffea2f">用部件組出缺少的字</SectionHeading><Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center"><Text lineHeight="2" opacity={.78}>內建 IDS（表意文字描述序列）拆解引擎。要補「編」，先查出拆解式 ⿰糹扁，再從字體裡既有的「糹」與「扁」部件對位組合，補字就從畫整個字變成調整部件。</Text><Box borderRadius="24px" overflow="hidden"><KumikoIdsDemo /></Box></Grid></MotionSection>
      <Box><SectionHeading en="ARCHITECTURE" accent="#ffea2f">從使用者體驗出發的架構</SectionHeading><Grid columns={{ base: 1, md: 2 }} gap={4}>{features.map(([en, title, description], index) => <MotionSection key={en} delay={index * .06}><Box backgroundColor="#18191d" borderRadius="24px" p={7} height="100%"><Text fontFamily="mono" color="#ffea2f" letterSpacing=".18em" fontSize="xs">{en}</Text><Heading mt={3} mb={3} fontSize="xl">{title}</Heading><Text lineHeight="1.8" opacity={.7}>{description}</Text></Box></MotionSection>)}</Grid></Box>
      <MotionSection><SectionHeading en="OPEN SOURCE" accent="#ffea2f">現在就打開一個字</SectionHeading><HStack gap={3} flexWrap="wrap"><ProjectLink href="https://kumiko.chiaki.ch" label="線上試用 Kumiko" accent="#ffea2f" /><ProjectLink href="https://github.com/chiakich/kumiko-font-editor" label="查看原始碼" detail="MIT" accent="#fff" /></HStack></MotionSection>
    </Stack></Container>
  </Box>
)

export default KumikoPage
