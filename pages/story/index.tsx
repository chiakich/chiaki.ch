import type { NextPage } from 'next'
import { useCallback, useState } from 'react'
import { Box } from 'styled-system/jsx'
import ProjectSection from 'components/index/ProjectSection'
import { makeStaticProps } from 'i18n/messages'

// Imported directly now: the component itself is just the CSS shell, and it
// defers its own WebGL layer (see DepthScrollSection). Going through dynamic()
// here put three.js in this page's preload set, which is what made /story the
// heaviest route on the site.
import DepthScrollSection from 'components/index/DepthScrollSection'
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
    <Box
      backgroundColor="black"
      width="100%"
      minHeight="100%"
      overflow="clip"
      fontFamily="default"
    >
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

export const getStaticProps = makeStaticProps('story')
