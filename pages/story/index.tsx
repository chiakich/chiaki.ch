import type { NextPage } from 'next'
import { Box } from '@chakra-ui/react'
import DepthScrollSection from 'components/index/DepthScrollSection'
import SeedGrowthSection from 'components/index/SeedGrowthSection'
import ProjectSection from 'components/index/ProjectSection'
import TopBar from 'components/TopBar'
import StorySubNav from 'components/StorySubNav'

const Story: NextPage = () => {
  return (
    <Box backgroundColor="black" width="100%" height="100%">
      <TopBar />
      <StorySubNav />
      <DepthScrollSection />
      <SeedGrowthSection />
      <ProjectSection />
    </Box>
  )
}

export default Story
