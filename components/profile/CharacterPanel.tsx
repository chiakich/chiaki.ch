import { Box, Flex, styled } from 'styled-system/jsx'
import {
  animate,
  m,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useState, type CSSProperties } from 'react'
import Barcode from 'components/profile/Barcode'
import NtscImage from 'components/effects/NtscImage'
import { NTSC_SPRITE } from 'lib/ntsc/params'
import { ACCENT } from 'components/profile/theme'
import { useI18n } from 'i18n'

const Text = styled.p
const Span = styled.span
const Img = styled.img

const MotionBox = m.create(Box)

const PORTRAIT_ART = '/assets/profile/chiaki_v2_web.webp'
// The artwork's own alpha, reused as a mask for the grille that sits over it.
const PORTRAIT_MASK = `url(${PORTRAIT_ART})`

// The Live2D preset, with the head's snow pulled right down: the avatar plays
// behind a chat panel where specks read as tube noise, but here the artwork is
// the whole panel and the same density reads as dirt on the glass. Module-level
// so its identity is stable — NtscImage rebuilds its context when it changes.
const PORTRAIT_TAPE = { ...NTSC_SPRITE, snowChance: 0.000008 }

// Gain on the artwork, the knob worth hand-tuning. The tape's luma path comes
// out a touch darker than the source and the grille takes a little more off the
// top, so the panel is lifted back rather than left reading as a dim print.
const PORTRAIT_GAIN = 1.1

// How hard the projection grille reads. Its own gradient is already soft and
// faint; this is the knob for the whole layer.
const GRILLE_STRENGTH = 1

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
      overflow="hidden"
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
        fontWeight="black"
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
        {t('profilePage.characterPanel.name')}
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
          <Text fontWeight="black" fontSize="0.62rem" letterSpacing="0.18em" color="white">
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
        fontWeight="black"
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
            fontWeight="black"
            letterSpacing="0.22em"
            fontSize="0.68rem"
            px="3px"
            py={2}
            whiteSpace="nowrap"
            style={{ writingMode: 'vertical-rl' }}
          >
            {t('profilePage.characterPanel.name')}
          </Box>
          <Text
            fontWeight="black"
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
              fontWeight="regular"
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

      {/* The artwork plays back off a tape rather than being drawn directly —
          the sprite preset, since this is a drawing on transparency, same as
          the Live2D portrait. The box carries the pose; the canvas inside
          fills it, so it needs the artwork's aspect to size itself. */}
      <MotionBox
        position="absolute"
        bottom="0"
        left="50%"
        height={{ base: '64vh', lg: '88%' }}
        aspectRatio="1012 / 1800"
        maxWidth="none"
        zIndex={1}
        filter="brightness(var(--portrait-gain)) drop-shadow(0 0 40px #ff782930)"
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
        style={
          {
            translateX: floatX,
            translateY: floatY,
            '--portrait-gain': PORTRAIT_GAIN,
            '--grille-strength': GRILLE_STRENGTH,
          } as CSSProperties
        }
      >
        <Box position="relative" width="100%" height="100%">
          <NtscImage
            src={PORTRAIT_ART}
            alt={t('profilePage.characterPanel.alt')}
            params={PORTRAIT_TAPE}
            fit="contain"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Masked by the artwork's own alpha, so the grille sits on her and
              not on a rectangle around her. Same source and the same contain
              fit as the canvas below, so the two line up exactly. */}
          <Box
            position="absolute"
            inset="0"
            pointerEvents="none"
            aria-hidden
            overflow="hidden"
            maskImage={PORTRAIT_MASK}
            maskSize="contain"
            maskRepeat="no-repeat"
            maskPosition="center"
          >
            {/* Soft-edged rather than a 1px band of solid colour. A hard edge
                here was the most acute thing on screen — sharper than anything
                the tape itself produces — which is what made a grille this
                faint still read as stripes laid over her. The period is in CSS
                pixels either way, so a phone at 3x gets a coarser one against a
                narrower figure, hence the lighter base. */}
            <Box
              position="absolute"
              inset="0"
              backgroundImage="repeating-linear-gradient(180deg, rgba(6,18,26,.34) 0px, rgba(6,18,26,0) 1.6px, rgba(6,18,26,0) 3px)"
              mixBlendMode="multiply"
              opacity={{
                base: 'calc(var(--grille-strength) * .7)',
                md: 'var(--grille-strength)',
              }}
            />
            {/* The refresh line the panel is currently drawing, and the only
                tint left over her. A static orange-to-cyan wash used to sit
                here for the projection look, but an 18% screen layer across the
                middle of a figure rewrites the artwork's own colour
                relationships rather than reading as a display. */}
            <Box
              position="absolute"
              left="0"
              right="0"
              height="22%"
              background="linear-gradient(180deg, transparent, rgba(236,248,255,.12) 50%, transparent)"
              animation="projectionSweep 6.5s linear infinite"
            />
          </Box>
        </Box>
      </MotionBox>

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
