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

const Image = styled.img

const TopBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const currentPath = usePathname()

  return (
    <Box
      as="nav"
      position="fixed"
      width="100%"
      zIndex="20"
      backgroundColor="#1d1d1f"
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
            <Link href="/" style={{ opacity: currentPath === '/' ? 1 : 0.5 }}>
              Home
            </Link>
            <Link
              href="/about"
              style={{ opacity: currentPath === '/about' ? 1 : 0.5 }}
            >
              About
            </Link>
            <Link
              href="/story"
              style={{ opacity: currentPath?.startsWith('/story') ? 1 : 0.5 }}
            >
              Story
            </Link>
            <Link
              href="/works"
              style={{ opacity: currentPath?.startsWith('/works') ? 1 : 0.5 }}
            >
              Works
            </Link>
          </HStack>
        </HStack>

        <Drawer
          placement="left"
          size="xs"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <DrawerOverlay onClick={() => setIsOpen(false)} />
          <DrawerContent backgroundColor="black" color="white">
            <DrawerHeader alignSelf="flex-end">
              <IconButton
                aria-label="Close"
                icon={<CloseIcon />}
                variant="unstyled"
                onClick={() => setIsOpen(false)}
              />
            </DrawerHeader>
            <DrawerBody>
              <VStack gap={5} alignItems="start">
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
                <Link href="/story">Story</Link>
                <Link href="/works">Works</Link>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  )
}

export default TopBar
