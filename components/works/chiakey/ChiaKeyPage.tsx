import Head from 'next/head'
import { MotionConfig } from 'framer-motion'
import { Box, Container, Stack } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import WorksSubNav from 'components/works/WorksSubNav'
import ChiaKeyFeatures from './ChiaKeyFeatures'
import ChiaKeyHero from './ChiaKeyHero'
import ChiaKeyLexicon from './ChiaKeyLexicon'
import ChiaKeyLinks from './ChiaKeyLinks'
import ChiaKeyStory from './ChiaKeyStory'

const ChiaKeyPage = () => (
  <MotionConfig reducedMotion="user">
    <Box backgroundColor="#0e0716" color="white" minHeight="100vh">
      <Head><title>千秋輸入法 ChiaKey - Works</title><meta name="description" content="以 Yahoo! 奇摩輸入法／KeyKey 開源程式碼為基礎的現代 macOS 繁體中文注音輸入法。" /></Head>
      <TopBar /><WorksSubNav /><ChiaKeyHero />
      <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 14, md: 20 }}>
        <Stack gap={{ base: 18, md: 24 }}><ChiaKeyStory /><ChiaKeyFeatures /><ChiaKeyLexicon /><ChiaKeyLinks /></Stack>
      </Container>
    </Box>
  </MotionConfig>
)

export default ChiaKeyPage
