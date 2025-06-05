import React, { useEffect, useRef, useState } from 'react'
import { Box, Text, VStack, Center, Spinner, HStack, Button } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { WalkingAnimation } from 'skinview3d'

// Dynamically import ReactSkinview3d to avoid SSR issues
const ReactSkinview3d = dynamic(() => import('react-skinview3d'), {
  ssr: false,
  loading: () => (
    <Center height="400px">
      <Spinner color="#df8a42" size="xl" />
    </Center>
  ),
})

const MinecraftSkin: React.FC = () => {
  const grassBlockStyles = {
    backgroundImage: `
      url('/assets/img/Grass_Block.png'),
      url('/assets/img/Grass_Block.png')
    `,
    backgroundSize: '120px',
    backgroundPosition: '0 0, 60px 103px',
    backgroundRepeat: 'repeat, repeat',
    imageRendering: 'pixelated',
  }

  return (
    <Box
      backgroundColor="white"
      position="relative"
      paddingY="60px"
      sx={{
        ...grassBlockStyles,
      }}
    >
      <Box
        width="100%"
        maxWidth="1200px"
        margin="0 auto"
        paddingX={{ base: '20px', md: '40px', lg: '60px' }}
        position="relative"
        zIndex={1}
        color="white"
      >
        {/* Section Title */}
        <VStack spacing={6} marginBottom="40px" alignItems="start">
          <Text fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold">
            Minecraft Skin
          </Text>
        </VStack>

        {/* Minecraft Skin Viewer */}
        <HStack spacing={10} justifyContent="center">
          <ReactSkinview3d
            skinUrl="/assets/about/mc_skin.png"
            height={500}
            width={500}
            onReady={(instance) => {
              instance.viewer.camera.position.set(-140, 130, 100)
              instance.viewer.camera.lookAt(0, 0, 0)
            }}
            options={{
              fov: 10,
              animation: new WalkingAnimation(),
            }}
          />
        </HStack>
      </Box>
    </Box>
  )
}

export default MinecraftSkin
