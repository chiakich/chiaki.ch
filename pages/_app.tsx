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
  components: {
    Button: {
      baseStyle: {
        WebkitTapHighlightColor: 'transparent',
        borderRadius: '100px',
        bgColor: 'rgba(100, 100, 100, 0.5)',
        transition: 'filter .2s',
        _hover: {
          filter: 'brightness(1.3)',
        },
        _active: {
          filter: 'brightness(1.5)',
        },
      },
      defaultProps: {
        variant: 'unstyle',
        size: 'lg',
      },
    },
    Link: {
      baseStyle: {
        _hover: { textDecoration: 'none' },
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
