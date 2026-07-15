import { useCallback, useEffect, useRef, useState } from 'react'
import { SplitFlap } from 'react-split-flap'
import { Box, Flex, styled } from 'styled-system/jsx'

const Text = styled.p

const W = 20
const H = 12
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
// Charset order matters: it is the physical flap order, so distance = flutter length.
const CHARS = [' ', ...LETTERS, '♥', '★', '█']
const BA_CHARS = [' ', '█'] // two-flap stack: every change lands in a single flip
const SHOWCASE_FLAP_STYLE = {
  display: 'grid',
  gridTemplateColumns: `repeat(${W}, 1.7ch)`,
  fontSize: 'clamp(10px, 3.2vw, 20px)',
  columnGap: '1px',
  rowGap: '3px',
}

// Easter egg: drop a frames JSON (string[H][W] of ' '/'█') here to enable playback on click.
// Generate one with scripts/generateBadAppleFrames.js
const BA_FRAMES_URL = '/assets/works/split-flap/bad-apple.json'

const center = (rows: string[], fill = ' ') =>
  rows.map((row) => {
    const left = Math.floor((W - row.length) / 2)
    return (fill.repeat(left) + row).padEnd(W, fill).slice(0, W)
  })

const art = (pattern: string[], ch: string) =>
  center(pattern.map((row) => row.replace(/X/g, ch).replace(/\./g, ' ')))

const HEART = art([
  '.XXXX.....XXXX.',
  'XXXXXX...XXXXXX',
  'XXXXXXX.XXXXXXX',
  'XXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXX',
  '.XXXXXXXXXXXXX.',
  '..XXXXXXXXXXX..',
  '...XXXXXXXXX...',
  '....XXXXXXX....',
  '.....XXXXX.....',
  '......XXX......',
  '.......X.......',
], '♥')

const INVADER = art([
  '',
  '',
  '..X.....X..',
  '...X...X...',
  '..XXXXXXX..',
  '.XX.XXX.XX.',
  'XXXXXXXXXXX',
  'X.XXXXXXX.X',
  'X.X.....X.X',
  '...XX.XX...',
  '',
  '',
], '█')

const WORDS = center([
  '',
  '',
  '',
  'PATA PATA',
  '',
  'SPLIT FLAP',
  '',
  'KEIKYU KAWASAKI',
  '',
  '',
  '',
  '',
])

const STARS = center([
  '..★.......★....',
  '.......★.......',
  '★...........★..',
  '....★..........',
  '..........★....',
  '.★......★......',
  '......★.....★..',
  '...★...........',
  '.........★.....',
  '★.....★.......★',
  '.....★.........',
  '..........★....',
].map((r) => r.replace(/\./g, ' ')))

const SCENES = [HEART, INVADER, WORDS, STARS]

const scrambleRows = () =>
  Array.from({ length: H }, () =>
    Array.from({ length: W }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join(''),
  )

// 20 × 12 = 240 digits on one shared animation clock, cycling through scenes.
// Clicking the board plays the Bad Apple frames if the JSON is present.
const FlapShowcase = () => {
  const [rows, setRows] = useState<string[]>(HEART)
  const [baMode, setBaMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const showcaseRef = useRef<HTMLDivElement>(null)
  const baFrames = useRef<string[][] | null>(null)
  const baLoading = useRef(false)
  const baFrameIndex = useRef(0)
  const sceneIndex = useRef(0)

  useEffect(() => {
    const node = showcaseRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      rootMargin: '200px 0px',
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const toggleBadApple = useCallback(async () => {
    if (baMode) {
      setBaMode(false)
      return
    }

    if (!baFrames.current && !baLoading.current) {
      baLoading.current = true
      try {
        const response = await fetch(BA_FRAMES_URL)
        const frames = response.ok ? await response.json() : null
        if (Array.isArray(frames) && frames.length) baFrames.current = frames
      } catch {
        // The showcase remains usable when the optional easter egg is unavailable.
      } finally {
        baLoading.current = false
      }
    }

    if (baFrames.current) {
      baFrameIndex.current = 0
      setBaMode(true)
    }
  }, [baMode])

  // Scene loop: reveal art top-down (rows cascade like the departure board), hold, scramble, next.
  useEffect(() => {
    if (!isVisible || baMode) return

    let cancelled = false
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const push = (fn: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer)
        if (!cancelled) fn()
      }, delay)
      timers.add(timer)
    }
    const applyFrame = (frame: string[]) =>
      frame.forEach((row, i) => push(() => setRows((prev) => prev.map((r, j) => (j === i ? row : r))), i * 90))
    const loop = () => {
      applyFrame(SCENES[sceneIndex.current % SCENES.length])
      push(() => {
        applyFrame(scrambleRows())
        push(() => {
          sceneIndex.current += 1
          loop()
        }, 2600)
      }, 6500)
    }
    loop()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [baMode, isVisible])

  useEffect(() => {
    if (!isVisible || !baMode || !baFrames.current) return
    const frames = baFrames.current
    const interval = setInterval(() => {
      if (baFrameIndex.current >= frames.length) {
        baFrameIndex.current = 0
        setBaMode(false)
        return
      }
      setRows(frames[baFrameIndex.current])
      baFrameIndex.current += 1
    }, 200)
    return () => clearInterval(interval)
  }, [baMode, isVisible])

  return (
    <Box ref={showcaseRef}>
      <Box overflowX="auto" pb={2}>
        <Flex
          direction="column"
          gap="3px"
          width="fit-content"
          mx="auto"
          onClick={toggleBadApple}
        >
          <SplitFlap
            key={baMode ? 'ba' : 'art'}
            value={rows.join('')}
            chars={baMode ? BA_CHARS : CHARS}
            length={W * H}
            align="left"
            theme="dark"
            size="small"
            className="performance-mode"
            style={SHOWCASE_FLAP_STYLE}
            timing={baMode ? 10 : 28}
            fontColor={baMode ? '#f2f2f2' : '#ff5d52'}
            animateOnMount={false}
          />
        </Flex>
      </Box>
      <Text mt={4} textAlign="center" fontSize="xs" opacity={0.45}>
        240 片字盤共用同一個動畫時鐘，逐行接續翻出不同畫面。
      </Text>
    </Box>
  )
}

export default FlapShowcase
