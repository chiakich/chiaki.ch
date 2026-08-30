import React, { useCallback, useEffect, useRef, useState } from 'react'
import NextLink from 'next/link'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { localizedPath, useI18n } from 'i18n'
import { thumbSrc } from 'lib/imageThumb'
import { HAIRLINE, LetterpressFilters, LetterpressStyles, RULE } from './letterpress'
import {
  AnnexHeading,
  AnnexPanel,
  Blueprint,
  ContactStrip,
  CopierDirt,
  PanelTitle,
  PaperBase,
  PhotoPlate,
  Redacted,
  Seal,
} from './parts'
import { Live2DAnnex, MinecraftAnnex, SkinTexture } from './annex'
import { styled } from 'styled-system/jsx'

const Img = styled.img

const PORTRAITS = [
  '/assets/story/character/gallery/portrait-1.webp',
  '/assets/story/character/gallery/portrait-2.webp',
  '/assets/story/character/gallery/portrait-3.webp',
  '/assets/story/character/gallery/portrait-4.webp',
  '/assets/story/character/gallery/portrait-5.webp',
]

const CONCEPTS = [
  '/assets/story/character/concept-art/default.webp',
  '/assets/story/character/concept-art/new-outfit.webp',
  '/assets/story/character/concept-art/birthday-outfit.webp',
]

const CONCEPT_KEYS = ['conceptDefault', 'conceptNewOutfit', 'conceptBirthday'] as const
const DESIGN_CREDIT_URL = 'https://www.plurk.com/ArmeCyan'

const STRIKE_X = 148
const SCROLL_RATIO = 1.5
const CHARS_PER_SEC = 40

// 打字忽快忽慢：成本按索引雜湊抖動（0.55x~1.95x），標點後停一拍，偶爾恍神多停一下。
// 拉丁字基礎成本低——打字機打字母本來就快。
const PAUSE_CHARS = '。，、．！？：；.,;:!?'
const charCost = (el: HTMLElement, i: number) => {
  const h = (i * 2654435761) >>> 0
  let cost = (el.classList.contains('cj') ? 1 : 0.4) * (0.25 + Math.pow(((h >>> 8) % 1000) / 1000, 2.2) * 4.5)
  const ch = el.textContent || ''
  if (ch && PAUSE_CHARS.includes(ch)) cost += 4 + ((h >>> 4) % 100) / 20
  else if (h % 17 === 0) cost += 4
  return cost
}

// 直排右起左行：讀下去＝視窗往左移＝紙往右送。x 由 -travel 走到 0。
// 開場時紙還在畫面外，先自己送到第一屏填滿，之後才交給捲動。
const useTrack = (enabled: boolean) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const railRef = useRef<HTMLDivElement>(null)
  const [plate, setPlate] = useState(430)

  useEffect(() => {
    const wrap = wrapRef.current
    const track = trackRef.current
    if (!enabled || !wrap || !track) return

    let frame = 0
    let intro = 0
    let travel = 0
    let introFrom = 0
    let introX = NaN
    let introing = true
    let chars: { el: HTMLElement; key: number; top: number; cost: number }[] = []
    let cursor = 0
    let frontX = Infinity
    let tick = 0
    let tickAt = 0
    let ink = 0

    const index = () => {
      for (const c of chars) c.el.classList.remove('pending')
      chars = []
      cursor = 0

      // 鉛字歪斜會讓量到的框偏個一兩像素，同一行的順序就亂了；量測時先擺正。
      track.classList.add('lp-flat')
      const base = track.getBoundingClientRect()
      for (const el of Array.from(track.querySelectorAll<HTMLElement>('[data-type] .lp-ch'))) {
        const r = el.getBoundingClientRect()
        if (!r.width && !r.height) continue
        chars.push({ el, key: Math.round(r.left + r.width / 2 - base.left), top: r.top, cost: charCost(el, chars.length) })
      }
      track.classList.remove('lp-flat')

      // 黑條、半形字的框不會剛好落在行中線上，差幾像素就會被排去別行；先把鍵值吸附到同一直行。
      const xs = Array.from(new Set(chars.map((c) => c.key))).sort((a, b) => b - a)
      const snap = new Map<number, number>()
      let anchor = Infinity
      for (const x of xs) {
        if (anchor - x > 6) anchor = x
        snap.set(x, anchor)
      }
      for (const c of chars) c.key = snap.get(c.key) ?? c.key

      // 整張紙視為同一套直行：先右行後左行，同一行（跨區塊）由上而下，跟打字機一致。
      chars.sort((a, b) => b.key - a.key || a.top - b.top)
      for (const c of chars) c.el.classList.add('pending')
    }

    const step = (now: number) => {
      tick = 0
      ink = Math.min(14, ink + ((now - tickAt) / 1000) * CHARS_PER_SEC)
      tickAt = now
      while (cursor > 0 && chars[cursor - 1].key <= frontX) {
        cursor -= 1
        chars[cursor].el.classList.add('pending')
      }
      while (cursor < chars.length && ink >= chars[cursor].cost && chars[cursor].key > frontX) {
        ink -= chars[cursor].cost
        chars[cursor].el.classList.remove('pending')
        cursor += 1
      }
      if (cursor < chars.length && chars[cursor].key > frontX) tick = window.requestAnimationFrame(step)
      else ink = 0
    }

    const ensureTick = () => {
      if (tick) return
      tickAt = performance.now()
      tick = window.requestAnimationFrame(step)
    }

    // 重新量測時直接同步到目標，不重打已經在畫面上的字。
    const flush = () => {
      while (cursor < chars.length && chars[cursor].key > frontX) {
        chars[cursor].el.classList.remove('pending')
        cursor += 1
      }
      while (cursor > 0 && chars[cursor - 1].key <= frontX) {
        cursor -= 1
        chars[cursor].el.classList.add('pending')
      }
    }

    const paint = (x: number) => {
      track.style.transform = `translate3d(${x}px, 0, 0)`

      // 打字游標：紙往右送，門檻比它大的字就算打出來了。捲動只更新目標，
      // 實際逐字放出交給 step 以固定速率追，怎麼捲都是一個一個字打。
      frontX = STRIKE_X - x
      ensureTick()

      for (const stamp of Array.from(track.querySelectorAll<HTMLElement>('.lp-press'))) {
        if (stamp.getBoundingClientRect().left >= STRIKE_X) stamp.classList.add('pressed')
      }

      if (railRef.current) {
        const p = travel ? Math.min(1, Math.max(0, (x + travel) / travel)) : 0
        railRef.current.style.width = `${p * 100}%`
      }
    }

    const update = () => {
      frame = 0
      if (introing) return
      const rect = wrap.getBoundingClientRect()
      const distance = Math.max(1, wrap.offsetHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, -rect.top / distance))
      paint(-(1 - p) * travel)
    }

    const measure = () => {
      index()
      travel = Math.max(0, track.offsetWidth - window.innerWidth)
      introFrom = STRIKE_X - (track.offsetWidth - 56)
      wrap.style.height = `${window.innerHeight + travel * SCROLL_RATIO}px`
      setPlate(Math.max(200, Math.min(430, window.innerHeight - 423)))
      if (introing) {
        if (Number.isNaN(introX)) introX = introFrom
        paint(introX)
      } else update()
      flush()
    }

    const stop = () => {
      if (!introing) return
      if (intro) window.cancelAnimationFrame(intro)
      introing = false
      update()
    }

    const schedule = () => {
      if (window.scrollY > 4) stop()
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    measure()

    // 開場送紙跟著打字走：紙停在打擊線上讓當前一行打完，打完才往右推一行，推滿第一屏交給捲動。
    const feed = () => {
      const next = chars[cursor]
      const target = Math.min(-travel, next ? STRIKE_X - next.key + 1 : -travel)
      introX += (target - introX) * 0.3
      if (Math.abs(target - introX) < 0.5) introX = target
      paint(introX)
      if (introX === -travel) stop()
      else intro = window.requestAnimationFrame(feed)
    }
    intro = window.requestAnimationFrame(feed)

    document.fonts?.ready.then(measure).catch(() => {})
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      if (frame) window.cancelAnimationFrame(frame)
      if (intro) window.cancelAnimationFrame(intro)
      if (tick) window.cancelAnimationFrame(tick)
      for (const c of chars) c.el.classList.remove('pending')
      wrap.style.height = ''
    }
  }, [enabled])

  return { wrapRef, trackRef, railRef, plate }
}

// 橫書版（英文、手機）的打字：不推紙，字在進入視窗下緣前逐字打出，往回捲會收回。
const useTypeFlow = (enabled: boolean, rootRef: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let chars: { el: HTMLElement; key: number; left: number; cost: number }[] = []
    let cursor = 0
    let front = 0
    let tick = 0
    let tickAt = 0
    let ink = 0

    const index = () => {
      for (const c of chars) c.el.classList.remove('pending')
      chars = []
      cursor = 0
      root.classList.add('lp-flat')
      for (const el of Array.from(root.querySelectorAll<HTMLElement>('.lp-ch'))) {
        const r = el.getBoundingClientRect()
        if (!r.width && !r.height) continue
        chars.push({
          el,
          key: Math.round(r.top + r.height / 2 + window.scrollY),
          left: r.left,
          cost: charCost(el, chars.length),
        })
      }
      root.classList.remove('lp-flat')
      chars.sort((a, b) => a.key - b.key || a.left - b.left)
      for (const c of chars) c.el.classList.add('pending')
    }

    const step = (now: number) => {
      tick = 0
      ink = Math.min(14, ink + ((now - tickAt) / 1000) * CHARS_PER_SEC)
      tickAt = now
      while (cursor > 0 && chars[cursor - 1].key >= front) {
        cursor -= 1
        chars[cursor].el.classList.add('pending')
      }
      while (cursor < chars.length && ink >= chars[cursor].cost && chars[cursor].key < front) {
        ink -= chars[cursor].cost
        chars[cursor].el.classList.remove('pending')
        cursor += 1
      }
      if (cursor < chars.length && chars[cursor].key < front) tick = window.requestAnimationFrame(step)
      else ink = 0
    }

    const ensureTick = () => {
      if (tick) return
      tickAt = performance.now()
      tick = window.requestAnimationFrame(step)
    }

    const sync = () => {
      front = window.scrollY + window.innerHeight * 0.82
      ensureTick()
    }

    let booted = false
    const measure = () => {
      index()
      sync()
      if (booted) {
        while (cursor < chars.length && chars[cursor].key < front) {
          chars[cursor].el.classList.remove('pending')
          cursor += 1
        }
      }
      booted = true
    }

    measure()
    document.fonts?.ready.then(measure).catch(() => {})
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', measure)
      if (tick) window.cancelAnimationFrame(tick)
      for (const c of chars) c.el.classList.remove('pending')
    }
  }, [enabled, rootRef])
}

// 英文在 vertical-rl 下整段轉 90 度，讀不了，所以只有中日文推紙；英文與手機走橫書打字。
const useCanScroll = (verticalScript: boolean) => {
  const [canScroll, setCanScroll] = useState(false)

  useEffect(() => {
    if (!verticalScript) return
    const wide = window.matchMedia('(min-width: 62em)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setCanScroll(wide.matches && !still.matches)
    sync()
    wide.addEventListener('change', sync)
    still.addEventListener('change', sync)
    return () => {
      wide.removeEventListener('change', sync)
      still.removeEventListener('change', sync)
    }
  }, [verticalScript])

  return canScroll
}

const CharacterFile = () => {
  const { locale, t } = useI18n()
  const canScroll = useCanScroll(locale !== 'en')
  const [portrait, setPortrait] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const { wrapRef, trackRef, railRef, plate } = useTrack(canScroll)
  const stackRef = useRef<HTMLDivElement>(null)
  useTypeFlow(!canScroll, stackRef)

  const openPortrait = useCallback(() => setLightbox(portrait), [portrait])

  const slides = [
    ...PORTRAITS.map((src) => ({ src, alt: t('characterPage.artAlt') })),
    ...CONCEPTS.map((src, i) => ({ src, alt: t(`characterPage.${CONCEPT_KEYS[i]}`) })),
  ]

  const f = (key: string) => t(`characterPage.file.${key}`)

  const fields = [
    { label: f('fName'), value: f('fNameValue'), note: f('fNameEn'), lead: true },
    { label: f('fModel'), value: f('fModelValue') },
    { label: f('fGrade'), value: f('fGradeValue'), accent: true },
    { label: f('fAuthor'), value: f('fAuthorValue') },
    { label: f('fDesigner'), value: f('creditDesignName'), href: DESIGN_CREDIT_URL },
    { label: f('fDuty'), value: f('fDutyValue') },
    { label: f('fBody'), value: f('fBodyValue') },
    { label: f('fBoot'), value: f('fBootValue') },
  ]

  const log = [f('log1'), f('log2'), f('log3'), f('log4')]

  const fileMeta = [
    { label: f('fileNo'), value: f('fileNoValue'), mono: true },
    { label: f('classWas'), value: f('classWasValue'), struck: true },
    { label: f('classNow'), value: f('classNowValue'), accent: true },
    { label: f('copies'), value: f('copiesValue'), mono: true },
  ]

  const conceptPlates = CONCEPTS.map((src, i) => ({
    src: thumbSrc(src),
    caption: t(`characterPage.${CONCEPT_KEYS[i]}`),
    note: `A-0${i + 1}`,
    index: PORTRAITS.length + i,
  }))

  const pressNow = !canScroll


  const declassified = (
    <div
      className={`stamp lp-press${pressNow ? ' pressed' : ''}`}
      style={
        {
          border: '3px solid rgba(162,55,42,.72)',
          padding: '7px 18px 9px',
          display: 'inline-block',
          '--press-rot': '-5deg',
        } as React.CSSProperties
      }
    >
      <div
        className="sg"
        style={{ fontSize: 26, fontWeight: 600, letterSpacing: '.26em', color: 'rgba(162,55,42,.9)', lineHeight: 1.1 }}
      >
        {f('declassified')}
      </div>
      <div className="tp" style={{ fontSize: 11, letterSpacing: '.3em', color: 'rgba(162,55,42,.82)', marginTop: 3 }}>
        {f('declassifiedEn')}
      </div>
    </div>
  )

  const terminalLink = (
    <NextLink
      href={localizedPath('/story/terminal', locale)}
      className="lp-btn"
      style={{ padding: '11px 16px', gap: 10 }}
    >
      <span className="sg" style={{ fontSize: 16, letterSpacing: '.12em', color: '#a2372a' }}>
        {f('terminalLink')}
      </span>
      <span className="tp" style={{ fontSize: 10, letterSpacing: '.2em', color: '#000' }}>
        TERMINAL
      </span>
    </NextLink>
  )

  const moreArt = (
    <NextLink href={localizedPath('/story/character/art', locale)} className="lp-btn">
      <span className="sg" style={{ fontSize: 19, letterSpacing: '.14em' }}>
        {t('characterPage.moreArt')}
      </span>
      <span className="tp" style={{ fontSize: 11, letterSpacing: '.22em', color: '#000' }}>
        MORE ART
      </span>
    </NextLink>
  )

  const signature = (
    <Img
      src="/assets/story/character/signature-animated.svg"
      alt={t('characterPage.signatureAlt')}
      style={{ display: 'block', width: '100%', maxWidth: 280, transform: 'rotate(3deg)' }} />
  )

  const track = (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div className="lp-stage">
        <div className="lp-track" ref={trackRef}>
          <div className="lp-fibre" aria-hidden="true" />

          <section style={{ width: 296, height: '100%', position: 'relative', flexShrink: 0 }}>
            <div className="lp-v" data-type style={{ height: '100%' }}>
              <div className="lbl" style={{ letterSpacing: '.3em' }}>
                {f('org')}
              </div>
              <h1 className="sg lp-v" style={{ marginTop: 26, fontSize: 62, letterSpacing: '.2em', lineHeight: 1.1 }}>
                <Redacted text={f('title')} />
              </h1>
              <div className="tp lp-v" style={{ marginRight: 24, fontSize: 12, letterSpacing: '.3em', color: '#000' }}>
                {f('titleEn')}
              </div>
            </div>
            <div style={{ position: 'absolute', left: 6, top: 44 }}>
              <Seal lines={[f('sealOrg'), f('seal')]} size={112} fontSize={18} pressed={pressNow} />
            </div>
            <div style={{ position: 'absolute', left: 0, bottom: 60 }}>{declassified}</div>
          </section>

          <section
            className="lp-ruled"
            style={{ width: 184, height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'row-reverse' }}
          >
            {fileMeta.map((item) => (
              <div
                key={item.label}
                className="lp-v lp-cell"
                style={{ width: 46, height: '100%', borderLeft: `1px solid ${HAIRLINE}` }}
              >
                <span className="lbl" style={{ fontSize: 9 }}>
                  {item.label}
                </span>
                <div
                  className={item.mono ? 'tp' : 'sg'}
                  style={{
                    fontSize: 14,
                    marginTop: 10,
                    letterSpacing: '.08em',
                    color: item.accent ? '#a2372a' : undefined,
                    textDecoration: item.struck ? 'line-through' : undefined,
                    textDecorationColor: item.struck ? 'rgba(162,55,42,.75)' : undefined,
                  }}
                >
                  <Redacted text={item.value} />
                </div>
              </div>
            ))}
          </section>

          <section
            className="lp-ruled"
            style={{
              width: 382,
              height: '100%',
              flexShrink: 0,
              borderTop: `2px solid ${RULE}`,
              borderBottom: `1px solid ${RULE}`,
              padding: '20px 0 22px',
              display: 'flex',
              flexDirection: 'row-reverse',
            }}
            data-type
          >
            {fields.map((field) => (
              <div
                key={field.label}
                className="lp-v lp-cell"
                style={{ width: 46, height: '100%', borderLeft: `1px dotted ${HAIRLINE}` }}
              >
                <span className="lbl" style={{ fontSize: 9 }}>
                  {field.label}
                </span>
                <div
                  className="sg"
                  style={{
                    fontSize: field.lead ? 25 : 17,
                    fontWeight: field.lead ? 600 : 400,
                    letterSpacing: field.lead ? '.14em' : '.08em',
                    marginTop: 12,
                    color: field.accent ? '#a2372a' : undefined,
                  }}
                >
                  {field.href ? (
                    <a href={field.href} target="_blank" rel="noreferrer" className="lp-credit">
                      <Redacted text={field.value} />
                    </a>
                  ) : (
                    <Redacted text={field.value} />
                  )}
                </div>
                {field.note && (
                  <div className="tp" style={{ fontSize: 10, letterSpacing: '.14em', color: '#000', marginTop: 8 }}>
                    {field.note}
                  </div>
                )}
              </div>
            ))}
          </section>

          <section data-plate style={{ width: 330, flexShrink: 0, alignSelf: 'flex-start', marginTop: 26 }}>
            <PhotoPlate
              src={thumbSrc(PORTRAITS[portrait])}
              alt={t('characterPage.artAlt')}
              caption={f('plateCaption')}
              note={`${portrait + 1} / ${PORTRAITS.length}`}
              height={plate}
              rotate={-1.4}
              tapes={[
                { left: '34px', width: 96, angle: -4 },
                { right: '30px', width: 84, angle: 3.5 },
              ]}
              onOpen={openPortrait}
              openLabel={t('characterPage.viewFullSize')}
            />
            <div style={{ marginTop: 18 }}>
              <ContactStrip
                images={PORTRAITS.map(thumbSrc)}
                current={portrait}
                onSelect={setPortrait}
                alt={t('characterPage.thumbnailAlt')}
              />
            </div>
          </section>

          <section style={{ width: 452, height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'row-reverse' }}>
            <div style={{ width: 34, height: '100%', borderLeft: `1px solid ${RULE}`, paddingLeft: 8 }}>
              <span className="lbl lp-v" style={{ fontSize: 10, letterSpacing: '.28em' }}>
                {f('logHeading')}　{f('logHeadingEn')}
              </span>
            </div>
            <div className="lp-v lp-ruled lp-typed" data-type style={{ flexGrow: 1, height: '100%' }}>
              {log.map((paragraph, i) => (
                <p
                  key={i}
                  className="sg"
                  style={{ fontSize: 17, letterSpacing: '.1em', height: '100%' }}
                >
                  <span className="tp" style={{ fontSize: 11, color: '#a2372a' }}>
                    ¶{String(i + 1).padStart(2, '0')}
                  </span>
                  {'　'}
                  <Redacted text={paragraph} />
                </p>
              ))}
            </div>
          </section>

          <section
            style={{ width: 122, height: '100%', flexShrink: 0, borderTop: '3px solid #a2372a', paddingTop: 18 }}
          >
            <div className="lbl lp-v" style={{ color: '#a2372a', fontSize: 9 }}>
              {f('note')}
            </div>
            <div
              className="hand lp-v"
              style={{ fontSize: 29, lineHeight: 1.6, marginRight: 12, transform: 'rotate(.8deg)' }}
            >
              {t('characterPage.greeting')}
            </div>
          </section>

          <section data-plate style={{ height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <AnnexHeading title={t('characterPage.conceptHeading')} tag={f('annexA')} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row-reverse',
                gap: 22,
                paddingTop: 16,
                flexGrow: 1,
                minHeight: 0,
              }}
            >
              <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
                {conceptPlates.slice(0, 2).map((plate, i) => (
                  <PhotoPlate
                    key={plate.note}
                    src={plate.src}
                    alt={plate.caption}
                    caption={plate.caption}
                    note={plate.note}
                    fill
                    rotate={[-0.9, 1.1][i]}
                    tapes={[{ left: '46%', width: 76, angle: [-2, 2.5][i] }]}
                    onOpen={() => setLightbox(plate.index)}
                    openLabel={t('characterPage.viewFullSize')}
                  />
                ))}
              </div>
              <div style={{ maxWidth: 300, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <PhotoPlate
                  src={conceptPlates[2].src}
                  alt={conceptPlates[2].caption}
                  caption={conceptPlates[2].caption}
                  note={conceptPlates[2].note}
                  fill
                  rotate={-0.4}
                  tapes={[{ left: '46%', width: 76, angle: -3 }]}
                  onOpen={() => setLightbox(conceptPlates[2].index)}
                  openLabel={t('characterPage.viewFullSize')}
                />
              </div>
            </div>
          </section>

          <section
            style={{ width: 560, height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <AnnexHeading title={f('annexHeading')} tag={f('annexB')} />

            <AnnexPanel>
              <div className="lp-v" data-type style={{ width: 186, height: '100%' }}>
                <PanelTitle title={f('live2dTitle')} tag="B-01" />
                <p className="sg" style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 2.2, letterSpacing: '.08em' }}>
                  <Redacted text={f('live2dRecord')} />
                </p>
                <div style={{ marginTop: 12 }}>{terminalLink}</div>
              </div>
              <Blueprint label={f('bpLabel')} style={{ flexGrow: 1, minWidth: 0 }}>
                <Live2DAnnex width={300} height={plate + 90} />
              </Blueprint>
            </AnnexPanel>
          </section>

          <section
            style={{ width: 486, height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <AnnexHeading title={t('characterPage.minecraftHeading')} tag={f('annexC')} />

            <AnnexPanel>
              <div className="lp-v" data-type style={{ width: 150, height: '100%' }}>
                <PanelTitle title={f('mcHeadingNote')} tag="C-01" />
                <p className="sg" style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 2.2, letterSpacing: '.08em' }}>
                  <Redacted text={f('mcRecord')} />
                </p>
              </div>
              <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Blueprint label={f('bpLabel')} style={{ flexGrow: 1, minHeight: 0 }}>
                  <MinecraftAnnex size={200} />
                </Blueprint>
                <Blueprint label={f('texture')} style={{ height: 118, flexShrink: 0 }}>
                  <SkinTexture size={96} />
                </Blueprint>
              </div>
            </AnnexPanel>
          </section>

          <section
            style={{
              width: 306,
              height: '100%',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'row-reverse',
              gap: 22,
              borderLeft: `2px solid ${RULE}`,
              paddingLeft: 22,
            }}
          >
            <div
              style={{ width: 140, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div className="lbl lp-v" style={{ fontSize: 9 }}>
                  {f('signChiaki')}
                </div>
                <div style={{ marginTop: 14 }}>{signature}</div>
                <div style={{ borderBottom: `1px solid ${RULE}`, marginTop: 4 }} />
              </div>
              <div>{moreArt}</div>
            </div>

            <div data-type style={{ width: 120, height: '100%', position: 'relative' }}>
              <div className="lbl lp-v" style={{ fontSize: 9 }}>
                {f('signRecorder')}
              </div>
              <div className="sg lp-v" style={{ fontSize: 26, letterSpacing: '.18em', marginTop: 10, marginRight: 10 }}>
                <Redacted text={f('signRecorderName')} />
              </div>
              <div style={{ position: 'absolute', left: 4, top: 250 }}>
                <div className="lbl lp-v" style={{ fontSize: 9, marginBottom: 10 }}>
                  {f('signReceipt')}
                </div>
                <Seal lines={[f('seal')]} size={74} fontSize={14} rotate={-5} pressed={pressNow} />
              </div>
            </div>
          </section>

          <div className="lp-grain" aria-hidden="true" />
          <CopierDirt />
        </div>

        <div className="lp-expose" aria-hidden="true" />

        <div className="lp-rail" aria-hidden="true">
          <span className="tp" style={{ fontSize: 9, letterSpacing: '.2em', color: '#000' }}>
            {f('scrollStart')}
          </span>
          <span className="bar-bg">
            <span className="bar-fg" ref={railRef} style={{ width: '0%' }} />
          </span>
          <span className="tp" style={{ fontSize: 9, letterSpacing: '.2em', color: '#000' }}>
            {f('scrollEnd')}
          </span>
        </div>

      </div>
    </div>
  )

  const stack = (
    <div ref={stackRef} className={locale !== 'en' ? 'lp-stack lp-boot' : 'lp-stack'}>
      <div className="lbl">{f('org')}</div>
      <div style={{ borderTop: `2px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, height: 4, margin: '10px 0 18px' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
        <div>
          <h1 className="sg" style={{ fontSize: 38, letterSpacing: '.14em', lineHeight: 1.1 }}>
            {f('title')}
          </h1>
          <div className="tp" style={{ marginTop: 10, fontSize: 10, letterSpacing: '.28em', color: '#000' }}>
            {f('titleEn')}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Seal lines={[f('sealOrg'), f('seal')]} size={74} fontSize={12} rotate={-7} pressed={pressNow} />
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'inline-block' }}>{declassified}</div>

      <div style={{ display: 'flex', marginTop: 22, border: `1px solid ${HAIRLINE}`, background: 'rgba(255,255,255,.24)' }}>
        {fileMeta.slice(0, 2).map((item, i) => (
          <div key={item.label} style={{ flexGrow: 1, padding: '9px 12px', borderRight: i === 0 ? `1px solid ${HAIRLINE}` : undefined }}>
            <div className="lbl">{item.label}</div>
            <div className={item.mono ? 'tp' : 'sg'} style={{ fontSize: 13, marginTop: 4, letterSpacing: '.08em' }}>
              <Redacted text={item.value} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30 }}>
        <PhotoPlate
          src={thumbSrc(PORTRAITS[portrait])}
          alt={t('characterPage.artAlt')}
          caption={f('plateCaption')}
          note={`${portrait + 1} / ${PORTRAITS.length}`}
          height={360}
          rotate={-1}
          tapes={[
            { left: '34px', width: 86, angle: -3.5 },
            { right: '30px', width: 74, angle: 3 },
          ]}
          onOpen={openPortrait}
          openLabel={t('characterPage.viewFullSize')}
        />
      </div>
      <div style={{ marginTop: 16, maxWidth: 360 }}>
        <ContactStrip
          images={PORTRAITS.map(thumbSrc)}
          current={portrait}
          onSelect={setPortrait}
          alt={t('characterPage.thumbnailAlt')}
        />
      </div>

      <div className="lp-sec">
        <span className="tp" style={{ fontSize: 11, letterSpacing: '.18em', color: '#a2372a' }}>
          § 01
        </span>
        <h2 className="sg" style={{ fontSize: 20, letterSpacing: '.16em' }}>
          {f('s1')}
        </h2>
        <span className="line" />
      </div>

      <div style={{ marginTop: 18, borderTop: `1px solid ${RULE}` }}>
        {fields.map((field) => (
          <div key={field.label} className="lp-row">
            <span className="lbl" style={{ width: 92, flexShrink: 0 }}>
              {field.label}
            </span>
            <span
              className="sg"
              style={{
                fontSize: field.lead ? 21 : 15,
                fontWeight: field.lead ? 600 : 400,
                letterSpacing: '.04em',
                color: field.accent ? '#a2372a' : undefined,
              }}
            >
              {field.href ? (
                <a href={field.href} target="_blank" rel="noreferrer" className="lp-credit">
                  <Redacted text={field.value} />
                </a>
              ) : (
                <Redacted text={field.value} />
              )}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 26 }}>
        <div className="lbl" style={{ borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 7 }}>
          {f('logHeading')}　{f('logHeadingEn')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 14 }}>
          {log.map((paragraph, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <span className="tp" style={{ fontSize: 10, color: '#a2372a', paddingTop: 6, flexShrink: 0 }}>
                ¶{String(i + 1).padStart(2, '0')}
              </span>
              <p className="sg" style={{ margin: 0, fontSize: 16, lineHeight: 2, letterSpacing: '.03em' }}>
                <Redacted text={paragraph} />
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 26, borderLeft: '3px solid #a2372a', padding: '2px 0 4px 16px' }}>
        <div className="lbl" style={{ color: '#a2372a' }}>
          {f('note')}
        </div>
        <div className="hand" style={{ fontSize: 23, marginTop: 8, transform: 'rotate(-1deg)', lineHeight: 1.5 }}>
          {t('characterPage.greeting')}
        </div>
      </div>

      <div className="lp-sec">
        <span className="tp" style={{ fontSize: 11, letterSpacing: '.18em', color: '#a2372a' }}>
          § 02
        </span>
        <h2 className="sg" style={{ fontSize: 20, letterSpacing: '.16em' }}>
          {t('characterPage.conceptHeading')}
        </h2>
        <span className="line" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 18, alignItems: 'center' }}>
        {conceptPlates.map((plate, i) => (
          <div key={plate.note} style={{ width: '100%', maxWidth: i === 2 ? 400 : 560 }}>
            <PhotoPlate
              src={plate.src}
              alt={plate.caption}
              caption={plate.caption}
              note={plate.note}
              rotate={[-0.7, 0.8, -0.3][i]}
              tapes={[{ left: '46%', width: 72, angle: [-2.5, 2.5, -3][i] }]}
              onOpen={() => setLightbox(plate.index)}
              openLabel={t('characterPage.viewFullSize')}
            />
          </div>
        ))}
      </div>

      <div className="lp-sec">
        <span className="tp" style={{ fontSize: 11, letterSpacing: '.18em', color: '#a2372a' }}>
          § 03
        </span>
        <h2 className="sg" style={{ fontSize: 20, letterSpacing: '.16em' }}>
          {f('annexHeading')}
        </h2>
        <span className="line" />
      </div>

      <div style={{ border: `1px solid ${RULE}`, background: 'rgba(255,255,255,.18)', padding: 16, marginTop: 18 }}>
        <AnnexHeading title={f('live2dTitle')} tag="B-01" stacked />
        <p className="sg" style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.9, letterSpacing: '.03em' }}>
          {f('live2dRecord')}
        </p>
        <div style={{ marginTop: 12 }}>{terminalLink}</div>
        <div style={{ marginTop: 14 }}>
          <Blueprint label={f('bpLabel')} style={{ height: 340 }}>
            <Live2DAnnex width={280} height={340} />
          </Blueprint>
        </div>
      </div>

      <div style={{ border: `1px solid ${RULE}`, background: 'rgba(255,255,255,.18)', padding: 16, marginTop: 16 }}>
        <AnnexHeading title={t('characterPage.minecraftHeading')} tag="C-01" stacked />
        <p className="sg" style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.9, letterSpacing: '.03em' }}>
          {f('mcRecord')}
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 14, alignItems: 'stretch' }}>
          <Blueprint label={f('texture')} style={{ width: 128, height: 128, flexShrink: 0 }}>
            <SkinTexture size={96} />
          </Blueprint>
          <Blueprint label={f('bpLabel')} style={{ flexGrow: 1, minWidth: 0, height: 128 }}>
            <MinecraftAnnex size={120} />
          </Blueprint>
        </div>
      </div>

      <div style={{ marginTop: 46, borderTop: `2px solid ${RULE}`, paddingTop: 24 }}>
        <div className="lbl" style={{ marginBottom: 4 }}>
          {f('signChiaki')}　{f('signRecorderName')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{signature}</div>
        <div style={{ borderBottom: `1px solid ${RULE}`, marginTop: 4 }} />
        <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center' }}>{moreArt}</div>
      </div>
    </div>
  )

  return (
    <div className="lp" style={{ position: 'relative', minHeight: '100vh', paddingTop: canScroll ? 0 : 92 }}>
      <LetterpressStyles />
      <LetterpressFilters />
      {!canScroll && <PaperBase />}

      <div style={{ position: 'relative' }}>{canScroll ? track : stack}</div>

      {!canScroll && (
        <>
          <div className="lp-grain" aria-hidden="true" />
          <CopierDirt />
        </>
      )}

      <Lightbox
        open={lightbox !== null}
        close={() => setLightbox(null)}
        slides={slides}
        index={lightbox ?? 0}
        plugins={[Zoom]}
        animation={{ fade: 300, swipe: 200 }}
        controller={{ closeOnBackdropClick: true }}
        carousel={{ finite: true }}
        zoom={{ maxZoomPixelRatio: 3, zoomInMultiplier: 2, scrollToZoom: true }}
        styles={{ container: { backgroundColor: 'rgba(20, 18, 14, .94)' } }}
      />
    </div>
  )
}

export default CharacterFile
