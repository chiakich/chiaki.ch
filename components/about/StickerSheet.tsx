import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'

const Text = styled.p

const MotionBox = motion(Box)

// Fraction of the container area the stickers should collectively cover.
// Leave some room: each sticker has its own collision margin and the layout
// grows outward from the centre rather than filling every available gap.
const FILL_RATIO = 0.4
// Extra clear space on every sticker, in pixels. Two neighbouring stickers
// therefore keep roughly twice this distance between their visible edges.
const STICKER_MARGIN = 8
// Collision circles deliberately fit inside the visual bounds. Using the full
// diagonal of a rotated square leaves large circular holes between otherwise
// rectangular stickers, even when STICKER_MARGIN is zero.
const COLLISION_RADIUS = 0.5
// Max absolute rotation applied to each sticker, in degrees.
const MAX_ROTATION = 12
// Fixed seed keeps the layout stable across renders (and SSR-safe).
const LAYOUT_SEED = 20260713

type StickerBase = {
  id: string
  title: string
  description: string
  // Relative size weight (unitless). Bigger = larger on screen. The actual
  // pixel size is derived from the container size at layout time.
  size: number
}

type TextSticker = StickerBase & {
  kind: 'text'
  label: string
  sub?: string
  bg: string
  color: string
  shape: 'skew' | 'pill' | 'circle'
}

type ImageSticker = StickerBase & {
  kind: 'image'
  src: string
  round?: boolean
  whiteOutline?: boolean
}

type Sticker = TextSticker | ImageSticker

const stickers: Sticker[] = [
  {
    id: 'oorai',
    kind: 'image',
    src: '/assets/about/stickers/oorai.avif',
    size: 150,
    title: 'Proud supporter of 大洗女子学園',
    description:
      '超級喜歡少女與戰車，大洗已經變成比老家還熟悉的小鎮了。海樂祭、八朔祭，冬天跟夏天都去過了！',
  },
  {
    id: 'React',
    kind: 'image',
    src: '/assets/about/stickers/react-logo.svg',
    size: 100,
    title: 'React',
    description:
      'React 是我最常用的前端框架，從 2015 年開始就一直在使用。而且他餵飽了我。我愛 React。',
  },
  {
    id: 'clip',
    kind: 'image',
    src: '/assets/about/stickers/clip.png',
    size: 30,
    title: 'Clip Studio Paint',
    description: 'Clip Studio Paint 是我最常用的繪圖軟體！',
    whiteOutline: false,
  },
  {
    id: 'WTM',
    kind: 'image',
    src: '/assets/about/stickers/wtm.jpg',
    size: 100,
    title: 'Google Women Techmakers',
    description: 'WTM 2023 講者',
  },
  {
    id: 'coscup',
    kind: 'image',
    src: '/assets/about/stickers/coscup.svg',
    size: 200,
    title: 'COSCUP 台灣開源人年會',
    description: 'COSCUP 資深會眾/審稿委員',
  },
  {
    id: 'sitcon',
    kind: 'image',
    src: '/assets/about/stickers/sitcon.png',
    size: 200,
    title: 'SITCON 學生計算機年會',
    description: 'SITCON 講者',
  },
  {
    id: 'justfont',
    kind: 'image',
    src: '/assets/about/stickers/jf.jpg',
    size: 200,
    title: 'justfont',
    description: 'jf ex-member',
  },
  {
    id: 'glyphs4',
    kind: 'image',
    src: '/assets/about/stickers/glyphs4.png',
    size: 70,
    title: 'Glyphs 4',
    description: 'Glyphs 4 zh-Hant Localization Translator',
    whiteOutline: false,
  },
  {
    id: 'arctic-code-vault-contributor',
    kind: 'image',
    src: '/assets/about/stickers/arctic-code-vault-contributor.png',
    size: 50,
    title: 'GitHub Arctic Code Vault Contributor',
    description:
      '@chiakich contributed code to several repositories in the 2020 GitHub Archive Program.',
    whiteOutline: false,
  },
  {
    id: 'isekai',
    kind: 'image',
    src: '/assets/about/stickers/isekai.png',
    size: 100,
    title: '観測者ヰ組',
    description: '意大利麵組',
    whiteOutline: false,
  },
  {
    id: 'isekai_art',
    kind: 'image',
    src: '/assets/about/stickers/isekai_art.jpeg',
    size: 150,
    title: 'ヰ世界情緒美術部',
    description: '我會繪製お情的圖',
    whiteOutline: false,
  },
  {
    id: 'sukonbu',
    kind: 'image',
    src: '/assets/about/stickers/sukonbu.png',
    size: 100,
    title: '司空部',
    description: 'Hi friends',
    whiteOutline: false,
  },
  {
    id: 'hinako',
    kind: 'image',
    src: '/assets/about/stickers/hinako.jpeg',
    size: 80,
    title: '妃那子',
    description: 'Livyatan of 妃那子 Official Fanclub',
    whiteOutline: false,
  },
  {
    id: 'himehina',
    kind: 'image',
    src: '/assets/about/stickers/himehina.png',
    size: 180,
    title: 'HIMEHINA JOJIGOD',
    description: '強力支持HIMEHINA活動的神級會員',
    whiteOutline: false,
  },
  {
    id: 'wwdc26',
    kind: 'image',
    src: '/assets/about/stickers/wwdc26.png',
    size: 120,
    title: 'WWDC 2026',
    description: 'WWDC 2026 Attendee',
    whiteOutline: false,
  },
]

// Small, fast, deterministic PRNG so the layout is identical every render.
const mulberry32 = (seed: number) => {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Placement = { cx: number; cy: number; size: number; rotation: number }

// A deterministic, centre-outward variant of front-chain circle packing.
// `oorai` anchors the composition. Each later sticker tries positions tangent
// to the existing outer edge and picks the closest valid one to the centre.
// This makes the sheet read as a deliberately built cluster, rather than a
// force simulation that happened to settle in one particular arrangement.
const computeLayout = (
  items: Sticker[],
  width: number,
  height: number
): Placement[] => {
  const rand = mulberry32(LAYOUT_SEED)
  const margin = Math.min(width, height) * 0.04
  const usableW = Math.max(1, width - margin * 2)
  const usableH = Math.max(1, height - margin * 2)
  const midX = width / 2
  const midY = height / 2
  // Pack in a horizontally compressed coordinate space, then map positions
  // back to the screen. This turns a tight circular cluster into one ellipse
  // without changing the stickers' own aspect ratios. Portrait screens keep a
  // circular cluster so the layout does not press against their side edges.
  const ellipseAspect = Math.min(1.5, Math.max(1, (width / height) * 0.75))

  // One scale unit so total sticker area ≈ FILL_RATIO of the usable area.
  // Area scales with size, so the on-screen edge scales with sqrt(size).
  const sumSize = items.reduce((acc, s) => acc + s.size, 0)
  const unit = Math.sqrt((FILL_RATIO * usableW * usableH) / sumSize)

  type Node = {
    index: number
    cx: number
    cy: number
    r: number // visual collision radius + personal margin
    br: number // visual bound radius, including rotation/card/shadow allowance
    px: number
    rotation: number
  }

  const nodes = items.map((s, index): Node => {
    const px = unit * Math.sqrt(s.size)
    return {
      index,
      cx: midX,
      cy: midY,
      // A rotated square's corner is about 0.71 × its edge from its centre.
      // This slightly conservative bound also reserves room for the shadow.
      br: px * 0.74,
      r: px * COLLISION_RADIUS + STICKER_MARGIN,
      px,
      rotation: (rand() * 2 - 1) * MAX_ROTATION,
    }
  })

  const isInside = (p: Node, cx: number, cy: number) => {
    const loX = margin + p.br
    const hiX = width - margin - p.br
    const loY = margin + p.br
    const hiY = height - margin - p.br
    return cx >= loX && cx <= hiX && cy >= loY && cy <= hiY
  }

  const packingDistance = (ax: number, ay: number, bx: number, by: number) =>
    Math.hypot((ax - bx) / ellipseAspect, ay - by)

  const isFree = (p: Node, cx: number, cy: number, placed: Node[]) =>
    isInside(p, cx, cy) &&
    placed.every(
      (other) => packingDistance(cx, cy, other.cx, other.cy) >= p.r + other.r
    )

  const angleDistance = (a: number, b: number) => {
    const delta = Math.abs(a - b) % (Math.PI * 2)
    return Math.min(delta, Math.PI * 2 - delta)
  }

  // Put the largest non-anchor stickers down first so smaller logos naturally
  // fill the contour. The anchor remains at the centre regardless of size.
  const anchor = nodes[0]
  const order = [...nodes.slice(1)].sort((a, b) => b.r - a.r || a.index - b.index)
  const placed = [anchor]
  const startAngle = rand() * Math.PI * 2

  for (const node of order) {
    const candidates: Array<{ cx: number; cy: number }> = []

    // Tangency to one sticker supplies the first ring and useful fallback
    // points; tangency to pairs fills concave spaces on later rings.
    for (const other of placed) {
      const distance = node.r + other.r
      for (let step = 0; step < 24; step++) {
        const angle = startAngle + (step / 24) * Math.PI * 2
        candidates.push({
          cx: other.cx + Math.cos(angle) * distance * ellipseAspect,
          cy: other.cy + Math.sin(angle) * distance,
        })
      }
    }

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]
        const b = placed[j]
        const dx = (b.cx - a.cx) / ellipseAspect
        const dy = b.cy - a.cy
        const d = Math.hypot(dx, dy)
        const ra = node.r + a.r
        const rb = node.r + b.r
        if (d === 0 || d > ra + rb || d < Math.abs(ra - rb)) continue

        const along = (ra * ra - rb * rb + d * d) / (2 * d)
        const offset = Math.sqrt(Math.max(0, ra * ra - along * along))
        const baseX = a.cx + ((along * dx) / d) * ellipseAspect
        const baseY = a.cy + (along * dy) / d
        const perpendicularX = ((-dy * offset) / d) * ellipseAspect
        const perpendicularY = (dx * offset) / d
        candidates.push(
          { cx: baseX + perpendicularX, cy: baseY + perpendicularY },
          { cx: baseX - perpendicularX, cy: baseY - perpendicularY }
        )
      }
    }

    // Measure compactness in the same ellipse coordinate space as collision
    // detection, so every added sticker reinforces one clean outer silhouette.
    const availableX = Math.max(1, (width - margin * 2) / 2)
    const availableY = Math.max(1, (height - margin * 2) / 2)
    const targetSeparation = (Math.PI * 2) / Math.max(2, placed.length)
    const score = ({ cx, cy }: { cx: number; cy: number }) => {
      const dx = cx - midX
      const dy = cy - midY
      const radial = Math.hypot(
        dx / (Math.min(availableX, availableY) * ellipseAspect),
        dy / Math.min(availableX, availableY)
      )
      const candidateAngle = Math.atan2(dy, dx)
      const outerAngles = placed
        .filter((other) => other !== anchor)
        .map((other) => Math.atan2(other.cy - midY, other.cx - midX))
      const nearestAngle = outerAngles.length
        ? Math.min(
            ...outerAngles.map((angle) => angleDistance(candidateAngle, angle))
          )
        : angleDistance(candidateAngle, startAngle)
      const angularPenalty =
        Math.max(0, targetSeparation - nearestAngle) / targetSeparation
      return radial + angularPenalty * 0.18
    }

    const choice = candidates
      .filter(({ cx, cy }) => isFree(node, cx, cy, placed))
      .sort((a, b) => score(a) - score(b))[0]
    if (choice) {
      node.cx = choice.cx
      node.cy = choice.cy
    } else {
      // This should only occur in a very small container. Walk outward until a
      // legal position is found, preserving the centre-outward invariant.
      let found = false
      for (let ring = 1; ring < 80 && !found; ring++) {
        const distance = ring * Math.max(8, node.r / 2)
        for (let step = 0; step < 48; step++) {
          const angle = startAngle + (step / 48) * Math.PI * 2
          const cx = midX + Math.cos(angle) * distance * ellipseAspect
          const cy = midY + Math.sin(angle) * distance
          if (isFree(node, cx, cy, placed)) {
            node.cx = cx
            node.cy = cy
            found = true
            break
          }
        }
      }

      // Never silently leave an unplaced sticker at the centre. If the
      // container is genuinely too small, choose the candidate with the least
      // overlap so it remains visible; normal viewport sizes take the branch
      // above and retain a fully collision-free layout.
      if (!found) {
        const leastOverlap = candidates
          .filter(({ cx, cy }) => isInside(node, cx, cy))
          .map((candidate) => ({
            ...candidate,
            overlap: placed.reduce(
              (total, other) =>
                total +
                Math.max(
                  0,
                  node.r +
                    other.r -
                    packingDistance(candidate.cx, candidate.cy, other.cx, other.cy)
                ),
              0
            ),
          }))
          .sort((a, b) => a.overlap - b.overlap)[0]
        if (leastOverlap) {
          node.cx = leastOverlap.cx
          node.cy = leastOverlap.cy
        }
      }
    }
    placed.push(node)
  }

  const result = new Array<Placement>(items.length)
  for (const p of nodes) {
    result[p.index] = { cx: p.cx, cy: p.cy, size: p.px, rotation: p.rotation }
  }
  return result
}

const StickerFace = ({
  sticker,
  renderSize,
}: {
  sticker: Sticker
  renderSize: number
}) => {
  if (sticker.kind === 'image') {
    // SVGs without intrinsic width/height (only a viewBox) collapse to 0x0
    // when constrained by max-width/max-height alone, so give them an explicit
    // width and let the height follow the aspect ratio.
    const isSvg = sticker.src.endsWith('.svg')
    // The white "sticker" border used to be nine stacked drop-shadow filters,
    // which are very expensive to repaint while animating. Rectangular raster
    // stickers instead get a cheap white card (background + padding + a single
    // box-shadow). SVG logos aren't rectangular, so they carry their own baked
    // white outline in the file and stay transparent with one drop-shadow —
    // same as the go-around stickers (whiteOutline: false).
    const useCard = sticker.whiteOutline !== false && !isSvg
    const pad = Math.round(renderSize * 0.05)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding={useCard ? `${pad}px` : 0}
        backgroundColor={useCard ? 'white' : undefined}
        borderRadius="15px"
        overflow="hidden"
        style={{
          // A single, GPU-cheap shadow. Card-style stickers get a box-shadow;
          // transparent ones get one drop-shadow that hugs their shape.
          boxShadow: useCard ? '0 6px 14px rgba(0,0,0,0.45)' : undefined,
          filter: useCard ? undefined : 'drop-shadow(0 5px 8px rgba(0,0,0,0.45))',
          // Cache as its own layer so hover-scaling just transforms the bitmap.
          willChange: 'transform',
        }}
      >
        <styled.img
          src={sticker.src}
          alt={sticker.title}
          style={{
            width: isSvg ? renderSize : undefined,
            height: isSvg ? 'auto' : undefined,
            maxWidth: renderSize,
            maxHeight: renderSize,
          }}
          objectFit="cover"
          display="block"
          borderRadius={sticker.round ? 'full' : undefined}
          draggable={false}
        />
      </Box>
    )
  }

  const isCircle = sticker.shape === 'circle'
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      backgroundColor={sticker.bg}
      color={sticker.color}
      px={isCircle ? 0 : { base: 3, md: 4 }}
      py={isCircle ? 0 : 2}
      width={isCircle ? { base: '76px', md: '92px' } : 'auto'}
      height={isCircle ? { base: '76px', md: '92px' } : 'auto'}
      borderRadius={sticker.shape === 'skew' ? '2px' : 'full'}
      transform={sticker.shape === 'skew' ? 'skewX(-8deg)' : undefined}
      border="3px solid white"
      boxShadow="0 6px 12px rgba(0,0,0,0.5)"
      textAlign="center"
    >
      <Box transform={sticker.shape === 'skew' ? 'skewX(8deg)' : undefined}>
        <Text
          fontWeight="900"
          fontSize={{ base: isCircle ? 'sm' : 'md', md: isCircle ? 'md' : 'xl' }}
          lineHeight="1.1"
          whiteSpace="nowrap"
        >
          {sticker.label}
        </Text>
        {sticker.sub && (
          <Text
            fontFamily="mono"
            fontSize="9px"
            letterSpacing="0.12em"
            opacity={0.7}
            mt="2px"
            whiteSpace="nowrap"
          >
            {sticker.sub}
          </Text>
        )}
      </Box>
    </Flex>
  )
}

const StickerSheet = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  const [activeSticker, setActiveSticker] = useState<string | null>(null)

  // Measure the container and re-measure on resize / orientation change.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      // Round to reduce churn from sub-pixel resize events.
      setSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const layout = useMemo(
    () => (size ? computeLayout(stickers, size.width, size.height) : null),
    [size]
  )

  return (
    <Box
      width="100%"
      maxWidth="100%"
      overflow="hidden"
      height={{ base: '85vh', md: '70vh' }}
    >
      <Box
        ref={containerRef}
        position="relative"
        width="100%"
        height="100%"
        overflow="hidden"
        userSelect="none"
      >
        <Text
          position="absolute"
          bottom={2}
          right={4}
          fontFamily="mono"
          fontSize="xs"
          letterSpacing="0.25em"
          color="#333"
          userSelect="none"
          pointerEvents="none"
          zIndex={30}
        >
          STICKER WALL
        </Text>

        {layout &&
          stickers.map((sticker, i) => {
            const place = layout[i]
            const isTooltipVisible = activeSticker === sticker.id
            const tooltipId = `sticker-${sticker.id}-description`
            return (
              <Box
                key={sticker.id}
                position="absolute"
                style={{ left: place.cx, top: place.cy }}
                width={0}
                height={0}
                zIndex={isTooltipVisible ? 20 : 10}
              >
                <MotionBox
                  as="button"
                  aria-describedby={tooltipId}
                  aria-label={sticker.title}
                  position="absolute"
                  initial={{
                    opacity: 0,
                    scale: 1.35,
                    x: '-50%',
                    y: '-50%',
                    rotate: place.rotation,
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                    x: '-50%',
                    y: '-50%',
                    rotate: place.rotation,
                  }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  cursor="pointer"
                  // Mouse: hover shows the tooltip. Touch: tap toggles it.
                  // (Framer's onHoverStart also fires on touch, which then
                  // fought the tap toggle and hid the tooltip immediately.)
                  onPointerEnter={(evt: React.PointerEvent) => {
                    if (evt.pointerType === 'mouse') setActiveSticker(sticker.id)
                  }}
                  onPointerLeave={(evt: React.PointerEvent) => {
                    if (evt.pointerType === 'mouse')
                      setActiveSticker((current) =>
                        current === sticker.id ? null : current
                      )
                  }}
                  onPointerUp={(evt: React.PointerEvent) => {
                    if (evt.pointerType !== 'mouse')
                      setActiveSticker((current) =>
                        current === sticker.id ? null : sticker.id
                      )
                  }}
                  onFocus={() => setActiveSticker(sticker.id)}
                  onBlur={() =>
                    setActiveSticker((current) =>
                      current === sticker.id ? null : current
                    )
                  }
                >
                  {/* Hover/active scale lives on a nested layer driven purely by
                      state, so it can't fight the entrance animation or the
                      pointer-gesture feedback loop that made it grow endlessly. */}
                  <MotionBox
                    animate={{ scale: isTooltipVisible ? 1.09 : 1 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <StickerFace sticker={sticker} renderSize={place.size} />
                  </MotionBox>
                </MotionBox>
                <MotionBox
                  id={tooltipId}
                  position="absolute"
                  left="50%"
                  top={`calc(50% + ${place.size / 2 + 12}px)`}
                  width="max-content"
                  maxWidth="min(260px, 70vw)"
                  px={3}
                  py={2}
                  backgroundColor="rgba(17,17,17,0.92)"
                  border="1px solid #ffffff33"
                  borderRadius="sm"
                  color="white"
                  fontSize="md"
                  lineHeight="1.5"
                  textAlign="left"
                  pointerEvents="none"
                  style={{ translateX: '-50%' }}
                  initial={false}
                  animate={
                    isTooltipVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }
                  }
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                >
                  <Text fontWeight="bold" mb={1}>
                    {sticker.title}
                  </Text>
                  <Text opacity={0.78}>{sticker.description}</Text>
                </MotionBox>
              </Box>
            )
          })}
      </Box>
    </Box>
  )
}

export default StickerSheet
