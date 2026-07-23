import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'

const Text = styled.p

const MotionBox = motion.create(Box)

// Fraction of the container area the stickers should collectively cover.
// Mask-based packing wastes far less space than circle packing, so this can
// sit higher than before; the layout shrinks and repacks if it can't fit.
const FILL_RATIO = 0.55
// Narrow (mobile) containers are much smaller in raw area than desktop ones
// despite the taller aspect ratio, which made stickers look tiny even though
// the fill ratio was "the same". Use a higher ratio below this width so
// mobile stickers start large and only shrink via the repack loop if they
// truly don't fit.
const MOBILE_WIDTH_BREAKPOINT = 640
const MOBILE_FILL_RATIO = 0.8
// Minimum clear space between two stickers' visible edges, in pixels.
const STICKER_MARGIN = 4
// Board cell size in css px. Smaller = tighter packing, slower layout.
const CELL = 2
// Max absolute rotation applied to each sticker, in degrees.
const MAX_ROTATION = 12
// Fixed seed keeps the layout stable across renders (and SSR-safe).
const LAYOUT_SEED = 20260713
// When some sticker can't be placed, scale everything down and repack.
const SHRINK_STEP = 0.93
const MAX_ATTEMPTS = 8

type StickerBase = {
  // Doubles as the i18n key: title/description live under
  // profilePage.stickerSheet.items.<id> in the locale files.
  id: string
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
  noRadius?: boolean
  whiteOutline?: boolean
}

type Sticker = TextSticker | ImageSticker

const stickers: Sticker[] = [
  { id: 'oorai', kind: 'image', src: '/assets/profile/stickers/oorai.webp', size: 150 },
  { id: 'react', kind: 'image', src: '/assets/profile/stickers/react-logo.webp', size: 100 },
  { id: 'clip', kind: 'image', src: '/assets/profile/stickers/clip.webp', size: 150 },
  { id: 'wtm', kind: 'image', src: '/assets/profile/stickers/wtm.webp', size: 100 },
  { id: 'coscup', kind: 'image', src: '/assets/profile/stickers/coscup.webp', size: 200 },
  { id: 'sitcon', kind: 'image', src: '/assets/profile/stickers/sitcon.webp', size: 200 },
  { id: 'justfont', kind: 'image', src: '/assets/profile/stickers/jf.webp', size: 200 },
  { id: 'glyphs4', kind: 'image', src: '/assets/profile/stickers/glyphs4.webp', size: 70 },
  {
    id: 'arcticVault',
    kind: 'image',
    src: '/assets/profile/stickers/arctic-code-vault-contributor.webp',
    size: 50,
  },
  { id: 'isekai', kind: 'image', src: '/assets/profile/stickers/isekai.webp', size: 100 },
  { id: 'isekaiArt', kind: 'image', src: '/assets/profile/stickers/isekai_art.webp', size: 150 },
  { id: 'sukonbu', kind: 'image', src: '/assets/profile/stickers/sukonbu.webp', size: 100 },
  { id: 'hinako', kind: 'image', src: '/assets/profile/stickers/hinako.webp', size: 80 },
  { id: 'himehina', kind: 'image', src: '/assets/profile/stickers/himehina.webp', size: 220 },
  { id: 'wwdc26', kind: 'image', src: '/assets/profile/stickers/wwdc26.webp', size: 120 },
  {
    id: 'endfield',
    kind: 'image',
    src: '/assets/profile/stickers/endfield.webp',
    size: 100,
    noRadius: true,
  },
  {
    id: 'evilTwinBrewing',
    kind: 'image',
    src: '/assets/profile/stickers/eviltwin.webp',
    size: 100,
    noRadius: true,
  },
  { id: 'flighty', kind: 'image', src: '/assets/profile/stickers/flighty.webp', size: 500 },
  {
    id: 'toge',
    kind: 'image',
    src: '/assets/profile/stickers/toge.svg',
    size: 200,
    noRadius: true,
  },
  { id: 'uiFifthAnniversary', kind: 'image', src: '/assets/profile/stickers/ui_5th.webp', size: 200 },
  { id: 'uiMembership', kind: 'image', src: '/assets/profile/stickers/ui_member.webp', size: 50 },
  { id: 'aogiri', kind: 'image', src: '/assets/profile/stickers/aogiri.webp', size: 100 },
  { id: 'rickAndMorty', kind: 'image', src: '/assets/profile/stickers/rm.webp', size: 150 },
  {
    id: 'nico25',
    kind: 'image',
    src: '/assets/profile/stickers/nico25.webp',
    size: 100,
    noRadius: true,
  },
  { id: 'teto', kind: 'image', src: '/assets/profile/stickers/teto.webp', size: 100 },
  { id: 'kasane', kind: 'image', src: '/assets/profile/stickers/kasane.webp', size: 250 },
  { id: 'comiket50', kind: 'image', src: '/assets/profile/stickers/comiket50.webp', size: 150 },
  { id: 'moztw', kind: 'image', src: '/assets/profile/stickers/moztw.webp', size: 150 },
  { id: 'fbosc', kind: 'image', src: '/assets/profile/stickers/fbosc.webp', size: 150 },
  { id: 'ponfes25', kind: 'image', src: '/assets/profile/stickers/ponfes25.webp', size: 200 },
  { id: 'kancolle', kind: 'image', src: '/assets/profile/stickers/kancolle.webp', size: 350 },
  { id: 'echoesbaa', kind: 'image', src: '/assets/profile/stickers/echoesbaa.webp', size: 200 },
  {
    id: 'amavel',
    kind: 'image',
    src: '/assets/profile/stickers/amavel.webp',
    size: 200,
    whiteOutline: true,
  },
  { id: 'expo2025', kind: 'image', src: '/assets/profile/stickers/expo2025.webp', size: 200 },
  { id: 'darjeeling', kind: 'image', src: '/assets/profile/stickers/darjeeling.webp', size: 200 },
  { id: 'mono', kind: 'image', src: '/assets/profile/stickers/mono.svg', size: 100 },
  { id: 'yorimo', kind: 'image', src: '/assets/profile/stickers/yorimo.webp', size: 200 },
  { id: 'suzumiya', kind: 'image', src: '/assets/profile/stickers/suzumiya.webp', size: 200 },
  { id: 'back2future', kind: 'image', src: '/assets/profile/stickers/back2future.webp', size: 200 },
  { id: 'yeastken', kind: 'image', src: '/assets/profile/stickers/yeastken.webp', size: 150 },
]

// Localised title/description for a sticker, resolved from its id.
const stickerText = (t: (key: string) => string, id: string) => ({
  title: t(`profilePage.stickerSheet.items.${id}.title`),
  description: t(`profilePage.stickerSheet.items.${id}.description`),
})

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

// Layout needs the images' pixels for their alpha shapes; cache them so
// resize-triggered repacks don't refetch.
const imageCache = new Map<string, Promise<HTMLImageElement | null>>()

const loadImage = (src: string) => {
  let cached = imageCache.get(src)
  if (!cached) {
    cached = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = src
    })
    imageCache.set(src, cached)
  }
  return cached
}

// A sticker's on-screen footprint (before rotation) plus how to paint its
// opaque region. Must mirror how StickerFace actually renders each kind.
type VisualBox = {
  w: number
  h: number
  draw: (ctx: CanvasRenderingContext2D) => void
}

const fillRoundedRect = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  r: number
) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.arcTo(w, 0, w, h, radius)
  ctx.arcTo(w, h, 0, h, radius)
  ctx.arcTo(0, h, 0, 0, radius)
  ctx.arcTo(0, 0, w, 0, radius)
  ctx.closePath()
  ctx.fill()
}

const visualBoxFor = (
  sticker: Sticker,
  px: number,
  img: HTMLImageElement | null
): VisualBox => {
  if (sticker.kind === 'text') {
    // Rough estimate; text stickers are currently unused.
    const isCircle = sticker.shape === 'circle'
    const w = isCircle ? 92 : sticker.label.length * 12 + 40
    const h = isCircle ? 92 : sticker.sub ? 58 : 44
    const r = isCircle ? w / 2 : sticker.shape === 'pill' ? h / 2 : 4
    return { w, h, draw: (ctx) => fillRoundedRect(ctx, w, h, r) }
  }

  const isSvg = sticker.src.endsWith('.svg')
  const nw = img?.naturalWidth ?? 0
  const nh = img?.naturalHeight ?? 0
  // Mirror StickerFace's sizing: SVGs get an explicit width, raster images
  // are clamped by max-width/max-height and never upscale.
  let iw = px
  let ih = px
  if (isSvg) {
    ih = nw > 0 && nh > 0 ? Math.min(px, (px * nh) / nw) : px
  } else if (nw > 0 && nh > 0) {
    const scale = Math.min(1, px / nw, px / nh)
    iw = nw * scale
    ih = nh * scale
  }

  const useCard = sticker.whiteOutline === true && !isSvg
  if (useCard) {
    const pad = Math.round(px * 0.05)
    const w = iw + pad * 2
    const h = ih + pad * 2
    return { w, h, draw: (ctx) => fillRoundedRect(ctx, w, h, 15) }
  }
  return {
    w: iw,
    h: ih,
    draw: (ctx) => {
      // Transparent stickers collide with their real pixel shape; a failed
      // image load degrades to a solid rectangle.
      if (img) ctx.drawImage(img, 0, 0, iw, ih)
      else ctx.fillRect(0, 0, iw, ih)
    },
  }
}

// Grow the opaque cells by `r` so STICKER_MARGIN is enforced by the mask
// itself and placement stays a plain overlap test.
const dilate = (grid: Uint8Array, w: number, h: number, r: number) => {
  let src = grid
  for (let pass = 0; pass < r; pass++) {
    const out = new Uint8Array(src)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!src[y * w + x]) continue
        if (x > 0) out[y * w + x - 1] = 1
        if (x < w - 1) out[y * w + x + 1] = 1
        if (y > 0) out[(y - 1) * w + x] = 1
        if (y < h - 1) out[(y + 1) * w + x] = 1
      }
    }
    src = out
  }
  return src
}

// A sticker's rasterised footprint at board resolution, rotation baked in.
// xs/ys list only the set cells so collision tests skip transparent areas.
type Mask = { w: number; h: number; xs: Int16Array; ys: Int16Array }

const buildMask = (box: VisualBox, rotationDeg: number): Mask | null => {
  const rad = (rotationDeg * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  // Pad by the margin so dilation has room to grow into.
  const w = Math.max(
    1,
    Math.ceil((box.w * cos + box.h * sin + STICKER_MARGIN * 2) / CELL)
  )
  const h = Math.max(
    1,
    Math.ceil((box.w * sin + box.h * cos + STICKER_MARGIN * 2) / CELL)
  )
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.translate(w / 2, h / 2)
  ctx.rotate(rad)
  // Uniform scale commutes with the rotation above.
  ctx.scale(1 / CELL, 1 / CELL)
  ctx.translate(-box.w / 2, -box.h / 2)
  ctx.fillStyle = '#000'
  box.draw(ctx)

  const data = ctx.getImageData(0, 0, w, h).data
  let grid: Uint8Array = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) grid[i] = data[i * 4 + 3] > 25 ? 1 : 0
  grid = dilate(grid, w, h, Math.round(STICKER_MARGIN / CELL))

  let count = 0
  for (let i = 0; i < w * h; i++) if (grid[i]) count++
  // An empty mask (e.g. an SVG the browser refused to rasterise) would let
  // the sticker land anywhere; block its whole bounds instead.
  if (count === 0) {
    grid.fill(1)
    count = w * h
  }
  const xs = new Int16Array(count)
  const ys = new Int16Array(count)
  let n = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y * w + x]) {
        xs[n] = x
        ys[n] = y
        n++
      }
    }
  }
  return { w, h, xs, ys }
}

const fits = (mask: Mask, board: Uint8Array, bw: number, bx: number, by: number) => {
  for (let i = 0; i < mask.xs.length; i++) {
    if (board[(by + mask.ys[i]) * bw + bx + mask.xs[i]]) return false
  }
  return true
}

const stamp = (
  mask: Mask,
  board: Uint8Array,
  bw: number,
  bx: number,
  by: number
) => {
  for (let i = 0; i < mask.xs.length; i++) {
    board[(by + mask.ys[i]) * bw + bx + mask.xs[i]] = 1
  }
}

// Walk an Archimedean spiral out from the board centre and return the first
// position where the mask overlaps nothing already placed (the d3-cloud
// strategy). The spiral is stretched horizontally so landscape containers
// fill sideways instead of leaving dead side margins.
const placeMask = (
  mask: Mask,
  board: Uint8Array,
  bw: number,
  bh: number,
  phase: number,
  aspect: number
) => {
  const maxR = Math.hypot(bw, bh) / 2
  let theta = 0
  while (true) {
    const r = 0.5 * theta
    if (r > maxR) return null
    const bx = Math.round(bw / 2 + Math.cos(theta + phase) * r * aspect - mask.w / 2)
    const by = Math.round(bh / 2 + Math.sin(theta + phase) * r - mask.h / 2)
    // Step roughly 1.5 cells along the arc per iteration.
    theta += Math.min(0.5, 1.5 / Math.max(r, 1))
    if (bx < 0 || by < 0 || bx + mask.w > bw || by + mask.h > bh) continue
    if (fits(mask, board, bw, bx, by)) return { bx, by }
  }
}

// Word-cloud style packing (à la d3-cloud): rasterise each sticker into a
// coarse alpha mask and spiral it out from the centre until it finds a free
// spot on the board bitmap. Colliding with real pixel shapes lets concave
// stickers interlock, which the previous circle packing never could.
const computeLayout = async (
  items: Sticker[],
  width: number,
  height: number
): Promise<Placement[]> => {
  const rand = mulberry32(LAYOUT_SEED)
  const rotations = items.map(() => (rand() * 2 - 1) * MAX_ROTATION)
  const phases = items.map(() => rand() * Math.PI * 2)
  const images = await Promise.all(
    items.map((s) => (s.kind === 'image' ? loadImage(s.src) : Promise.resolve(null)))
  )

  const margin = Math.min(width, height) * 0.04
  const usableW = Math.max(1, width - margin * 2)
  const usableH = Math.max(1, height - margin * 2)
  const ellipseAspect = Math.min(1.5, Math.max(1, (width / height) * 0.75))

  // One scale unit so total sticker area ≈ fillRatio of the usable area.
  const fillRatio = width < MOBILE_WIDTH_BREAKPOINT ? MOBILE_FILL_RATIO : FILL_RATIO
  const sumSize = items.reduce((acc, s) => acc + s.size, 0)
  let unit = Math.sqrt((fillRatio * usableW * usableH) / sumSize)

  // Anchor first, then large to small: big stickers claim space near the
  // centre and small logos fill the notches left between them.
  const order = items.map((_, i) => i)
  order.sort((a, b) =>
    a === 0 ? -1 : b === 0 ? 1 : items[b].size - items[a].size || a - b
  )

  const bw = Math.ceil(usableW / CELL)
  const bh = Math.ceil(usableH / CELL)

  let attempt = 0
  while (true) {
    const board = new Uint8Array(bw * bh)
    const placements = new Array<Placement | null>(items.length).fill(null)
    let ok = true
    for (const index of order) {
      const px = unit * Math.sqrt(items[index].size)
      const mask = buildMask(
        visualBoxFor(items[index], px, images[index]),
        rotations[index]
      )
      const spot =
        mask && placeMask(mask, board, bw, bh, phases[index], ellipseAspect)
      if (!mask || !spot) {
        ok = false
        continue
      }
      stamp(mask, board, bw, spot.bx, spot.by)
      placements[index] = {
        cx: margin + (spot.bx + mask.w / 2) * CELL,
        cy: margin + (spot.by + mask.h / 2) * CELL,
        size: px,
        rotation: rotations[index],
      }
    }
    if (ok || attempt >= MAX_ATTEMPTS - 1) {
      // Only a pathologically small container reaches this fallback: stack
      // anything unplaced at the centre so nothing disappears.
      return items.map(
        (s, i) =>
          placements[i] ?? {
            cx: width / 2,
            cy: height / 2,
            size: unit * Math.sqrt(s.size),
            rotation: rotations[i],
          }
      )
    }
    unit *= SHRINK_STEP
    attempt++
  }
}

const StickerFace = ({
  sticker,
  renderSize,
}: {
  sticker: Sticker
  renderSize: number
}) => {
  const { t } = useI18n()
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
    const useCard = sticker.whiteOutline === true && !isSvg
    const pad = Math.round(renderSize * 0.05)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding={useCard ? `${pad}px` : 0}
        backgroundColor={useCard ? 'white' : undefined}
        borderRadius={sticker.noRadius ? undefined : '10px'}
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
          alt={stickerText(t, sticker.id).title}
          style={{
            width: isSvg ? renderSize : undefined,
            height: isSvg ? 'auto' : undefined,
            maxWidth: renderSize,
            maxHeight: renderSize,
          }}
          objectFit="cover"
          display="block"
          borderRadius={
            sticker.noRadius ? undefined : sticker.round ? 'full' : undefined
          }
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
          fontWeight="black"
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

const StickerTooltip = ({
  id,
  sticker,
  place,
  container,
  visible,
}: {
  id: string
  sticker: Sticker
  place: Placement
  container: { width: number; height: number }
  visible: boolean
}) => {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  // Horizontal shift that keeps the tooltip inside the container, so edge
  // stickers' descriptions aren't clipped by the sheet's overflow: hidden.
  const [shift, setShift] = useState(0)
  const [above, setAbove] = useState(false)

  // The tooltip is always in the DOM (just transparent), so it can be
  // measured whenever the layout or container changes rather than on open.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const pad = 8
    const gap = place.size / 2 + 12
    const idealLeft = place.cx - el.offsetWidth / 2
    const clampedLeft = Math.min(
      Math.max(idealLeft, pad),
      container.width - el.offsetWidth - pad
    )
    setShift(clampedLeft - idealLeft)
    setAbove(place.cy + gap + el.offsetHeight > container.height - pad)
  }, [place, container])

  const gap = place.size / 2 + 12
  return (
    <MotionBox
      ref={ref}
      id={id}
      position="absolute"
      left="50%"
      top={above ? undefined : `calc(50% + ${gap}px)`}
      bottom={above ? `calc(50% + ${gap}px)` : undefined}
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
      style={{ translateX: `calc(-50% + ${shift}px)` }}
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: above ? -4 : 4 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    >
      <Text fontWeight="bold" mb={1}>
        {stickerText(t, sticker.id).title}
      </Text>
      <Text opacity={0.78}>{stickerText(t, sticker.id).description}</Text>
    </MotionBox>
  )
}

const StickerSheet = () => {
  const { t } = useI18n()
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

  const [layout, setLayout] = useState<Placement[] | null>(null)

  // Mask packing reads image pixels, so the layout arrives asynchronously.
  useEffect(() => {
    if (!size) return
    let cancelled = false
    computeLayout(stickers, size.width, size.height).then((placements) => {
      if (!cancelled) setLayout(placements)
    })
    return () => {
      cancelled = true
    }
  }, [size])

  return (
    <Box width="100%" maxWidth="100%" overflow="hidden" height="100%">
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
          {t('profilePage.stickerSheet.wallLabel')}
        </Text>

        {layout &&
          size &&
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
                fontFamily="'M 翔鶴黑體 TC', 'PingFang TC', 'LiHei Pro', 'Heiti TC', 'Source Han Sans TC', 'Noto Sans TC',
    'Hiragino Sans', 'Century Gothic', 'Microsoft Jhenghei', '微軟正黑體', sans-serif"
              >
                <MotionBox
                  as="button"
                  aria-describedby={tooltipId}
                  aria-label={stickerText(t, sticker.id).title}
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
                <StickerTooltip
                  id={tooltipId}
                  sticker={sticker}
                  place={place}
                  container={size}
                  visible={isTooltipVisible}
                />
              </Box>
            )
          })}
      </Box>
    </Box>
  )
}

export default StickerSheet
