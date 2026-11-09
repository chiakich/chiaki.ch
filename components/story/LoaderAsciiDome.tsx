import { useEffect, useRef, useState } from 'react'
import { Box } from 'styled-system/jsx'

// A dome of flickering slash glyphs, like an old firmware self-test.
// The animation is the GLYPHS re-rolling over time (not a colour sweep over
// a static grid) — that is what makes it read as a computing terminal.

const COLS = 29
const ROWS = 14
const FLICKER_MS = 90

type Cell = { char: string; opacity: number; gold: boolean }

function inDome(x: number, y: number) {
  const dx = (x - (COLS - 1) / 2) / ((COLS - 1) / 2)
  const dy = (y - (ROWS - 1) / 2) / ((ROWS - 1) / 2)
  return dx * dx + dy * dy * 1.12 <= 1 && y <= ROWS - 2
}

function rollChar(progress: number): string {
  const r = Math.random()
  if (r < 0.72) return '/'
  if (r < 0.8) return String(Math.floor(progress) % 10)
  if (r < 0.9) return String(Math.floor(Math.random() * 10))
  if (r < 0.96) return '▓'
  return ' '
}

// Deterministic first frame (no Math.random) so SSR and hydration match;
// the useEffect below brings it to life once mounted.
function buildStaticGrid(): Cell[][] {
  return Array.from({ length: ROWS }, (_, y) =>
    Array.from({ length: COLS }, (_, x) =>
      inDome(x, y)
        ? { char: '/', opacity: 0.4, gold: false }
        : { char: ' ', opacity: 0, gold: false }
    )
  )
}

const LoaderAsciiDome = ({ progress }: { progress: number }) => {
  const [grid, setGrid] = useState<Cell[][]>(buildStaticGrid)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    const id = window.setInterval(() => {
      setGrid((prev) =>
        prev.map((row) =>
          row.map((cell) => {
            if (cell.opacity === 0) return cell
            // Re-roll only a fraction of cells each tick → organic flicker
            if (Math.random() > 0.2) return cell
            return {
              char: rollChar(progressRef.current),
              opacity: 0.3 + Math.random() * 0.5,
              gold: Math.random() < 0.06,
            }
          })
        )
      )
    }, FLICKER_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <Box
      position="relative"
      mb="34px"
      style={{ fontFamily: "'Courier New', ui-monospace, monospace" }}
    >
      <Box fontSize={{ base: '9px', md: '12px' }} lineHeight="1.12">
        {grid.map((row, y) => (
          <Box key={y} whiteSpace="pre" textAlign="center">
            {row.map((cell, x) => (
              <span
                key={x}
                style={{
                  color: cell.gold
                    ? `rgba(236,193,94,${cell.opacity})`
                    : `rgba(135,205,211,${cell.opacity})`,
                }}
              >
                {cell.char}
              </span>
            ))}
          </Box>
        ))}
      </Box>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        fontSize={{ base: '13px', md: '17px' }}
        letterSpacing=".14em"
        color="#d7eef1"
        textShadow="0 0 14px rgba(144,224,231,.8)"
      >
        /{String(Math.min(99, Math.round(progress))).padStart(2, '0')}
      </Box>
    </Box>
  )
}

export default LoaderAsciiDome
