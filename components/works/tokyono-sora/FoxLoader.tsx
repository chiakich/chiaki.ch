import { motion } from 'framer-motion'

const FoxLoader = () => (
  <svg viewBox="0 0 220 220" width="100%" role="img" aria-label="旋轉狐狸載入動畫示意">
    <circle cx="110" cy="110" r="92" fill="#10222d" stroke="#6ed8e5" strokeOpacity=".3" />
    <motion.g style={{ transformOrigin: '110px 110px' }} animate={{ rotate: 360 }} transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }}>
      <path d="M110 35 C160 34 190 76 182 122 C177 157 148 183 110 184 C74 184 42 157 37 122 C31 79 60 43 93 38 L76 73 L112 58 L147 74 L132 39 Z" fill="none" stroke="#f58a48" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M174 138 C205 147 198 182 168 181 C149 180 142 167 147 155" fill="none" stroke="#f58a48" strokeWidth="13" strokeLinecap="round" />
    </motion.g>
    <circle cx="87" cy="108" r="5" fill="#dffaff" /><circle cx="133" cy="108" r="5" fill="#dffaff" />
    <path d="M98 132 Q110 142 122 132" fill="none" stroke="#dffaff" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

export default FoxLoader
