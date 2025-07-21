import type { NextPage } from 'next'
import { Box } from '@chakra-ui/react'
import CoverSection from 'components/index/Cover'
import DepthScrollSection from 'components/index/DepthScrollSection'
import TopBar from 'components/TopBar'

const Home: NextPage = () => {
  return (
    <Box backgroundColor="black" width="100%" height="100%">
      <TopBar />
      <Box
        width="100vw"
        height="100vh"
        position="absolute"
        zIndex="10"
        overflow="hidden"
      >
        <CoverSection />
      </Box>

      <DepthScrollSection />
      <Box height="100vh"></Box>
    </Box>
  )
}

export default Home
