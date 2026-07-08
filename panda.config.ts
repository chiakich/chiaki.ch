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
          akitra: { value: 'akitra, "xingothic-tc", sans-serif' },
          nixie: { value: 'nixie, monospace' },
          huninn: { value: 'huninn, "xingothic-tc", sans-serif' },
        },
        colors: {
          accent: { value: '#df8a42' },
          accentSoft: { value: '#f5c8a1' },
        },
      },
      keyframes: {
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        nixieShine: {
          '0%': { color: '#ff7728' },
          '33%': { color: '#f57c37' },
          '66%': { color: '#e85d02' },
          '100%': { color: '#ff7728' },
        },
      },
    },
  },
  globalFontface: {
    akitra: {
      src: 'url(/assets/fonts/AkiTRA-Regular.woff2) format("woff2")',
      fontWeight: 400,
      fontDisplay: 'swap',
    },
    nixie: {
      src: 'url(/assets/fonts/AkiNixieNumber-Regular.woff2) format("woff2")',
      fontWeight: 400,
      fontDisplay: 'swap',
    },
    // Subset for headings; the full font is lazy-loaded by the type tester
    huninn: {
      src: 'url(/assets/fonts/huninn-subset.woff2) format("woff2")',
      fontWeight: 400,
      fontDisplay: 'swap',
    },
  },
  globalCss: {
    body: {
      bg: 'black',
      fontFamily: 'body',
      fontWeight: 'normal',
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
