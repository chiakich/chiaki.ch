import React, { useState } from 'react'
import {
  Box,
  Text,
  Grid,
  GridItem,
  VStack,
  Image,
  IconButton,
  HStack,
  useDisclosure,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

// Character concept art images
const conceptArts = [
  '/assets/about/concept1.jpg',
  '/assets/about/concept2.jpg',
  '/assets/about/concept3.png',
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
      width="100%"
      maxWidth="1200px"
      margin="0 auto"
      paddingX={{ base: '20px', md: '40px', lg: '60px' }}
      paddingTop="20px"
      paddingBottom="60px"
      position="relative"
      zIndex={1}
      color="black"
    >
      <Text
        fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
        fontWeight="bold"
        marginBottom="20px"
      >
        設定圖集
      </Text>
      {/* Concept Art Gallery */}
      <Box>
        {/* Main Display Area */}
        <Box
          position="relative"
          marginBottom="30px"
          borderRadius="16px"
          overflow="hidden"
          backgroundColor="rgba(245, 200, 161, 0.1)"
          border="2px solid rgba(223, 138, 66, 0.2)"
        >
          <Image
            src={conceptArts[currentConceptIndex]}
            alt={conceptTitles[currentConceptIndex]}
            width="100%"
            height={{ base: '300px', md: '650px' }}
            objectFit="contain"
            backgroundColor="rgba(255, 255, 255, 0.9)"
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
            backgroundColor="#df8a42"
            _hover={{ backgroundColor: '#c57835' }}
          />
        </Box>

        {/* Thumbnail Navigation */}
        <HStack spacing={4} justify="center" flexWrap="wrap">
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
                backgroundColor="rgba(255, 255, 255, 0.9)"
              >
                <Image
                  src={art}
                  alt={conceptTitles[index]}
                  width="100%"
                  height="100%"
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
