import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { LazyMotion } from 'framer-motion'
import { useEffect } from 'react'
import PageMeta from 'components/PageMeta'
import TopBar from 'components/TopBar'
import { LocaleProvider, type Locale, locales } from 'i18n'
import '../styled-system/styles.css'

declare global {
  interface Window {
    _jf?: {
      flush?: () => void
    }
  }
}

// Kicked off at module scope rather than when LazyMotion first asks for it, so
// the chunk downloads alongside hydration instead of adding a round trip after
// it. That matters because heroes render from `initial={{ opacity: 0 }}`: waiting
// for features would leave them invisible for an extra RTT.
const motionFeatures = import('lib/motionFeatures').then((mod) => mod.default)
const loadMotionFeatures = () => motionFeatures

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const pathnameLocale = router.pathname.split('/')[1]
  const locale = (pageProps.locale ??
    (locales.includes(pathnameLocale as Locale) ? pathnameLocale : 'tw')) as Locale

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
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <LocaleProvider locale={locale} messages={pageProps.messages}>
        {/*
          Components use `m` rather than `motion`, so the feature set is supplied
          once here instead of every call site dragging in the full motion
          bundle. `strict` makes a stray `motion.*` throw during prerender
          rather than silently shipping both. No layout/drag props are in use,
          so domAnimation (animation + exit + inView + tap/hover/focus) covers
          everything — reach for domMax if that changes.
        */}
        <LazyMotion features={loadMotionFeatures} strict>
          <TopBar />
          <main>
            <Component {...pageProps} />
          </main>
          <PageMeta override={pageProps.pageMeta} />
        </LazyMotion>
      </LocaleProvider>
    </>
  )
}

export default MyApp
