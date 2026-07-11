import type { NextPage } from 'next'
import { useCallback, useState } from 'react'
import { Box } from 'styled-system/jsx'
import DepthScrollSection from 'components/index/DepthScrollSection'
import ProjectSection from 'components/index/ProjectSection'
import TopBar from 'components/TopBar'
import StorySubNav from 'components/StorySubNav'
import StoryAtmosphere from 'components/story/StoryAtmosphere'
import StoryProgress from 'components/story/StoryProgress'
import StoryBootLoader from 'components/story/StoryBootLoader'
import SignalArchiveSection from 'components/story/SignalArchiveSection'
import TokoyoParallaxSection from 'components/story/TokoyoParallaxSection'
import HumanMemorySection from 'components/story/HumanMemorySection'
import StorySequence from 'components/story/StorySequence'
import NoritoSection from 'components/story/NoritoSection'

const Story: NextPage = () => {
  const [openingDone, setOpeningDone] = useState(false)
  const handleBootDone = useCallback(() => setOpeningDone(true), [])

  return (
    <Box backgroundColor="black" width="100%" minHeight="100%" overflow="clip">
      <TopBar />
      <StorySubNav />
      <StoryBootLoader onComplete={handleBootDone} />
      <StoryAtmosphere />
      <StoryProgress />
      <DepthScrollSection started={openingDone} />
      <SignalArchiveSection />
      <StorySequence />
      <HumanMemorySection />
      <NoritoSection />
      <TokoyoParallaxSection />
      <ProjectSection />
    </Box>
  )
}

export default Story
