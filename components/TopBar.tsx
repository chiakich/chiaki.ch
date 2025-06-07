import {
  Flex,
  IconButton,
  Box,
  HStack,
  Image,
  Text,
  Drawer,
  DrawerOverlay,
  DrawerHeader,
  DrawerContent,
  VStack,
  DrawerBody,
} from '@chakra-ui/react'
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'

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
        align="center"
        justify="space-between"
        fontWeight="normal"
      >
        {/* Left section */}
        <HStack spacing={5}>
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
            <HStack spacing={2}>
              <Image
                src="/assets/icon/logo_white.svg"
                alt="Logo"
                height="20px"
                display={{ base: 'none', md: 'block' }}
              />
            </HStack>
          </Link>

          <HStack spacing={5} display={{ base: 'none', md: 'flex' }} color="#F5F5F7">
            <Link href="/" style={{ opacity: currentPath === '/' ? 1 : 0.5 }}>
              Home
            </Link>
            <Link
              href="/character"
              style={{
                opacity: currentPath === '/character' ? 1 : 0.5,
              }}
            >
              Character
            </Link>
            <Link
              href="/fonts"
              style={{
                opacity: currentPath === '/fonts' ? 1 : 0.5,
              }}
            >
              Fonts
            </Link>
          </HStack>
        </HStack>

        <Drawer
          placement="left"
          size="xs"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <DrawerOverlay />
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
              <VStack spacing={5} align="start">
                <Link href="/">Home</Link>
                <Link href="/character">Character</Link>
                <Link href="/fonts">Fonts</Link>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  )
}

export default TopBar
