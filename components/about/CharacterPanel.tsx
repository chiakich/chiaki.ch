import { Box, Flex, styled } from 'styled-system/jsx'
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Barcode from 'components/about/Barcode'
import { ACCENT } from 'components/about/theme'
import { useI18n } from 'i18n'

const Text = styled.p
const Span = styled.span
const Img = styled.img

const MotionBox = motion(Box)
const MotionImg = motion(styled.img)

// Sticky character visual styled as an acrylic authorization pass
const CharacterPanel = ({
  x,
  y,
}: {
  x: MotionValue<number>
  y: MotionValue<number>
}) => {
  const { t } = useI18n()
  const swayX = useMotionValue(0)
  const breatheY = useMotionValue(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current?.complete) setImageLoaded(true)
  }, [])

  useEffect(() => {
    const swayControls = animate(swayX, [-6, 6, -6], {
      duration: 7,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    })

    const breatheControls = animate(breatheY, [0, -2, 0], {
      duration: 5.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    })

    return () => {
      swayControls.stop()
      breatheControls.stop()
    }
  }, [swayX, breatheY])

  const floatX = useTransform(() => x.get() + swayX.get())
  const floatY = useTransform(() => y.get() + breatheY.get())

  const bgX = useTransform(floatX, (v: number) => v * -1.6)
  const bgY = useTransform(floatY, (v: number) => v * -1.6)

  // Cache-busted on mount so the draw animation replays on every visit
  const [sigSrc, setSigSrc] = useState('')
  useEffect(() => {
    setSigSrc(`/assets/story/character/signature-animated.svg?v=${Date.now()}`)
  }, [])

  return (
    <Box
      position="relative"
      width="100%"
      height={{ base: '68vh', lg: 'calc(100vh - 44px)' }}
    >
      {/* Slanted accent panel */}
      <MotionBox
        position="absolute"
        top="-5%"
        right="-5%"
        width="65%"
        height="115%"
        background="linear-gradient(200deg, #ff78292e 0%, #ff782908 65%, transparent 100%)"
        clipPath="polygon(28% 0, 100% 0, 100% 100%, 0 100%)"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Halftone dots */}
      <Box
        position="absolute"
        inset="0"
        backgroundImage="radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1.5px)"
        backgroundSize="22px 22px"
        maskImage="linear-gradient(115deg, transparent 30%, black 75%)"
      />

      {/* Outline name behind the character */}
      <MotionBox
        position="absolute"
        top="2%"
        right="2%"
        fontSize={{ base: '4rem', lg: '6.5rem' }}
        fontWeight="900"
        letterSpacing="0.02em"
        lineHeight="0.95"
        textTransform="uppercase"
        color="transparent"
        style={{
          x: bgX,
          y: bgY,
          WebkitTextStroke: `1px ${ACCENT}59`,
          writingMode: 'vertical-rl',
        }}
        whiteSpace="nowrap"
        userSelect="none"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {t('aboutPage.characterPanel.name')}
      </MotionBox>

      {/* Top-left strip: barcode + label */}
      <Flex
        position="absolute"
        top={{ base: '20px', lg: '26px' }}
        left={{ base: '24px', lg: '32px' }}
        alignItems="center"
        gap={2}
        zIndex={3}
        aria-hidden
      >
        <Barcode seed="SECURED-EQUIPMENT" width={52} height={16} />
        <Box>
          <Text fontWeight="900" fontSize="0.62rem" letterSpacing="0.18em" color="white">
            SECURED EQUIPMENT
          </Text>
          <Text fontFamily="mono" fontSize="0.5rem" letterSpacing="0.16em" opacity={0.5}>
            CHIAKI.CH - B101
          </Text>
        </Box>
      </Flex>

      {/* Warning chip */}
      <Flex
        position="absolute"
        top={{ base: '20px', lg: '26px' }}
        right={{ base: '24px', lg: '34px' }}
        zIndex={3}
        alignItems="center"
        gap={1}
        backgroundColor="#ffb400"
        color="black"
        px={2}
        py="2px"
        fontWeight="900"
        fontSize="0.55rem"
        letterSpacing="0.12em"
        clipPath="polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)"
        aria-hidden
      >
        ⚠ STAFF ONLY
      </Flex>

      {/* Right vertical authorization labels, pinned in place */}
      <MotionBox
        position="absolute"
        top={{ base: '48px', lg: '60px' }}
        right={{ base: '24px', lg: '34px' }}
        zIndex={3}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <Flex gap={2} alignItems="flex-start">
          <Box
            backgroundColor="white"
            color="black"
            fontWeight="900"
            letterSpacing="0.22em"
            fontSize="0.68rem"
            px="3px"
            py={2}
            whiteSpace="nowrap"
            style={{ writingMode: 'vertical-rl' }}
          >
            {t('aboutPage.characterPanel.name')}
          </Box>
          <Text
            fontWeight="900"
            fontSize={{ base: '1.05rem', lg: '1.25rem' }}
            letterSpacing="0.12em"
            lineHeight="1.1"
            color="white"
            whiteSpace="nowrap"
            textTransform="uppercase"
            style={{ writingMode: 'vertical-rl' }}
          >
            CHIAKI.CH
            <Span opacity={0.55} ml="0.4em">AUTHORIZATION CARD</Span>
            <Span
              fontFamily="mono"
              fontSize="0.5rem"
              fontWeight="normal"
              letterSpacing="0.14em"
              opacity={0.6}
              border="1px solid rgba(255,255,255,0.4)"
              px="2px"
              py={1}
              ml="0.6em"
            >
              R-2.6 version
            </Span>
          </Text>
        </Flex>
      </MotionBox>

      <MotionImg
        ref={imgRef}
        src="/assets/about/chiaki_v2_web.webp"
        alt={t('aboutPage.characterPanel.alt')}
        position="absolute"
        bottom="0"
        left="50%"
        height={{ base: '64vh', lg: '88%' }}
        maxWidth="none"
        zIndex={1}
        filter="drop-shadow(0 0 40px #ff782930)"
        onLoad={() => setImageLoaded(true)}
        initial={{
          clipPath: 'polygon(0 0, 18% 0, 0 100%, 0 100%)',
          opacity: 0,
          x: '-42%',
        }}
        animate={
          imageLoaded
            ? {
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                opacity: 1,
                x: '-50%',
              }
            : {
                clipPath: 'polygon(0 0, 18% 0, 0 100%, 0 100%)',
                opacity: 0,
                x: '-42%',
              }
        }
        transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ translateX: floatX, translateY: floatY }}
      />

      {/* Left vertical barcode over the artwork */}
      <Flex
        position="absolute"
        left={{ base: '22px', lg: '30px' }}
        bottom={{ base: '16%', lg: '64px' }}
        direction="column"
        alignItems="center"
        gap={2}
        zIndex={3}
        opacity={0.85}
        aria-hidden
      >
        <Barcode seed="CHIAKI-KZ26" vertical width={104} height={13} color="rgba(255,255,255,0.85)" />
        <Text
          fontFamily="mono"
          fontSize="0.5rem"
          letterSpacing="0.22em"
          color="rgba(255,255,255,0.7)"
          style={{ writingMode: 'vertical-rl' }}
        >
          CHIAKI.CH - KZ26
        </Text>
      </Flex>

      {/* Signature printed directly on the artwork; the SVG draws itself */}
      <Box
        position="absolute"
        right={{ base: '10px', lg: '20px' }}
        bottom={{ base: '0px', lg: '35px' }}
        zIndex={3}
        aria-hidden
      >
        {sigSrc && (
          <Img
            src={sigSrc}
            alt=""
            width={{ base: '130px', lg: '180px' }}
            filter="brightness(0) invert(1) drop-shadow(0 2px 10px rgba(0,0,0,0.5))"
            opacity={0.95}
            transform="rotate(4deg)"
          />
        )}
        <Text
          fontFamily="mono"
          fontSize="0.52rem"
          letterSpacing="0.2em"
          color="rgba(255,255,255,0.7)"
          mt={1}
          textAlign="right"
          textShadow="0 1px 6px rgba(0,0,0,0.6)"
        >
          Operator of chiaki.ch ✦✦✦
        </Text>
      </Box>

      {/* Blend the feet into the page bottom */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        height={{ base: '18%', lg: '16%' }}
        background="linear-gradient(transparent, black)"
        display='block'
        zIndex={2}
      />
    </Box>
  )
}

export default CharacterPanel
