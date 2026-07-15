import type { NextPage } from 'next'
import { Box, Center } from 'styled-system/jsx'
import { Button } from 'components/ui/controls'
import NextLink from 'next/link'
import TopBar from 'components/TopBar'
import CharacterIntroduction from 'components/character/CharacterIntroduction'
import CharacterConceptArt from 'components/character/CharacterConceptArt'
import Live2DModel from 'components/character/Live2DModel'
import IntroBackground from 'components/character/IntroBackground'
import MinecraftSkin from 'components/character/MinecraftSkin'

const CharacterOverviewPage: NextPage = () => {
  return (
    <Box
      bg="black"
      w="100%"
      minHeight="100vh"
      cursor="url('https://images.plurk.com/i4BLwuGEg7v4dgyVOufB7.gif'), default"
    >
      <TopBar />
      <Box pt="88px" pb="40px">
        <IntroBackground>
          <CharacterIntroduction />
          <CharacterConceptArt />
        </IntroBackground>
      </Box>
      <Live2DModel />
      <MinecraftSkin />
      <Center py="100px">
        <NextLink href="/story/character/art">
          <Button colorScheme="whiteAlpha" variant="outline">
            更多作品
          </Button>
        </NextLink>
      </Center>
    </Box>
  )
}

export default CharacterOverviewPage
