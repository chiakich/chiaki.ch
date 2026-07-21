import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  jsxFramework: 'react',
  conditions: {
    extend: {
      // xingothic-tc 缺日文字符，非中文頁面要把 Source Han Sans TC 排到它前面
      jaEn: 'html:lang(ja) &, html:lang(en) &',
    },
  },
  theme: {
    extend: {
      breakpoints: {
        // 極窄機型（< 360px）才退回漢堡選單，其餘一律平鋪主選單文字
        xs: '22.5em',
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
          default: {
            value:
              "'M 翔鶴黑體 TC', 'PingFang TC', 'LiHei Pro', 'Heiti TC', 'Source Han Sans TC', 'Noto Sans TC','Hiragino Sans', 'Century Gothic', 'Microsoft Jhenghei', '微軟正黑體', sans-serif",
          },
          nixie: { value: 'nixie, monospace' },
        },
        colors: {
          accent: { value: '#df8a42' },
          accentSoft: { value: '#f5c8a1' },
          aboutAccent: { value: '#ff7829' },
          aboutAccentSoft: { value: '#f5c8a1' },
        },
      },
      semanticTokens: {
        fonts: {
          body: {
            value: {
              base: '"xingothic-tc", "Noto Sans TC", sans-serif',
              _jaEn: '"sourcehansans-tc", "xingothic-tc", "Noto Sans TC", sans-serif',
            },
          },
          akitra: {
            value: {
              base: 'akitra, "xingothic-tc", sans-serif',
              _jaEn: 'akitra, "sourcehansans-tc", "xingothic-tc", sans-serif',
            },
          },
          huninn: {
            value: {
              base: 'huninn, "xingothic-tc", sans-serif',
              _jaEn: 'huninn, "sourcehansans-tc", "xingothic-tc", sans-serif',
            },
          },
          cubic: {
            value: {
              base: 'cubic, "xingothic-tc", monospace',
              _jaEn: 'cubic, "sourcehansans-tc", "xingothic-tc", monospace',
            },
          },
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
        cursorBlink: {
          '0%, 45%': { opacity: 1 },
          '46%, 100%': { opacity: 0 },
        },
        hudPulse: {
          '0%, 100%': { opacity: 0.32 },
          '50%': { opacity: 0.9 },
        },
        scanlineDrift: {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(100vh)' },
        },
        foxfireFloat: {
          '0%, 100%': {
            transform: 'translate3d(0, 10px, 0) scale(.82)',
            opacity: 0.35,
          },
          '45%': {
            transform: 'translate3d(8px, -16px, 0) scale(1.08)',
            opacity: 0.95,
          },
          '70%': {
            transform: 'translate3d(-5px, -7px, 0) scale(.94)',
            opacity: 0.62,
          },
        },
        noritoBurn: {
          '0%': {
            opacity: 0,
            filter: 'blur(8px)',
            transform: 'translate3d(0, 28px, 0) scale(.94)',
          },
          '18%': {
            opacity: 0.88,
            filter: 'blur(0)',
            transform: 'translate3d(0, 0, 0) scale(1)',
          },
          '68%': {
            opacity: 0.55,
            filter: 'blur(1px)',
            transform: 'translate3d(6px, -18px, 0) scale(1.015)',
          },
          '100%': {
            opacity: 0,
            filter: 'blur(9px)',
            transform: 'translate3d(-8px, -70px, 0) scale(1.04)',
          },
        },
        noritoGlyphSettle: {
          '0%': {
            opacity: 0,
            transform: 'scale(5.5) translateZ(0)',
            filter: 'blur(12px)',
            color: '#fff4c6',
          },
          '45%': {
            opacity: 1,
            transform: 'scale(1.35) translateZ(0)',
            filter: 'blur(1px)',
            color: '#f5cc70',
          },
          '100%': {
            opacity: 0.92,
            transform: 'scale(1) translateZ(0)',
            filter: 'blur(0)',
            color: '#d9f7eb',
          },
        },
        packetDamage: {
          '0%, 100%': { transform: 'translate3d(0,0,0)', filter: 'none' },
          '12%': { transform: 'translate3d(-15px,5px,0)', filter: 'saturate(2.2)' },
          '24%': {
            transform: 'translate3d(13px,-6px,0)',
            filter: 'hue-rotate(-24deg) saturate(3)',
          },
          '38%': {
            transform: 'translate3d(-9px,3px,0)',
            filter: 'contrast(1.6) saturate(3)',
          },
          '56%': {
            transform: 'translate3d(7px,-2px,0)',
            filter: 'hue-rotate(18deg)',
          },
        },
        redFailureFlash: {
          '0%, 100%': { opacity: 0 },
          '15%, 38%': { opacity: 0.72 },
          '52%': { opacity: 0.18 },
        },
        crtFlicker: {
          '0%, 88%, 100%': { opacity: 1 },
          '89%': { opacity: 0.72 },
          '90%': { opacity: 1 },
          '93%': { opacity: 0.85 },
          '94%': { opacity: 1 },
          '97%': { opacity: 0.92 },
        },
        artReveal: {
          '0%': { opacity: 0, filter: 'blur(6px)', transform: 'translateY(6px)' },
          '100%': { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' },
        },
        dropFall: {
          '0%': { transform: 'translateY(-28px)', opacity: 0 },
          '12%': { opacity: 1 },
          '82%': { opacity: 1 },
          '100%': { transform: 'translateY(210px)', opacity: 0 },
        },
        kenBurns: {
          '0%': { transform: 'scale(1.06) translate(0, 0)' },
          '100%': { transform: 'scale(1.2) translate(-2%, -3%)' },
        },
        vhsRoll: {
          '0%': { transform: 'translateY(-30%)', opacity: 0 },
          '12%': { opacity: 0.5 },
          '88%': { opacity: 0.5 },
          '100%': { transform: 'translateY(150%)', opacity: 0 },
        },
        flashOut: {
          '0%': { opacity: 0.9 },
          '100%': { opacity: 0 },
        },
        grainShift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-6%, 4%)' },
          '40%': { transform: 'translate(4%, -6%)' },
          '60%': { transform: 'translate(-4%, 6%)' },
          '80%': { transform: 'translate(6%, -4%)' },
        },
        conveyor: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        starPulse: {
          '0%, 100%': { opacity: 0.5, transform: 'scale(.85) rotate(0deg)' },
          '50%': { opacity: 1, transform: 'scale(1.15) rotate(90deg)' },
        },
        noritoLine: {
          '0%': { opacity: 0, filter: 'blur(6px)', transform: 'translateY(12px)' },
          '18%': { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' },
          '72%': { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' },
          '100%': {
            opacity: 0,
            filter: 'blur(4px)',
            transform: 'translateY(-10px)',
          },
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
    cubic: {
      src: 'url(/assets/fonts/Cubic_11.woff2) format("woff2")',
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
