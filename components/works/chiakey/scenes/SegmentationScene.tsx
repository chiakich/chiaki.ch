import { motion } from 'framer-motion'
import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'

// 依實際行為：組字中把游標移到想斷開的位置按 Tab，在游標處強制斷詞，
// 整句重新組字：「查相干純」→「茶香甘醇」。
const SegmentationScene = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="游標移到相干之間按 Tab，「查相干純」重新斷詞成「茶香甘醇」">
    <SceneBackground title="Tab 斷詞" />
    {/* 斷詞前 */}
    <motion.g animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .52, .6, 1] }}>
      <text x="104" y="140" fontSize="30" fill="#241533">查相干純</text>
      {/* 游標從句尾移到「相｜干」之間 */}
      <motion.line y1="112" y2="150" stroke="#241533" strokeWidth="2.5"
        animate={{ x1: [226, 226, 166, 166], x2: [226, 226, 166, 166] }}
        transition={{ duration: 6, repeat: Infinity, times: [0, .15, .3, 1] }} />
    </motion.g>
    <line x1="104" y1="150" x2="226" y2="150" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
    {/* 斷詞後 */}
    <motion.g animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 6, repeat: Infinity, times: [0, .55, .63, 1] }}>
      <text x="104" y="140" fontSize="30" fill="#241533">茶香甘醇</text>
    </motion.g>
    <motion.g animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .32, .4, .56, .64] }}>
      <Keycap x={104} y={196} width={56} label="tab ⇥" />
    </motion.g>
    <motion.text x="240" y="220" fontSize="13" fill="#7c6b90" animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 6, repeat: Infinity, times: [0, .6, .68, 1] }}>在游標處強制斷詞，整句重新組字</motion.text>
  </svg>
)

export default SegmentationScene
