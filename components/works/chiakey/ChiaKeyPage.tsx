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
      <TopBar /><WorksSubNav /><ChiaKeyHero />
      <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 24 }}>
        <Stack gap={{ base: 20, md: 32 }}><ChiaKeyStory /><ChiaKeyFeatures /><ChiaKeyLexicon /><ChiaKeyLinks /></Stack>
      </Container>
    </Box>
  </MotionConfig>
)

export default ChiaKeyPage
