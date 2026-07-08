import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styled-system/styles.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>千秋稻荷社 - Chiaki Inari Shrine</title>
        <meta name="description" content="千秋的個人網站與作品展示" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
