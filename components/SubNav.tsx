import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

const Text = styled.p
const Link = styled.a

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
      height="52px"
    >
      <Flex
        maxW="width.section"
        mx="auto"
        px={{ base: '20px', md: '40px', lg: '60px' }}
        height="100%"
        align="center"
        justify="space-between"
        color="white"
      >
        <Text fontSize="lg">{title}</Text>

        <HStack
          gap={{ base: 4, md: 8 }}
          height="100%"
          overflowX="auto"
          flex="1"
          justifyContent={{ base: 'flex-start', md: 'flex-end' }}
          ml={5}
          css={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
        >
          {items.map((item) => (
            <Link
              as={NextLink}
              key={item.id}
              href={item.path}
              fontSize="sm"
              fontWeight="medium"
              height="100%"
              display="flex"
              alignItems="center"
              color={
                router.pathname === item.path
                  ? 'gray.100'
                  : 'rgba(255, 255, 255, 0.56)'
              }
              _hover={{
                color: 'gray.100',
              }}
              borderBottom={router.pathname === item.path ? '1px solid' : 'none'}
              borderColor="white"
              px="5px"
              flexShrink={0}
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
