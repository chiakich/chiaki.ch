import { motion } from 'framer-motion'
import { SceneBackground } from '../ChiaKeySvgPrimitives'

const ConversionScene = () => (
  <svg viewBox="0 0 640 300" width="100%" height="100%" role="img" aria-label="內建繁體與簡體中文轉換">
    <SceneBackground title="繁簡轉換" />
    <rect x="210" y="88" width="220" height="42" rx="21" fill="#e2e7ed" />
    <motion.rect x="214" y="92" width="104" height="34" rx="17" fill="#2f80ed" animate={{ x: [0, 108, 108, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, .42, .72, 1] }} />
    <text x="266" y="115" textAnchor="middle" fontSize="14" fill="white">繁體</text>
    <text x="374" y="115" textAnchor="middle" fontSize="14" fill="#34475a">简体</text>
    <motion.text x="320" y="190" textAnchor="middle" fontSize="30" fill="#20354c" animate={{ opacity: [1, 1, 0, 0, 1] }} transition={{ duration: 5, repeat: Infinity }}>臺灣設計，開啟檔案</motion.text>
    <motion.text x="320" y="190" textAnchor="middle" fontSize="30" fill="#20354c" animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 5, repeat: Infinity }}>台湾设计，开启文件</motion.text>
    <motion.path d="M218 218 L422 218" stroke="#6daaf0" strokeWidth="3" strokeLinecap="round" animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 5, repeat: Infinity }} />
  </svg>
)

export default ConversionScene
