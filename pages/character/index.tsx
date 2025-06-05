import type { NextPage } from 'next'
import { Box, VStack } from '@chakra-ui/react'
import TopBar from 'components/TopBar'
import CharacterSubNav from 'components/character/CharacterSubNav'
import CharacterIntroduction from 'components/character/CharacterIntroduction'
import Live2DModelComponent from 'components/character/Live2DModel'

const CharacterOverviewPage: NextPage = () => {
  return (
    <Box backgroundColor="black" width="100%" minHeight="100vh">
      <TopBar />
      <CharacterSubNav />

      <VStack spacing={8} paddingTop="88px" paddingBottom="40px">
        <Box width="100%">
          <CharacterIntroduction />
        </Box>

        <Box
          width="100%"
          maxWidth="1200px"
          paddingX={{ base: '20px', md: '40px', lg: '60px' }}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={{ base: '50vh', md: '60vh', lg: '600px' }}
        >
          <Live2DModelComponent />
        </Box>
      </VStack>
    </Box>
  )
}

export default CharacterOverviewPage
