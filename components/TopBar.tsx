import {
  Flex,
  Box,
  HStack,
  VStack,
  styled,
} from 'styled-system/jsx'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
} from 'components/ui/controls'
import { ChevronDownIcon, CloseIcon, HamburgerIcon } from 'components/ui/icons'
import Link from 'next/link'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { worksNavItems } from 'components/works/WorksSubNav'
import { storyNavItems } from 'components/StorySubNav'
import { fontsNavItems } from 'components/fonts/FontsSubNav'
import type { SubNavItem } from 'components/SubNav'

const Image = styled.img
const Text = styled.p

const mainLinks = [
  ['Home', '/'],
  ['About', '/about'],
  ['Story', '/story'],
  ['Works', '/works'],
  ['Fonts', '/fonts'],
]

const mobileSubnavItems: Record<string, SubNavItem[]> = {
  Story: storyNavItems,
  Works: worksNavItems,
  Fonts: fontsNavItems,
}

const TopBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const currentPath = usePathname()

  React.useEffect(() => {
    if (!isOpen) return

    const activeParent = mainLinks.find(([, path]) =>
      path === '/' ? currentPath === '/' : currentPath?.startsWith(path)
    )?.[0]

    if (activeParent && mobileSubnavItems[activeParent]) {
      setExpandedMenu(activeParent)
    }
  }, [currentPath, isOpen])

  const isActive = (path: string) =>
    path === '/' ? currentPath === '/' : currentPath?.startsWith(path)

  return (
    <Box
      as="nav"
      position="fixed"
      width="100%"
      zIndex="20"
      backgroundColor="rgba(29,29,31,.92)"
      backdropFilter="saturate(180%) blur(20px)"
      borderBottom="1px solid"
      borderColor="gray.800"
    >
      <Flex
        maxW="width.section"
        mx="auto"
        px={{ base: '20px', md: '40px', lg: '60px' }}
        height="44px"
        alignItems="center"
        justify="space-between"
        fontWeight="normal"
      >
        {/* Left section */}
        <HStack gap={5}>
          <IconButton
            aria-label="Menu"
            icon={<HamburgerIcon color="white" />}
            variant="ghost"
            size="sm"
            color="white"
            style={{ color: 'white' }}
            _hover={{ bg: 'gray.800' }}
            display={{ base: 'flex', md: 'none' }}
            onClick={() => {
              setIsOpen((prev) => !prev)
            }}
          />
          <Link href="/">
            <Image
              src="/assets/icon/logo_white.svg"
              alt="Logo"
              height="20px"
              display={{ base: 'none', md: 'block' }}
            />
          </Link>

          <HStack gap={5} display={{ base: 'none', md: 'flex' }} color="#F5F5F7">
            {mainLinks.map(([label, path]) => (
              <Link key={path} href={path} style={{ opacity: isActive(path) ? 1 : 0.5 }}>
                {label}
              </Link>
            ))}
          </HStack>
        </HStack>

        <Drawer
          placement="left"
          size="xs"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <DrawerOverlay onClick={() => setIsOpen(false)} />
          <DrawerContent backgroundColor="rgba(18,18,20,.98)" color="white">
            <DrawerHeader alignSelf="flex-end" px={3} pt={3} pb={2}>
              <IconButton
                aria-label="Close"
                icon={<CloseIcon />}
                variant="unstyled"
                onClick={() => setIsOpen(false)}
              />
            </DrawerHeader>
            <DrawerBody px={7} pb={8}>
              <VStack gap={2} alignItems="stretch">
                {mainLinks.map(([label, path], index) => {
                  const subnavItems = mobileSubnavItems[label]
                  const hasChildren = Boolean(subnavItems)
                  const isExpanded = expandedMenu === label
                  const itemTransition = `opacity 280ms ease ${80 + index * 45}ms, transform 320ms cubic-bezier(0.22, 1, 0.36, 1) ${80 + index * 45}ms`

                  return (
                    <Box
                      key={path}
                      opacity={isOpen ? 1 : 0}
                      transform={isOpen ? 'translateX(0)' : 'translateX(-12px)'}
                      transition={itemTransition}
                    >
                      {hasChildren ? (
                        <styled.button
                          type="button"
                          display="flex"
                          width="100%"
                          alignItems="center"
                          justifyContent="space-between"
                          py={2}
                          bg="transparent"
                          border="0"
                          color="white"
                          cursor="pointer"
                          fontSize="1.6rem"
                          fontWeight="600"
                          letterSpacing="-.02em"
                          textAlign="left"
                          opacity={isActive(path) ? 1 : 0.8}
                          onClick={() => setExpandedMenu((expanded) => expanded === label ? null : label)}
                          aria-expanded={isExpanded}
                          aria-controls={`mobile-${label.toLowerCase()}-menu`}
                        >
                          {label}
                          <Box
                            as="span"
                            display="inline-flex"
                            fontSize="1.25rem"
                            transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                            transition="transform 220ms ease"
                          >
                            <ChevronDownIcon />
                          </Box>
                        </styled.button>
                      ) : (
                        <Link href={path} onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '.5rem 0', fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-.02em', opacity: isActive(path) ? 1 : 0.8 }}>
                          {label}
                        </Link>
                      )}
                      {hasChildren && (
                        <Box
                          id={`mobile-${label.toLowerCase()}-menu`}
                          maxH={isExpanded ? '20rem' : 0}
                          opacity={isExpanded ? 1 : 0}
                          overflow="hidden"
                          transition="max-height 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease"
                        >
                          <VStack gap={1} alignItems="start" mt={1} mb={2} pl={4} py={1} borderLeft="1px solid rgba(255,255,255,.16)">
                            {subnavItems?.map((item) => (
                              <Link key={item.id} href={item.path} onClick={() => setIsOpen(false)} style={{ padding: '.35rem 0', fontSize: '1.05rem', opacity: currentPath === item.path ? 1 : 0.55 }}>
                                {item.title}
                              </Link>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </VStack>
              <Text mt={8} fontSize="xs" opacity={.35}>chiaki.ch</Text>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  )
}

export default TopBar
