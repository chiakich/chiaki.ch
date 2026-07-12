import type { AppProps } from 'next/app'
import PageMeta from 'components/PageMeta'
import '../styled-system/styles.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <PageMeta />
    </>
  )
}

export default MyApp
