import { useEffect, useRef } from 'react'

const HEIGHT = 56
const SWEEP_MS = 2600
// How long a new segment stays hot after the wave moves.
const KICK_SECONDS = 1.6

// pushWave appends and then trims the front, so the new tail is whatever no longer lines up.
const appended = (prev: number[], next: number[]) => {
  if (!prev.length) return next.length
  for (let shift = 0; shift < prev.length; shift += 1) {
    if (next[0] === prev[shift] && next[1] === prev[shift + 1])
      return next.length - (prev.length - shift)
  }
  return next.length
}

const mix = (from: number[], to: number[], t: number) =>
  from.map((value, index) => Math.round(value + (to[index] - value) * t))

const NightScope = ({ samples }: { samples: number[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const live = useRef({ samples, fresh: 0, changedAt: -Infinity })

  useEffect(() => {
    const prev = live.current.samples
    if (prev === samples) return
    live.current = {
      samples,
      fresh: Math.max(0, appended(prev, samples)),
      changedAt: performance.now(),
    }
  }, [samples])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      width = canvas.clientWidth
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(HEIGHT * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    let frame = 0
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      const { samples: values, fresh, changedAt } = live.current
      const since = (now - changedAt) / 1000
      const kick = since < KICK_SECONDS ? Math.exp(-since * 2.6) : 0
      const mid = HEIGHT / 2
      ctx.clearRect(0, 0, width, HEIGHT)

      if (kick) {
        ctx.fillStyle = `rgba(255,120,60,${0.16 * kick})`
        ctx.fillRect(0, 0, width, HEIGHT)
      }

      ctx.shadowBlur = 0
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(238,150,98,.09)'
      ctx.beginPath()
      for (let col = 1; col < 10; col += 1) {
        const x = Math.round((col / 10) * width) + 0.5
        ctx.moveTo(x, 0)
        ctx.lineTo(x, HEIGHT)
      }
      for (let row = 1; row < 4; row += 1) {
        const y = Math.round((row / 4) * HEIGHT) + 0.5
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      const count = Math.max(values.length, 2)
      const sweep = calm ? 1 : (now % SWEEP_MS) / SWEEP_MS
      const shake = calm ? 0 : kick > 0.55 ? (Math.random() - 0.5) * 6 * kick : 0
      const gain = (HEIGHT / 2 - 5) * (1 + 0.4 * kick)
      const hum = calm ? 0 : 0.7 + kick * 3
      const points = Array.from({ length: count }, (_, index) => {
        const value = Math.max(-1, Math.min(1, values[index] ?? 0))
        const noise =
          (Math.random() - 0.5) * hum + Math.sin(now / 41 + index * 1.7) * hum * 0.5
        return {
          x: (index / (count - 1)) * width + shake,
          y: mid - value * gain + noise,
        }
      })

      ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(255,130,60,.85)'
      for (let index = 1; index < count; index += 1) {
        const a = points[index - 1]
        const b = points[index]
        // Phosphor: the beam leaves the trace bright and it fades until the next pass.
        const age = (sweep - b.x / width + 1) % 1
        const glow = calm ? 0.8 : 0.28 + 0.72 * Math.exp(-age * 3.5)
        const hot = index >= count - fresh ? kick : 0
        const [r, g, bl] = mix([223, 138, 66], [255, 244, 224], hot)
        ctx.shadowBlur = 4 + hot * 12
        ctx.lineWidth = 1.3 + hot * 1.2
        ctx.strokeStyle = `rgba(${r},${g},${bl},${Math.min(1, glow + hot)})`
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      if (!calm) {
        const head = points[Math.min(count - 1, Math.round(sweep * (count - 1)))]
        ctx.shadowBlur = 10
        ctx.fillStyle = 'rgba(255,236,214,.9)'
        ctx.beginPath()
        ctx.arc(head.x, head.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: HEIGHT }}
    />
  )
}

export default NightScope
