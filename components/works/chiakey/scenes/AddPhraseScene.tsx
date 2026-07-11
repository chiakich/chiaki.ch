import { motion } from 'framer-motion'
import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

// 依實際行為：游標在句尾，Shift+← 由後往前選取字詞，按 Enter 加入使用者詞庫。
// 提示文字取自輸入法本體的 tooltip。
const AddPhraseScene = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="游標在句尾以 Shift 加左方向鍵往前選取「鹽酥雞」，按 Enter 加入使用者詞庫">
    <SceneBackground title="加入新詞" />
    {/* 選取範圍由句尾往前長：右緣固定在游標位置 */}
    <motion.rect y="106" height="40" rx="4" fill="#e3c8f5" animate={{ x: [272, 188, 188, 188], width: [0, 84, 84, 84] }} transition={{ duration: 5.5, repeat: Infinity, times: [0, .3, .9, 1] }} />
    <text x="104" y="136" fontSize="28" fill="#241533">好吃的鹽酥雞</text>
    <line x1="104" y1="144" x2="272" y2="144" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
    <line x1="272" y1="104" x2="272" y2="144" stroke="#241533" strokeWidth="2" />
    <Keycap x={104} y={196} width={64} label="shift" />
    <Keycap x={176} y={196} width={44} label="←" delay={.15} />
    <motion.g animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 5.5, repeat: Infinity, times: [0, .32, .62, .72] }}>
      <rect x="286" y="180" width="292" height="34" rx="8" fill="#4a3560" />
      <text x="432" y="202" textAnchor="middle" fontSize="12.5" fill="#fff">正在選取字詞組…請按 ENTER 鍵加入資料庫</text>
    </motion.g>
    <motion.g animate={{ opacity: [0, 0, 0, 1, 1] }} transition={{ duration: 5.5, repeat: Infinity, times: [0, .6, .68, .78, 1] }}>
      <circle cx="330" cy="82" r="13" fill="#28c840" />
      <path d="M324 82 L328.5 87 L337 77" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="352" y="87" fontSize="14" fill="#4a3560">「鹽酥雞」已加入使用者詞庫</text>
    </motion.g>
  </svg>
)

export default AddPhraseScene
