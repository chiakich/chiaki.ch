import React, { useState } from 'react'
import { Box, HStack, styled } from 'styled-system/jsx'
import { IconButton, useDisclosure } from 'components/ui/controls'
import { SearchIcon } from 'components/ui/icons'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

const Text = styled.p
const Image = styled.img

// Character concept art images
const conceptArts = [
  '/assets/story/character/concept-art/default.jpg',
  '/assets/story/character/concept-art/new-outfit.jpg',
  '/assets/story/character/concept-art/birthday-outfit.png',
]

const conceptTitles = ['設定圖', '新衣裝設定圖', '生日衣裝']

const slides = conceptArts.map((src, index) => ({
  src,
  alt: conceptTitles[index],
}))

const CharacterConceptArt: React.FC = () => {
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box
      w="100%"
      maxW="width.section"
      mx="auto"
      px={{ base: '20px', md: '40px', lg: '60px' }}
      pt="20px"
      pb="60px"
      position="relative"
      zIndex={1}
      color="black"
    >
      <Text
        fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
        fontWeight="bold"
        mb="20px"
      >
        設定圖集
      </Text>
      {/* Concept Art Gallery */}
      <Box>
        {/* Main Display Area */}
        <Box
          position="relative"
          mb="30px"
          borderRadius="16px"
          overflow="hidden"
          bg="rgba(245, 200, 161, 0.1)"
          border="2px solid rgba(223, 138, 66, 0.2)"
        >
          <Image
            src={conceptArts[currentConceptIndex]}
            alt={conceptTitles[currentConceptIndex]}
            w="100%"
            height={{ base: '300px', md: '650px' }}
            objectFit="contain"
            bg="rgba(255, 255, 255, 0.9)"
          />
          <IconButton
            aria-label="View full size"
            icon={<SearchIcon />}
            position="absolute"
            bottom="16px"
            right="16px"
            colorScheme="orange"
            variant="solid"
            onClick={() => {
              setCurrentConceptIndex(currentConceptIndex)
              onOpen()
            }}
            size="lg"
            borderRadius="full"
            bg="#df8a42"
            _hover={{ bg: '#c57835' }}
          />
        </Box>

        {/* Thumbnail Navigation */}
        <HStack gap={4} justify="center" flexWrap="wrap">
          {conceptArts.map((art, index) => (
            <Box
              key={art}
              position="relative"
              cursor="pointer"
              onClick={() => setCurrentConceptIndex(index)}
              transition="all 0.3s ease"
              _hover={{ transform: 'scale(1.05)' }}
            >
              <Box
                width={{ base: '80px', md: '100px', lg: '120px' }}
                height={{ base: '80px', md: '100px', lg: '120px' }}
                borderRadius="12px"
                overflow="hidden"
                border="3px solid"
                borderColor={
                  currentConceptIndex === index
                    ? '#df8a42'
                    : 'rgba(223, 138, 66, 0.3)'
                }
                bg="rgba(255, 255, 255, 0.9)"
              >
                <Image
                  src={art}
                  alt={conceptTitles[index]}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  objectPosition="center"
                />
              </Box>
              <Text
                fontSize="sm"
                textAlign="center"
                marginTop="8px"
                fontWeight={currentConceptIndex === index ? 'bold' : 'medium'}
                color={currentConceptIndex === index ? '#df8a42' : 'gray.600'}
              >
                {conceptTitles[index]}
              </Text>
            </Box>
          ))}
        </HStack>
      </Box>

      {/* Lightbox */}
      <Lightbox
        open={isOpen}
        close={onClose}
        slides={slides}
        index={currentConceptIndex}
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
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        }}
      />
    </Box>
  )
}

export default CharacterConceptArt
