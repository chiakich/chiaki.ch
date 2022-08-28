import type { NextPage } from 'next'
import { Box } from '@chakra-ui/react'
import CoverSection from 'components/index/Cover'
import DetailSection from 'components/index/Detail'

const Home: NextPage = () => {
  return (
    <Box backgroundColor="black" width="100%" height="100%">
      <CoverSection />
      <DetailSection />
    </Box>
  )
}

export default Home
