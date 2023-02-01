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
        border: '1px solid white',
        borderRadius: '100px',
        backdropFilter: 'blur(10px)',
        bgColor: 'rgba(100, 100, 100, 0.5)',
        _hover: {
          bgColor: 'rgba(80, 80, 80, 0.5)',
        },
        _active: {
          bgColor: 'rgba(100, 100, 100, 0.5)',
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
