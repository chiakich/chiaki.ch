import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

const shortcuts = [
  ['Shift + ,', '，'], ['Shift + .', '。'], ['Shift + [', '「'], ['Shift + ]', '」'], ['Shift + /', '？'],
] as const

const PunctuationScene = () => (
  <svg viewBox="0 0 640 300" width="100%" height="100%" role="img" aria-label="按 Shift 逗號輸出全形逗號與其他標點快捷鍵">
    <SceneBackground title="標點快捷鍵" />
    <Keycap x={188} y={92} width={74} label="shift" active={false} />
    <text x={274} y={117} fontSize="18" fill="#738196">＋</text>
    <Keycap x={292} y={92} label="," active={false} />
    <path d="M366 111 H408" fill="none" stroke="#9aabbe" strokeWidth="2.5" markerEnd="url(#punc-arrow)" />
    <defs>
      <marker id="punc-arrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#9aabbe" /></marker>
    </defs>
    <text x={430} y={124} fontSize="38" fontWeight="700" fill="#2478db">，</text>

    {shortcuts.map(([keys, symbol], index) => (
      <g key={keys} transform={`translate(${44 + index * 112} 186)`}>
        <rect width="96" height="48" rx="9" fill="#edf3fa" stroke="#b5c6d8" />
        <text x="14" y="21" fontSize="11" fill="#62758a">{keys}</text>
        <text x="48" y="42" textAnchor="middle" fontSize="20" fill="#203b5b">{symbol}</text>
      </g>
    ))}
  </svg>
)

export default PunctuationScene
