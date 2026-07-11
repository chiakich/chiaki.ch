import Head from 'next/head'
import { Box, Container, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import WorksSubNav from 'components/works/WorksSubNav'
import FoxLoader from './FoxLoader'
import TokyonoHero from './TokyonoHero'

const Heading = styled.h3
const Text = styled.p

const features = [
  ['LAYOUT', '重新安排河道', '調整行距、暱稱、大頭貼與噗文寬度，讓時間軸更容易掃讀。'],
  ['GLASS', '背景與介面融合', '即時模糊半透明面板讓使用者上傳的背景圖成為完整視覺。'],
  ['RWD', '各種方向都能閱讀', '支援不同螢幕寬高、直向畫面與瀏覽器縮放。'],
  ['NIXIE', '數字管卡馬值', '把自製 Nixie 字體放進卡馬顯示，形成世界線變動率般的細節。'],
]

const TokyonoPage = () => (
  <Box backgroundColor="#081720" color="white" minHeight="100vh">
    <Head><title>東京乃空 Tokyono Sora - Works</title><meta name="description" content="重新設計噗浪時間軸的免費 CSS 佈景。" /></Head>
    <TopBar /><WorksSubNav /><TokyonoHero />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 20 }}><Stack gap={20}>
      <MotionSection><SectionHeading en="DESIGN" accent="#8eeaf4">一條更舒服的河道</SectionHeading><Text maxW="760px" lineHeight="2" fontSize={{ base: 'md', md: 'lg' }} opacity={.78}>東京乃空是一套免費、自由使用的 Plurk CSS 佈景。它不改變噗浪的核心互動，而是重畫資訊層級、配色、間距與背景關係，讓每則噗文像漂浮在場景中的訊息。</Text></MotionSection>
      <Box><SectionHeading en="DETAILS" accent="#8eeaf4">藏在時間軸裡的設計</SectionHeading><Grid columns={{ base: 1, md: 2 }} gap={4}>{features.map(([en, title, description], index) => <MotionSection key={en} delay={index * .06}><Box p={6} height="100%" backgroundColor="rgba(27,52,66,.62)" border="1px solid rgba(142,234,244,.18)" backdropFilter="blur(12px)"><Text fontFamily="mono" color="#8eeaf4" fontSize="xs" letterSpacing=".18em">{en}</Text><Heading fontSize="xl" mt={3} mb={3}>{title}</Heading><Text opacity={.7} lineHeight="1.8">{description}</Text></Box></MotionSection>)}</Grid></Box>
      <MotionSection><Grid columns={{ base: 1, md: 2 }} gap={10} alignItems="center"><Box maxW="300px" mx="auto"><FoxLoader /></Box><Box><SectionHeading en="LOADING" accent="#f58a48">等待時，也有一隻狐狸</SectionHeading><Text lineHeight="1.9" opacity={.76}>自製旋轉狐狸替代制式載入圖示；連卡馬數字、個人簡介出場與河道配色，都被當成同一個世界觀的一部分。</Text></Box></Grid></MotionSection>
      <MotionSection><SectionHeading en="INSTALL" accent="#8eeaf4">貼上一段 CSS 就能使用</SectionHeading><Text mb={6} maxW="720px" lineHeight="1.9" opacity={.75}>將主題 CSS 貼到噗浪的「自訂佈景風格」。較慢的裝置也可用靜態模糊圖片產生器，預先產生背景效果。</Text><HStack gap={3} flexWrap="wrap"><ProjectLink href="https://github.com/chiakich/Tokyono-Sora/blob/main/TokynoSora.css" label="本體 CSS" accent="#8eeaf4" /><ProjectLink href="https://github.com/chiakich/Tokyono-Sora" label="安裝說明" accent="#fff" /></HStack></MotionSection>
    </Stack></Container>
  </Box>
)

export default TokyonoPage
