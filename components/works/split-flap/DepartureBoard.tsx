import { useEffect, useRef, useState } from 'react'
import { LongFlap } from 'react-split-flap'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'

const Text = styled.p
const Span = styled.span

const IMG_BASE = '/assets/works/split-flap/kawasaki'

interface Service {
  kind: string
  dest: number
  cars: string
  bikou: number | 'black'
}

// Real Keikyu-Kawasaki up-bound patterns (for Haneda / Shinagawa / Asakusa line):
// each kind/destination/remark trio appeared on the retired pata-pata board.
const SCHEDULE: Service[] = [
  { kind: 'ltd', dest: 31, cars: '8両', bikou: 19 }, // 特急 成田空港 品川・新橋・日本橋・浅草方面直通
  { kind: 'local', dest: 9, cars: '6両', bikou: 59 }, // 普通 品川 京急蒲田で羽田空港からのエアポート急行に連絡
  { kind: 'air_exp', dest: 34, cars: '8両', bikou: 'black' }, // ✈急行 羽田空港
  { kind: 'rapid_ltd', dest: 8, cars: '8両', bikou: 21 }, // 快特 泉岳寺 品川方面泉岳寺行
  { kind: 'air_rapid_ltd', dest: 31, cars: '8両', bikou: 19 }, // ✈快特 成田空港
  { kind: 'local', dest: 9, cars: '4両', bikou: 23 }, // 普通 品川 平和島まで先に到着
  { kind: 'ltd', dest: 4, cars: '12両', bikou: 3 }, // 特急 高砂 前4両品川止まり
  { kind: 'exp', dest: 34, cars: '6両', bikou: 'black' }, // 急行 羽田空港
]

const KINDS = ['air_exp', 'air_ltd', 'air_rapid_ltd', 'com_ltd', 'exp', 'local', 'ltd', 'out', 'rapid_ltd', 'black']

const flapImage = (webpSrc: string, pngSrc: string) => (
  <picture style={{ width: '100%', height: '100%', display: 'block' }}>
    <source srcSet={webpSrc} type="image/webp" />
    <img src={pngSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
  </picture>
)

const imageFlaps = (dir: string, ids: (string | number)[]) =>
  ids.map((id) => {
    const base = `${IMG_BASE}/${dir}/${id}`
    return {
      id: String(id),
      component: flapImage(`${base}.webp`, `${base}.PNG`),
    }
  })

// Full physical flap sets (not just the ids we display) so a change travels
// through many flaps before landing, like the real machine. dest 22/32 don't exist.
const DEST_IDS = ['black', ...Array.from({ length: 45 }, (_, i) => i).filter((i) => i !== 22 && i !== 32)]
const BIKOU_IDS = ['black', ...Array.from({ length: 59 }, (_, i) => i + 1)]

const ORDER_FLAPS = imageFlaps('order', [1, 2, 3])
const HOME_FLAPS = imageFlaps('home', [6])
const KIND_FLAPS = imageFlaps('kind', KINDS)
const DEST_FLAPS = imageFlaps('dest', DEST_IDS)
const BIKOU_FLAPS = imageFlaps('bikou', BIKOU_IDS)
const HOUR_FLAPS = imageFlaps('hour', Array.from({ length: 24 }, (_, i) => i))
const MINUTE_FLAPS = imageFlaps('minute', Array.from({ length: 10 }, (_, i) => i))
const CARS_FLAPS = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1
  const id = `${num}両`
  const hasImage = [4, 6, 8, 10, 12].includes(num)
  const base = hasImage ? `${IMG_BASE}/cars/${num}` : `${IMG_BASE}/cars/black`
  return {
    id,
    component: flapImage(`${base}.webp`, `${base}.png`),
  }
})

interface RowState {
  service: Service
  departure: Date
}

const CELL = { digitHeight: 40, theme: 'dark' as const, timing: 40 }

const BoardRow = ({ order, row }: { order: number; row: RowState | null }) => (
  <Flex gap="3px" alignItems="center" width="fit-content">
    <LongFlap flaps={ORDER_FLAPS} displayId={String(order)} digitWidth={62} animateOnMount={false} {...CELL} />
    <LongFlap flaps={HOME_FLAPS} displayId="6" digitWidth={62} animateOnMount={false} {...CELL} />
    <LongFlap flaps={KIND_FLAPS} displayId={row ? row.service.kind : 'black'} digitWidth={58} {...CELL} />
    <LongFlap flaps={DEST_FLAPS} displayId={row ? String(row.service.dest) : 'black'} digitWidth={150} {...CELL} />
    <LongFlap flaps={HOUR_FLAPS} displayId={row ? String(row.departure.getHours()) : '0'} digitWidth={55} {...CELL} />
    <LongFlap flaps={MINUTE_FLAPS} displayId={row ? String(Math.floor(row.departure.getMinutes() / 10)) : '0'} digitWidth={30} {...CELL} />
    <LongFlap flaps={MINUTE_FLAPS} displayId={row ? String(row.departure.getMinutes() % 10) : '0'} digitWidth={30} {...CELL} />
    <LongFlap flaps={CARS_FLAPS} displayId={row ? row.service.cars : '8両'} digitWidth={55} {...CELL} />
    <Box display={{ base: 'none', lg: 'block' }}>
      <LongFlap flaps={BIKOU_FLAPS} displayId={row ? String(row.service.bikou) : 'black'} digitWidth={250} {...CELL} />
    </Box>
  </Flex>
)

const AnalogClock = () => {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const seconds = now ? now.getSeconds() : 0
  const minutes = now ? now.getMinutes() + seconds / 60 : 0
  const hours = now ? (now.getHours() % 12) + minutes / 60 : 0

  return (
    <svg width="104" height="104" viewBox="0 0 100 100" role="img" aria-label="現在時刻">
      <circle cx="50" cy="50" r="48" fill="#f5f5f2" />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        return (
          <line
            key={i}
            x1={50 + 40 * Math.sin(angle)} y1={50 - 40 * Math.cos(angle)}
            x2={50 + 44 * Math.sin(angle)} y2={50 - 44 * Math.cos(angle)}
            stroke="#222" strokeWidth={i % 3 === 0 ? 3 : 1.5}
          />
        )
      })}
      <line x1="50" y1="50" x2={50 + 24 * Math.sin((hours * 30 * Math.PI) / 180)} y2={50 - 24 * Math.cos((hours * 30 * Math.PI) / 180)} stroke="#111" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="50" x2={50 + 36 * Math.sin((minutes * 6 * Math.PI) / 180)} y2={50 - 36 * Math.cos((minutes * 6 * Math.PI) / 180)} stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="50" x2={50 + 38 * Math.sin((seconds * 6 * Math.PI) / 180)} y2={50 - 38 * Math.cos((seconds * 6 * Math.PI) / 180)} stroke="#c33" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="50" cy="50" r="2.5" fill="#111" />
    </svg>
  )
}

const nextDeparture = (from: Date, offsetMinutes: number) => new Date(from.getTime() + offsetMinutes * 60000)

// Keikyu-Kawasaki style three-row departure board. When a train departs, rows
// flip one at a time (first row takes over the second, and so on), matching
// how the real board cascaded. Times run off the visitor's clock.
const DepartureBoard = () => {
  const [rows, setRows] = useState<(RowState | null)[]>([null, null, null])
  const queueIndex = useRef(3)

  useEffect(() => {
    const now = new Date()
    setRows([0, 1, 2].map((i) => ({ service: SCHEDULE[i], departure: nextDeparture(now, 2 + i * 4) })))

    const timeouts: ReturnType<typeof setTimeout>[] = []
    const interval = setInterval(() => {
      // Cascade: each row flips 900ms after the one above it.
      timeouts.length = 0
      timeouts.push(
        setTimeout(() => setRows(([, b, c]) => [b, b, c]), 0),
        setTimeout(() => setRows(([a, , c]) => [a, c, c]), 900),
        setTimeout(() => {
          const service = SCHEDULE[queueIndex.current % SCHEDULE.length]
          queueIndex.current += 1
          setRows(([a, b]) => [a, b, { service, departure: nextDeparture(b?.departure ?? new Date(), 4) }])
        }, 1800),
      )
    }, 9000)

    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return (
    <Box>
      <Box overflowX="auto" pb={2} css={{ scrollbarWidth: 'thin' }}>
        <Box width="fit-content" mx="auto" backgroundColor="#0d0d0f" borderRadius="18px" border="1px solid rgba(255,255,255,.1)" boxShadow="0 12px 40px rgba(0,0,0,.5)" px={{ base: 4, md: 6 }} py={5}>
          <Flex gap={{ base: 4, md: 6 }} alignItems="center">
            <Flex direction="column" gap="12px">
              <HStack gap={4} pb={1} borderBottom="1px solid rgba(255,255,255,.14)" alignItems="baseline" whiteSpace="nowrap">
                <Span backgroundColor="#f2f2f2" color="#0d0d0f" fontWeight="800" px={2} borderRadius="4px" fontSize="md">6</Span>
                <Span fontSize={{ base: 'md', md: 'lg' }} fontWeight="700" letterSpacing=".3em" color="#f2f2f2">羽田空港　品川　新橋　浅草　方面</Span>
                <Span display={{ base: 'none', md: 'inline' }} fontSize="10px" opacity={0.55} letterSpacing=".05em">for Haneda Airport, Shinagawa, Shimbashi, Asakusa</Span>
              </HStack>
              <BoardRow order={1} row={rows[0]} />
              <BoardRow order={2} row={rows[1]} />
              <BoardRow order={3} row={rows[2]} />
            </Flex>
            <Box display={{ base: 'none', xl: 'block' }}>
              <AnalogClock />
            </Box>
          </Flex>
        </Box>
      </Box>
      <Text mt={3} textAlign="center" fontSize="xs" opacity={0.45} letterSpacing=".08em">
        致敬 2022 年退役的京急川崎駅「パタパタ」發車標
      </Text>
    </Box>
  )
}

export default DepartureBoard
