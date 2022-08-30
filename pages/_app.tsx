import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    cssVarPrefix: 'c',
  },
  styles: {
    global: {
      body: {
        bg: 'black',
        fontFamily: '"xingothic-tc","Noto Sans TC", sans-serif',
        fontWeight: '700',
      },
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Chiaki Inari</title>
        <meta name="description" content="Chiaki Inari" />
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
