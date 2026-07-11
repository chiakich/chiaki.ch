import { useEffect, useRef } from 'react'
import { Box } from 'styled-system/jsx'

// Matrix-style falling glyph rain on a single canvas, filling the section
// behind the terminal. Throttled to ~18fps and centre-masked so the terminal
// stays readable.

const GLYPHS = '0123456789/＼｜ｱｶｻﾀﾅﾊ▓アカサ稲荷'.split('')

const AsciiMatrixField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const fontSize = 16
    let cols = 0
    let drops: number[] = []

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      cols = Math.max(1, Math.floor(canvas.width / fontSize))
      drops = Array.from({ length: cols }, () =>
        Math.floor((Math.random() * -canvas.height) / fontSize)
      )
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let last = 0
    const draw = (time: number) => {
      raf = requestAnimationFrame(draw)
      if (time - last < 55) return // ~18fps — cheap
      last = time

      ctx.fillStyle = 'rgba(1,6,5,0.16)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < cols; i++) {
        const x = i * fontSize
        const y = drops[i] * fontSize
        // bright head
        ctx.fillStyle = 'rgba(150,255,214,0.9)'
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y)
        // dim trailing glyph
        if (y > fontSize) {
          ctx.fillStyle = 'rgba(63,190,155,0.3)'
          ctx.fillText(GLYPHS[(i * 3) % GLYPHS.length], x, y - fontSize)
        }
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.6
      }
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <Box
      position="absolute"
      inset="0"
      zIndex="0"
      opacity=".55"
      pointerEvents="none"
      aria-hidden="true"
      style={{
        WebkitMaskImage:
          'radial-gradient(ellipse 60% 60% at 50% 46%, transparent 4%, black 66%)',
        maskImage:
          'radial-gradient(ellipse 60% 60% at 50% 46%, transparent 4%, black 66%)',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </Box>
  )
}

export default AsciiMatrixField
