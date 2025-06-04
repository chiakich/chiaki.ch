import React, { useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Button,
  Link,
  Grid,
  GridItem,
  useDisclosure,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
} from '@chakra-ui/react'
import { DownloadIcon, CalendarIcon, AtSignIcon } from '@chakra-ui/icons'
import Lightbox from 'yet-another-react-lightbox'
import Download from 'yet-another-react-lightbox/plugins/download'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { Project } from 'utils/characterAssetsIndex'
import R18Dialog from './R18Dialog'
import { useR18Dialog } from './useR18Dialog'

interface ProjectCardProps {
  project: Project
  isHorizontal?: boolean
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

// Helper function to get thumbnail path
const getThumbnailPath = (imagePath: string, isLarge: boolean = false): string => {
  // For SVGs, GIFs，直接用原圖
  if (
    imagePath.toLowerCase().endsWith('.svg') ||
    imagePath.toLowerCase().endsWith('.gif')
  ) {
    return imagePath
  }
  const nameWithoutExt = imagePath.substring(0, imagePath.lastIndexOf('.'))
  const thumbType = isLarge ? '_thumb_large' : '_thumb_small'
  const thumbnailPath = `${nameWithoutExt}${thumbType}.jpg`
  return thumbnailPath
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isHorizontal = false,
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
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({})

  // Show all images, but apply blur to R18 images when showR18 is false
  const displayImages: ImageType[] = project.images

  // Prepare slides for lightbox (only include non-R18 or visible R18 images)
  const slides: SlideType[] = displayImages
    .filter((image: ImageType) => !image.r18 || showR18)
    .map((image: ImageType) => ({
      src: image.path,
      alt: `${project.title} - ${image.name}`,
      download: image.path,
    }))

  const handleImageClick = (imageIndex: number): void => {
    const image = displayImages[imageIndex]
    if (image.r18 && !ageConfirmed) {
      openDialog(imageIndex)
    } else if (!image.r18 || showR18) {
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
    if (imageIndex !== null) {
      const image = displayImages[imageIndex]
      const slideIndex = slides.findIndex(
        (slide: SlideType) => slide.src === image.path
      )
      if (slideIndex !== -1) {
        setCurrentImageIndex(slideIndex)
        closeDialog()
        openLightbox()
      }
    }
  }

  // Add image load handler
  const handleImageLoad = (
    imagePath: string,
    event: React.SyntheticEvent<HTMLImageElement>
  ) => {
    const img = event.target as HTMLImageElement
    setImageDimensions((prev) => ({
      ...prev,
      [imagePath]: {
        width: img.naturalWidth,
        height: img.naturalHeight,
      },
    }))
  }

  const isLandscape = (imagePath: string): boolean => {
    const dimensions = imageDimensions[imagePath]
    if (!dimensions) return false
    return dimensions.width >= dimensions.height
  }

  const getImageStyle = (
    image: ImageType,
    index: number,
    totalImages: number
  ): React.CSSProperties => {
    const isLandscapeImage = isLandscape(image.path)

    // First image with special handling for landscape
    if (index === 0) {
      if (isLandscapeImage) {
        // For landscape images, use full width and auto height
        const baseStyle: React.CSSProperties = {
          width: '100%',
          height: 'auto',
          maxHeight: '510px',
          objectFit: 'contain',
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

      // For portrait images, use fixed dimensions
      const baseStyle: React.CSSProperties = {
        width: '383px',
        height: '510px',
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

    // For other images
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: isLandscapeImage ? 'contain' : 'cover',
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

    // 單張圖，正確套用圓角
    if (totalImages === 1) {
      return (
        <Box
          position="relative"
          cursor="pointer"
          onClick={() => handleImageClick(0)}
          overflow="hidden"
          borderRadius="12px"
        >
          <Image
            src={getThumbnailPath(images[0].path, true)}
            alt={`${project.title} - ${images[0].name}`}
            loading="lazy"
            fallbackSrc={images[0].path}
            style={{
              ...getImageStyle(images[0], 0, totalImages),
              borderRadius: '12px',
            }}
            onLoad={(e) => handleImageLoad(images[0].path, e)}
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

    // vertical：左一大直圖，右2小圖，第二張顯示+N
    if (layout === 'vertical') {
      return (
        <Flex direction="row" gap={2} align="stretch">
          {/* 大圖 */}
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
            <Image
              src={getThumbnailPath(images[0].path, true)}
              alt={`${project.title} - ${images[0].name}`}
              loading="lazy"
              fallbackSrc={images[0].path}
              style={{
                ...getImageStyle(images[0], 0, totalImages),
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px',
              }}
              onLoad={(e) => handleImageLoad(images[0].path, e)}
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
          {/* 右側2小圖 */}
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
                <Image
                  src={getThumbnailPath(image.path, false)}
                  alt={`${project.title} - ${image.name}`}
                  loading="lazy"
                  fallbackSrc={image.path}
                  style={{
                    ...getImageStyle(image, index + 1, totalImages),
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                  onLoad={(e) => handleImageLoad(image.path, e)}
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
                {/* 第二張顯示+N */}
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

    // all：全部圖片都展示，每行最多3張
    if (layout === 'all') {
      const rows = []
      for (let i = 0; i < images.length; i += 3) {
        rows.push(images.slice(i, i + 3))
      }
      return (
        <VStack spacing={2} align="stretch">
          {rows.map((row, rowIndex) => (
            <HStack key={rowIndex} spacing={2} align="stretch">
              {row.map((image, colIndex) => (
                <Box
                  key={`${project.id}-${image.name}-${rowIndex * 3 + colIndex}`}
                  position="relative"
                  cursor="pointer"
                  onClick={() => handleImageClick(rowIndex * 3 + colIndex)}
                  overflow="hidden"
                  borderRadius="12px"
                  flex={1}
                  minWidth={0}
                  minHeight={0}
                >
                  <Image
                    src={getThumbnailPath(image.path, false)}
                    alt={`${project.title} - ${image.name}`}
                    loading="lazy"
                    fallbackSrc={image.path}
                    style={{
                      ...getImageStyle(image, rowIndex * 3 + colIndex, totalImages),
                      width: '100%',
                      height: '170px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                    onLoad={(e) => handleImageLoad(image.path, e)}
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
            </HStack>
          ))}
        </VStack>
      )
    }

    // horizontal：上大圖，下最多3小圖，第三張顯示+N
    // 預設
    return (
      <Grid templateRows="auto 1fr" gap={2}>
        {/* 大圖在上 */}
        <GridItem>
          <Box
            position="relative"
            cursor="pointer"
            onClick={() => handleImageClick(0)}
            overflow="hidden"
            borderRadius="12px"
          >
            <Image
              src={getThumbnailPath(images[0].path, true)}
              alt={`${project.title} - ${images[0].name}`}
              loading="lazy"
              fallbackSrc={images[0].path}
              style={{
                ...getImageStyle(images[0], 0, totalImages),
                width: '100%',
                borderRadius: '12px',
              }}
              onLoad={(e) => handleImageLoad(images[0].path, e)}
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
        {/* 下方三小圖 */}
        <GridItem>
          <Grid templateColumns="repeat(3, 1fr)" gap={1}>
            {images.slice(1, 4).map((image, index) => (
              <Box
                key={`${project.id}-${image.name}-${index + 1}`}
                position="relative"
                cursor="pointer"
                onClick={() => handleImageClick(index + 1)}
                overflow="hidden"
                borderRadius="12px"
                width="100%"
                height="170px"
              >
                <Image
                  src={getThumbnailPath(image.path, false)}
                  alt={`${project.title} - ${image.name}`}
                  loading="lazy"
                  fallbackSrc={image.path}
                  style={{
                    ...getImageStyle(image, index + 1, totalImages),
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                  onLoad={(e) => handleImageLoad(image.path, e)}
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
                {/* 第三張顯示+N */}
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
