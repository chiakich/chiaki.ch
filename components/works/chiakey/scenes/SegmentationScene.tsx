import { motion } from 'framer-motion'
import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

// 依實際行為：底線反映目前的斷詞（查｜相干｜純），
// ← 讓游標一格一格往左跳到相干之間，按 Tab 強制斷詞，
// 整句重新組字成 茶香｜甘醇。
// 字寬 30px：查104 相134 干164 純194（結尾 224）。
const stepTimes = { jump1: .18, jump2: .32, tab: .48, swap: .56 }

const SegmentationScene = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="游標一格一格移到相干之間按 Tab，「查 相干 純」重新斷詞成「茶香 甘醇」">
    <SceneBackground title="Tab 斷詞" />
    {/* 斷詞前：查｜相干｜純 三段底線 */}
    <motion.g animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 7, repeat: Infinity, times: [0, stepTimes.swap, stepTimes.swap + .06, 1] }}>
      <text x="104" y="140" fontSize="30" fill="#241533">查相干純</text>
      <line x1="105" y1="150" x2="132" y2="150" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
      <line x1="137" y1="150" x2="192" y2="150" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
      <line x1="197" y1="150" x2="223" y2="150" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
      {/* 游標一格一格往左跳：句尾 → 干純之間 → 相干之間 */}
      <motion.line y1="112" y2="150" stroke="#241533" strokeWidth="2.5"
        animate={{ x1: [226, 226, 194, 194, 164, 164], x2: [226, 226, 194, 194, 164, 164] }}
        transition={{ duration: 7, repeat: Infinity, times: [0, stepTimes.jump1 - .02, stepTimes.jump1, stepTimes.jump2 - .02, stepTimes.jump2, 1] }} />
    </motion.g>
    {/* 斷詞後：茶香｜甘醇 兩段底線 */}
    <motion.g animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 7, repeat: Infinity, times: [0, stepTimes.swap, stepTimes.swap + .08, 1] }}>
      <text x="104" y="140" fontSize="30" fill="#241533">茶香甘醇</text>
      <line x1="105" y1="150" x2="162" y2="150" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
      <line x1="167" y1="150" x2="223" y2="150" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
    {/* 按鍵：← ← 然後 tab */}
    <motion.g animate={{ opacity: [1, 1, 0, 0], y: [0, 0, 0, 0] }} transition={{ duration: 7, repeat: Infinity, times: [0, stepTimes.tab - .06, stepTimes.tab - .02, 1] }}>
      <motion.g animate={{ y: [0, 3, 0, 3, 0, 0] }} transition={{ duration: 7, repeat: Infinity, times: [stepTimes.jump1 - .04, stepTimes.jump1 - .02, stepTimes.jump2 - .06, stepTimes.jump2 - .02, stepTimes.jump2, 1] }}>
        <rect x={104} y={196} width="44" height="38" rx="8" fill="#fff" stroke="#a795c0" />
        <text x="126" y="220" textAnchor="middle" fontSize="13" fontWeight="700" fill="#4a3560">←</text>
      </motion.g>
      <text x="158" y="220" fontSize="12" fill="#7c6b90">× 2</text>
    </motion.g>
    <motion.g animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 7, repeat: Infinity, times: [0, stepTimes.tab - .06, stepTimes.tab, stepTimes.swap + .04, stepTimes.swap + .1] }}>
      <Keycap x={104} y={196} width={56} label="tab ⇥" />
    </motion.g>
    <motion.text x="240" y="220" fontSize="13" fill="#7c6b90" animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 7, repeat: Infinity, times: [0, stepTimes.swap + .06, stepTimes.swap + .14, 1] }}>在游標處強制斷詞，整句重新組字</motion.text>
  </svg>
)

export default SegmentationScene
