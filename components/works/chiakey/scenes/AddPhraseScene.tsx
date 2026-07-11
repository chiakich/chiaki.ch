import { motion } from 'framer-motion'
import { SceneBackground } from '../ChiaKeySvgPrimitives'

// 依實際行為：游標在句尾，按住 Shift、每按一次 ← 往前多選一個字，
// 按三次選到「鹽酥雞」，Enter 加入使用者詞庫；或直接按 Ctrl+3。
// 提示文字取自輸入法本體的 tooltip。
const stepTimes = [0, .12, .16, .24, .28, .36, .4, 1]

const AddPhraseScene = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="按住 Shift 按三次左方向鍵，逐字選取「鹽酥雞」後按 Enter 加入使用者詞庫">
    <SceneBackground title="加入新詞" />
    {/* 選取範圍一格一格由句尾往前長 */}
    <motion.rect y="106" height="40" rx="4" fill="#e3c8f5"
      animate={{ x: [272, 272, 244, 244, 216, 216, 188, 188], width: [0, 0, 28, 28, 56, 56, 84, 84] }}
      transition={{ duration: 6.5, repeat: Infinity, times: stepTimes }} />
    <text x="104" y="136" fontSize="28" fill="#241533">好吃的鹽酥雞</text>
    <line x1="104" y1="144" x2="272" y2="144" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
    <line x1="272" y1="104" x2="272" y2="144" stroke="#241533" strokeWidth="2" />

    {/* shift 按住不放 */}
    <motion.rect x={104} y={199} width="64" height="38" rx="8" fill="#ecd8f7" stroke="#8a2b9e"
      animate={{ y: [196, 199, 199, 199, 199, 199, 199, 196] }}
      transition={{ duration: 6.5, repeat: Infinity, times: [0, .1, .2, .3, .4, .5, .6, .66] }} />
    <text x="136" y="222" textAnchor="middle" fontSize="13" fontWeight="700" fill="#4a3560">shift</text>
    {/* ← 按三下 */}
    <motion.g animate={{ y: [0, 3, 0, 3, 0, 3, 0, 0] }} transition={{ duration: 6.5, repeat: Infinity, times: [0, .12, .2, .24, .32, .36, .44, 1] }}>
      <rect x={176} y={196} width="44" height="38" rx="8" fill="#fff" stroke="#a795c0" />
      <text x="198" y="220" textAnchor="middle" fontSize="13" fontWeight="700" fill="#4a3560">←</text>
    </motion.g>
    <motion.text x="232" y="220" fontSize="12" fill="#7c6b90" animate={{ opacity: [0, 0, 1, 1, 1] }} transition={{ duration: 6.5, repeat: Infinity, times: [0, .12, .16, .44, 1] }}>× 3</motion.text>

    <motion.g animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 6.5, repeat: Infinity, times: [0, .42, .48, .66, .72] }}>
      <rect x="286" y="180" width="292" height="34" rx="8" fill="#4a3560" />
      <text x="432" y="202" textAnchor="middle" fontSize="12.5" fill="#fff">正在選取字詞組…請按 ENTER 鍵加入資料庫</text>
    </motion.g>
    <motion.g animate={{ opacity: [0, 0, 0, 1, 1] }} transition={{ duration: 6.5, repeat: Infinity, times: [0, .66, .72, .78, 1] }}>
      <circle cx="330" cy="82" r="13" fill="#28c840" />
      <path d="M324 82 L328.5 87 L337 77" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="352" y="87" fontSize="14" fill="#4a3560">「鹽酥雞」已加入使用者詞庫</text>
    </motion.g>
    <text x="104" y="256" fontSize="12" fill="#7c6b90">趕時間的話：control + 3 直接把游標前三個字加入</text>
  </svg>
)

export default AddPhraseScene
