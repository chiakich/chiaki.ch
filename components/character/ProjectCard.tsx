import React, { useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Button,
  Link,
  Wrap,
  WrapItem,
  useDisclosure,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import Lightbox from 'yet-another-react-lightbox'
import Download from 'yet-another-react-lightbox/plugins/download'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { Project } from 'utils/characterAssetsIndex'

interface ProjectCardProps {
  project: Project
  isHorizontal?: boolean
  showR18?: boolean
  ageConfirmed?: boolean
}

// Helper function to get thumbnail path
const getThumbnailPath = (
  imagePath: string,
  isFirstImage: boolean = false
): string => {
  // For first image, SVGs, or GIFs, return original path
  if (
    isFirstImage ||
    imagePath.toLowerCase().endsWith('.svg') ||
    imagePath.toLowerCase().endsWith('.gif')
  ) {
    return imagePath
  }

  const extension = imagePath.substring(imagePath.lastIndexOf('.'))
  const nameWithoutExt = imagePath.substring(0, imagePath.lastIndexOf('.'))
  const thumbnailPath = `${nameWithoutExt}_thumb.jpg`

  // Always return thumbnail path - the Image component will handle fallback
  // If thumbnail doesn't exist, the fallbackSrc will be used
  return thumbnailPath
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isHorizontal = false,
  showR18 = false,
  ageConfirmed = false,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [r18ConfirmImageIndex, setR18ConfirmImageIndex] = useState<number | null>(
    null
  )
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  // Show all images, but apply blur to R18 images when showR18 is false
  const displayImages = project.images

  // Prepare slides for lightbox (only include non-R18 or visible R18 images)
  const slides = displayImages
    .filter((image) => !image.r18 || showR18)
    .map((image) => ({
      src: image.path, // Always use original path for lightbox
      alt: `${project.title} - ${image.name}`,
      download: image.path,
    }))

  const handleImageClick = (imageIndex: number) => {
    const image = displayImages[imageIndex]

    // If it's an R18 image and user hasn't confirmed age, show confirmation dialog
    if (image.r18 && !ageConfirmed) {
      setR18ConfirmImageIndex(imageIndex)
      onOpen()
    } else if (!image.r18 || showR18) {
      // Find the index in the filtered slides array
      const slideIndex = slides.findIndex((slide) => slide.src === image.path)
      if (slideIndex !== -1) {
        setCurrentImageIndex(slideIndex)
        onOpen()
      }
    }
  }

  const handleR18Confirm = () => {
    localStorage.setItem('ageConfirmed', 'true')
    if (r18ConfirmImageIndex !== null) {
      const image = displayImages[r18ConfirmImageIndex]
      const slideIndex = slides.findIndex((slide) => slide.src === image.path)
      if (slideIndex !== -1) {
        setCurrentImageIndex(slideIndex)
      }
    }
    onClose()
  }

  // Helper function to get image style for R18 content
  const getImageStyle = (image: any) => {
    if (image.r18 && !showR18) {
      return {
        filter: 'blur(20px)',
        opacity: 0.6,
      }
    }
    return {}
  }

  if (isHorizontal) {
    return (
      <>
        <Box
          backgroundColor="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          borderRadius="12px"
          padding="20px"
          transition="all 0.3s ease"
          _hover={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-2px)',
          }}
          width="100%"
        >
          <Flex direction={{ base: 'column', md: 'row' }} gap={6} align="flex-start">
            {/* Left side: Project info */}
            <Box minWidth="200px" flex="0 0 auto">
              <Text fontSize="xl" fontWeight="bold" color="white" marginBottom="8px">
                {project.title}
              </Text>
              <VStack align="flex-start" spacing={2} marginBottom={4}>
                <Text fontSize="sm" color="gray.300">
                  作者：{project.author}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {project.date}
                </Text>
                {displayImages.length > 0 && (
                  <Text fontSize="xs" color="gray.500">
                    {displayImages.length} 張圖片
                    {displayImages.some((img) => img.r18) &&
                      !showR18 &&
                      ` (包含 ${
                        displayImages.filter((img) => img.r18).length
                      } 張 R18 內容)`}
                  </Text>
                )}
              </VStack>

              {/* Download Files */}
              {project.downloadFiles.length > 0 && (
                <Box>
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
                        >
                          {file.name}
                        </Button>
                      </Link>
                    ))}
                  </VStack>
                </Box>
              )}
            </Box>

            {/* Right side: Images */}
            {displayImages.length > 0 && (
              <Box flex="1" overflow="hidden">
                <Wrap spacing={3}>
                  {displayImages.map((image, index) => (
                    <WrapItem key={`${project.id}-${image.name}-${index}`}>
                      <Box
                        position="relative"
                        cursor="pointer"
                        transition="transform 0.2s ease"
                        _hover={{ transform: 'scale(1.05)' }}
                        onClick={() => handleImageClick(index)}
                        overflow="hidden" // Ensure blur effects don't overflow
                        borderRadius="8px"
                      >
                        <Image
                          src={getThumbnailPath(image.path, index === 0)}
                          alt={`${project.title} - ${image.name}`}
                          width={index === 0 ? '200px' : '100px'}
                          height={index === 0 ? '200px' : '100px'}
                          objectFit={index === 0 ? 'contain' : 'cover'}
                          borderRadius="8px"
                          border="1px solid rgba(255, 255, 255, 0.1)"
                          loading="lazy"
                          fallbackSrc={image.path}
                          style={getImageStyle(image)}
                        />

                        {/* R18 Badge */}
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

                        {/* Overlay hint */}
                        <Box
                          position="absolute"
                          top="0"
                          left="0"
                          right="0"
                          bottom="0"
                          backgroundColor="rgba(0, 0, 0, 0.7)"
                          borderRadius="8px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          opacity="0"
                          transition="opacity 0.2s ease"
                          _hover={{ opacity: 1 }}
                        >
                          <Text color="white" fontSize="xs" fontWeight="bold">
                            {image.r18 && !showR18 ? 'R18 Content' : 'Click to view'}
                          </Text>
                        </Box>
                      </Box>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
          </Flex>
        </Box>

        {/* R18 Confirmation Dialog */}
        <AlertDialog
          isOpen={isOpen && r18ConfirmImageIndex !== null}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent bg="gray.800" color="white">
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                成人內容確認
              </AlertDialogHeader>

              <AlertDialogBody>
                此內容包含成人內容，僅限18歲以上觀看。
                <br />
                您是否已滿18歲？
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  variant="ghost"
                  colorScheme="gray"
                >
                  取消
                </Button>
                <Button colorScheme="red" onClick={handleR18Confirm} ml={3}>
                  確認已滿18歲
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Lightbox */}
        <Lightbox
          open={isOpen && r18ConfirmImageIndex === null}
          close={onClose}
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

  // Original vertical card layout
  return (
    <>
      <Box
        backgroundColor="rgba(255, 255, 255, 0.05)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        borderRadius="12px"
        padding="20px"
        transition="all 0.3s ease"
        _hover={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transform: 'translateY(-4px)',
        }}
      >
        <VStack spacing={4} align="stretch">
          {/* Project Title and Author */}
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="white" marginBottom="4px">
              {project.title}
            </Text>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.300">
                作者：{project.author}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {project.date}
              </Text>
            </HStack>
          </Box>

          {/* Images Grid */}
          {displayImages.length > 0 && (
            <Box>
              <Wrap spacing={2}>
                {displayImages.map((image, index) => (
                  <WrapItem key={`${project.id}-${image.name}-${index}`}>
                    <Box
                      position="relative"
                      cursor="pointer"
                      transition="transform 0.2s ease"
                      _hover={{ transform: 'scale(1.05)' }}
                      onClick={() => handleImageClick(index)}
                      overflow="hidden" // Ensure blur effects don't overflow
                      borderRadius="8px"
                    >
                      <Image
                        src={getThumbnailPath(image.path, index === 0)}
                        alt={`${project.title} - ${image.name}`}
                        width={index === 0 ? '200px' : '120px'}
                        height={index === 0 ? '200px' : '120px'}
                        objectFit={index === 0 ? 'contain' : 'cover'}
                        borderRadius="8px"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                        loading="lazy"
                        fallbackSrc={image.path}
                        style={getImageStyle(image)}
                      />

                      {/* R18 Badge */}
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

                      {/* Overlay hint */}
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        backgroundColor="rgba(0, 0, 0, 0.7)"
                        borderRadius="8px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        opacity="0"
                        transition="opacity 0.2s ease"
                        _hover={{ opacity: 1 }}
                      >
                        <Text color="white" fontSize="xs" fontWeight="bold">
                          {image.r18 && !showR18 ? 'R18 Content' : 'Click to view'}
                        </Text>
                      </Box>
                    </Box>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}

          {/* Download Files */}
          {project.downloadFiles.length > 0 && (
            <Box>
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
                    >
                      {file.name}
                    </Button>
                  </Link>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>

      {/* R18 Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen && r18ConfirmImageIndex !== null}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800" color="white">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              成人內容確認
            </AlertDialogHeader>

            <AlertDialogBody>
              此內容包含成人內容，僅限18歲以上觀看。
              <br />
              您是否已滿18歲？
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                variant="ghost"
                colorScheme="gray"
              >
                取消
              </Button>
              <Button colorScheme="red" onClick={handleR18Confirm} ml={3}>
                確認已滿18歲
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Lightbox */}
      <Lightbox
        open={isOpen && r18ConfirmImageIndex === null}
        close={onClose}
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
