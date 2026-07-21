// Deterministic pseudo-random bars so SSR and client render match
const Barcode = ({
  seed,
  width = 96,
  height = 20,
  color = 'rgba(255,255,255,0.7)',
  vertical = false,
}: {
  seed: string
  width?: number
  height?: number
  color?: string
  vertical?: boolean
}) => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0
  }
  const bars: { pos: number; size: number }[] = []
  let pos = 0
  while (pos < 100) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0
    const size = 1 + (h % 4)
    h = (Math.imul(h, 1103515245) + 12345) >>> 0
    const gap = 1 + (h % 3)
    bars.push({ pos, size })
    pos += size + gap
  }
  return (
    <svg
      width={vertical ? height : width}
      height={vertical ? width : height}
      viewBox={vertical ? '0 0 20 100' : '0 0 100 20'}
      preserveAspectRatio="none"
      aria-hidden
      style={{ display: 'block' }}
    >
      {bars.map((bar) =>
        vertical ? (
          <rect key={bar.pos} x={0} y={bar.pos} width={20} height={bar.size} fill={color} />
        ) : (
          <rect key={bar.pos} x={bar.pos} y={0} width={bar.size} height={20} fill={color} />
        ),
      )}
    </svg>
  )
}

export default Barcode
