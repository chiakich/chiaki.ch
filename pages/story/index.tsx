import type { NextPage } from 'next'
import { Box } from 'styled-system/jsx'
import DepthScrollSection from 'components/index/DepthScrollSection'
import SeedGrowthSection from 'components/index/SeedGrowthSection'
import ProjectSection from 'components/index/ProjectSection'
import TopBar from 'components/TopBar'
import StorySubNav from 'components/StorySubNav'
import StoryAtmosphere from 'components/story/StoryAtmosphere'
import StoryHeroOverlay from 'components/story/StoryHeroOverlay'
import StoryProgress from 'components/story/StoryProgress'

const Story: NextPage = () => {
  return (
    <Box backgroundColor="black" width="100%" minHeight="100%" overflow="clip">
      <TopBar />
      <StorySubNav />
      <StoryAtmosphere />
      <StoryProgress />
      <StoryHeroOverlay />
      <DepthScrollSection />
      <SeedGrowthSection />
      <ProjectSection />
    </Box>
  )
}

export default Story
