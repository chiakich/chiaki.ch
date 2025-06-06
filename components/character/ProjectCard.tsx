import React, { useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Link,
  Grid,
  GridItem,
  useDisclosure,
  Flex,
  Avatar,
  Tooltip,
  Divider,
} from '@chakra-ui/react'
import { DownloadIcon, CalendarIcon, AtSignIcon } from '@chakra-ui/icons'
import Lightbox from 'yet-another-react-lightbox'
import Download from 'yet-another-react-lightbox/plugins/download'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { Project } from 'components/character/characterAssetsIndex'
import R18Dialog from './R18Dialog'
import { useR18Dialog } from './useR18Dialog'
import NextImage from 'next/image'

interface ProjectCardProps {
  project: Project
  showR18?: boolean
  ageConfirmed?: boolean
}

interface ImageType {
  path: string
  name: string
  r18?: boolean
  cropPosition?: 'top' | 'center'
  width?: number
  height?: number
}

interface SlideType {
  src: string
  alt: string
  download: string
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  showR18 = false,
  ageConfirmed = false,
}): React.ReactElement => {
  const { isOpen, imageIndex, cancelRef, openDialog, closeDialog, confirmDialog } =
    useR18Dialog()
  const {
    isOpen: isLightboxOpen,
    onOpen: openLightbox,
    onClose: closeLightbox,
  } = useDisclosure()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [localAgeConfirmed, setLocalAgeConfirmed] = useState(false)

  // Check localStorage on mount and update state
  React.useEffect(() => {
    const confirmed = localStorage.getItem('ageConfirmed') === 'true'
    setLocalAgeConfirmed(confirmed)
  }, [])

  // Use local state or props, prioritizing localStorage
  const isAgeConfirmed = localAgeConfirmed || ageConfirmed

  // Show all images, but apply blur to R18 images when showR18 is false
  const displayImages: ImageType[] = project.images

  // Prepare slides for lightbox (only include non-R18 or visible R18 images)
  const slides: SlideType[] = displayImages
    .filter((image: ImageType) => !image.r18 || showR18 || isAgeConfirmed)
    .map((image: ImageType) => ({
      src: image.path,
      alt: `${project.title} - ${image.name}`,
      download: image.path,
    }))

  const handleImageClick = (imageIndex: number): void => {
    const image = displayImages[imageIndex]
    if (image.r18 && !isAgeConfirmed) {
      openDialog(imageIndex)
    } else if (!image.r18 || showR18 || isAgeConfirmed) {
      const slideIndex = slides.findIndex(
        (slide: SlideType) => slide.src === image.path
      )
      if (slideIndex !== -1) {
        setCurrentImageIndex(slideIndex)
        openLightbox()
      }
    }
  }

  const handleR18Confirm = () => {
    localStorage.setItem('ageConfirmed', 'true')
    setLocalAgeConfirmed(true)

    if (imageIndex !== null) {
      const image = displayImages[imageIndex]
      closeDialog()

      // Use setTimeout to ensure state updates and dialog closes before lightbox opens
      setTimeout(() => {
        // Recalculate slides with updated age confirmation
        const updatedSlides = displayImages
          .filter((img: ImageType) => !img.r18 || showR18 || true) // Now all R18 images are included
          .map((img: ImageType) => ({
            src: img.path,
            alt: `${project.title} - ${img.name}`,
            download: img.path,
          }))

        const slideIndex = updatedSlides.findIndex(
          (slide: SlideType) => slide.src === image.path
        )

        if (slideIndex !== -1) {
          setCurrentImageIndex(slideIndex)
          openLightbox()
        }
      }, 100)
    }
  }

  const getImageStyle = (image: ImageType): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      objectFit: 'cover',
      objectPosition: image.cropPosition === 'top' ? 'top' : 'center',
    }

    if (image.r18 && !showR18) {
      return {
        ...baseStyle,
        filter: 'blur(20px)',
        opacity: 0.6,
      }
    }
    return baseStyle
  }

  const renderImageGrid = (): React.ReactElement => {
    const images = displayImages
    const totalImages = images.length
    const layout = project.layout || 'horizontal'

    if (totalImages === 0) return <></>

    // Single image
    if (totalImages === 1) {
      return (
        <Box
          position="relative"
          cursor="pointer"
          onClick={() => handleImageClick(0)}
          overflow="hidden"
          borderRadius="12px"
          width="100%"
        >
          <NextImage
            src={images[0].path}
            alt={`${project.title} - ${images[0].name}`}
            width={images[0].width || 383}
            height={images[0].height || 510}
            style={{
              ...getImageStyle(images[0]),
              width: '100%',
              height: 'auto',
              borderRadius: '12px',
              imageRendering: project.isPixelArt ? 'pixelated' : 'auto',
            }}
          />
          {images[0].r18 && (
            <Box
              position="absolute"
              top="2px"
              right="2px"
              backgroundColor="red.500"
              color="white"
              fontSize="8px"
              fontWeight="bold"
              padding="2px 4px"
              borderRadius="4px"
              zIndex={2}
            >
              R18
            </Box>
          )}
        </Box>
      )
    }

    // Vertical layout: Left large image, right 2 small images, second shows +N
    if (layout === 'vertical') {
      return (
        <Flex direction="row" gap={2} align="stretch">
          {/* Large image */}
          <Box
            flexShrink={0}
            width="383px"
            height="510px"
            position="relative"
            cursor="pointer"
            onClick={() => handleImageClick(0)}
            overflow="hidden"
            borderRadius="12px"
          >
            <NextImage
              src={images[0].path}
              alt={`${project.title} - ${images[0].name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 510px"
              style={{
                ...getImageStyle(images[0]),
                borderRadius: '12px',
                imageRendering: project.isPixelArt ? 'pixelated' : 'auto',
              }}
            />
            {images[0].r18 && (
              <Box
                position="absolute"
                top="2px"
                right="2px"
                backgroundColor="red.500"
                color="white"
                fontSize="8px"
                fontWeight="bold"
                padding="2px 4px"
                borderRadius="4px"
                zIndex={2}
              >
                R18
              </Box>
            )}
          </Box>
          {/* Right side 2 small images */}
          <VStack spacing={2} flex={1} height="510px">
            {images.slice(1, 3).map((image, index) => (
              <Box
                key={`${project.id}-${image.name}-${index + 1}`}
                position="relative"
                cursor="pointer"
                onClick={() => handleImageClick(index + 1)}
                overflow="hidden"
                borderRadius="12px"
                width="100%"
                height="100%"
                flex={1}
                minHeight={0}
              >
                <NextImage
                  src={image.path}
                  alt={`${project.title} - ${image.name}`}
                  width={383}
                  height={510}
                  style={{
                    ...getImageStyle(image),
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    imageRendering: project.isPixelArt ? 'pixelated' : 'auto',
                  }}
                />
                {image.r18 && (
                  <Box
                    position="absolute"
                    top="2px"
                    right="2px"
                    backgroundColor="red.500"
                    color="white"
                    fontSize="8px"
                    fontWeight="bold"
                    padding="2px 4px"
                    borderRadius="4px"
                    zIndex={2}
                  >
                    R18
                  </Box>
                )}
                {/* Second image shows +N */}
                {index === 1 && totalImages > 3 && (
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    backgroundColor="rgba(0, 0, 0, 0.7)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="12px"
                  >
                    <Text color="white" fontSize="xl" fontWeight="bold">
                      +{totalImages - 3}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
          </VStack>
        </Flex>
      )
    }

    // All layout: Display all images, max 3 per row
    if (layout === 'all') {
      return (
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {images.map((image, index) => (
            <Box
              key={`${project.id}-${image.name}-${index}`}
              position="relative"
              cursor="pointer"
              onClick={() => handleImageClick(index)}
              overflow="hidden"
              borderRadius="12px"
              flex={1}
              minWidth={0}
              minHeight={0}
            >
              <NextImage
                src={image.path}
                alt={`${project.title} - ${image.name}`}
                width={383}
                height={170}
                style={{
                  ...getImageStyle(image),
                  borderRadius: '12px',
                  imageRendering: project.isPixelArt ? 'pixelated' : 'auto',
                }}
              />
              {image.r18 && (
                <Box
                  position="absolute"
                  top="2px"
                  right="2px"
                  backgroundColor="red.500"
                  color="white"
                  fontSize="8px"
                  fontWeight="bold"
                  padding="2px 4px"
                  borderRadius="4px"
                  zIndex={2}
                >
                  R18
                </Box>
              )}
            </Box>
          ))}
        </Grid>
      )
    }

    // Horizontal layout (default): Top large image, bottom max 3 small images, third shows +N
    return (
      <Grid templateRows="auto 1fr" gap={2}>
        {/* Large image on top */}
        <GridItem>
          <Box
            position="relative"
            cursor="pointer"
            onClick={() => handleImageClick(0)}
            overflow="hidden"
            borderRadius="12px"
            width="100%"
            height="400px"
          >
            <NextImage
              src={images[0].path}
              alt={`${project.title} - ${images[0].name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              style={{
                ...getImageStyle(images[0]),
                borderRadius: '12px',
              }}
            />
            {images[0].r18 && (
              <Box
                position="absolute"
                top="2px"
                right="2px"
                backgroundColor="red.500"
                color="white"
                fontSize="8px"
                fontWeight="bold"
                padding="2px 4px"
                borderRadius="4px"
                zIndex={2}
              >
                R18
              </Box>
            )}
          </Box>
        </GridItem>
        {/* Bottom small images */}
        <GridItem>
          <Grid
            templateColumns={`repeat(${Math.min(totalImages - 1, 3)}, 1fr)`}
            gap={1}
          >
            {images.slice(1, 4).map((image, index) => (
              <Box
                key={`${project.id}-${image.name}-${index + 1}`}
                position="relative"
                cursor="pointer"
                onClick={() => handleImageClick(index + 1)}
                overflow="hidden"
                borderRadius="12px"
                width="100%"
                height={images.length > 3 ? '170px' : '430px'}
              >
                <NextImage
                  src={image.path}
                  alt={`${project.title} - ${image.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 510px"
                  style={{
                    ...getImageStyle(image),
                    borderRadius: '12px',
                    imageRendering: project.isPixelArt ? 'pixelated' : 'auto',
                  }}
                />
                {image.r18 && (
                  <Box
                    position="absolute"
                    top="2px"
                    right="2px"
                    backgroundColor="red.500"
                    color="white"
                    fontSize="8px"
                    fontWeight="bold"
                    padding="2px 4px"
                    borderRadius="4px"
                    zIndex={2}
                  >
                    R18
                  </Box>
                )}
                {/* Third image shows +N */}
                {index === 2 && totalImages > 4 && (
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    backgroundColor="rgba(0, 0, 0, 0.7)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="12px"
                  >
                    <Text color="white" fontSize="xl" fontWeight="bold">
                      +{totalImages - 4}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
          </Grid>
        </GridItem>
      </Grid>
    )
  }

  const renderProjectContent = (): React.ReactElement => (
    <Box
      backgroundColor="rgba(255, 255, 255, 0.05)"
      border="1px solid rgba(255, 255, 255, 0.1)"
      borderRadius="16px"
      overflow="hidden"
    >
      {/* Header */}
      <Flex p={4} gap={3} align="center">
        <Avatar
          name={project.author}
          size="md"
          bg="blue.500"
          color="white"
          icon={<AtSignIcon />}
        />
        <VStack align="start" spacing={0} flex={1}>
          <HStack>
            <Text fontWeight="bold" color="white">
              {project.author}
            </Text>
            <Text color="gray.400" fontSize="sm">
              @{project.author.toLowerCase().replace(/\s+/g, '')}
            </Text>
          </HStack>
          <HStack color="gray.400" fontSize="sm">
            <CalendarIcon />
            <Text>{project.date}</Text>
          </HStack>
        </VStack>
      </Flex>

      {/* Title */}
      <Box px={4} pb={2}>
        <Text fontSize="xl" fontWeight="bold" color="white">
          {project.title}
        </Text>
      </Box>

      {/* Images Grid */}
      {displayImages.length > 0 && (
        <Box p={4} pt={0}>
          {renderImageGrid()}
        </Box>
      )}

      {/* Download Files */}
      {project.downloadFiles.length > 0 && (
        <>
          <Divider borderColor="rgba(255, 255, 255, 0.1)" />
          <Box p={4}>
            <Text fontSize="sm" color="gray.300" marginBottom="8px">
              下載檔案：
            </Text>
            <VStack spacing={2} align="stretch">
              {project.downloadFiles.map((file, index) => (
                <Link
                  key={`${project.id}-${file.name}-${index}`}
                  href={file.path}
                  download={file.name}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    leftIcon={<DownloadIcon />}
                    width="100%"
                    justifyContent="flex-start"
                    fontSize="xs"
                    _hover={{
                      backgroundColor: 'blue.500',
                      color: 'white',
                    }}
                  >
                    {file.name}
                  </Button>
                </Link>
              ))}
            </VStack>
          </Box>
        </>
      )}

      {/* Footer Stats */}
      <Divider borderColor="rgba(255, 255, 255, 0.1)" />
      <Flex p={3} justify="space-between" color="gray.400" fontSize="sm">
        <HStack spacing={4}>
          <Tooltip label="圖片數量">
            <HStack>
              <Text>{displayImages.length} 張圖片</Text>
              {displayImages.some((img) => img.r18) && !showR18 && (
                <Text color="red.400">
                  ({displayImages.filter((img) => img.r18).length} 張 R18)
                </Text>
              )}
            </HStack>
          </Tooltip>
          <Tooltip label="下載檔案">
            <Text>{project.downloadFiles.length} 個檔案</Text>
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  )

  return (
    <>
      {renderProjectContent()}
      <R18Dialog
        isOpen={isOpen}
        onClose={closeDialog}
        onConfirm={handleR18Confirm}
        cancelRef={cancelRef}
      />
      <Lightbox
        open={isLightboxOpen && !isOpen}
        close={closeLightbox}
        slides={slides}
        index={currentImageIndex}
        plugins={[Download, Zoom]}
        animation={{ fade: 300, swipe: 200 }}
        controller={{ closeOnBackdropClick: true }}
        toolbar={{
          buttons: ['close'],
        }}
        render={{
          buttonPrev: slides.length <= 1 ? () => null : undefined,
          buttonNext: slides.length <= 1 ? () => null : undefined,
        }}
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
    </>
  )
}

export default ProjectCard
