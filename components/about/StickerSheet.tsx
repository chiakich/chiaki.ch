import { motion, useMotionValue } from 'framer-motion'
import { useRef, useState } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'

const Text = styled.p

const MotionBox = motion(Box)

const STICKER_SCALE = 0.8
const PAN_LIMIT_X = 560
const PAN_LIMIT_Y = 420
const IMAGE_OUTLINE_PADDING = 8

type StickerBase = {
  id: string
  title: string
  description: string
  // Pixel offset from the center of the map. (0, 0) is the map origin.
  x: number
  y: number
  rotation: number
}

type TextSticker = StickerBase & {
  kind: 'text'
  label: string
  sub?: string
  bg: string
  color: string
  shape: 'skew' | 'pill' | 'circle'
}

type ImageSticker = StickerBase & {
  kind: 'image'
  src: string
  size: number
  round?: boolean
}

type Sticker = TextSticker | ImageSticker

// Fixed layout — arranged around the map origin like a real sticker wall.
const stickers: Sticker[] = [
  {
    id:'oorai',
    kind: 'image',
    src: '/assets/about/stickers/oorai.avif',
    size: 150,
    title: 'Proud supporter of 大洗女子学園',
    description: '超級喜歡少女與戰車，大洗已經變成比老家還熟悉的小鎮了。海樂祭、八朔祭，冬天跟夏天都去過了！',
    x: 0,
    y: 0,
    rotation: 8,
  },
  {
    id:'React',
    kind: 'image',
    src: 'https://raw.githubusercontent.com/facebook/react/main/fixtures/dom/public/react-logo.svg',
    size: 100,
    title: 'React',
    description: 'React 是我最常用的前端框架，從 2015 年開始就一直在使用。而且他餵飽了我。我愛 React。',
    x: 150,
    y: 150,
    rotation: 0,
  },
  {
    id:'clip',
    kind: 'image',
    src: '/assets/about/stickers/clip.png',
    size: 100,
    title: 'Clip Studio Paint',
    description: 'Clip Studio Paint 是我最常用的繪圖軟體！',
    x: -150,
    y: 150,
    rotation: -5,
  }
]

const StickerFace = ({ sticker }: { sticker: Sticker }) => {
  if (sticker.kind === 'image') {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="visible"
        style={{
          width: sticker.size + IMAGE_OUTLINE_PADDING * 2,
          height: sticker.size + IMAGE_OUTLINE_PADDING * 2,
        }}
      >
        <styled.img
          src={sticker.src}
          alt={sticker.title}
          style={{
            filter:
              'drop-shadow(2px 0 white) drop-shadow(-2px 0 white) drop-shadow(0 2px white) drop-shadow(0 -2px white) drop-shadow(1.5px 1.5px white) drop-shadow(-1.5px 1.5px white) drop-shadow(1.5px -1.5px white) drop-shadow(-1.5px -1.5px white) drop-shadow(0 6px 10px rgba(0,0,0,0.5))',
          }}
          objectFit="cover"
          display="block"
          borderRadius={sticker.round ? 'full' : undefined}
          draggable={false}
        />
      </Box>
    )
  }

  const isCircle = sticker.shape === 'circle'
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor={sticker.bg}
      color={sticker.color}
      px={isCircle ? 0 : { base: 3, md: 4 }}
      py={isCircle ? 0 : 2}
      width={isCircle ? { base: '76px', md: '92px' } : 'auto'}
      height={isCircle ? { base: '76px', md: '92px' } : 'auto'}
      borderRadius={sticker.shape === 'skew' ? '2px' : 'full'}
      transform={sticker.shape === 'skew' ? 'skewX(-8deg)' : undefined}
      border="3px solid white"
      boxShadow="0 6px 12px rgba(0,0,0,0.5)"
      textAlign="center"
    >
      <Box transform={sticker.shape === 'skew' ? 'skewX(8deg)' : undefined}>
        <Text
          fontWeight="900"
          fontSize={{ base: isCircle ? 'sm' : 'md', md: isCircle ? 'md' : 'xl' }}
          lineHeight="1.1"
          whiteSpace="nowrap"
        >
          {sticker.label}
        </Text>
        {sticker.sub && (
          <Text
            fontFamily="mono"
            fontSize="9px"
            letterSpacing="0.12em"
            opacity={0.7}
            mt="2px"
            whiteSpace="nowrap"
          >
            {sticker.sub}
          </Text>
        )}
      </Box>
    </Flex>
  )
}

const StickerSheet = () => {
  const panStart = useRef<{ x: number; y: number; mapX: number; mapY: number } | null>(null)
  const hasDragged = useRef(false)
  const [hoveredSticker, setHoveredSticker] = useState<string | null>(null)
  const [tappedSticker, setTappedSticker] = useState<string | null>(null)
  const mapX = useMotionValue(0)
  const mapY = useMotionValue(0)

  return (
    <Box width="100%" height="100vh">
      <Box
        position="relative"
        width="100%"
        height="100vh"
        overflow="hidden"
        cursor="grab"
        userSelect="none"
        style={{ touchAction: 'none' }}
        onPointerDown={(evt: React.PointerEvent<HTMLDivElement>) => {
          if (evt.button !== 0) return
          panStart.current = {
            x: evt.clientX,
            y: evt.clientY,
            mapX: mapX.get(),
            mapY: mapY.get(),
          }
          hasDragged.current = false
        }}
        onPointerMove={(evt: React.PointerEvent<HTMLDivElement>) => {
          if (!panStart.current) return
          const dx = evt.clientX - panStart.current.x
          const dy = evt.clientY - panStart.current.y
          hasDragged.current ||= Math.abs(dx) > 8 || Math.abs(dy) > 8
          mapX.set(Math.min(PAN_LIMIT_X, Math.max(-PAN_LIMIT_X, panStart.current.mapX + dx)))
          mapY.set(Math.min(PAN_LIMIT_Y, Math.max(-PAN_LIMIT_Y, panStart.current.mapY + dy)))
        }}
        onPointerUp={() => {
          panStart.current = null
        }}
        onPointerCancel={() => {
          panStart.current = null
        }}
      >
        <Text
          position="absolute"
          bottom={2}
          right={4}
          fontFamily="mono"
          fontSize="xs"
          letterSpacing="0.25em"
          color="#333"
          userSelect="none"
          pointerEvents="none"
          zIndex={30}
        >
          STICKER MAP // DRAG TO EXPLORE
        </Text>

        <MotionBox
          position="absolute"
          top="50%"
          left="50%"
          width="1px"
          height="1px"
          style={{ x: mapX, y: mapY }}
        >
          {stickers.map((sticker, i) => {
            const isTooltipVisible = hoveredSticker === sticker.id || tappedSticker === sticker.id
            const tooltipId = `sticker-${sticker.id}-description`
            return (
              <Box
                key={sticker.id}
                position="absolute"
                style={{
                  left: sticker.x,
                  top: sticker.y,
                  transform: `translate(-50%, -50%) scale(${STICKER_SCALE})`,
                }}
                zIndex={isTooltipVisible ? 20 : 10}
              >
                <MotionBox
                  as="button"
                  aria-describedby={tooltipId}
                  aria-label={sticker.title}
                  initial={{
                    scale: 1.35,
                    rotate: sticker.rotation,
                  }}
                  whileInView={{
                    scale: 1,
                    rotate: sticker.rotation,
                  }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  cursor="pointer"
                  onHoverStart={() => setHoveredSticker(sticker.id)}
                  onHoverEnd={() => setHoveredSticker(null)}
                  onFocus={() => setHoveredSticker(sticker.id)}
                  onBlur={() => setHoveredSticker(null)}
                  onPointerUp={(evt: React.PointerEvent<HTMLDivElement>) => {
                    if (evt.pointerType !== 'touch' || hasDragged.current) return
                    setTappedSticker((current) => current === sticker.id ? null : sticker.id)
                  }}
                >
                  <StickerFace sticker={sticker} />
                </MotionBox>
                <MotionBox
                  id={tooltipId}
                  position="absolute"
                  left="50%"
                  top="calc(100% + 12px)"
                  width="max-content"
                  maxWidth="min(260px, 70vw)"
                  px={3}
                  py={2}
                  backgroundColor="rgba(17,17,17,0.92)"
                  border="1px solid #ffffff33"
                  borderRadius="sm"
                  color="white"
                  fontSize="md"
                  lineHeight="1.5"
                  textAlign="left"
                  pointerEvents="none"
                  style={{ translateX: '-50%' }}
                  initial={false}
                  animate={isTooltipVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                >
                  <Text fontWeight="bold" mb={1}>{sticker.title}</Text>
                  <Text opacity={0.78}>{sticker.description}</Text>
                </MotionBox>
              </Box>
            )
          })}
        </MotionBox>
      </Box>
    </Box>
  )
}

export default StickerSheet
