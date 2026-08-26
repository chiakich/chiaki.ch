import { useEffect, useRef, useState } from 'react'

type TerminalViewport = {
  height: number | null
  offsetTop: number
  keyboardOpen: boolean
  /**
   * Layout-viewport pixels hidden below the visual viewport — the keyboard
   * plus Safari's collapsed URL pill and form-assistant rows. The layout
   * viewport still extends behind all of it, so the page can keep painting
   * there (the pill floats over page pixels); only interactive UI must stay
   * above this inset.
   */
  keyboardInset: number
}

const isEditable = (element: Element | null) =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLElement && element.isContentEditable)

/**
 * True when the touch landed inside something that legitimately scrolls
 * (transcript, chip row, lexicon panel) or an editable field — those keep
 * their native behaviour; everything else must not pan the page.
 */
const touchMayScroll = (target: EventTarget | null) => {
  let element = target instanceof Element ? target : null
  while (element && element !== document.body) {
    if (isEditable(element)) return true
    const style = window.getComputedStyle(element)
    if (
      (/(auto|scroll)/.test(style.overflowY) &&
        element.scrollHeight > element.clientHeight) ||
      (/(auto|scroll)/.test(style.overflowX) &&
        element.scrollWidth > element.clientWidth)
    ) {
      return true
    }
    element = element.parentElement
  }
  return false
}

const useDocumentScrollLock = () => {
  useEffect(() => {
    const { body, documentElement } = document
    const scrollY = window.scrollY
    const previousBody = {
      left: body.style.left,
      overflow: body.style.overflow,
      position: body.style.position,
      right: body.style.right,
      top: body.style.top,
      width: body.style.width,
    }
    const previousDocumentElement = {
      overflow: documentElement.style.overflow,
      overscrollBehavior: documentElement.style.overscrollBehavior,
    }

    documentElement.style.overflow = 'hidden'
    documentElement.style.overscrollBehavior = 'none'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    // `overflow: hidden` does not stop iOS from letting a finger pan the
    // visual viewport while the keyboard is up (the layout viewport is taller
    // than what's visible, so the OS treats the page as pannable). The only
    // reliable lock is refusing the touchmove itself, so refuse it everywhere
    // except inside elements that actually scroll their own content.
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) return
      if (touchMayScroll(event.target)) return
      event.preventDefault()
    }
    document.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      document.removeEventListener('touchmove', onTouchMove)
      documentElement.style.overflow = previousDocumentElement.overflow
      documentElement.style.overscrollBehavior =
        previousDocumentElement.overscrollBehavior
      body.style.position = previousBody.position
      body.style.top = previousBody.top
      body.style.left = previousBody.left
      body.style.right = previousBody.right
      body.style.width = previousBody.width
      body.style.overflow = previousBody.overflow
      window.scrollTo(0, scrollY)
    }
  }, [])
}

/** Tracks the part of the screen that remains above a mobile soft keyboard. */
const useTerminalViewport = (): TerminalViewport => {
  useDocumentScrollLock()

  const baselineHeightRef = useRef(0)
  const [viewport, setViewport] = useState<TerminalViewport>({
    height: null,
    offsetTop: 0,
    keyboardOpen: false,
    keyboardInset: 0,
  })

  useEffect(() => {
    const visualViewport = window.visualViewport
    let frame = 0

    const update = () => {
      const height = Math.round(visualViewport?.height ?? window.innerHeight)
      // iOS pans the visual viewport down to keep a focused input visible even
      // while the document is scroll-locked; the fixed frame has to follow, or
      // the page shows shifted up with a black band under it.
      const offsetTop = Math.round(visualViewport?.offsetTop ?? 0)
      const keyboardInset = Math.max(
        0,
        Math.round(window.innerHeight) - height - offsetTop
      )
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
          current.keyboardOpen === keyboardOpen &&
          current.keyboardInset === keyboardInset
        ) {
          return current
        }
        return { height, offsetTop, keyboardOpen, keyboardInset }
      })

      // iOS pans the page automatically to reveal the focused input. Once the
      // frame has compacted to the visual viewport the input is visible at
      // offset 0, so undo the pan instead of living with the displacement.
      // The offsetTop compensation above still covers the frames in between.
      if (heightReduced && editableFocused && offsetTop > 0) {
        window.scrollTo(0, 0)
      }
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
