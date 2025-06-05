import React, { useEffect, useRef } from 'react'
import { Box, Text, VStack, Center } from '@chakra-ui/react'
import { WalkingAnimation } from 'skinview3d'

const MinecraftSkin: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Use dynamic import to avoid SSR issues
    if (typeof window !== 'undefined' && canvasRef.current) {
      import('skinview3d')
        .then((skinview3d) => {
          const canvas = canvasRef.current
          if (!canvas) return

          const viewer = new skinview3d.SkinViewer({
            canvas: canvas,
            width: 500,
            height: 500,
          })

          // Load the skin
          viewer.loadSkin('/assets/about/mc_skin.png')

          // Set up controls
          viewer.controls.enableRotate = true
          viewer.controls.enableZoom = true
          viewer.controls.enablePan = false

          // set animation
          viewer.animation = new WalkingAnimation()

          // Cleanup function
          return () => {
            viewer.dispose?.()
          }
        })
        .catch((error) => {
          console.error('Failed to load skinview3d:', error)
        })
    }
  }, [])

  return (
    <Box position="relative" paddingY="60px">
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
        <Center>
          <canvas ref={canvasRef} width={500} height={500} />
        </Center>
      </Box>
    </Box>
  )
}

export default MinecraftSkin
