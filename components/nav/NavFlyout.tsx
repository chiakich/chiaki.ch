import Link from 'next/link'
import { Box, Flex, styled } from 'styled-system/jsx'
import type { NavSection } from './navData'
import { localizedPath, useI18n } from 'i18n'

const Text = styled.p

interface NavFlyoutProps {
  section: NavSection
  currentPath: string | null
  onNavigate: () => void
}

// Apple 產品選單式的 flyout 內容：圖示 + 標題橫向排列，窄螢幕自動換行。
const NavFlyout = ({ section, currentPath, onNavigate }: NavFlyoutProps) => {
  const { locale } = useI18n()

  return <Box
    maxW="width.section"
    mx="auto"
    px={{ base: '20px', md: '40px', lg: '60px' }}
    pt={1}
    pb={{ base: 3, md: 4 }}
  >
    <Flex
      flexWrap="wrap"
      justifyContent="center"
      alignItems="flex-start"
      gap={{ base: '4px', md: '20px' }}
    >
      {section.items.map((item) => {
        const isCurrent = currentPath === item.path

        return (
          <Link
            key={item.id}
            href={localizedPath(item.path, locale)}
            onClick={onNavigate}
            aria-current={isCurrent ? 'page' : undefined}
          >
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="flex-start"
              gap={2}
              width={{ base: '76px', md: '92px' }}
              px={2}
              py={3}
              borderRadius="12px"
              color={isCurrent ? 'white' : 'rgba(255,255,255,.72)'}
              backgroundColor={isCurrent ? 'rgba(255,255,255,.08)' : 'transparent'}
              transition="color 200ms ease, background-color 200ms ease"
              _hover={{ color: 'white', backgroundColor: 'rgba(255,255,255,.08)' }}
            >
              <Flex height="44px" alignItems="center" justifyContent="center">
                {item.icon}
              </Flex>
              <Text
                fontSize={{ base: '11px', md: '12px' }}
                fontWeight="600"
                letterSpacing="-.01em"
                textAlign="center"
                lineHeight="1.3"
              >
                {item.title}
              </Text>
            </Flex>
          </Link>
        )
      })}
    </Flex>
  </Box>
}

export default NavFlyout
