import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  jsxFramework: 'react',
  conditions: {
    extend: {
      // xingothic-tc 缺日文字符；英文改用拉丁系統字型，避免 CJK 標點字形。
      jaEn: 'html:lang(ja) &, html:lang(en) &',
      en: 'html:lang(en) &',
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
        // Site-wide 4-step scale; overrides panda's default preset (bold/black keep
        // their usual 700/900, but medium is 600 here — not the preset's 500 — and
        // regular replaces "normal" as the naming used across this project.
        fontWeights: {
          regular: { value: '400' },
          medium: { value: '600' },
          bold: { value: '700' },
          black: { value: '900' },
        },
        colors: {
          accent: { value: '#df8a42' },
          accentSoft: { value: '#f5c8a1' },
          profileAccent: { value: '#ff7829' },
          profileAccentSoft: { value: '#f5c8a1' },
        },
      },
      semanticTokens: {
        fonts: {
          body: {
            value: {
              base: '"xingothic-tc", "Noto Sans TC", sans-serif',
              _jaEn: '"sourcehansans-tc", "xingothic-tc", "Noto Sans TC", sans-serif',
              _en: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
        heartbeat: {
          '0%, 40%, 100%': { transform: 'scale(1)', opacity: 0.7 },
          '10%': { transform: 'scale(1.35)', opacity: 1 },
          '22%': { transform: 'scale(1.12)', opacity: 0.9 },
        },
        nightShake: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '20%': { transform: 'translate3d(-4px,2px,0)' },
          '40%': { transform: 'translate3d(4px,-2px,0)' },
          '60%': { transform: 'translate3d(-3px,1px,0)' },
          '80%': { transform: 'translate3d(2px,-1px,0)' },
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
        // The lexicon panel is revealed mid-conversation, so it fades in like
        // another channel coming up rather than appearing already there.
        lexiconReveal: {
          from: { opacity: 0, transform: 'translateY(-6px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
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
        projectionSweep: {
          '0%': { transform: 'translateY(-130%)' },
          '100%': { transform: 'translateY(130%)' },
        },
        snowfall: {
          from: { backgroundPosition: '0 0, 40px 0, 10px 0' },
          to: { backgroundPosition: '0 400px, 40px 260px, 10px 180px' },
        },
        snowDrift: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(var(--fall))' },
        },
        // The origin flips at the midpoint so the block wipes in from one side and out the other
        chiakiBlockX: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '45%': { transform: 'scaleX(1)', transformOrigin: 'left' },
          '55%': { transform: 'scaleX(1)', transformOrigin: 'right' },
          '100%': { transform: 'scaleX(0)', transformOrigin: 'right' },
        },
        chiakiBlockY: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '45%': { transform: 'scaleY(1)', transformOrigin: 'top' },
          '55%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
        chiakiBlockText: {
          '0%, 49%': { opacity: 0 },
          '50%, 100%': { opacity: 1 },
        },
        snowSway: {
          from: { translate: 'calc(var(--sway) * -1) 0' },
          to: { translate: 'var(--sway) 0' },
        },
        // Uses the standalone scale/translate properties so it composes with an element's own transform
        breathe: {
          '0%, 100%': { scale: '1 1', translate: '0 0' },
          '50%': { scale: '1.001 1.004', translate: '0 -1px' },
        },
        // Uneven steps read as a live flame rather than a pulse
        chiakiFlicker: {
          '0%, 100%': { opacity: 0.55 },
          '8%': { opacity: 0.9 },
          '14%': { opacity: 0.68 },
          '30%': { opacity: 1 },
          '46%': { opacity: 0.6 },
          '58%': { opacity: 0.95 },
          '72%': { opacity: 0.72 },
          '86%': { opacity: 1 },
        },
        chiakiFadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        chiakiFadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        // Each mote sets its own --dx/--dy so they don't all drift the same way
        chiakiMote: {
          '0%': { opacity: 0, translate: '0 0' },
          '25%': { opacity: 1 },
          '70%': { opacity: 0.85 },
          '100%': { opacity: 0, translate: 'var(--dx) var(--dy)' },
        },
        chiakiPvOut: {
          to: { opacity: 0, filter: 'blur(8px)', translate: '0 -.4em' },
        },
        chiakiPvIn: {
          from: { opacity: 0, filter: 'blur(8px)', translate: '0 .4em' },
        },
        // The PV ambient loops animate transform so they compose with the per-character entrance properties
        chiakiPvSway: {
          '0%, 100%': { transform: 'rotate(calc(var(--sway, 3deg) * -1)) translateY(.03em)' },
          '50%': { transform: 'rotate(var(--sway, 3deg)) translateY(-.04em)' },
        },
        chiakiPvFlow: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        chiakiPvBreath: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.62 },
        },
        chiakiDiscIn: {
          from: { opacity: 0, scale: '.7' },
          to: { opacity: 1, scale: '1' },
        },
        chiakiFadeUp: {
          from: { opacity: 0, transform: 'translateY(22px)' },
          to: { opacity: 1, transform: 'none' },
        },
        chiakiLed: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        chiakiPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(223,138,66,.55)' },
          '100%': { boxShadow: '0 0 0 26px rgba(223,138,66,0)' },
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
    // justfont's alias scan attributes an element's entire textContent to the
    // webfont and rejects a font once a page sends it more than ~1300 chars.
    // Keeping the alias off <body> skips the __NEXT_DATA__ script; skipping
    // <main> on pages flagged data-jf-skip keeps long-form text out too.
    body: {
      bg: 'black',
      fontFamily: '"Noto Sans TC", sans-serif',
      fontWeight: 'normal',
    },
    'body > :not(script, style, #__next), #__next > :not(main), main:not(:has([data-jf-skip]))': {
      fontFamily: 'body',
    },
    a: {
      color: 'inherit',
      textDecoration: 'none',
    },
    button: {
      WebkitTapHighlightColor: 'transparent',
    },
    // Opt-in per page so other routes keep instant jumps
    'html:has([data-smooth-scroll])': {
      scrollBehavior: { base: 'smooth', _motionReduce: 'auto' },
    },
  },
})
