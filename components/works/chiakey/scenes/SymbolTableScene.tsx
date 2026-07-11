import { motion } from 'framer-motion'
import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

const symbols = ['，', '。', '、', '「', '」', '《', '》', '？', '！', '：', '…', '—', '※', '★', '→', '℃']

// 依實際快捷鍵：Control + Command + . 開啟符號表。
const SymbolTableScene = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="按 Control、Command 與句點開啟符號表">
    <SceneBackground title="符號表" />
    <Keycap x={80} y={120} width={72} label="control" />
    <text x="166" y="145" fontSize="18" fill="#7c6b90">+</text>
    <Keycap x={184} y={120} width={54} label="⌘" delay={.12} />
    <text x="252" y="145" fontSize="18" fill="#7c6b90">+</text>
    <Keycap x={270} y={120} width={44} label="." delay={.24} />
    <motion.g animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, 6] }} transition={{ duration: 4.8, repeat: Infinity, times: [0, .22, .86, 1] }}>
      <rect x="366" y="68" width="216" height="180" rx="14" fill="#fdfdfd" stroke="#a795c0" filter="url(#shadow)" />
      <text x="474" y="92" textAnchor="middle" fontSize="12" fill="#7c6b90">符號表</text>
      {symbols.map((symbol, index) => {
        const column = index % 4
        const row = Math.floor(index / 4)
        return (
          <g key={symbol}>
            {index === 0 && <rect x={382} y={104} width="44" height="30" rx="6" fill="#ecd8f7" />}
            <text x={404 + column * 48} y={126 + row * 34} textAnchor="middle" fontSize="19" fill="#241533">{symbol}</text>
          </g>
        )
      })}
    </motion.g>
  </svg>
)

export default SymbolTableScene
