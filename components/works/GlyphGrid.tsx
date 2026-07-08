import { Box, Grid, styled } from 'styled-system/jsx'
import { motion } from 'framer-motion'

const Text = styled.p
const MotionBox = motion(Box)

interface GlyphGridProps {
  chars: string
  fontFamily: string
  accent?: string
  glow?: boolean
  minCell?: string
}

// Full character-set specimen grid with staggered reveal
const GlyphGrid = ({
  chars,
  fontFamily,
  accent = '#df8a42',
  glow = false,
  minCell = '72px',
}: GlyphGridProps) => {
  const list = Array.from(chars).filter((c) => c !== ' ')

  return (
    <Grid
      gap={2}
      width="100%"
      gridTemplateColumns="repeat(auto-fill, minmax(var(--min-cell), 1fr))"
      style={
        { '--accent': accent, '--min-cell': minCell } as React.CSSProperties
      }
    >
      {list.map((char, i) => (
        <MotionBox
          key={`${char}-${i}`}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          aspectRatio="1"
          backgroundColor="rgba(255,255,255,0.03)"
          border="1px solid rgba(255,255,255,0.08)"
          borderRadius="4px"
          cursor="default"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.3, delay: Math.min((i % 24) * 0.015, 0.4) }}
          _hover={{
            borderColor: 'var(--accent)',
            backgroundColor: 'rgba(255,255,255,0.06)',
            '& .glyph': { transform: 'scale(1.15)' },
          }}
          style={{ transition: 'border-color 0.2s ease, background-color 0.2s ease' }}
        >
          <Box
            className="glyph"
            fontFamily={fontFamily}
            fontSize="clamp(1.4rem, 2.6vw, 2.2rem)"
            lineHeight="1"
            color={glow ? '#ff9b28' : 'white'}
            textShadow={
              glow
                ? '0 0 6px rgba(255,65,0,0.7), 0 0 20px #ff8000'
                : undefined
            }
            style={{ transition: 'transform 0.2s ease' }}
          >
            {char}
          </Box>
          <Text
            fontSize="0.6rem"
            mt={2}
            opacity={0.35}
            fontFamily="monospace"
            letterSpacing="0.05em"
          >
            {'U+' + char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}
          </Text>
        </MotionBox>
      ))}
    </Grid>
  )
}

export default GlyphGrid
