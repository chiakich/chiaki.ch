import { useId, useState } from 'react'
import { Box, HStack, Wrap, styled } from 'styled-system/jsx'
import { LetterpressFilters, Redacted } from 'kappan/react'
import { pressTuning, pressTexture, NEUTRAL_PRESS, type LetterpressOptions, type Press } from 'kappan'
import { Dial, Key } from 'components/works/letterpress/Controls'
import { DEMO_OPTIONS } from 'components/works/letterpress/pressOptions'

const Text = styled.p

/**
 * 用印刷的成因當旋鈕。不給 only 就是整台印刷機：旋鈕、預設、算出來的濾鏡參數。
 * 給了 only 就變成一張比較圖 —— 同一段字，並排印在該成因的兩三種狀態上。
 *
 * 逐節不用旋鈕，是因為旋鈕是先後比較，讀者得記住拉之前長什麼樣；並排是同時比較，
 * 跟文章拿實印稿並排比對是同一件事，而且不用操作，滑過去也看得到差別。
 */

type Cause = keyof Press | 'set' | 'size'

const CAUSES: Record<keyof Press, { label: string; hint: string }> = {
  ink: { label: '上墨量', hint: '少了筆畫會斷，多了糊成一團' },
  pressure: { label: '壓力', hint: '輕了墨轉不滿、整體發灰，重了墨被擠到邊上，邊實中淡' },
  roughness: { label: '紙面粗糙', hint: '光滑的塗佈紙，到纖維把筆畫邊推歪的手工紙' },
  absorbency: { label: '紙的吸墨', hint: '塗佈紙不暈，新聞紙平但很吸墨、邊緣滲開' },
  wear: { label: '字面磨損', hint: '舊字的字面被磨鈍、邊上崩角、也印得比較淡' },
  unevenness: { label: '字內墨量差異', hint: '鉛字沒坐平，一顆字裡一側飽一側虛' },
}
const SET_HINT = '排字工的手不是尺，每顆字擺進去都差那麼一點'
/**
 * 排字那節一定要長樣字。逐字歪斜與濃淡的週期是 11／13／17／23 這些互質的大數 ——
 * 刻意挑大的，整段文章才看不出循環；代價是七個字只命中四條規則裡的兩條，
 * 而且視覺最強的加粗那兩條（13n+8、23n+11）根本輪不到。
 */
// 樣字必須落在 iming-subset 的字集內（見 scripts/subsetIMing.py）。子集外的字會
// 悄悄掉到 Noto Serif TC，基線與字面框不同，看起來像某幾個字自己往下沉 ——
// 而且歪斜 0 那一格也還在，因為那根本不是歪斜造成的。這句取自見本帖，保證在集內。
const SET_TEXT = '排字工的手也不是尺。每顆字擺進去都差那麼一點點，整段看下去，字是活的，行是斜的。'
// 缺角與缺塊的尺度是絕對長度，不會跟著字級放大 —— 這張圖就是要讓人看見這件事。
const SIZE_HINT = '同一組參數，換個字級就是另一回事'

const NEUTRAL = NEUTRAL_PRESS
const PRESETS: { label: string; press: Press }[] = [
  { label: '標準', press: NEUTRAL },
  { label: '墨上太多', press: { ...NEUTRAL, ink: 1.9, pressure: 1.3, unevenness: 0.6 } },
  // 成因都偏向缺墨的話 starve 會疊到把字打碎，這幾組刻意留在讀得出字的範圍內。
  { label: '墨不夠', press: { ...NEUTRAL, ink: 0.6, pressure: 0.8, roughness: 1.1, unevenness: 1.4 } },
  { label: '粗紙手刷', press: { ...NEUTRAL, ink: 1.05, pressure: 0.8, roughness: 1.7, absorbency: 1.6, wear: 1.15, unevenness: 1.3 } },
  { label: '新聞紙', press: { ...NEUTRAL, ink: 1.1, roughness: 0.6, absorbency: 1.6, wear: 1.2 } },
  { label: '新字好紙', press: { ...NEUTRAL, pressure: 1.4, roughness: 0.2, absorbency: 0.3, wear: 0, unevenness: 0.5 } },
]

/** 逐節比較的「標準」那一側全篇共用同一組濾鏡，BlogWidgets 只掛一份。 */
export const NEUTRAL_PREFIX = 'lpp-neutral'
export const NEUTRAL_OPTIONS: LetterpressOptions = { ...DEMO_OPTIONS, idPrefix: NEUTRAL_PREFIX, filters: pressTuning(NEUTRAL) }

type Pane = { label: string; press?: Partial<Press>; size?: number; lean?: number; weight?: number }
type Compare = { hint: string; text: string; size: number; panes: Pane[] }

// 上墨與壓力兩個方向都會壞，各給三格；其餘都是乾淨的兩極。
// 三格並排時每格較窄，樣字要短。
const COMPARE: Record<Cause, Compare> = {
  ink: {
    hint: CAUSES.ink.hint, text: '活版印刷', size: 30,
    panes: [{ label: '墨不夠', press: { ink: 0.5 } }, { label: '標準' }, { label: '墨太多', press: { ink: 1.9 } }],
  },
  pressure: {
    hint: CAUSES.pressure.hint, text: '活版印刷', size: 30,
    panes: [{ label: '壓太輕', press: { pressure: 0.6 } }, { label: '標準' }, { label: '壓太重', press: { pressure: 1.7 } }],
  },
  roughness: {
    hint: CAUSES.roughness.hint, text: '常世通信 第一號', size: 30,
    panes: [{ label: '塗佈紙', press: { roughness: 0.2 } }, { label: '手工紙', press: { roughness: 1.8 } }],
  },
  absorbency: {
    hint: CAUSES.absorbency.hint, text: '常世通信 第一號', size: 30,
    panes: [{ label: '塗佈紙', press: { absorbency: 0.2 } }, { label: '新聞紙', press: { absorbency: 1.8 } }],
  },
  wear: {
    hint: CAUSES.wear.hint, text: '常世通信 第一號', size: 30,
    panes: [{ label: '新字', press: { wear: 0 } }, { label: '舊字', press: { wear: 1.9 } }],
  },
  unevenness: {
    hint: CAUSES.unevenness.hint, text: '常世通信 第一號', size: 30,
    panes: [{ label: '坐平', press: { unevenness: 0 } }, { label: '沒坐平', press: { unevenness: 1.9 } }],
  },
  set: {
    hint: SET_HINT, text: SET_TEXT, size: 20,
    panes: [{ label: '排得齊', lean: 0, weight: 0 }, { label: '排字工的手', lean: 0.6, weight: 1.4 }],
  },
  size: {
    hint: SIZE_HINT, text: '見本', size: 16,
    panes: [{ label: '16px 內文', size: 16 }, { label: '60px 大字', size: 60 }],
  },
}

const PAPER = '#efe9db'
const RULE = 'color-mix(in srgb, var(--ink) 22%, transparent)'

const filterVars = (prefix: string) => ({
  '--lp-s': `url(#${prefix}-s)`,
  '--lp-t': `url(#${prefix}-t)`,
  '--lp-d': `url(#${prefix}-d)`,
  '--lp-x': `url(#${prefix}-x)`,
})

/**
 * 一張紙：自己的濾鏡、自己的紙紋。--texture 要跟 .lp-paper 同層，紙紋是它的
 * ::before/::after，設在子層讀不到。標準墨壓的紙不掛濾鏡，指向全篇共用那組。
 */
const Sheet = ({
  press = NEUTRAL,
  lean = 0.2,
  weight = 1,
  children,
}: {
  press?: Press
  lean?: number
  weight?: number
  children: React.ReactNode
}) => {
  const own = `lpp-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const neutral = (Object.keys(NEUTRAL) as (keyof Press)[]).every((k) => press[k] === NEUTRAL[k])
  const prefix = neutral ? NEUTRAL_PREFIX : own
  const vars = {
    ...filterVars(prefix),
    '--texture': pressTexture(press),
    '--lean': lean,
    '--weight': weight,
    // 紙色掛在 .lp 不在 .lp-paper 上；這裡不能再掛一層 .lp，會把外框的變數全部重設。
    background: 'var(--paper)',
  } as React.CSSProperties

  return (
    <Box className="lp-paper" style={vars} px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
      {!neutral && <LetterpressFilters {...DEMO_OPTIONS} idPrefix={own} filters={pressTuning(press)} />}
      {children}
    </Box>
  )
}

// 短樣字在整台印刷機上不換行（寬度夠、可捲）；在比較圖的窄格裡只准在空格處折，
// 不在字中間斷 —— 一出捲軸就不像印在紙上的東西了。
const Sample = ({ text, size, long, fit = false }: { text: string; size: number; long: boolean; fit?: boolean }) => (
  <Box textAlign={long ? 'justify' : 'center'} overflowX={long || fit ? 'visible' : 'auto'}>
    <styled.p
      className="lp-f-t"
      style={{
        fontSize: size,
        letterSpacing: '.12em',
        lineHeight: long ? 2 : 1.7,
        whiteSpace: long || fit ? 'normal' : 'nowrap',
        wordBreak: fit && !long ? 'keep-all' : undefined,
      }}
    >
      <Redacted text={text} />
    </styled.p>
  </Box>
)

const LetterpressPress = ({
  only,
  text,
  size,
}: {
  only?: Cause
  text?: string
  size?: number
}) => {
  // 顏色與字堆不繼承文章頁：那組是為長篇閱讀調的，墨較淡，同一組濾鏡會啃掉更多。
  // 四支濾鏡也要指到活的 id：文章頁沒掛濾鏡，繼承來的 url(#lp-*) 全是死連結。
  const frame = {
    ...filterVars(NEUTRAL_PREFIX),
    // 標點字型排最前面，unicode-range 才搶得贏正文字型。
    '--type': `'${DEMO_OPTIONS.punctFont!.family}', ${DEMO_OPTIONS.typeFamily}`,
    '--latin': DEMO_OPTIONS.latinFamily,
    '--ink': DEMO_OPTIONS.ink,
    '--ink3': DEMO_OPTIONS.inkMuted,
    '--red': DEMO_OPTIONS.red,
    // 見本帖是白紙，文章裡的比較圖要一眼看出「這是一張紙」，用 kappan 預設的米黃。
    '--paper': PAPER,
  } as React.CSSProperties

  if (only) {
    const cmp = COMPARE[only]
    const sample = text ?? cmp.text
    // 長樣字要能換行，不然會變成一條橫向捲軸。
    const long = sample.length > 12
    return (
      <Box className="lp" style={{ ...frame, background: 'transparent' }}>
        <Box
          display="grid"
          // 一格至少 200px，塞不下就往下疊；格與格之間露出底色當分隔線。
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 1, background: RULE, border: `1px solid ${RULE}` }}
        >
          {cmp.panes.map((pane) => (
            <Sheet key={pane.label} press={{ ...NEUTRAL, ...pane.press }} lean={pane.lean} weight={pane.weight}>
              <Box display="flex" flexDirection="column" justifyContent="center" gap={4} height="100%">
                <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1}>
                  <Sample text={sample} size={pane.size ?? size ?? cmp.size} long={long} fit />
                </Box>
                <Text className="lbl" textAlign="center">{pane.label}</Text>
              </Box>
            </Sheet>
          ))}
        </Box>
        <Text className="lbl" textAlign="center" mt={3}>{cmp.hint}</Text>
      </Box>
    )
  }

  return <FullPress text={text ?? '常世通信 第一號'} size={size ?? 34} frame={frame} />
}

/** 整台印刷機：六個成因加字級，幾組預設，底下印實際算出來的濾鏡參數。 */
const FullPress = ({ text, size: initialSize, frame }: { text: string; size: number; frame: React.CSSProperties }) => {
  const [size, setSize] = useState(initialSize)
  const long = text.length > 12
  const [press, setPress] = useState<Press>(NEUTRAL)
  const [lean, setLean] = useState(0.2)
  const [weight, setWeight] = useState(1)
  const set = (k: keyof Press) => (v: number) => setPress((p) => ({ ...p, [k]: v }))
  const tuning = pressTuning(press).text!

  return (
    <Box className="lp" style={{ ...frame, border: `1px solid ${RULE}` }}>
      <Sheet press={press} lean={lean} weight={weight}>
        <Box py={{ base: 4, md: 6 }}>
          <Sample text={text} size={size} long={long} />
        </Box>

        <Wrap gap={{ base: 4, md: 6 }} justifyContent="center">
          {(Object.keys(CAUSES) as (keyof Press)[]).map((c) => (
            <Dial key={c} label={CAUSES[c].label} value={press[c]} onCommit={set(c)} />
          ))}
          <Dial label="字間墨量差異" value={weight} live onCommit={setWeight} />
          <Dial label="字間歪斜" value={lean} live onCommit={setLean} />
          <Dial label="字級" value={size} min={12} max={72} step={1} live format={(v) => `${v}px`} onCommit={setSize} />
        </Wrap>

        <HStack gap={2} justifyContent="center" mt={5} flexWrap="wrap">
          {PRESETS.map((p) => (
            <Key key={p.label} onClick={() => setPress(p.press)}>{p.label}</Key>
          ))}
        </HStack>
        <Text className="lbl" textAlign="center" mt={4} style={{ lineHeight: 1.9 }}>
          {`推歪 ${tuning.displace!.toFixed(2)}　積墨 ${tuning.pooling!.toFixed(2)}　崩角 ${tuning.chipAmount!.toFixed(2)}／尺度 ${tuning.chipFrequency!.toFixed(2)}　缺塊門檻 ${tuning.voidThreshold!.toFixed(3)}　墨暈 ${tuning.bleed || '關'}　拉硬 ${tuning.contrast!.toFixed(1)}　邊實 ${tuning.rim!.toFixed(2)}　壓痕 ${tuning.deboss!.toFixed(2)}　墨量 ${tuning.fade!.toFixed(2)}`}
        </Text>
      </Sheet>
    </Box>
  )
}

export default LetterpressPress
