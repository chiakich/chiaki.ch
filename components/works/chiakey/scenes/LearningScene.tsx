import { motion } from 'framer-motion'
import { SceneBackground, SvgCandidateMenu } from '../ChiaKeySvgPrimitives'

// 依實際行為：選字會寫入使用者候選快取，下次相同讀音時排序提前。
const LearningScene = () => (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="選過「再」之後，下次輸入時「再」排到候選第一位">
    <SceneBackground title="選字學習" />
    <text x="160" y="92" textAnchor="middle" fontSize="13" fill="#69798c">第一次：選第 2 個「再」</text>
    <motion.g animate={{ opacity: [1, 1, 1, .35] }} transition={{ duration: 6, repeat: Infinity, times: [0, .45, .6, 1] }}>
      <SvgCandidateMenu items={['在', '再', '載', '栽']} x={62} y={104} page="1/9" highlightIndex={1} animated={false} />
    </motion.g>
    <motion.g animate={{ opacity: [0, 0, 1, 1], x: [-8, -8, 0, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .4, .55, 1] }}>
      <path d="M282 190 H340" stroke="#2f80ed" strokeWidth="3" strokeLinecap="round" />
      <path d="M332 182 L344 190 L332 198" fill="none" stroke="#2f80ed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
    <text x="478" y="92" textAnchor="middle" fontSize="13" fill="#69798c">下一次：「再」已在第 1 位</text>
    <motion.g animate={{ opacity: [0, 0, 1, 1], y: [8, 8, 0, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .45, .6, 1] }}>
      <SvgCandidateMenu items={['再', '在', '載', '栽']} x={380} y={104} page="1/9" highlightIndex={0} animated={false} />
    </motion.g>
  </svg>
)

export default LearningScene
