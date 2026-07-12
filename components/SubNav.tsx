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

// Apple 產品頁式 local nav：桌面顯示毛玻璃細列，
// 手機隱藏（項目改由 TopBar 的漢堡選單顯示）。
const SubNav = ({
  title,
  items,
  backgroundColor = 'rgba(22, 22, 23, 0.8)',
  borderColor = 'rgba(255, 255, 255, 0.12)',
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
      height="48px"
      display={{ base: 'none', md: 'block' }}
    >
      <Flex
        maxW="width.section"
        mx="auto"
        px={{ md: '40px', lg: '60px' }}
        height="100%"
        align="center"
        justify="space-between"
        color="white"
      >
        <Text fontSize="17px" fontWeight="600" letterSpacing="-.01em">
          {title}
        </Text>

        <HStack gap={8} height="100%" ml={5}>
          {items.map((item) => (
            <Link
              as={NextLink}
              key={item.id}
              href={item.path}
              fontSize="14px"
              fontWeight="600"
              height="100%"
              display="flex"
              alignItems="center"
              color={
                router.pathname === item.path ? 'white' : 'rgba(255, 255, 255, 0.62)'
              }
              _hover={{ color: 'white' }}
              flexShrink={0}
              transition="color 0.2s"
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
