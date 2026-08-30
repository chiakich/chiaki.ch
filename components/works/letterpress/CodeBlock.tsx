import { Fragment } from 'react'
import { styled } from 'styled-system/jsx'

const Pre = styled.pre

/**
 * 見本帖上的程式碼。多色刷 —— 每個顏色都是一次落版，所以只用四色：
 * 墨、硃、靛，加上註解的淡墨。
 *
 * 高亮自己做的，兩段短樣本不值得為它拉一整套 highlighter 進來，
 * 也不必為了上色改用 dangerouslySetInnerHTML。
 */

const INK = {
  comment: 'rgba(0, 0, 0, .42)',
  string: 'var(--red)',
  keyword: '#1f4e79',
  tag: '#1f4e79',
  plain: 'var(--ink)',
} as const

type Kind = keyof typeof INK

// 順序有意義：註解要先吃掉，否則裡面的引號會被當成字串。
const TOKEN = new RegExp(
  [
    String.raw`(\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/|\/\/[^\n]*)`, // 註解
    String.raw`('[^'\n]*'|"[^"\n]*"|\`[^\`]*\`)`, // 字串
    String.raw`\b(import|from|export|const|let|var|function|return|new|await|async)\b`, // 關鍵字
    String.raw`(<\/?[A-Za-z][\w.]*|\/>|>)`, // JSX 標籤
  ].join('|'),
  'g'
)

const tokenize = (code: string) => {
  const out: { kind: Kind; text: string }[] = []
  let last = 0
  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0
    if (index > last) out.push({ kind: 'plain', text: code.slice(last, index) })
    const kind: Kind = match[1] ? 'comment' : match[2] ? 'string' : match[3] ? 'keyword' : 'tag'
    out.push({ kind, text: match[0] })
    last = index + match[0].length
  }
  if (last < code.length) out.push({ kind: 'plain', text: code.slice(last) })
  return out
}

const CodeBlock = ({ code }: { code: string }) => (
  // .tp 一次給到兩件事：Courier Prime 的字面，跟行文那支墨壓濾鏡。
  <Pre className="tp" style={{ margin: 0, fontSize: 14, lineHeight: 1.85 }}>
    {tokenize(code).map((token, index) => (
      <Fragment key={index}>
        {token.kind === 'plain' ? (
          token.text
        ) : (
          <span style={{ color: INK[token.kind] }}>{token.text}</span>
        )}
      </Fragment>
    ))}
  </Pre>
)

export default CodeBlock
