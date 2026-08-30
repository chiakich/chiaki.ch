import { useEffect, useRef, useState } from 'react'
import { redact } from 'kappan'
import { LetterpressFilters } from 'kappan/react'
import { Box, HStack, Stack, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { fetchFaces, loadFaceForText, pickWeight, type EmFont, type LoadedFace } from './fonts'
import { exportPng, exportSvg } from './exportPress'
import { Dial, Key } from './Controls'
import { DEMO_OPTIONS } from './pressOptions'
import { PLAYGROUND_TEXT } from './specimenText'

const Text = styled.p

const SIZES = [16, 22, 32, 48]
const BAR_UNIT = 14
/** 試打區自己一組濾鏡，才不會跟見本帖與樣張那兩組互相影響。 */
const PLAY_PREFIX = 'lpplay'
/** 見本帖正文的 1.9em 是為 16px 調的傳統書行距；試打區字級大得多，預設收緊一點。 */
const DEFAULT_PITCH = 1.5
// 源流明體 TW：台灣字形的明體，跟見本帖自架的一點明體氣質最接近。
const DEFAULT_FACE = 'GenRyuMinTW'

/** 把 redact() 包出來的 .lp-ch 拆回純文字。就地換掉，字級的 span 不受影響。 */
const unredact = (el: HTMLElement) => {
  for (const span of [...el.querySelectorAll('.lp-ch')]) {
    const width = Number.parseFloat((span as HTMLElement).style.getPropertyValue('--bar-w'))
    const text = span.classList.contains('bar')
      ? '█'.repeat(Math.max(1, Math.round(width / BAR_UNIT)))
      : span.textContent ?? ''
    span.replaceWith(document.createTextNode(text))
  }
  // 相鄰的文字節點合回去，之後打字與游標移動才正常。
  el.normalize()
}

/**
 * 試打區。使用者自己打字，選一段改字級，切直排橫排，換字體。
 *
 * 編輯區刻意不由 React 控制內容：contenteditable 一旦被外面重畫，中文輸入法的
 * 組字就會被打斷。初始內容用 ref 塞一次，之後 DOM 自己管，React 只碰 class 與樣式。
 *
 * 逐字歪斜要把每個字包成 span，那跟編輯是衝突的（游標與組字都會壞），
 * 所以不做即時預覽：離開輸入框才排版，重新點進來就還原成純文字。
 */
const PressPlayground = () => {
  const { t } = useI18n()
  const wrapRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const setRef = useRef(false)
  // 焦點一離開編輯區，選取範圍就沒了。隨時記著最後一次選到哪，
  // 字級那些控制項才有東西可以套用。
  const rangeRef = useRef<Range | null>(null)
  // 切字體是兩趟網路往返，先發的不一定先回。只認最後一次發出的那個。
  const faceTicket = useRef(0)
  const [vertical, setVertical] = useState(false)
  const [faces, setFaces] = useState<EmFont[]>([])
  const [faceId, setFaceId] = useState(DEFAULT_FACE)
  const [faceWeight, setFaceWeight] = useState<number | null>(null)
  const [customSize, setCustomSize] = useState(28)
  const [loaded, setLoaded] = useState<LoadedFace | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [exportError, setExportError] = useState(false)
  const [pitch, setPitch] = useState(DEFAULT_PITCH)
  const [tracking, setTracking] = useState(0)
  const [strength, setStrength] = useState(1)
  const [lean, setLean] = useState(1)
  const [weight, setWeight] = useState(1)

  useEffect(() => {
    if (editorRef.current) editorRef.current.textContent = PLAYGROUND_TEXT
  }, [])

  useEffect(() => {
    fetchFaces().then(setFaces).catch(() => setFaces([]))
  }, [])

  // 只要選取範圍還在編輯區裡就記下來，之後不管焦點跑去哪都還原得回去。
  useEffect(() => {
    const remember = () => {
      const selection = window.getSelection()
      const editor = editorRef.current
      if (!selection || selection.rangeCount === 0 || !editor) return
      const range = selection.getRangeAt(0)
      if (!range.collapsed && editor.contains(range.commonAncestorContainer)) {
        rangeRef.current = range.cloneRange()
      }
    }
    document.addEventListener('selectionchange', remember)
    return () => document.removeEventListener('selectionchange', remember)
  }, [])

  /** 依目前畫面上的字切一份子集載進來。換字體、換字重或排完版都重來一次。 */
  const applyFace = async (id: string, weight?: number) => {
    const face = faces.find((item) => item.id === id)
    const editor = editorRef.current
    if (!face || !editor) return
    const text = editor.textContent ?? ''
    if (!text.trim()) return
    const ticket = ++faceTicket.current
    setStatus('loading')
    try {
      const next = await loadFaceForText(face, text, weight ?? pickWeight(face))
      if (ticket !== faceTicket.current) return
      setLoaded(next)
      setStatus('idle')
    } catch (error) {
      if (ticket !== faceTicket.current) return
      // 取不到就維持前一套字，畫面不會空掉。
      console.warn(error)
      setStatus('error')
    }
  }

  // 清單一到就把預設字體載起來；預設那套萬一被過濾掉了就退到第一套。
  useEffect(() => {
    if (!faces.length) return
    const id = faces.some((face) => face.id === faceId) ? faceId : faces[0].id
    const face = faces.find((item) => item.id === id)
    const weight = face ? pickWeight(face) : 400
    setFaceId(id)
    setFaceWeight(weight)
    void applyFace(id, weight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faces])

  /** 把記住的選取範圍包進一個指定字級的 span。沒選字就不動作。 */
  const applySize = (size: number) => {
    const editor = editorRef.current
    const range = rangeRef.current
    if (!editor || !range || range.collapsed) return
    if (!editor.contains(range.commonAncestorContainer)) return
    const span = document.createElement('span')
    span.style.fontSize = `${size}px`
    span.appendChild(range.extractContents())
    range.insertNode(span)
    rangeRef.current = null
    window.getSelection()?.removeAllRanges()
  }

  /**
   * 離開輸入框才排版。編輯中動 DOM 會打斷輸入法組字，也會讓游標亂跳。
   *
   * 焦點只是跑到旁邊的控制項（字級輸入框、字體選單）時不算離開 —— 排版會把
   * 選取範圍指到的節點換掉，那些控制項就沒東西可以套用了。
   */
  const compose = (event?: React.FocusEvent) => {
    const editor = editorRef.current
    const next = event?.relatedTarget as Node | null
    // 焦點還在試打區裡（跑去字級輸入框、字體選單）就不算離開。
    if (next && wrapRef.current?.contains(next)) return
    if (!editor || setRef.current) return
    redact(editor)
    setRef.current = true
    // 打了新字就得重切一份子集，不然新字會掉回系統字。
    void applyFace(faceId, faceWeight ?? undefined)
  }

  /**
   * 點回來就拆掉。掛在 pointerdown 而不是 focus —— 要趕在瀏覽器決定游標位置之前
   * 把結構還原，不然游標會落在待會就被換掉的節點上。
   */
  const decompose = () => {
    const editor = editorRef.current
    if (!editor || !setRef.current) return
    unredact(editor)
    setRef.current = false
  }

  /**
   * 匯出用的設定。刻意走套件的 options 而不是照抄畫面上那組 CSS 變數 ——
   * 變數裡的 --lp-* 指向 lpplay-* 那組濾鏡，那些 id 在匯出的檔案裡不存在。
   * 傳 options 進去，letterpressCss 與 filtersMarkup 會用預設前綴重新產生一份對得上的。
   */
  const exportInput = () => ({
    node: editorRef.current as HTMLElement,
    options: { ...DEMO_OPTIONS, pitch: `${pitch}em`, lean, weight, filters: { strength } },
    font: loaded ? { family: loaded.family, buffer: loaded.buffer } : undefined,
  })

  /** 匯出會在好幾個地方 throw，失敗要讓使用者看得到，不能只留在 console。 */
  const runExport = async (task: () => void | Promise<void>) => {
    const editor = editorRef.current
    if (!editor) return
    // 沒排過版就先排一次，匯出的才是完整的樣子。
    if (!setRef.current) compose()
    try {
      setExportError(false)
      await task()
    } catch (error) {
      console.warn(error)
      setExportError(true)
    }
  }

  // 只有這個子樹改指到試打區那組濾鏡，頁面其他地方照舊。
  const playVars = {
    '--pitch': `${pitch}em`,
    '--lean': lean,
    '--weight': weight,
    '--lp-s': `url(#${PLAY_PREFIX}-s)`,
    '--lp-t': `url(#${PLAY_PREFIX}-t)`,
    '--lp-d': `url(#${PLAY_PREFIX}-d)`,
    '--lp-x': `url(#${PLAY_PREFIX}-x)`,
  } as React.CSSProperties

  const grouped = faces.reduce<Record<string, EmFont[]>>((acc, face) => {
    const key = face.category || 'other'
    ;(acc[key] ||= []).push(face)
    return acc
  }, {})

  return (
    // onBlur 掛在整區而不是編輯區：React 的 onBlur 就是會冒泡的 focusout，
    // 掛在編輯區的話，焦點一旦先跑到工具列，之後離開整區就再也收不到事件了。
    <Box ref={wrapRef} onBlur={compose}>
      <HStack gap={{ base: 4, md: 7 }} flexWrap="wrap" justifyContent="center" mb={5}>
        <HStack gap={2}>
          <Text className="lbl">{t('letterpressPage.playDirection')}</Text>
          <Key on={!vertical} onClick={() => setVertical(false)}>{t('letterpressPage.playHorizontal')}</Key>
          <Key on={vertical} onClick={() => setVertical(true)}>{t('letterpressPage.playVertical')}</Key>
        </HStack>

        <HStack gap={2}>
          <Text className="lbl">{t('letterpressPage.playSize')}</Text>
          {SIZES.map((size) => (
            <Key key={size} onClick={() => applySize(size)} title={t('letterpressPage.playSizeHint')}>
              {size}
            </Key>
          ))}
          <styled.input
            type="number"
            min={8}
            max={200}
            value={customSize}
            onChange={(event) => setCustomSize(Number(event.currentTarget.value))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                applySize(customSize)
              }
            }}
            aria-label={t('letterpressPage.playSizeCustom')}
            width="64px"
            px={2}
            py="6px"
            style={{ border: '1px solid var(--ink)', background: 'transparent', fontSize: 13, color: 'var(--ink)' }}
          />
          <Key onClick={() => applySize(customSize)} title={t('letterpressPage.playSizeCustom')}>
            {t('letterpressPage.playApply')}
          </Key>
        </HStack>

        <HStack gap={2}>
          <Text className="lbl">{t('letterpressPage.playFace')}</Text>
          <styled.select
            className="sg"
            value={faceId}
            onMouseDown={(event) => event.stopPropagation()}
            onChange={(event) => {
              const id = event.currentTarget.value
              // 每套字的字重不一樣，換字體就重挑一個它有的。
              const weight = pickWeight(faces.find((face) => face.id === id) ?? { id, name: id })
              setFaceId(id)
              setFaceWeight(weight)
              void applyFace(id, weight)
            }}
            px={3}
            py="6px"
            maxWidth="200px"
            cursor="pointer"
            style={{ border: '1px solid var(--ink)', background: 'transparent', fontSize: 13, color: 'var(--ink)' }}
          >
            {Object.entries(grouped).map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((face) => (
                  <option key={face.id} value={face.id}>{face.name}</option>
                ))}
              </optgroup>
            ))}
          </styled.select>
          <styled.select
            className="sg"
            value={faceWeight ?? ''}
            onChange={(event) => {
              const next = Number(event.currentTarget.value)
              setFaceWeight(next)
              void applyFace(faceId, next)
            }}
            aria-label={t('letterpressPage.playWeight')}
            px={2}
            py="6px"
            cursor="pointer"
            style={{ border: '1px solid var(--ink)', background: 'transparent', fontSize: 13, color: 'var(--ink)' }}
          >
            {(faces.find((face) => face.id === faceId)?.weight ?? [400]).map((weight) => (
              <option key={weight} value={weight}>{weight}</option>
            ))}
          </styled.select>
        </HStack>

        <HStack gap={2}>
          <Text className="lbl">{t('letterpressPage.playExport')}</Text>
          <Key onClick={() => void runExport(() => exportSvg(exportInput()))}>SVG</Key>
          <Key onClick={() => void runExport(() => exportPng(exportInput()))}>PNG</Key>
        </HStack>
      </HStack>

      <HStack gap={{ base: 5, md: 8 }} flexWrap="wrap" justifyContent="center" mb={6}>
        <Dial
          label={t('letterpressPage.playPitch')}
          value={pitch}
          min={1}
          max={2.6}
          step={0.05}
          live
          format={(v) => `${v.toFixed(2)}em`}
          onCommit={setPitch}
        />
        <Dial
          label={t('letterpressPage.playTracking')}
          value={tracking}
          min={0}
          max={0.5}
          step={0.02}
          live
          format={(v) => `${v.toFixed(2)}em`}
          onCommit={setTracking}
        />
        <Dial label={t('letterpressPage.dialStrength')} value={strength} onCommit={setStrength} />
        <Dial label={t('letterpressPage.dialLean')} value={lean} live onCommit={setLean} />
        <Dial label={t('letterpressPage.dialWeight')} value={weight} live onCommit={setWeight} />
      </HStack>

      <Stack gap={2} mb={5} alignItems="center">
        <Text className="tp" style={{ fontSize: 12, opacity: .72 }}>
          {exportError
            ? t('letterpressPage.playExportError')
            : status === 'loading'
            ? t('letterpressPage.playLoading')
            : status === 'error'
              ? t('letterpressPage.playFaceError')
              : loaded
                ? `${t('letterpressPage.playDownloaded')} ${(loaded.bytes / 1024).toFixed(1)} KB`
                : ''}
        </Text>
        <Text className="tp" style={{ fontSize: 12, opacity: .55 }}>
          {t('letterpressPage.playHint')} {t('letterpressPage.playResizeHint')}
        </Text>
      </Stack>

      <LetterpressFilters {...DEMO_OPTIONS} idPrefix={PLAY_PREFIX} filters={{ strength }} />

      {/* 紙紋不在這裡疊 —— 整頁的紙已經在底下，編輯區是透明的，再疊一層會變兩張紙。 */}
      <Box position="relative" style={playVars}>
        <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onPointerDown={decompose}
        onFocus={decompose}
        className={`sg lp-typed${vertical ? ' lp-v' : ''}`}
        style={{
          border: '1px solid var(--ink)',
          padding: '34px 38px',
          // 使用者自己拉大小。直排拉寬、橫排拉高才有意義，所以兩邊給不同的軸。
          resize: vertical ? 'horizontal' : 'vertical',
          minHeight: vertical ? 260 : 220,
          height: vertical ? 400 : 260,
          minWidth: vertical ? 320 : undefined,
          overflow: 'auto',
          outline: 'none',
          fontSize: 22,
          fontFamily: loaded ? `'${loaded.family}', serif` : undefined,
          letterSpacing: `${tracking}em`,
          whiteSpace: 'pre-wrap',
          cursor: 'text',
          position: 'relative',
          zIndex: 1,
          background: 'none',
        }}
        />
      </Box>

      <Text className="tp" mt={3} textAlign="center" style={{ fontSize: 11, opacity: .5 }}>
        <styled.a
          href="https://font.emtech.cc"
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          {t('letterpressPage.playPrivacy')}
        </styled.a>
      </Text>
    </Box>
  )
}

export default PressPlayground
