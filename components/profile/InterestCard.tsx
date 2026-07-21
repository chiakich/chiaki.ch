import { useState } from 'react'
import { Box, styled } from 'styled-system/jsx'
import { motion, useReducedMotion } from 'framer-motion'

const Text = styled.p
const Span = styled.span

const MotionBox = motion.create(Box)
const Img = styled.img

// Per-image "camera move" for the Ken Burns pan/zoom while hovered.
// `pos` animates object-position, so pans align to the real image edges
// (e.g. '50% 0%' starts flush with the very top of the photo). `scale` is a
// centered zoom via transform. Landscape images pan horizontally; portrait
// images pan top→bottom; a couple simply push in.
type Frame = { pos: string; scale: number }
type Move = { from: Frame; to: Frame }

const cameraMoves: Record<string, Move> = {
  // Landscape — horizontal pan
  photo: { from: { pos: '0% 50%', scale: 1 }, to: { pos: '100% 50%', scale: 1.2 } },
  doujin: { from: { pos: '100% 50%', scale: 1 }, to: { pos: '0% 50%', scale: 1.2 } },
  food: { from: { pos: '100% 50%', scale: 1 }, to: { pos: '0% 50%', scale: 1.2 } },
  mini: { from: { pos: '0% 50%', scale: 1 }, to: { pos: '100% 50%', scale: 1.2 } },
  cosplay: {
    from: { pos: '55% 50%', scale: 1 },
    to: { pos: '15% 50%', scale: 1 },
  },
  model: {
    from: { pos: '100% 40%', scale: 1.04 },
    to: { pos: '10% 60%', scale: 1.12 },
  },
  // Landscape — push in
  design: {
    from: { pos: '50% 50%', scale: 1.04 },
    to: { pos: '50% 50%', scale: 1.28 },
  },
  electronics: {
    from: { pos: '50% 50%', scale: 1.04 },
    to: { pos: '50% 50%', scale: 1.3 },
  },
  // Portrait — top→bottom pan (starts flush with the top edge)
  opensource: {
    from: { pos: '50% 85%', scale: 1 },
    to: { pos: '70% 60%', scale: 1.15 },
  },
  drawing: { from: { pos: '50% 15%', scale: 1 }, to: { pos: '50% 50%', scale: 1 } },
  lolita: { from: { pos: '50% 40%', scale: 1 }, to: { pos: '50% 90%', scale: 1 } },
  travel: { from: { pos: '50% 90%', scale: 1 }, to: { pos: '50% 60%', scale: 1 } },
}

const defaultMove: Move = {
  from: { pos: '0% 50%', scale: 1.04 },
  to: { pos: '100% 50%', scale: 1.04 },
}

const InterestCard = ({
  id,
  index,
  title,
  en,
  description,
}: {
  id: string
  index: number
  title: string
  en: string
  description: string
}) => {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const move = cameraMoves[id] ?? defaultMove
  const src = `/assets/profile/interests/${id}.webp`

  return (
    <MotionBox
      position="relative"
      backgroundColor="#111"
      border="1px solid #222"
      clipPath="polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)"
      px={5}
      py={4}
      overflow="hidden"
      minHeight="132px"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.5,
        delay: (index % 2) * 0.08,
        ease: 'easeOut',
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      _hover={{
        borderColor: '#ff782988',
        transform: 'translateY(-3px)',
        '& .interest-en': { color: '#ff7829', opacity: 0.9 },
      }}
      style={{
        transition: 'transform 0.25s ease, border-color 0.25s ease',
      }}
    >
      {/* ── CRT background layer ── */}
      <MotionBox
        aria-hidden
        position="absolute"
        inset="0"
        zIndex={0}
        overflow="hidden"
        pointerEvents="none"
        initial={false}
        animate={
          reduceMotion
            ? { opacity: hovered ? 0.4 : 0 }
            : {
                opacity: hovered ? 1 : 0,
                scaleY: hovered ? 1 : 0.7,
                filter: hovered ? 'brightness(1)' : 'brightness(2.6)',
              }
        }
        transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Ken Burns image — pans via object-position so it aligns to the real image edges */}
        <Img
          src={src}
          alt=""
          loading="lazy"
          position="absolute"
          inset="0"
          width="100%"
          height="100%"
          display="block"
          style={{
            objectFit: 'cover',
            objectPosition: (hovered && !reduceMotion ? move.to : move.from).pos,
            transform: `scale(${(hovered && !reduceMotion ? move.to : move.from).scale})`,
            transition: reduceMotion
              ? 'none'
              : 'object-position 7s linear, transform 7s linear',
            filter: 'saturate(1.15) contrast(1.08)',
          }}
        />

        {/* Readability scrim */}
        <Box
          position="absolute"
          inset="0"
          background="linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.82) 100%)"
        />

        {/* Static scanlines */}
        <Box
          position="absolute"
          inset="0"
          backgroundImage="repeating-linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.28) 2px, rgba(0,0,0,0.28) 3px)"
          mixBlendMode="multiply"
          opacity={0.8}
        />

        {/* Faint RGB fringe / phosphor tint */}
        <Box
          position="absolute"
          inset="0"
          backgroundImage="linear-gradient(90deg, rgba(255,0,60,0.06), rgba(0,255,120,0.02) 50%, rgba(0,120,255,0.06))"
          mixBlendMode="screen"
        />

        {/* Rolling scanline band */}
        {hovered && !reduceMotion && (
          <MotionBox
            position="absolute"
            left="0"
            right="0"
            height="28%"
            background="linear-gradient(180deg, transparent, rgba(255,255,255,0.08) 50%, transparent)"
            initial={{ top: '-30%' }}
            animate={{ top: '110%' }}
            transition={{ duration: 4.5, ease: 'linear', repeat: Infinity }}
          />
        )}

        {/* Flicker */}
        {hovered && !reduceMotion && (
          <MotionBox
            position="absolute"
            inset="0"
            backgroundColor="rgba(255,255,255,0.03)"
            animate={{ opacity: [0.5, 0.15, 0.7, 0.3, 0.55] }}
            transition={{ duration: 0.5, ease: 'linear', repeat: Infinity }}
          />
        )}

        {/* Vignette */}
        <Box
          position="absolute"
          inset="0"
          boxShadow="inset 0 0 60px 12px rgba(0,0,0,0.7)"
        />
      </MotionBox>

      {/* ── Foreground content ── */}
      <Text
        className="interest-en"
        position="relative"
        zIndex={2}
        display="block"
        textAlign="right"
        fontSize="xs"
        fontWeight="black"
        letterSpacing="0.2em"
        opacity={0.3}
        style={{ transition: 'color 0.25s ease, opacity 0.25s ease' }}
      >
        {en}
      </Text>
      <Text
        position="relative"
        zIndex={2}
        fontWeight="bold"
        fontSize={{ base: 'md', md: 'lg' }}
        mb={1}
        textShadow="0 1px 6px rgba(0,0,0,0.7)"
      >
        <Span color="#ff7829" mr={2} fontSize="sm">
          {String(index + 1).padStart(2, '0')}
        </Span>
        {title}
      </Text>
      <Text
        position="relative"
        zIndex={2}
        fontSize={{ base: 'sm', md: 'md' }}
        opacity={0.85}
        lineHeight="1.8"
        textShadow="0 1px 6px rgba(0,0,0,0.7)"
      >
        {description}
      </Text>
    </MotionBox>
  )
}

export default InterestCard
