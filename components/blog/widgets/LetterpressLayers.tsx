import { useId, useState } from 'react'
import { Box, HStack, styled } from 'styled-system/jsx'
import { LetterpressFilters, Redacted } from 'kappan/react'
import type { FilterTuning, LetterpressOptions } from 'kappan'
import { Dial } from 'components/works/letterpress/Controls'
import { DEMO_OPTIONS } from 'components/works/letterpress/pressOptions'

const Text = styled.p

/**
 * 一節一個，示範「再疊一層上去」。
 *
 * 每一節把它之前的層全開，自己這層交給滑桿從 0 拉起 —— 讀者拉到 0 看到還沒加這層
 * 的樣子，拉到 2 看到誇張版，中間那個位置就是見本帖用的值。所以是累加不是並列。
 */

type LayerId = 'paper' | 'ink' | 'press' | 'set'

const ORDER: LayerId[] = ['paper', 'ink', 'press', 'set']

const LABEL: Record<LayerId, string> = {
  paper: '紙',
  ink: '墨',
  press: '壓',
  set: '排字',
}

// 紙紋是 opacity，封頂在 1，滑桿再往上拉沒有意義；其餘幾層可以推到誇張。
const MAX: Record<LayerId, number> = { paper: 1, ink: 2, press: 2, set: 2 }

const LetterpressLayers = ({
  layer,
  text = '常世通信 第一號',
  size = 34,
}: {
  layer: LayerId
  text?: string
  size?: number
}) => {
  const [amount, setAmount] = useState(1)

  // 之前的層全開，之後的層全關，自己這層聽滑桿的。
  const active = ORDER.indexOf(layer)
  const at = (id: LayerId) => {
    const index = ORDER.indexOf(id)
    if (index < active) return 1
    return index === active ? amount : 0
  }
  const paper = at('paper')
  const ink = at('ink')
  const press = at('press')
  const set = at('set')

  // 濾鏡各支是獨立的一份，多個 demo 同頁才不會互相蓋掉。
  const prefix = `lpw-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  // -t 是 .sg 吃到的那支。這裡逐欄位給值，不用全域 strength ——
  // strength 會把位移、脹開、缺角一起縮放，那樣就沒辦法一次只動一層。
  const filters: FilterTuning = {
    text: {
      bleed: ink > 0,
      dilate: 0.3 * ink,
      contrast: 1 + 2.2 * ink,
      threshold: -0.06 * ink,
      displace: 1.6 * press,
      chipAmount: 0.18 * press,
    },
  }
  const options: LetterpressOptions = { ...DEMO_OPTIONS, idPrefix: prefix, filters }

  const vars = {
    '--texture': paper,
    '--lean': set,
    '--weight': set,
    '--lp-s': `url(#${prefix}-s)`,
    '--lp-t': `url(#${prefix}-t)`,
    '--lp-d': `url(#${prefix}-d)`,
    '--lp-x': `url(#${prefix}-x)`,
  } as React.CSSProperties

  return (
    <Box className="lp" position="relative" overflow="hidden" style={vars}>
      <LetterpressFilters {...options} />

      {paper > 0 && (
        <>
          <i className="lp-fibre" />
          <i className="lp-expose" />
          <i className="lp-grain" />
        </>
      )}

      <Box position="relative" zIndex={1} px={{ base: 5, md: 8 }} py={{ base: 7, md: 9 }}>
        <Box textAlign="center" py={{ base: 4, md: 6 }}>
          <styled.p
            className="sg"
            style={{ fontSize: size, fontWeight: 600, letterSpacing: '.12em', lineHeight: 1.7 }}
          >
            <Redacted text={text} />
          </styled.p>
        </Box>

        <HStack justifyContent="center" mt={{ base: 5, md: 7 }}>
          <Dial
            label={LABEL[layer]}
            value={amount}
            max={MAX[layer]}
            live={layer === 'paper' || layer === 'set'}
            onCommit={setAmount}
          />
        </HStack>
        <Text className="lbl" textAlign="center" mt={3}>
          {amount === 0 ? `沒有${LABEL[layer]}` : `${LABEL[layer]} × ${amount.toFixed(1)}`}
        </Text>
      </Box>
    </Box>
  )
}

export default LetterpressLayers
