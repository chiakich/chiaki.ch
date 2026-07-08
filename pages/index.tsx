import type { NextPage } from 'next'
import { Box } from 'styled-system/jsx'
import CoverSection from 'components/index/Cover'
import TopBar from 'components/TopBar'

const Home: NextPage = () => {
  return (
    <Box backgroundColor="black" width="100%" height="100%">
      <TopBar />
      <Box width="100vw" height="100vh" overflow="hidden">
        <CoverSection />
      </Box>
    </Box>
  )
}

export default Home
