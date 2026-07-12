import { useCallback, useEffect, useRef, useState } from 'react'
import { WORLDLINES } from './nixieTheme'

const clockValue = () => {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  // 小數點後六位（分分秒秒＋百分之一秒），跟世界線變動率與 $ 背景陰極一樣寬
  return `${now.getHours() >= 12 ? 1 : 0}.${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(Math.floor(now.getMilliseconds() / 10))}`
}

export const useWorldline = () => {
  const [display, setDisplay] = useState('0.000000')
  const [shifting, setShifting] = useState(false)
  const busy = useRef(false)
  const timers = useRef<number[]>([])

  const later = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay)
    timers.current.push(id)
  }, [])

  const shift = useCallback(() => {
    if (busy.current) return
    busy.current = true
    setShifting(true)
    const target = WORLDLINES[Math.floor(Math.random() * WORLDLINES.length)]
    let tick = 0
    const spin = window.setInterval(() => {
      tick += 1
      setDisplay(target.split('').map((char, index) => char === '.' ? '.' : tick > 18 + index * 2 ? char : String(Math.floor(Math.random() * 10))).join(''))
      if (tick > 34) {
        window.clearInterval(spin)
        setDisplay(target)
        setShifting(false)
        later(() => { busy.current = false; setDisplay(clockValue()) }, 2100)
      }
    }, 45)
    timers.current.push(spin)
  }, [later])

  useEffect(() => {
    const activeTimers = timers.current
    const clock = window.setInterval(() => { if (!busy.current) setDisplay(clockValue()) }, 100)
    const autoShift = window.setInterval(shift, 13000)
    activeTimers.push(clock, autoShift)
    return () => activeTimers.forEach(window.clearInterval)
  }, [shift])

  return { display, shifting, shift }
}
