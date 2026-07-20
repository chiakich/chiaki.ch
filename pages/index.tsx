import type { NextPage } from 'next'
import { Box } from 'styled-system/jsx'
import CoverSection from 'components/index/Cover'
import SocietyIntro from 'components/index/SocietyIntro'

const Home: NextPage = () => {
  return (
    <Box backgroundColor="black" width="100%" minHeight="100vh">
      <Box width="100vw" height="100vh" overflow="hidden">
        <CoverSection />
      </Box>
      <SocietyIntro />
    </Box>
  )
}

export default Home
