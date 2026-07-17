import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Box, Center, styled } from 'styled-system/jsx'
import { Spinner } from 'components/ui/controls'
import { useI18n } from 'i18n'

const Text = styled.p

// Dynamically import the Live2D model component with no SSR
const Loading = () => {
  const { t } = useI18n()
  return (
    <Box width={{ base: '95vw', md: '60vw', lg: '400px' }} height={{ base: '80vh', md: '70vh', lg: '600px' }} display="flex" flexDirection="column" alignItems="center" justifyContent="center" backgroundColor="transparent">
      <Spinner color="gray.400" />
      <Text marginTop={4} color="gray.500">{t('characterPage.loading')}</Text>
    </Box>
  )
}

const Live2DModelClient = dynamic(() => import('./Live2DModelClient'), {
  ssr: false,
  loading: Loading,
})

interface Live2DModelProps {
  width?: number
  height?: number
}

const Live2DModel: React.FC<Live2DModelProps> = ({ width, height }) => {
  const [isClient, setIsClient] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Box
        width={{ base: '95vw', md: '60vw', lg: width || '400px' }}
        height={{ base: '80vh', md: '70vh', lg: height || '600px' }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        backgroundColor="transparent"
      >
        <Spinner color="gray.400" />
        <Text marginTop={4} color="gray.500">
          {t('characterPage.initializing')}
        </Text>
      </Box>
    )
  }

  return (
    <>
      <Box maxWidth="width.section" margin="0 auto" position="relative">
        <Text
          color="white"
          marginX={{ base: '20px', md: '40px', lg: '60px' }}
          fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
          fontWeight="bold"
        >
          Live2D
        </Text>
        <Text
          color="white"
          marginX={{ base: '20px', md: '40px', lg: '60px' }}
          fontSize="14px"
        >
          {t('characterPage.live2dDescription')}
        </Text>
      </Box>
      <Center>
        <Live2DModelClient width={width} height={height} />
      </Center>
    </>
  )
}

export default Live2DModel
