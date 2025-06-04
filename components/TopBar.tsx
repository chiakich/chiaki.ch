import { Flex, IconButton, Box, HStack, Image, Text } from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import React from 'react'

const TopBar: React.FC = () => {
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
        maxW="1200px"
        mx="auto"
        px={4}
        height="44px"
        align="center"
        justify="space-between"
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

          <HStack spacing={5} display={{ base: 'none', md: 'flex' }} color="white">
            <Link href="/">Home</Link>
            <Link href="/character">Character</Link>
            <Link href="/fonts">Fonts</Link>
          </HStack>
        </HStack>
      </Flex>
    </Box>
  )
}

export default TopBar
