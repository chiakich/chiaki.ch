import React, { useEffect, useRef } from 'react'
import { Box, VStack, Center, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'

const Text = styled.p

const MinecraftSkin: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { t } = useI18n()

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
          viewer.loadSkin('/assets/story/character/minecraft-skin.png')

          // Set up controls
          viewer.controls.enableRotate = true
          viewer.controls.enableZoom = false
          viewer.controls.enablePan = false

          // set animation
          viewer.animation = new skinview3d.WalkingAnimation()

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
    <Box position="relative">
      <Box
        width="100%"
        maxWidth="width.section"
        margin="0 auto"
        paddingX={{ base: '20px', md: '40px', lg: '60px' }}
        position="relative"
        zIndex={1}
        color="white"
      >
        {/* Section Title */}
        <VStack gap={6} marginBottom="40px" alignItems="start">
          <Text fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold">
            {t('characterPage.minecraftHeading')}
          </Text>
        </VStack>

        {/* Minecraft Skin Viewer */}
        <Center width="100%" overflow="hidden">
          <canvas ref={canvasRef} width={500} height={500} />
        </Center>
      </Box>
    </Box>
  )
}

export default MinecraftSkin
