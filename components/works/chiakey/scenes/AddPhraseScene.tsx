import { motion } from 'framer-motion'
import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

// 依實際行為：組字狀態下 Shift+方向鍵選取字詞，按 Enter 加入使用者詞庫。
// 提示文字取自輸入法本體的 tooltip。
const AddPhraseScene = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Shift 加方向鍵選取「鹽酥雞」，按 Enter 加入使用者詞庫">
    <SceneBackground title="加入新詞" />
    <motion.rect x="100" y="106" height="40" rx="4" fill="#bcd8ff" animate={{ width: [0, 96, 96, 96] }} transition={{ duration: 5.5, repeat: Infinity, times: [0, .3, .9, 1] }} />
    <text x="104" y="136" fontSize="28" fill="#182431">鹽酥雞好吃</text>
    <line x1="104" y1="144" x2="244" y2="144" stroke="#2f80ed" strokeWidth="3" strokeLinecap="round" />
    <Keycap x={104} y={196} width={64} label="shift" />
    <Keycap x={176} y={196} width={44} label="←" delay={.15} />
    <motion.g animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 5.5, repeat: Infinity, times: [0, .32, .62, .72] }}>
      <rect x="286" y="180" width="292" height="34" rx="8" fill="#33465c" />
      <text x="432" y="202" textAnchor="middle" fontSize="12.5" fill="#fff">正在選取字詞組…請按 ENTER 鍵加入資料庫</text>
    </motion.g>
    <motion.g animate={{ opacity: [0, 0, 0, 1, 1] }} transition={{ duration: 5.5, repeat: Infinity, times: [0, .6, .68, .78, 1] }}>
      <circle cx="330" cy="132" r="13" fill="#28c840" />
      <path d="M324 132 L328.5 137 L337 127" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="352" y="137" fontSize="14" fill="#33465c">「鹽酥雞」已加入使用者詞庫</text>
    </motion.g>
  </svg>
)

export default AddPhraseScene
