import { useId, useState } from 'react'
import { Box, HStack, Wrap, styled } from 'styled-system/jsx'
import { LetterpressFilters, Redacted } from 'kappan/react'
import { pressTuning, pressTexture, NEUTRAL_PRESS, type LetterpressOptions, type Press } from 'kappan'
import { Dial, Key } from 'components/works/letterpress/Controls'
import { DEMO_OPTIONS } from 'components/works/letterpress/pressOptions'

const Text = styled.p

/**
 * 用印刷的成因當旋鈕。不給 only 就是全部，給了就只露那一根 —— 逐節講的時候用。
 *
 * 刻意不做成「一層一層加上去」：印刷機上永遠同時有墨、有壓力、有紙，
 * 不存在「還沒加墨」的狀態。一次動一個、其餘維持標準，才是真的能對照的變因。
 */

type Cause = keyof Press | 'set' | 'size'

const CAUSES: Record<keyof Press, { label: string; hint: string }> = {
  ink: { label: '上墨量', hint: '少了筆畫會斷，多了糊成一團' },
  pressure: { label: '壓力', hint: '輕了墨轉不滿、整體發灰，重了墨被擠到邊上，邊實中淡' },
  paper: { label: '紙的粗糙', hint: '光滑的塗佈紙，到粗糙吸墨的手工紙' },
  wear: { label: '鉛字年紀', hint: '舊字的字面被磨鈍、邊上崩角、也印得比較淡' },
}
const SET_HINT = '排字工的手不是尺，每顆字擺進去都差那麼一點'
/**
 * 排字那節一定要長樣字。逐字歪斜與濃淡的週期是 11／13／17／23 這些互質的大數 ——
 * 刻意挑大的，整段文章才看不出循環；代價是七個字只命中四條規則裡的兩條，
 * 而且視覺最強的加粗那兩條（13n+8、23n+11）根本輪不到。
 */
// 樣字必須落在 iming-subset 的字集內（見 scripts/subsetIMing.py）。子集外的字會
// 悄悄掉到 Noto Serif TC，基線與字面框不同，看起來像某幾個字自己往下沉 ——
// 而且拉到歪斜 0 也還在，因為那根本不是歪斜造成的。這句取自見本帖，保證在集內。
const SET_TEXT = '排字工的手也不是尺。每顆字擺進去都差那麼一點點，整段看下去，字是活的，行是斜的。'
// 缺角與缺塊的尺度是絕對長度，不會跟著字級放大 —— 這根滑桿就是要讓人看見這件事。
const SIZE_HINT = '同一組參數，換個字級就是另一回事'

const NEUTRAL = NEUTRAL_PRESS
const PRESETS: { label: string; press: Press }[] = [
  { label: '標準', press: NEUTRAL },
  { label: '墨上太多', press: { ink: 1.9, pressure: 1.3, paper: 1, wear: 1 } },
  // 四個成因都偏向缺墨的話 starve 會疊到把字打碎，這幾組刻意留在讀得出字的範圍內。
  { label: '墨不夠', press: { ink: 0.6, pressure: 0.8, paper: 1.1, wear: 1 } },
  { label: '粗紙手刷', press: { ink: 1.05, pressure: 0.8, paper: 1.7, wear: 1.15 } },
  { label: '新字好紙', press: { ink: 1, pressure: 1.4, paper: 0.2, wear: 0 } },
]

const LetterpressPress = ({
  only,
  text = only === 'set' ? SET_TEXT : '常世通信 第一號',
  size: initialSize = only === 'set' ? 20 : 34,
}: {
  only?: Cause
  text?: string
  size?: number
}) => {
  const [size, setSize] = useState(initialSize)
  // 長樣字要能換行，不然會變成一條橫向捲軸。
  const long = text.length > 12
  const [press, setPress] = useState<Press>(NEUTRAL)
  const [lean, setLean] = useState(1)
  const [weight, setWeight] = useState(1)
  const set = (k: keyof Press) => (v: number) => setPress((p) => ({ ...p, [k]: v }))

  const prefix = `lpp-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const filters = pressTuning(press)
  const tuning = filters.text!
  const options: LetterpressOptions = { ...DEMO_OPTIONS, idPrefix: prefix, filters }
  // --texture 要跟 .lp-paper 同層：紙紋是它的 ::before/::after，設在子層讀不到。
  const vars = {
    // 四支都要覆蓋：文章頁沒掛濾鏡，繼承來的 url(#lp-*) 全是死連結。
    '--lp-s': `url(#${prefix}-s)`,
    '--lp-t': `url(#${prefix}-t)`,
    '--lp-d': `url(#${prefix}-d)`,
    '--lp-x': `url(#${prefix}-x)`,
    // 顏色與字堆不繼承文章頁：那組是為長篇閱讀調的，墨較淡，同一組濾鏡會啃掉更多。
    // 標點字型排最前面，unicode-range 才搶得贏正文字型。
    '--type': `'${DEMO_OPTIONS.punctFont!.family}', ${DEMO_OPTIONS.typeFamily}`,
    '--latin': DEMO_OPTIONS.latinFamily,
    '--ink': DEMO_OPTIONS.ink,
    '--ink3': DEMO_OPTIONS.inkMuted,
    '--red': DEMO_OPTIONS.red,
    '--paper': DEMO_OPTIONS.paper,
    '--texture': pressTexture(press),
    '--lean': lean,
    '--weight': weight,
    border: '1px solid color-mix(in srgb, var(--ink) 22%, transparent)',
  } as React.CSSProperties

  const show = (c: Cause) => !only || only === c
  const hint = !only ? null : only === 'set' ? SET_HINT : only === 'size' ? SIZE_HINT : CAUSES[only].hint

  return (
    <Box className="lp lp-paper" position="relative" style={vars}>
      <LetterpressFilters {...options} />
      <Box px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
        <Box textAlign={long ? 'justify' : 'center'} py={{ base: 4, md: 6 }} overflowX={long ? 'visible' : 'auto'}>
          <styled.p
            className="lp-f-t"
            style={{ fontSize: size, letterSpacing: '.12em', lineHeight: long ? 2 : 1.7, whiteSpace: long ? 'normal' : 'nowrap' }}
          >
            <Redacted text={text} />
          </styled.p>
        </Box>

        {hint && <Text className="lbl" textAlign="center" mb={4}>{hint}</Text>}

        <Wrap gap={{ base: 4, md: 6 }} justifyContent="center">
          {(Object.keys(CAUSES) as (keyof Press)[]).map((c) =>
            show(c) ? <Dial key={c} label={CAUSES[c].label} value={press[c]} onCommit={set(c)} /> : null
          )}
          {show('set') && <Dial label="歪斜" value={lean} live onCommit={setLean} />}
          {show('set') && <Dial label="濃淡差異" value={weight} live onCommit={setWeight} />}
          {(show('size') || !only) && (
            <Dial label="字級" value={size} min={12} max={72} step={1} live format={(v) => `${v}px`} onCommit={setSize} />
          )}
        </Wrap>

        {!only && (
          <>
            <HStack gap={2} justifyContent="center" mt={5} flexWrap="wrap">
              {PRESETS.map((p) => (
                <Key key={p.label} onClick={() => setPress(p.press)}>{p.label}</Key>
              ))}
            </HStack>
            <Text className="lbl" textAlign="center" mt={4} style={{ lineHeight: 1.9 }}>
              {`推歪 ${tuning.displace!.toFixed(2)}　崩角 ${tuning.chipAmount!.toFixed(2)}／尺度 ${tuning.chipFrequency!.toFixed(2)}　缺塊門檻 ${tuning.voidThreshold!.toFixed(3)}　墨暈 ${tuning.bleed || '關'}　拉硬 ${tuning.contrast!.toFixed(1)}　邊實 ${tuning.rim!.toFixed(2)}　壓痕 ${tuning.deboss!.toFixed(2)}　墨量 ${tuning.fade!.toFixed(2)}`}
            </Text>
          </>
        )}
      </Box>
    </Box>
  )
}

export default LetterpressPress
