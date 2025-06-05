import { Box, Flex, HStack, Link, Text, useColorModeValue } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

export interface SubNavItem {
  id: string
  title: string
  path: string
}

interface SubNavProps {
  title: string
  items: SubNavItem[]
  backgroundColor?: string
  borderColor?: string
}

const SubNav = ({
  title,
  items,
  backgroundColor = 'rgba(22, 22, 23, 0.8)',
  borderColor = 'rgba(255, 255, 255, 0.24)',
}: SubNavProps) => {
  const router = useRouter()

  return (
    <Box
      as="nav"
      position="fixed"
      top="44px" // Position below the main TopBar
      width="100%"
      zIndex="10"
      backgroundColor={backgroundColor}
      backdropFilter="saturate(180%) blur(20px)"
      borderBottom="1px solid"
      borderColor={borderColor}
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
        <Text fontSize="sm">{title}</Text>

        <HStack spacing={8}>
          {items.map((item) => (
            <Link
              as={NextLink}
              key={item.id}
              href={item.path}
              fontSize="sm"
              fontWeight="medium"
              color={router.pathname === item.path ? 'gray.100' : 'gray.400'}
              _hover={{
                color: 'gray.400',
              }}
              px={3}
              py={1}
              borderRadius="md"
              transition="all 0.2s"
            >
              {item.title}
            </Link>
          ))}
        </HStack>
      </Flex>
    </Box>
  )
}

export default SubNav
