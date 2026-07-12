import Head from 'next/head'
import { Box, Container, Grid, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import WorksSubNav from 'components/works/WorksSubNav'
import TgJpgHero from './TgJpgHero'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img

const pipeline = [
  ['01', '辨識檔名', '監聽以 .jpg、.png 或 .gif 結尾的訊息。'],
  ['02', '檢查搜尋來源', '啟動時執行健康檢查，只啟用當下可用的引擎。'],
  ['03', '搶先回覆', '跨來源搜尋，第一張 Telegram 能傳送的結果立刻勝出。'],
]

const TgJpgPage = () => (
  <Box backgroundColor="#08121c" color="white" minHeight="100vh">
    <Head><title>tg.jpg Telegram Bot - Works</title><meta name="description" content="輸入圖片檔名，就回覆第一張可用搜尋結果的 Telegram bot。" /></Head>
    <TopBar /><WorksSubNav /><TgJpgHero />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 20 }}><Stack gap={20}>
      <MotionSection><SectionHeading en="IDEA" accent="#57b5ff">把搜尋縮成一個檔名</SectionHeading><Text maxW="760px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.78}>不用離開對話開瀏覽器找圖。tg.jpg 接上 Google、DuckDuckGo、Bing 三個免費來源，以及可選的 Serper 與 SerpAPI；設定了 Serper API key 時，它會排在最高優先。</Text></MotionSection>
      <Box><SectionHeading en="PIPELINE" accent="#57b5ff">誰先找到，就由誰回覆</SectionHeading><Grid columns={{ base: 1, md: 3 }} gap={4}>{pipeline.map(([number, title, description], index) => <MotionSection key={number} delay={index * .08}><Box backgroundColor="#111f2d" borderRadius="24px" p={7} height="100%"><Text color="#57b5ff" fontWeight="700" fontSize="sm">{number}</Text><Heading fontSize="xl" my={3} letterSpacing="-.01em">{title}</Heading><Text opacity={.65} lineHeight="1.8" fontSize="sm">{description}</Text></Box></MotionSection>)}</Grid></Box>
      <MotionSection><Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center"><Box borderRadius="24px" overflow="hidden"><Image src="/assets/works/tg-jpg/chat.webp" alt="tg.jpg 在 Telegram 回覆 mic drop GIF" width="100%" display="block" /></Box><Box><SectionHeading en="BUILT WITH RUST" accent="#57b5ff">Rust 重寫版</SectionHeading><Text lineHeight="1.9" opacity={.75} mb={6}>原本是 Node.js bot，後來以 Rust 重寫：Teloxide 接 Telegram、Reqwest 抓搜尋結果。啟動時對每個搜尋來源做健康檢查，掛掉的來源直接停用，其餘照優先序輪流試到有結果為止。附 Docker 與 Fly.io 部署設定。</Text><ProjectLink href="https://github.com/chiakich/rust-tg.jpg" label="GitHub Repository" accent="#57b5ff" /></Box></Grid></MotionSection>
    </Stack></Container>
  </Box>
)

export default TgJpgPage
