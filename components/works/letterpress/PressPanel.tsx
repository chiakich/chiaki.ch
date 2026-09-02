import { Redacted } from 'kappan/react'

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
    <div
      style={{
        border: '1px solid var(--ink)',
        padding: '34px 38px',
        // 直排固定高度，那是行長；橫排讓紙自己長高，長短由字數決定。
        height: vertical ? 560 : 'auto',
        overflow: 'auto',
        // 直排的欄數是算得出來的，寬度包住就好；撐滿會讓版心偏到某一側。
        width: vertical ? 'max-content' : undefined,
        maxWidth: '100%',
        margin: vertical ? '0 auto' : undefined,
      }}
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
              fontSize: latin ? 15 : 16,
              letterSpacing: latin ? '.01em' : 0,
              textAlign: latin ? 'justify' : undefined,
            }}
          >
            <Redacted text={line} />
          </p>
        ))}
      </div>
    </div>
  )
}

export default PressPanel
