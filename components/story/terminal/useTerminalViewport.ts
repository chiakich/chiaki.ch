import { useEffect, useRef, useState } from 'react'

type TerminalViewport = {
  height: number | null
  offsetTop: number
  keyboardOpen: boolean
}

const isEditable = (element: Element | null) =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLElement && element.isContentEditable)

/** Tracks the part of the screen that remains above a mobile soft keyboard. */
const useTerminalViewport = (): TerminalViewport => {
  const baselineHeightRef = useRef(0)
  const [viewport, setViewport] = useState<TerminalViewport>({
    height: null,
    offsetTop: 0,
    keyboardOpen: false,
  })

  useEffect(() => {
    const visualViewport = window.visualViewport
    let frame = 0

    const update = () => {
      const height = Math.round(visualViewport?.height ?? window.innerHeight)
      const offsetTop = Math.round(visualViewport?.offsetTop ?? 0)
      const editableFocused = isEditable(document.activeElement)

      if (!baselineHeightRef.current) baselineHeightRef.current = height
      if (!editableFocused) {
        baselineHeightRef.current = Math.max(baselineHeightRef.current, height)
      }

      const heightReduced = baselineHeightRef.current - height > 120
      setViewport((current) => {
        // Keep the compact layout through the keyboard's closing animation;
        // focusout usually arrives before visualViewport has grown again.
        const keyboardOpen =
          heightReduced && (editableFocused || current.keyboardOpen)
        if (
          current.height === height &&
          current.offsetTop === offsetTop &&
          current.keyboardOpen === keyboardOpen
        ) {
          return current
        }
        return { height, offsetTop, keyboardOpen }
      })
    }

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(update)
    }
    const resetBaseline = () => {
      baselineHeightRef.current = 0
      scheduleUpdate()
    }

    update()
    visualViewport?.addEventListener('resize', scheduleUpdate)
    visualViewport?.addEventListener('scroll', scheduleUpdate)
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('orientationchange', resetBaseline)
    document.addEventListener('focusin', scheduleUpdate)
    document.addEventListener('focusout', scheduleUpdate)

    return () => {
      window.cancelAnimationFrame(frame)
      visualViewport?.removeEventListener('resize', scheduleUpdate)
      visualViewport?.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('orientationchange', resetBaseline)
      document.removeEventListener('focusin', scheduleUpdate)
      document.removeEventListener('focusout', scheduleUpdate)
    }
  }, [])

  return viewport
}

export default useTerminalViewport
