import NextLink from 'next/link'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import type { NavSection } from './navData'
import { localizedPath, useI18n } from 'i18n'

const Text = styled.p
const Link = styled.a

interface SubNavProps {
  section: NavSection
  currentPath: string | null
}

// Apple 產品頁式的 local nav：桌面常駐的毛玻璃細列，負責「你在這一區的哪一頁」。
// 手機隱藏 —— 項目改由 TopBar 的 flyout 呈現。
const SubNav = ({ section, currentPath }: SubNavProps) => {
  const { locale } = useI18n()

  return <Box
    as="nav"
    position="fixed"
    top="44px" // Position below the main TopBar
    width="100%"
    zIndex="10"
    backgroundColor="rgba(22, 22, 23, 0.8)"
    backdropFilter="saturate(180%) blur(20px)"
    borderBottom="1px solid"
    borderColor="rgba(255, 255, 255, 0.12)"
    height="48px"
    display={{ base: 'none', md: 'block' }}
    fontFamily="body"
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
        {section.title}
      </Text>

      <HStack gap={8} height="100%" ml={5}>
        {section.items.map((item) => (
          <Link
            as={NextLink}
            key={item.id}
            href={localizedPath(item.path, locale)}
            fontSize="14px"
            fontWeight="600"
            height="100%"
            display="flex"
            alignItems="center"
            color={currentPath === item.path ? 'white' : 'rgba(255, 255, 255, 0.62)'}
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
}

export default SubNav
