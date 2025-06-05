import type { NextPage } from 'next'
import { Box, VStack } from '@chakra-ui/react'
import TopBar from 'components/TopBar'
import CharacterSubNav from 'components/character/CharacterSubNav'
import CharacterIntroduction from 'components/character/CharacterIntroduction'
import CharacterConceptArt from 'components/character/CharacterConceptArt'
import Live2DModel from 'components/character/Live2DModel'
import IntroBackground from 'components/character/IntroBackground'
import MinecraftSkin from 'components/character/MinecraftSkin'

const CharacterOverviewPage: NextPage = () => {
  return (
    <Box backgroundColor="black" width="100%" minHeight="100vh">
      <TopBar />
      <CharacterSubNav />
      <Box paddingTop="88px" paddingBottom="40px">
        <IntroBackground>
          <CharacterIntroduction />
          <CharacterConceptArt />
        </IntroBackground>
      </Box>
      <Live2DModel />
      <MinecraftSkin />
    </Box>
  )
}

export default CharacterOverviewPage
