import React, { useState } from 'react'
import { Box, Grid, GridItem, VStack, Flex, styled } from 'styled-system/jsx'
import { IconButton, useDisclosure } from 'components/ui/controls'
import { SearchIcon } from 'components/ui/icons'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { useI18n } from 'i18n'

const Text = styled.p
const Heading = styled.h1
const Image = styled.img

const CharacterIntroduction: React.FC = () => {
  const { t } = useI18n()
  // State for current character art
  const [currentArtIndex, setCurrentArtIndex] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const characterArts = [
    '/assets/story/character/gallery/portrait-1.png',
    '/assets/story/character/gallery/portrait-2.png',
    '/assets/story/character/gallery/portrait-3.png',
    '/assets/story/character/gallery/portrait-4.png',
    '/assets/story/character/gallery/portrait-5.png',
  ]

  const slides = characterArts.map((src) => ({
    src,
    alt: t('characterPage.artAlt'),
  }))

  const delicateWirePatternStyles = {
    background: `
      repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(100, 100, 100, 0.1) 50px, rgba(100, 100, 100, 0.1) 51px),
      repeating-linear-gradient(60deg, transparent, transparent 50px, rgba(100, 100, 100, 0.1) 50px, rgba(100, 100, 100, 0.1) 51px),
      repeating-linear-gradient(120deg, transparent, transparent 50px, rgba(100, 100, 100, 0.1) 50px, rgba(100, 100, 100, 0.1) 51px)
    `,
    backgroundSize: '100% 100%',
  }

  return (
    <Grid
      gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
      gap={{ base: 8, md: 12 }}
      w="100%"
      maxW="width.section"
      mx="auto"
      px={{ base: '20px', md: '40px', lg: '60px' }}
      py="40px"
      color="black"
      position="relative"
      zIndex={1}
    >
      {/* Left Column - Character Introduction */}
      <GridItem my={{ base: '10px', md: '150px' }}>
        <VStack gap={4} alignItems="start">
          <Heading
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
            fontWeight="bold"
            mb="20px"
          >
            {t('characterPage.name')}
          </Heading>
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            lineHeight="1.8"
            fontWeight="medium"
          >
            {t('characterPage.greeting')}
          </Text>
          <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.8" opacity={0.9}>
            {t('characterPage.description').split('\n').map((line, index) => (
              <React.Fragment key={line}>
                {index > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </Text>
          <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.8" opacity={0.9}>
            {t('characterPage.birthday')}
          </Text>
          <Image
            src="/assets/story/character/signature-animated.svg"
            alt={t('characterPage.signatureAlt')}
            w="50%"
            mt="20px"
            alignSelf="flex-end"
            transform="rotate(4deg)"
          />
        </VStack>
      </GridItem>

      {/* Right Column - Character Art Display */}
      <GridItem>
        <Flex gap={6}>
          {/* Main Image Display */}
          <Box
            position="relative"
            flex="1"
            height={{ base: '60vh', md: '70vh' }}
            overflow="hidden"
          >
            <Image
              src={characterArts[currentArtIndex]}
              alt={`${t('characterPage.artAlt')} ${currentArtIndex + 1}`}
              w="100%"
              h="100%"
              objectFit="contain"
            />
            <IconButton
              aria-label={t('characterPage.viewFullSize')}
              icon={<SearchIcon />}
              position="absolute"
              bottom="16px"
              right="16px"
              colorScheme="blackAlpha"
              variant="solid"
              onClick={onOpen}
              size="lg"
              borderRadius="full"
            />
          </Box>

          {/* Thumbnails */}
          <VStack
            gap={3}
            w={{ base: '60px', md: '80px' }}
            my={{ base: '10px', md: '50px' }}
          >
            {characterArts.map((art, index) => (
              <Box
                key={art}
                w={{ base: '50px', md: '70px' }}
                h={{ base: '50px', md: '70px' }}
                borderRadius="full"
                overflow="hidden"
                cursor="pointer"
                border="2px solid"
                borderColor={currentArtIndex === index ? '#df8a42' : '#f5c8a1'}
                transition="all 0.2s"
                backdropFilter="blur(10px)"
                onClick={() => setCurrentArtIndex(index)}
              >
                <Image
                  src={art}
                  alt={`${t('characterPage.thumbnailAlt')} ${index + 1}`}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  objectPosition="top"
                />
              </Box>
            ))}
          </VStack>
        </Flex>

        {/* Lightbox */}
        <Lightbox
          open={isOpen}
          close={onClose}
          slides={slides}
          index={currentArtIndex}
          plugins={[Zoom]}
          animation={{ fade: 300, swipe: 200 }}
          controller={{ closeOnBackdropClick: true }}
          carousel={{ finite: true }}
          zoom={{
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
            doubleClickMaxStops: 2,
            keyboardMoveDistance: 50,
            wheelZoomDistanceFactor: 100,
          }}
        />
      </GridItem>
    </Grid>
  )
}

export default CharacterIntroduction
