import type { NextPage } from 'next'
import { Box, Flex, Grid, HStack, VStack, styled } from 'styled-system/jsx'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from 'framer-motion'
import Image from 'next/image'
import NextLink from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import Barcode from 'components/profile/Barcode'
import CharacterPanel from 'components/profile/CharacterPanel'
import InterestCard from 'components/profile/InterestCard'
import Section from 'components/profile/Section'
import { useI18n } from 'i18n'

const Heading = styled.h2
const Text = styled.p
const List = styled.ul
const ListItem = styled.li
const Span = styled.span

const MotionBox = motion.create(Box)
const StickerSheet = dynamic(() => import('components/profile/StickerSheet'), {
  ssr: false,
})

const DeferredStickerSheet = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsNearViewport(true)
        observer.disconnect()
      },
      { rootMargin: '200px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Box ref={containerRef} width="100%" height="100%">
      {isNearViewport && <StickerSheet />}
    </Box>
  )
}

const interestIds = [
  'design', 'drawing', 'photo', 'model', 'doujin', 'cosplay', 'travel', 'coding', 'chill',
]

const Profile: NextPage = () => {
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
    title: t(`profilePage.interests.${id}.title`),
    en: t(`profilePage.interests.${id}.tag`),
    description: t(`profilePage.interests.${id}.description`),
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
      position="relative"
      onMouseMove={handleMouseMove}
    >
      {/* Orange dot grid, same as the index society section */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        height="100vh"
        opacity=".2"
        backgroundImage="radial-gradient(rgba(244, 142, 44, .2) 1px, transparent 1px)"
        backgroundSize="18px 18px"
        maskImage="linear-gradient(to bottom, black 40%, transparent)"
        pointerEvents="none"
        zIndex={0}
        aria-hidden
      />

      {/* Decorative diagonal bars, parallax on scroll */}
      <MotionBox
        position="fixed"
        top="20%"
        left="-6%"
        width="46%"
        height="10px"
        background="linear-gradient(90deg, color-mix(in srgb, var(--colors-profile-accent) 40%, transparent), transparent)"
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
        background="linear-gradient(90deg, color-mix(in srgb, var(--colors-profile-accent) 25%, transparent), transparent)"
        transform="rotate(-18deg)"
        style={{ y: barY }}
        pointerEvents="none"
        zIndex={0}
      />

      {/* Left rail with serial markings, desktop only */}
      <Box
        position="fixed"
        left="8px"
        top="50%"
        transform="translateY(-50%)"
        zIndex={0}
        pointerEvents="none"
        display={{ base: 'none', xl: 'block' }}
        aria-hidden
      >
        <Text
          fontFamily="mono"
          fontSize="0.58rem"
          letterSpacing="0.35em"
          opacity={0.3}
          whiteSpace="nowrap"
          style={{ writingMode: 'vertical-rl' }}
        >
          CHIAKI.CH // 091145.18.163 ▸▸ WHATEVER YOU DESIGN, MAKE SURE IT&apos;s HAPPY ▸▸
        </Text>
      </Box>

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
          pt={{ base: 0, lg: 20 }}
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
                border="2px solid var(--colors-profile-accent)"
                flexShrink={0}
              >
                <Image
                  src="/assets/img/profile.webp"
                  alt={t('profilePage.header.profileAlt')}
                  width={64}
                  height={64}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </Box>
              <Text
                fontFamily="mono"
                fontSize={{ base: 'xs', md: 'sm' }}
                letterSpacing={{ base: '0.2em', md: '0.35em' }}
                color="profileAccent"
                fontWeight="bold"
              >
                {t('profilePage.header.eyebrow')}
              </Text>
              <Span color="profileAccent" fontWeight="black" letterSpacing="-0.05em" aria-hidden>
                ⟩⟩⟩
              </Span>
            </HStack>

            <Heading
              as="h1"
              fontSize={{ base: '3.5rem', md: '5.5rem' }}
              fontWeight="medium"
              lineHeight="1.05"
              letterSpacing="-0.02em"
              mb={4}
            >
              {t('profilePage.header.namePart1')}
              <Span position="relative" display="inline-block" mx="0.1em">
                {/* Offset outline echo */}
                <Span
                  position="absolute"
                  inset="0.05em -0.08em -0.02em"
                  border="2px solid color-mix(in srgb, var(--colors-profile-accent) 53%, transparent)"
                  transform="skewX(-6deg) translate(0.07em, 0.07em)"
                  clipPath="polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)"
                  zIndex={0}
                  aria-hidden
                />
                {/* Solid block with clipped corner and inner hairline */}
                <Span
                  position="absolute"
                  inset="0.05em -0.08em -0.02em"
                  backgroundColor="profileAccent"
                  transform="skewX(-6deg)"
                  clipPath="polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)"
                  outline="1px solid rgba(0,0,0,0.3)"
                  outlineOffset="-6px"
                  zIndex={0}
                />
                {/* Serial microtext on the block edge */}
                <Span
                  position="absolute"
                  bottom="0.02em"
                  left="0"
                  fontFamily="mono"
                  fontSize="0.6rem"
                  fontWeight="regular"
                  letterSpacing="0.18em"
                  lineHeight="1"
                  color="rgba(0,0,0,0.55)"
                  transform="skewX(-6deg)"
                  zIndex={1}
                  aria-hidden
                >
                  CK-02
                </Span>
                <Span position="relative" zIndex={1} color="black">
                  {t('profilePage.header.namePart2')}
                </Span>
              </Span>
            </Heading>

            {/* Barcode + serial, pass-card style */}
            <Flex alignItems="center" gap={4} mb={5} flexWrap="wrap">
              <Barcode seed="SUZUKAZE-CHIAKI" width={72} height={16} color="rgba(255,255,255,0.55)" />
              <Span
                fontFamily="mono"
                fontSize="0.6rem"
                letterSpacing="0.18em"
                opacity={0.5}
                whiteSpace="nowrap"
                aria-hidden
              >
                NO.091145.18.163 // R-2.6
              </Span>
            </Flex>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="regular"
              color="profileAccentSoft"
              mb={5}
            >
              {t('profilePage.header.tagline')}
            </Text>
            <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" maxW="520px">
              {t('profilePage.header.introLine1')}
              <br />
              {t('profilePage.header.introLine2')}
            </Text>
          </MotionBox>

          <VStack gap={16} alignItems="start">
            <Section en={t('profilePage.sections.nowPlaying.tag')} code="SEC.01" title={t('profilePage.sections.nowPlaying.title')}>
              <List display="flex" flexDirection="column" gap={3} pl="1.5rem">
                <ListItem>
                  {t('profilePage.sections.nowPlaying.item1')}
                </ListItem>
                <ListItem>
                  {t('profilePage.sections.nowPlaying.item2')}
                </ListItem>
              </List>
            </Section>

            <Section en={t('profilePage.sections.interests.tag')} code="SEC.02" title={t('profilePage.sections.interests.title')}>
              <Grid columns={{ base: 1, md: 2 }} gap={4} mt={2}>
                {interests.map((item, i) => (
                  <InterestCard
                    key={item.id}
                    index={i}
                    title={item.title}
                    en={item.en}
                    description={item.description}
                  />
                ))}
              </Grid>
            </Section>

            <Section en={t('profilePage.sections.gettingAlong.tag')} code="SEC.03" title={t('profilePage.sections.gettingAlong.title')}>
              <Text>
                {t('profilePage.sections.gettingAlong.line1')}
                <br />
                {t('profilePage.sections.gettingAlong.line2')}
                <br />
                {t('profilePage.sections.gettingAlong.line3')}
              </Text>
            </Section>

            <Section en={t('profilePage.sections.oneRequest.tag')} code="SEC.04" title={t('profilePage.sections.oneRequest.title')}>
              <Text>
                {t('profilePage.sections.oneRequest.line1')}
                <br />
                {t('profilePage.sections.oneRequest.line2')}
                <br />
                {t('profilePage.sections.oneRequest.line3')}
              </Text>
            </Section>

            <Section en={t('profilePage.sections.contact.tag')} code="SEC.05" title={t('profilePage.sections.contact.title')}>
              <Text>
                {t('profilePage.sections.contact.textBefore')}{' '}
                <NextLink
                  href="/sns"
                  style={{
                    color: 'var(--colors-profile-accent)',
                    borderBottom: '1px solid color-mix(in srgb, var(--colors-profile-accent) 40%, transparent)',
                  }}
                >
                  {t('profilePage.sections.contact.linkLabel')}
                </NextLink>
                {t('profilePage.sections.contact.textAfter')}
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
        <DeferredStickerSheet />
      </MotionBox>

      {/* Footer strip */}
      <Box
        borderTop="1px solid color-mix(in srgb, var(--colors-profile-accent) 20%, transparent)"
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
          background="repeating-linear-gradient(-45deg, var(--colors-profile-accent) 0 8px, transparent 8px 16px)"
          flexShrink={0}
        />
        <Span
          fontFamily="mono"
          fontSize={{ base: 'xs', sm: 'sm' }}
          fontWeight="bold"
          letterSpacing={{ base: '0.15em', sm: '0.3em' }}
          color="color-mix(in srgb, var(--colors-profile-accent) 80%, transparent)"
          textAlign="center"
          whiteSpace={{ base: 'normal', sm: 'nowrap' }}
        >
          {t('profilePage.footer')}
        </Span>
        <Box
          width={{ base: '32px', sm: '64px' }}
          height="6px"
          background="repeating-linear-gradient(-45deg, var(--colors-profile-accent) 0 8px, transparent 8px 16px)"
          flexShrink={0}
        />
      </Box>
    </Box>
  )
}

export default Profile
