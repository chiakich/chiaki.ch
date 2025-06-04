import { Box, Flex, HStack, Link, Text, useColorModeValue } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

const fonts = [
  {
    id: 'akitra',
    title: '台鐵客貨車字體',
    path: '/fonts/akitra',
  },
  {
    id: 'nixie',
    title: 'Nixie 字體',
    path: '/fonts/nixie',
  },
  {
    id: 'huninn',
    title: '粉圓字體',
    path: '/fonts/huninn',
  },
]

const FontsSubNav = () => {
  const router = useRouter()
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const activeColor = useColorModeValue('blue.500', 'blue.300')
  const hoverColor = useColorModeValue('gray.100', 'gray.700')

  return (
    <Box
      as="nav"
      position="fixed"
      top="44px" // Position below the main TopBar
      width="100%"
      zIndex="10"
      backgroundColor="rgba(22, 22, 23, 0.8)"
      backdropFilter="saturate(180%) blur(20px)"
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.24)"
      height="44px"
    >
      <Flex
        maxW="1200px"
        mx="auto"
        px={4}
        height="100%"
        align="center"
        justify="space-between"
        color="white"
      >
        <Text fontSize="sm">字體作品</Text>

        <HStack spacing={8}>
          {fonts.map((font) => (
            <Link
              as={NextLink}
              key={font.id}
              href={font.path}
              fontSize="sm"
              fontWeight="medium"
              color={router.pathname === font.path ? activeColor : 'gray.200'}
              _hover={{
                textDecoration: 'none',
                color: activeColor,
                bg: hoverColor,
              }}
              px={3}
              py={1}
              borderRadius="md"
              transition="all 0.2s"
            >
              {font.title}
            </Link>
          ))}
        </HStack>
      </Flex>
    </Box>
  )
}

export default FontsSubNav
