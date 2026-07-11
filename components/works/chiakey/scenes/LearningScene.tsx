import { motion } from 'framer-motion'
import { SceneBackground } from '../ChiaKeySvgPrimitives'

const times = [0, .34, .5, .84, 1]
const transition = { duration: 4.6, repeat: Infinity, times }
const row1 = 140
const row2 = 182

const LearningScene = () => (
  <svg viewBox="0 0 640 300" width="100%" height="100%" role="img" aria-label="常選的候選詞逐漸往前移到第一位">
    <SceneBackground title="智慧學習使用者偏好" />
    <text x="320" y="106" textAnchor="middle" fontSize="13" fill="#69798c">輸入「ㄗㄞˋ」，常選的字自動往前</text>

    <rect x="236" y="120" width="168" height="130" rx="14" fill="#111" stroke="#fff" strokeWidth="3" />
    {/* 第一列高亮 */}
    <rect x="238" y={row1 - 20} width="164" height="32" fill="#8a008a" />
    {/* 固定的候選編號 */}
    {[row1, row2, 224].map((y, index) => (
      <text key={y} x="262" y={y} textAnchor="middle" fontSize="15" fontWeight="700" fill="white">{index + 1}</text>
    ))}

    {/* 「再」從第二列升到第一列 */}
    <motion.text x="300" fontSize="21" fontWeight="700" fill="white" animate={{ y: [row2, row2, row1, row1, row2] }} transition={transition}>再</motion.text>
    {/* 「在」被擠到第二列 */}
    <motion.text x="300" fontSize="21" fontWeight="700" fill="white" animate={{ y: [row1, row1, row2, row2, row1] }} transition={transition}>在</motion.text>
    <text x="300" y="224" fontSize="21" fontWeight="700" fill="white">載</text>

    <motion.g animate={{ opacity: [0, 0, 1, 1, 0] }} transition={transition}>
      <rect x="440" y="150" width="128" height="44" rx="10" fill="#e9f3ff" stroke="#76adf1" />
      <text x="504" y="177" textAnchor="middle" fontSize="14" fill="#23466e">偏好 +1</text>
    </motion.g>
  </svg>
)

export default LearningScene
