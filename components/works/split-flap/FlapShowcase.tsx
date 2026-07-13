import { useEffect, useRef, useState } from 'react'
import { SplitFlap } from 'react-split-flap'
import { Box, Flex, styled } from 'styled-system/jsx'

const Text = styled.p

const W = 20
const H = 12
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
// Charset order matters: it is the physical flap order, so distance = flutter length.
const CHARS = [' ', ...LETTERS, '♥', '★', '█']
const BA_CHARS = [' ', '█'] // two-flap stack: every change lands in a single flip

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
  const baFrames = useRef<string[][] | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    fetch(BA_FRAMES_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((frames) => {
        if (Array.isArray(frames) && frames.length) baFrames.current = frames
      })
      .catch(() => {})
  }, [])

  // Scene loop: reveal art top-down (rows cascade like the departure board), hold, scramble, next.
  useEffect(() => {
    if (baMode) return
    let scene = 0
    const push = (fn: () => void, delay: number) => timers.current.push(setTimeout(fn, delay))
    const applyFrame = (frame: string[]) =>
      frame.forEach((row, i) => push(() => setRows((prev) => prev.map((r, j) => (j === i ? row : r))), i * 90))
    const loop = () => {
      timers.current = []
      applyFrame(SCENES[scene % SCENES.length])
      push(() => {
        applyFrame(scrambleRows())
        push(() => { scene += 1; loop() }, 2600)
      }, 6500)
    }
    loop()
    return () => timers.current.forEach(clearTimeout)
  }, [baMode])

  useEffect(() => {
    if (!baMode || !baFrames.current) return
    const frames = baFrames.current
    let index = 0
    const interval = setInterval(() => {
      if (index >= frames.length) {
        setBaMode(false)
        return
      }
      setRows(frames[index])
      index += 1
    }, 200)
    return () => clearInterval(interval)
  }, [baMode])

  return (
    <Box>
      <Box overflowX="auto" pb={2}>
        <Flex
          direction="column"
          gap="3px"
          width="fit-content"
          mx="auto"
          onClick={() => baFrames.current && setBaMode((mode) => !mode)}
        >
          {rows.map((row, i) => (
            <SplitFlap
              key={`${baMode ? 'ba' : 'art'}-${i}`}
              value={row}
              chars={baMode ? BA_CHARS : CHARS}
              length={W}
              align="left"
              theme="dark"
              size="small"
              timing={baMode ? 10 : 28}
              fontColor={baMode ? '#f2f2f2' : '#ff5d52'}
              animateOnMount={false}
            />
          ))}
        </Flex>
      </Box>
      <Text mt={4} textAlign="center" fontSize="xs" opacity={0.45}>
        240 片字盤共用同一個動畫時鐘，逐行接續翻出不同畫面。
      </Text>
    </Box>
  )
}

export default FlapShowcase
