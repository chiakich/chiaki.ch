import type { NextPage } from 'next'
import { Box } from '@chakra-ui/react'
import CoverSection from 'components/index/Cover'
import DepthScrollSection from 'components/index/DepthScrollSection'
import SeedGrowthSection from 'components/index/SeedGrowthSection'
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
      <SeedGrowthSection />
      <Box
        height="100vh"
        width="100vw"
        backgroundColor="black"
        position="relative"
      />
    </Box>
  )
}

export default Home
