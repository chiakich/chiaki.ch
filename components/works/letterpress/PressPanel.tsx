import { Redacted } from 'kappan/react'
import { Box } from 'styled-system/jsx'

export type PanelMode = 'cn-vertical' | 'cn-horizontal' | 'en-horizontal'

interface PressPanelProps {
  mode: PanelMode
  title: string
  lines: readonly string[]
}

/**
 * 一塊樣張。三種排法共用這份 JSX，換的只有 .lp-v 一個 class ——
 * flex 的 column 是跟著 writing-mode 走的，橫排是由上往下，直排就自動變成由右往左。
 *
 * 紙紋與濾鏡掛在整頁的 .lp 上，這裡不再疊一層；整本見本帖是同一張紙。
 * 也沒有格線：傳統鉛字書不印格子，字靠鉛身排實，行距由行間的鉛條決定。
 */
const PressPanel = ({ mode, title, lines }: PressPanelProps) => {
  const vertical = mode === 'cn-vertical'
  const latin = mode === 'en-horizontal'

  return (
    <Box
      overflow="auto"
      // 手機要放掉上限，不然負邊界推出去的寬度會被 100%（容器的 327px）夾回來。
      maxWidth={vertical ? { base: 'none', md: '100%' } : '100%'}
      overscrollBehaviorX="contain"
      p={{ base: '22px 24px', md: '34px 38px' }}
      // 直排固定高度，那是行長；橫排讓紙自己長高，長短由字數決定。
      // 行長愈長，同樣字數需要的欄數愈少，整塊就愈窄 —— 所以手機上要拉高不是縮小。
      height={vertical ? { base: '78vh', md: '560px' } : 'auto'}
      // 桌機寬度包住版心就好，撐滿會偏到某一側。手機無論如何包不住 —— 八個段落
      // 每段都要另起新欄，約十四欄；所以改成滿出容器的邊界，捲起來像一頁書。
      width={vertical ? { base: 'auto', md: 'max-content' } : undefined}
      mx={vertical ? { base: '-24px', md: 'auto' } : undefined}
      style={{ border: '1px solid var(--ink)' }}
    >
      <div
        className={`lp-typed${vertical ? ' lp-v' : ''}`}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0 }}
      >
        <div className="lp-cell">
          <h3
            className="sg"
            style={{
              fontSize: latin ? 23 : 25,
              fontWeight: 600,
              letterSpacing: latin ? '.02em' : '.3em',
            }}
          >
            <Redacted text={title} />
          </h3>
        </div>

        {lines.map((line, i) => (
          <p
            key={i}
            className="sg"
            style={{
              // 傳統書：漢字排實不加字距，拉丁字照字身走。
              // 600 跟見本列一致：一點明體只有 400，這是合成粗體，但印得飽的感覺就是它給的。
              fontWeight: 600,
              fontSize: latin ? 15 : 16,
              letterSpacing: latin ? '.01em' : 0,
              textAlign: latin ? 'justify' : undefined,
            }}
          >
            <Redacted text={line} />
          </p>
        ))}
      </div>
    </Box>
  )
}

export default PressPanel
