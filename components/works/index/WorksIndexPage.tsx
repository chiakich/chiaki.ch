import Head from 'next/head'
import { motion } from 'framer-motion'
import { Box, Container, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import WorksSubNav from 'components/works/WorksSubNav'
import WorkCard, { WorkCardData } from './WorkCard'
import { ChiaKeySpecimen, KumikoSpecimen, TgJpgSpecimen, TokyonoSpecimen } from './WorkSpecimens'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const MotionBox = motion(Box)

const works: WorkCardData[] = [
  { id: 'chiakey', title: '千秋輸入法', en: 'CHIAKEY', description: '讓 Yahoo! 奇摩輸入法／KeyKey 熟悉的輸入節奏，在現代 macOS 上繼續被使用與維護。', tags: ['macOS', '輸入法', '開源復興'], href: '/works/chiakey', accent: '#62a8ff', specimen: <ChiaKeySpecimen /> },
  { id: 'kumiko', title: 'Kumiko Font Editor', en: 'FONT EDITOR', description: '完全在瀏覽器運作、以 GitHub 為核心的 CJK 補字工具，讓開源字體協作真正零安裝。', tags: ['React', 'CJK', 'GitHub workflow'], href: '/works/kumiko', accent: '#ffea2f', specimen: <KumikoSpecimen /> },
  { id: 'tokyono-sora', title: '東京乃空', en: 'PLURK UI', description: '重新設計噗浪時間軸的資訊層級、毛玻璃質感與響應式介面，讓河道成為一幅可以閱讀的風景。', tags: ['UI Design', 'CSS', 'Plurk'], href: '/works/tokyono-sora', accent: '#68d5e3', specimen: <TokyonoSpecimen /> },
  { id: 'tg-jpg', title: 'tg.jpg', en: 'TELEGRAM BOT', description: '在 Telegram 打出一個圖片檔名，機器人就從多個搜尋來源帶回第一張可用的圖片。', tags: ['Rust', 'Telegram', 'Image search'], href: '/works/tg-jpg', accent: '#57b5ff', specimen: <TgJpgSpecimen /> },
]

const WorksIndexPage = () => (
  <Box backgroundColor="#070708" color="white" minHeight="100vh">
    <Head><title>Works - 千秋的作品</title><meta name="description" content="千秋設計與開發的軟體、工具與介面作品。" /></Head>
    <TopBar /><WorksSubNav />
    <Box pt="96px"><Container maxW="1080px" py={12} px={{ base: '24px', md: '40px' }}>
      <MotionBox initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} mb={14}>
        <Text fontFamily="mono" fontSize="sm" letterSpacing=".35em" color="#7eb6ff" fontWeight="bold" mb={3}>WORKS&nbsp;&nbsp;//&nbsp;&nbsp;DESIGN &amp; CODE</Text>
        <Heading fontSize={{ base: '3rem', md: '4.5rem' }} lineHeight={1.05} fontWeight="900" mb={5}>作品<Span color="#7eb6ff">集</Span></Heading>
        <Box width="180px" height="8px" mb={5} background="repeating-linear-gradient(-45deg, #7eb6ff 0 10px, transparent 10px 20px)" />
        <Text maxW="620px" fontSize={{ base: 'md', md: 'lg' }} opacity={.85} lineHeight="1.9">把熟悉的工具帶到新的系統、讓複雜的創作變得容易，或只是讓一個每天打開的畫面更好看一點。</Text>
      </MotionBox>
      <Stack gap={10}>{works.map((work, index) => <WorkCard key={work.id} work={work} index={index} />)}</Stack>
    </Container></Box>
  </Box>
)

export default WorksIndexPage
