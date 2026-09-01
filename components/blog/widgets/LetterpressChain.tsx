import { useId, useState } from 'react'
import { Box, HStack, Wrap, styled } from 'styled-system/jsx'
import { LetterpressFilters, Redacted } from 'kappan/react'
import type { LetterpressOptions } from 'kappan'
import { pressToTuning, ramp, clamp, type Press } from './press'
import { Dial, Key } from 'components/works/letterpress/Controls'
import { DEMO_OPTIONS } from 'components/works/letterpress/pressOptions'

const Text = styled.p

const DEFAULT_PRESS: Press = { ink: 1, pressure: 1, paper: 1, wear: 1 }
const PRESETS: { label: string; press: Press }[] = [
  { label: '標準', press: DEFAULT_PRESS },
  { label: '墨上太多', press: { ink: 1.9, pressure: 1.3, paper: 1, wear: 1 } },
  { label: '墨不夠', press: { ink: 0.25, pressure: 0.6, paper: 1.2, wear: 1.2 } },
  { label: '粗紙手刷', press: { ink: 1.2, pressure: 0.7, paper: 2, wear: 1.4 } },
  { label: '新字好紙', press: { ink: 1, pressure: 1.4, paper: 0.2, wear: 0 } },
]

const LetterpressChain = ({ text = '常世通信 第一號', size: initialSize = 34 }: { text?: string; size?: number }) => {
  const [size, setSize] = useState(initialSize)
  const [press, setPress] = useState<Press>(DEFAULT_PRESS)
  const set = (k: keyof Press) => (v: number) => setPress((p) => ({ ...p, [k]: v }))

  const prefix = `lpc-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const tuning = pressToTuning(press)
  const options: LetterpressOptions = { ...DEMO_OPTIONS, idPrefix: prefix, filters: { text: tuning } }
  // 紙粗糙的話，紙紋本身也該濃一點 —— 那是同一張紙。
  const vars = {
    '--lp-t': `url(#${prefix}-t)`,
    '--texture': clamp(ramp(press.paper, 0.35, 1, 1), 0, 1),
  } as React.CSSProperties

  return (
    <Box className="lp lp-paper" position="relative">
      <LetterpressFilters {...options} />
      <Box px={{ base: 5, md: 8 }} py={{ base: 7, md: 9 }} style={vars}>
        <Box textAlign="center" py={{ base: 5, md: 7 }} overflowX="auto">
          <styled.p className="lp-f-t" style={{ fontSize: size, fontWeight: 600, letterSpacing: '.12em', lineHeight: 1.7, whiteSpace: 'nowrap' }}>
            <Redacted text={text} />
          </styled.p>
        </Box>

        <Wrap gap={{ base: 4, md: 6 }} justifyContent="center" mt={{ base: 4, md: 6 }}>
          <Dial label="上墨量" value={press.ink} onCommit={set('ink')} />
          <Dial label="壓力" value={press.pressure} onCommit={set('pressure')} />
          <Dial label="紙的粗糙" value={press.paper} onCommit={set('paper')} />
          <Dial label="鉛字年紀" value={press.wear} onCommit={set('wear')} />
          <Dial label="字級" value={size} min={12} max={72} step={1} live format={(v) => `${v}px`} onCommit={setSize} />
        </Wrap>

        <HStack gap={2} justifyContent="center" mt={5} flexWrap="wrap">
          {PRESETS.map((p) => (
            <Key key={p.label} onClick={() => setPress(p.press)}>{p.label}</Key>
          ))}
        </HStack>

        {/* 底下印出實際算出來的濾鏡參數 —— 一個成因牽動好幾道，這樣才看得見。 */}
        <Text className="lbl" textAlign="center" mt={4} style={{ lineHeight: 1.9 }}>
          {`推歪 ${tuning.displace!.toFixed(2)}　脹開 ${tuning.dilate!.toFixed(2)}　崩角 ${tuning.chipAmount!.toFixed(2)}　缺塊門檻 ${tuning.voidThreshold!.toFixed(3)}　墨暈 ${tuning.bleed ? '開' : '關'}　拉硬 ${tuning.contrast!.toFixed(1)}`}
        </Text>
      </Box>
    </Box>
  )
}

export default LetterpressChain
