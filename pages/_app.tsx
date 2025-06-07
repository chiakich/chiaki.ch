import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    cssVarPrefix: 'c',
  },
  sizes: {
    width: {
      section: '1080px',
    },
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>千秋稻荷社 - Chiaki Inari Shrine</title>
        <meta name="description" content="千秋的個人網站與作品展示" />
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
