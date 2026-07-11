import { motion } from 'framer-motion'
import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

// 依實際行為：⌃⌘G 切換「繁體中文轉簡體」輸出濾鏡，單向繁→簡。
const ConversionScene = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="按 Control、Command 與 G 切換繁體轉簡體輸出">
    <SceneBackground title="繁體中文轉簡體" />
    <Keycap x={80} y={90} width={72} label="control" />
    <Keycap x={160} y={90} width={54} label="⌘" delay={.12} />
    <Keycap x={222} y={90} width={44} label="G" delay={.24} />
    <motion.g animate={{ opacity: [0, 1, 1, 1, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .15, .5, .9, 1] }}>
      <rect x="330" y="92" width="248" height="34" rx="8" fill="#fdfdfd" stroke="#a795c0" />
      <text x="352" y="115" fontSize="14" fill="#28a04a">✓</text>
      <text x="372" y="115" fontSize="13.5" fill="#4a3560">繁體中文轉簡體</text>
    </motion.g>
    <text x="104" y="205" fontSize="26" fill="#241533">臺灣的檔案</text>
    <motion.g animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 6, repeat: Infinity, times: [0, .35, .5, 1] }}>
      <path d="M262 197 H320" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
      <path d="M312 189 L324 197 L312 205" fill="none" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="348" y="205" fontSize="26" fill="#241533">台湾的档案</text>
    </motion.g>
    <text x="104" y="242" fontSize="12" fill="#7c6b90">照常打注音，送出時轉為簡體（單向繁 → 簡）</text>
  </svg>
)

export default ConversionScene
