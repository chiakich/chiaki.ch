import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  jsxFramework: 'react',
  theme: {
    extend: {
      breakpoints: {
        sm: '30em',
        md: '48em',
        lg: '62em',
        xl: '80em',
        '2xl': '96em',
      },
      tokens: {
        sizes: {
          section: { value: '1080px' },
          width: {
            section: { value: '1080px' },
          },
          container: {
            xl: { value: '1280px' },
          },
        },
        fonts: {
          body: { value: '"xingothic-tc", "Noto Sans TC", sans-serif' },
        },
      },
      keyframes: {
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'black',
      fontFamily: 'body',
    },
    a: {
      color: 'inherit',
      textDecoration: 'none',
    },
    button: {
      WebkitTapHighlightColor: 'transparent',
    },
  },
})
