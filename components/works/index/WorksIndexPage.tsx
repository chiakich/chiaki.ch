import { motion } from 'framer-motion'
import { Box, Container, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import WorkCard, { WorkCardData } from './WorkCard'
import { ChiaKeySpecimen, KumikoSpecimen, SplitFlapSpecimen, TgJpgSpecimen, TokyonoSpecimen } from './WorkSpecimens'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const MotionBox = motion(Box)

const works: WorkCardData[] = [
  { id: 'chiakey', title: '千秋輸入法', en: 'CHIAKEY', description: '以 Yahoo! 奇摩輸入法／KeyKey 的開源程式碼為基礎的 macOS 注音輸入法，保留原本的組字手感與候選窗，在現代系統上繼續維護。', tags: ['macOS', '輸入法', '開源復興'], href: '/works/chiakey', accent: '#b06ee8', specimen: <ChiaKeySpecimen /> },
  { id: 'kumiko', title: 'Kumiko Font Editor', en: 'FONT EDITOR', description: '零安裝的網頁字體編輯器：從 GitHub 載入 UFO、用 IDS 部件在瀏覽器裡補字，再送出 pull request。', tags: ['React', 'CJK', 'GitHub workflow'], href: '/works/kumiko', accent: '#ffea2f', specimen: <KumikoSpecimen /> },
  { id: 'tokyono-sora', title: '東京乃空', en: 'PLURK UI', description: '免費的噗浪 CSS 佈景：毛玻璃面板、數字管卡馬值、響應式排版，貼上一段 CSS 就能套用。', tags: ['UI Design', 'CSS', 'Plurk'], href: '/works/tokyono-sora', accent: '#68d5e3', specimen: <TokyonoSpecimen /> },
  { id: 'tg-jpg', title: 'tg.jpg', en: 'TELEGRAM BOT', description: '在 Telegram 打出圖片檔名，bot 依優先序查詢多個搜尋來源，回傳第一張能傳送的圖片。', tags: ['Rust', 'Telegram', 'Image search'], href: '/works/tg-jpg', accent: '#57b5ff', specimen: <TgJpgSpecimen /> },
  { id: 'split-flap', title: 'react-split-flap', en: 'REACT COMPONENT', description: '重現車站翻頁顯示器的 React 元件。共用動畫時鐘與 Web Animations API，讓幾百格字盤同時翻動也保持流暢。', tags: ['React', 'npm package', 'Animation'], href: '/works/split-flap', accent: '#ff5d52', specimen: <SplitFlapSpecimen /> },
]

const WorksIndexPage = () => (
  <Box backgroundColor="#070708" color="white" minHeight="100vh">
    <TopBar />
    <Box pt="96px"><Container maxW="1080px" py={12} px={{ base: '24px', md: '40px' }}>
      <MotionBox initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} mb={16} textAlign="center">
        <Text fontSize="sm" letterSpacing=".14em" color="#7eb6ff" fontWeight="700" textTransform="uppercase" mb={4}>Works · Design &amp; Code</Text>
        <Heading fontSize={{ base: '3rem', md: '4.8rem' }} lineHeight={1.05} fontWeight="700" letterSpacing="-.03em" mb={5}>作品<Span color="#7eb6ff">集</Span></Heading>
        <Text maxW="620px" mx="auto" fontSize={{ base: 'md', md: 'lg' }} opacity={.7} lineHeight="1.9">把熟悉的工具帶到新的系統、讓複雜的創作變得容易，或只是讓一個每天打開的畫面更好看一點。</Text>
      </MotionBox>
      <Stack gap={10}>{works.map((work, index) => <WorkCard key={work.id} work={work} index={index} />)}</Stack>
    </Container></Box>
  </Box>
)

export default WorksIndexPage
