import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <LocaleProvider locale={locale}>
        <TopBar />
        <main>
          <Component {...pageProps} />
        </main>
        <PageMeta />
      </LocaleProvider>
    </>
  )
}

export default MyApp
