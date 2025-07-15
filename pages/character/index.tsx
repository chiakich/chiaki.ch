import type { NextPage } from 'next'
import { Box, Center, Button } from '@chakra-ui/react'
import NextLink from 'next/link'
import TopBar from 'components/TopBar'
import CharacterSubNav from 'components/character/CharacterSubNav'
import CharacterIntroduction from 'components/character/CharacterIntroduction'
import CharacterConceptArt from 'components/character/CharacterConceptArt'
import Live2DModel from 'components/character/Live2DModel'
import IntroBackground from 'components/character/IntroBackground'
import MinecraftSkin from 'components/character/MinecraftSkin'

const CharacterOverviewPage: NextPage = () => {
  return (
    <Box
      backgroundColor="black"
      width="100%"
      minHeight="100vh"
      cursor="url('https://images.plurk.com/i4BLwuGEg7v4dgyVOufB7.gif'), default"
    >
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
      <Center py="100px">
        <NextLink href="/character/art">
          <Button colorScheme="whiteAlpha" variant="outline">
            更多作品
          </Button>
        </NextLink>
      </Center>
    </Box>
  )
}

export default CharacterOverviewPage
