import { MotionConfig } from 'framer-motion'
import { Box, Container, Stack } from 'styled-system/jsx'
import ChiaKeyFaq from './ChiaKeyFaq'
import ChiaKeyFeatures from './ChiaKeyFeatures'
import ChiaKeyHero from './ChiaKeyHero'
import ChiaKeyLexicon from './ChiaKeyLexicon'
import ChiaKeyLinks from './ChiaKeyLinks'
import ChiaKeyPrecision from './ChiaKeyPrecision'
import ChiaKeyStory from './ChiaKeyStory'

// Precision 是整頁唯一的滿版段落，所以它插在兩個 Container 中間——
// 寬度的變化就是 Apple 產品頁的換氣點。
const ChiaKeyPage = () => (
  <MotionConfig reducedMotion="user">
    <Box backgroundColor="#0e0716" color="white" minHeight="100vh">
      <ChiaKeyHero />
      <Container maxW="1080px" px={{ base: '24px', md: '40px' }} pt={{ base: 16, md: 24 }}>
        <ChiaKeyStory />
      </Container>
      <ChiaKeyPrecision />
      <Container maxW="1080px" px={{ base: '24px', md: '40px' }} pb={{ base: 16, md: 24 }}>
        <Stack gap={{ base: 20, md: 32 }}><ChiaKeyFeatures /><ChiaKeyLexicon /><ChiaKeyLinks /><ChiaKeyFaq /></Stack>
      </Container>
    </Box>
  </MotionConfig>
)

export default ChiaKeyPage
