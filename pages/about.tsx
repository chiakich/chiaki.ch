import type { NextPage } from 'next'
import { Box, Flex, Grid, HStack, VStack, styled } from 'styled-system/jsx'
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from 'framer-motion'
import Image from 'next/image'
import NextLink from 'next/link'
import { useEffect, useRef, useState } from 'react'
import TopBar from 'components/TopBar'
import StickerSheet from 'components/about/StickerSheet'
import { useI18n } from 'i18n'

const Heading = styled.h2
const Text = styled.p
const List = styled.ul
const ListItem = styled.li
const Span = styled.span

const MotionBox = motion(Box)
const MotionImg = motion(styled.img)

const ACCENT = '#ff7829'
const ACCENT_SOFT = '#f5c8a1'

const interestIds = [
  'design', 'drawing', 'photo', 'model', 'doujin', 'cosplay', 'travel', 'coding', 'chill',
]

// Skewed P5-style tag + heading
const SectionTitle = ({
  en,
  children,
}: {
  en: string
  children: React.ReactNode
}) => (
  <Flex alignItems="center" gap={4} mb={5}>
    <Box
      backgroundColor={ACCENT}
      color="black"
      fontWeight="bold"
      fontSize="xs"
      letterSpacing="0.2em"
      px={3}
      py={1}
      transform="skewX(-12deg)"
      flexShrink={0}
    >
      <Box transform="skewX(12deg)">{en}</Box>
    </Box>
    <Heading
      as="h2"
      fontSize={{ base: 'xl', md: '2xl' }}
      fontWeight="bold"
      letterSpacing="0.05em"
    >
      {children}
    </Heading>
    <Box
      flex="1"
      height="1px"
      background={`linear-gradient(90deg, ${ACCENT}55, transparent)`}
    />
  </Flex>
)

const Section = ({
  en,
  title,
  children,
}: {
  en: string
  title: string
  children: React.ReactNode
}) => (
  <MotionBox
    width="100%"
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    <SectionTitle en={en}>{title}</SectionTitle>
    <Box fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" opacity={0.92}>
      {children}
    </Box>
  </MotionBox>
)

// Sticky character visual with wipe-in entrance and mouse parallax
const CharacterPanel = ({
  x,
  y,
}: {
  x: ReturnType<typeof useSpring>
  y: ReturnType<typeof useSpring>
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
        background={`linear-gradient(200deg, ${ACCENT}2e 0%, ${ACCENT}08 65%, transparent 100%)`}
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

      <MotionImg
        ref={imgRef}
        src="/assets/about/chiaki_v2_web.png"
        alt={t('aboutPage.characterPanel.alt')}
        position="absolute"
        bottom="0"
        left="50%"
        height={{ base: '64vh', lg: '88%' }}
        maxWidth="none"
        filter={`drop-shadow(0 0 40px ${ACCENT}30)`}
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

      {/* Blend the feet into the page bottom */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        height="18%"
        background="linear-gradient(transparent, black)"
        display={{ base: 'block', lg: 'none' }}
      />
    </Box>
  )
}

const About: NextPage = () => {
  const { t } = useI18n()
  const rootRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const x = useSpring(mouseX, { stiffness: 60, damping: 18 })
  const y = useSpring(mouseY, { stiffness: 60, damping: 18 })

  const { scrollYProgress } = useScroll()
  const barY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const interests = interestIds.map((id) => ({
    id,
    title: t(`aboutPage.interests.${id}.title`),
    en: t(`aboutPage.interests.${id}.tag`),
    description: t(`aboutPage.interests.${id}.description`),
  }))

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set((e.clientX / window.innerWidth - 0.5) * 14)
    mouseY.set((e.clientY / window.innerHeight - 0.5) * 10)
  }

  return (
    <Box
      ref={rootRef}
      backgroundColor="black"
      color="white"
      minHeight="100vh"
      overflowX="clip"
      onMouseMove={handleMouseMove}
    >
      <TopBar />

      {/* Decorative diagonal bars, parallax on scroll */}
      <MotionBox
        position="fixed"
        top="20%"
        left="-6%"
        width="46%"
        height="10px"
        background={`linear-gradient(90deg, ${ACCENT}66, transparent)`}
        transform="rotate(-18deg)"
        style={{ y: barY }}
        pointerEvents="none"
        zIndex={0}
      />
      <MotionBox
        position="fixed"
        top="65%"
        left="-10%"
        width="36%"
        height="4px"
        background={`linear-gradient(90deg, ${ACCENT}40, transparent)`}
        transform="rotate(-18deg)"
        style={{ y: barY }}
        pointerEvents="none"
        zIndex={0}
      />

      <Grid
        gridTemplateColumns={{
          base: '1fr',
          lg: 'minmax(0, 1fr) clamp(320px, 34vw, 440px)',
        }}
        gap={0}
        pt="44px"
        maxW="width.section"
        mx="auto"
        position="relative"
        zIndex={1}
      >
        {/* Mobile-first: character hero on top for small screens */}
        <Box display={{ base: 'block', lg: 'none' }} order={0}>
          <CharacterPanel x={x} y={y} />
        </Box>

        {/* Content column */}
        <Box
          order={{ base: 1, lg: 0 }}
          px={{ base: '24px', md: '48px' }}
          pt={{ base: 6, lg: 20 }}
          pb="80px"
        >
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            mb={14}
          >
            <HStack gap={4} mb={4} alignItems="center">
              <Box
                borderRadius="full"
                overflow="hidden"
                boxSize="64px"
                border={`2px solid ${ACCENT}`}
                flexShrink={0}
              >
                <Image
                  src="/assets/img/profile.jpg"
                  alt={t('aboutPage.header.profileAlt')}
                  width={64}
                  height={64}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </Box>
              <Text
                fontFamily="mono"
                fontSize={{ base: 'xs', md: 'sm' }}
                letterSpacing={{ base: '0.2em', md: '0.35em' }}
                color={ACCENT}
                fontWeight="bold"
              >
                {t('aboutPage.header.eyebrow')}
              </Text>
            </HStack>

            <Heading
              as="h1"
              fontSize={{ base: '3.5rem', md: '5.5rem' }}
              fontWeight="900"
              lineHeight="1.05"
              letterSpacing="-0.02em"
              mb={4}
            >
              {t('aboutPage.header.namePart1')}
              <Span position="relative" display="inline-block" mx="0.1em">
                <Span
                  position="absolute"
                  inset="0.05em -0.08em -0.02em"
                  backgroundColor={ACCENT}
                  transform="skewX(-8deg)"
                  zIndex={0}
                />
                <Span position="relative" zIndex={1} color="black">
                  {t('aboutPage.header.namePart2')}
                </Span>
              </Span>
            </Heading>

            {/* Hazard stripe, Endfield-style */}
            <Box
              width="180px"
              height="8px"
              mb={5}
              background={`repeating-linear-gradient(-45deg, ${ACCENT} 0 10px, transparent 10px 20px)`}
            />
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="medium"
              color={ACCENT_SOFT}
              mb={5}
            >
              {t('aboutPage.header.tagline')}
            </Text>
            <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" maxW="520px">
              {t('aboutPage.header.introLine1')}
              <br />
              {t('aboutPage.header.introLine2')}
            </Text>
          </MotionBox>

          <VStack gap={16} alignItems="start">
            <Section en={t('aboutPage.sections.nowPlaying.tag')} title={t('aboutPage.sections.nowPlaying.title')}>
              <List display="flex" flexDirection="column" gap={3} pl="1.5rem">
                <ListItem>
                  {t('aboutPage.sections.nowPlaying.item1')}
                </ListItem>
                <ListItem>
                  {t('aboutPage.sections.nowPlaying.item2')}
                </ListItem>
              </List>
            </Section>

            <Section en={t('aboutPage.sections.interests.tag')} title={t('aboutPage.sections.interests.title')}>
              <Grid columns={{ base: 1, md: 2 }} gap={4} mt={2}>
                {interests.map((item, i) => (
                  <MotionBox
                    key={item.id}
                    position="relative"
                    backgroundColor="#111"
                    border="1px solid #222"
                    clipPath="polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)"
                    px={5}
                    py={4}
                    overflow="hidden"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: 0.5,
                      delay: (i % 2) * 0.08,
                      ease: 'easeOut',
                    }}
                    _hover={{
                      borderColor: `${ACCENT}88`,
                      transform: 'translateY(-3px)',
                      '& .interest-en': { color: ACCENT, opacity: 0.9 },
                    }}
                    style={{
                      transition: 'transform 0.25s ease, border-color 0.25s ease',
                    }}
                  >
                    <Text
                      className="interest-en"
                      position="absolute"
                      top={2}
                      right={4}
                      fontSize="xs"
                      fontWeight="900"
                      letterSpacing="0.2em"
                      opacity={0.3}
                      style={{ transition: 'color 0.25s ease, opacity 0.25s ease' }}
                    >
                      {item.en}
                    </Text>
                    <Text
                      fontWeight="bold"
                      fontSize={{ base: 'md', md: 'lg' }}
                      mb={1}
                    >
                      <Span color={ACCENT} mr={2} fontSize="sm">
                        {String(i + 1).padStart(2, '0')}
                      </Span>
                      {item.title}
                    </Text>
                    <Text
                      fontSize={{ base: 'sm', md: 'md' }}
                      opacity={0.85}
                      lineHeight="1.8"
                    >
                      {item.description}
                    </Text>
                  </MotionBox>
                ))}
              </Grid>
            </Section>

            <Section en={t('aboutPage.sections.gettingAlong.tag')} title={t('aboutPage.sections.gettingAlong.title')}>
              <Text>
                {t('aboutPage.sections.gettingAlong.line1')}
                <br />
                {t('aboutPage.sections.gettingAlong.line2')}
                <br />
                {t('aboutPage.sections.gettingAlong.line3')}
              </Text>
            </Section>

            <Section en={t('aboutPage.sections.oneRequest.tag')} title={t('aboutPage.sections.oneRequest.title')}>
              <Text>
                {t('aboutPage.sections.oneRequest.line1')}
                <br />
                {t('aboutPage.sections.oneRequest.line2')}
                <br />
                {t('aboutPage.sections.oneRequest.line3')}
              </Text>
            </Section>

            <Section en={t('aboutPage.sections.contact.tag')} title={t('aboutPage.sections.contact.title')}>
              <Text>
                {t('aboutPage.sections.contact.textBefore')}{' '}
                <NextLink
                  href="/sns"
                  style={{ color: ACCENT, borderBottom: `1px solid ${ACCENT}66` }}
                >
                  {t('aboutPage.sections.contact.linkLabel')}
                </NextLink>
                {t('aboutPage.sections.contact.textAfter')}
              </Text>
            </Section>
          </VStack>
        </Box>

        {/* Desktop: sticky character on the right */}
        <Box
          display={{ base: 'none', lg: 'block' }}
          position="sticky"
          top="44px"
          height="calc(100vh - 44px)"
          alignSelf="start"
        >
          <CharacterPanel x={x} y={y} />
        </Box>
      </Grid>

      {/* Full-bleed sticker map, kept outside the two-column layout. */}
      <MotionBox
        width="100%"
        maxWidth="1800px"
        marginX="auto"
        pb="80px"
        aspectRatio={{ base: '1 / 2', md: '1.8' }}
        minWidth={0}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <StickerSheet />
      </MotionBox>

      {/* Footer strip */}
      <Box
        borderTop={`1px solid ${ACCENT}33`}
        py={4}
        position="relative"
        zIndex={1}
        backgroundColor="black"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={{ base: 3, md: 6 }}
        px={4}
      >
        <Box
          width={{ base: '32px', sm: '64px' }}
          height="6px"
          background={`repeating-linear-gradient(-45deg, ${ACCENT} 0 8px, transparent 8px 16px)`}
          flexShrink={0}
        />
        <Span
          fontFamily="mono"
          fontSize={{ base: 'xs', sm: 'sm' }}
          fontWeight="bold"
          letterSpacing={{ base: '0.15em', sm: '0.3em' }}
          color={`${ACCENT}cc`}
          textAlign="center"
          whiteSpace={{ base: 'normal', sm: 'nowrap' }}
        >
          {t('aboutPage.footer')}
        </Span>
        <Box
          width={{ base: '32px', sm: '64px' }}
          height="6px"
          background={`repeating-linear-gradient(-45deg, ${ACCENT} 0 8px, transparent 8px 16px)`}
          flexShrink={0}
        />
      </Box>
    </Box>
  )
}

export default About
