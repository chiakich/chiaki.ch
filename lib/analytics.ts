import { useEffect, type RefObject } from 'react'

// Umami Cloud → Settings → Websites → Edit → Website ID; empty disables tracking
export const UMAMI_WEBSITE_ID = 'b9b2d53a-5c01-4283-98b4-4763630ce35a'
export const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js'
// Keeps localhost and preview deploys out of the stats
export const UMAMI_DOMAINS = 'chiaki.ch'

type EventData = Record<string, string | number | boolean>

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void }
  }
}

export const track = (event: string, data?: EventData) => {
  window.umami?.track(event, data)
}

export const useTrackOnView = (
  ref: RefObject<Element | null>,
  event: string,
  data?: EventData
) => {
  const key = JSON.stringify(data ?? {})

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        track(event, data)
        observer.disconnect()
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, event, key])
}
