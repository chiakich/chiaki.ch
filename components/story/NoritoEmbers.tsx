import { Box, styled } from 'styled-system/jsx'

const Text = styled.p

// Scattered norito fragments drifting behind the prayer — each fades in, rises,
// and burns out on its own loop. Always animating (no scroll gate) so they are
// reliably visible whenever the section is on screen.
const fragments = [
  { text: 'ひふみ', x: 2, y: 8, size: 28, depth: 0 },
  { text: 'よいむ', x: 48, y: 5, size: 36, depth: 1 },
  { text: 'なや', x: 70, y: 73, size: 29, depth: 0 },
  { text: 'こともち', x: 4, y: 78, size: 34, depth: 2 },
  { text: 'ろらね', x: 31, y: 31, size: 44, depth: 2 },
  { text: 'しきる', x: 72, y: 24, size: 25, depth: 1 },
  { text: 'ゆゐつわ', x: 12, y: 48, size: 28, depth: 1 },
  { text: 'ぬ', x: 57, y: 51, size: 31, depth: 2 },
  { text: 'そをた', x: 28, y: 66, size: 24, depth: 1 },
  { text: 'はくめか', x: 76, y: 88, size: 22, depth: 0 },
  { text: 'うお', x: -3, y: 27, size: 23, depth: 0 },
  { text: 'えにさ', x: 87, y: 43, size: 30, depth: 1 },
  { text: 'りへて', x: 18, y: 92, size: 20, depth: 0 },
  { text: 'のます', x: 0, y: 61, size: 26, depth: 0 },
  { text: 'あせゑほれ', x: 84, y: 66, size: 19, depth: 0 },
]

const NoritoEmbers = () => (
  <Box
    position="absolute"
    top="0"
    left="0"
    width="100%"
    height="100vh"
    overflow="hidden"
    pointerEvents="none"
    zIndex="2"
  >
    {fragments.map((fragment, index) => (
      <Text
        key={fragment.text + index}
        position="absolute"
        fontFamily="huninn"
        letterSpacing=".12em"
        color={fragment.depth === 2 ? 'rgba(255,224,150,.95)' : 'rgba(120,240,208,.8)'}
        textShadow={
          fragment.depth === 2
            ? '0 0 24px rgba(239,169,60,.8)'
            : '0 0 18px rgba(77,224,187,.65)'
        }
        // Dynamic values MUST be inline styles — Panda can't generate classes
        // for runtime template values, so these props would silently no-op.
        style={{
          left: `${fragment.x}%`,
          top: `${fragment.y}%`,
          fontSize: `clamp(13px, ${(fragment.size * 0.55).toFixed(0)}px + 0.6vw, ${fragment.size}px)`,
          zIndex: fragment.depth + 1,
          filter: `blur(${Math.max(0, 1.5 - fragment.depth)}px)`,
          opacity: 0,
          animation: `noritoBurn ${3.4 + (index % 4) * 0.55}s ease-out ${index * 0.32}s infinite`,
        }}
      >
        {fragment.text}
      </Text>
    ))}
  </Box>
)

export default NoritoEmbers
