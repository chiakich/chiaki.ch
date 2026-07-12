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
import { CloseIcon, HamburgerIcon } from 'components/ui/icons'
import Link from 'next/link'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { worksNavItems } from 'components/works/WorksSubNav'

const Image = styled.img
const Text = styled.p

const mainLinks = [
  ['Home', '/'],
  ['About', '/about'],
  ['Story', '/story'],
  ['Works', '/works'],
  ['Fonts', '/fonts'],
]

const TopBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const currentPath = usePathname()
  const inWorks = currentPath?.startsWith('/works')

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
            icon={<HamburgerIcon />}
            variant="ghost"
            size="sm"
            color="white"
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
            <DrawerHeader alignSelf="flex-end">
              <IconButton
                aria-label="Close"
                icon={<CloseIcon />}
                variant="unstyled"
                onClick={() => setIsOpen(false)}
              />
            </DrawerHeader>
            <DrawerBody>
              {/* Apple 式行動選單：大字主導覽；位於 /works 時展開 works 子選單 */}
              <VStack gap={4} alignItems="start">
                {mainLinks.map(([label, path]) => (
                  <React.Fragment key={path}>
                    <Link href={path} onClick={() => setIsOpen(false)} style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-.02em', opacity: isActive(path) ? 1 : 0.8 }}>
                      {label}
                    </Link>
                    {label === 'Works' && inWorks && (
                      <VStack gap={3} alignItems="start" pl={4} py={1} borderLeft="1px solid rgba(255,255,255,.16)">
                        {worksNavItems.map((item) => (
                          <Link key={item.id} href={item.path} onClick={() => setIsOpen(false)} style={{ fontSize: '1.05rem', opacity: currentPath === item.path ? 1 : 0.55 }}>
                            {item.title}
                          </Link>
                        ))}
                      </VStack>
                    )}
                  </React.Fragment>
                ))}
              </VStack>
              <Text mt={10} fontSize="xs" opacity={.35}>chiaki.ch</Text>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  )
}

export default TopBar
