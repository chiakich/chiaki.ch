import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'

const CharacterIntroduction: React.FC = () => {
  return (
    <VStack
      spacing={6}
      marginBottom={{ base: '40px', md: '60px' }}
      align="center"
      textAlign="center"
    >
      <Text
        fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
        fontWeight="bold"
        color="white"
        marginBottom="20px"
      >
        Character Portfolio
      </Text>

      <Box
        backgroundColor="rgba(255, 255, 255, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.2)"
        borderRadius="12px"
        padding={{ base: '20px', md: '30px' }}
        maxWidth="800px"
        backdropFilter="blur(10px)"
      >
        <Text
          fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
          color="white"
          lineHeight="1.8"
          fontWeight="medium"
        >
          はおーっ！涼風千秋です！
          <br />
          見習繪師、字體設計師、前端工程師，
          <br />
          神使狐狸大小姐，喜歡優雅、可愛的東西
        </Text>
      </Box>
    </VStack>
  )
}

export default CharacterIntroduction
