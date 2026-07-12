import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import PageMeta from 'components/PageMeta'
import '../styled-system/styles.css'

declare global {
  interface Window {
    _jf?: {
      flush?: () => void
    }
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    let frameId: number | undefined

    const refreshJustfont = () => {
      // Wait for the destination page to commit its content before justfont scans it.
      frameId = window.requestAnimationFrame(() => {
        window._jf?.flush?.()
      })
    }

    router.events.on('routeChangeComplete', refreshJustfont)

    return () => {
      router.events.off('routeChangeComplete', refreshJustfont)

      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [router.events])

  return (
    <>
      <Component {...pageProps} />
      <PageMeta />
    </>
  )
}

export default MyApp
