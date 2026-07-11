import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SceneBackground } from '../ChiaKeySvgPrimitives'

// 實際註冊的輸入模組：好打注音（預設）、傳統注音，以及倉頡與簡易（CIN 表格模組）。
const engines = [
  ['好打注音', '智慧組字，本頁示範的就是它'],
  ['傳統注音', '一字一音的傳統打法'],
  ['倉頡', 'CIN 表格模組'],
  ['簡易', 'CIN 表格模組'],
]

const EnginesScene = () => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % engines.length), 1700)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="輸入法選單列出好打注音、傳統注音、倉頡與簡易">
      <SceneBackground title="輸入模組" />
      <rect x="150" y="76" width="250" height="182" rx="12" fill="#fdfdfd" stroke="#a795c0" filter="url(#shadow)" />
      {engines.map(([name], index) => {
        const rowY = 90 + index * 42
        const isActive = index === active
        return (
          <g key={name}>
            <motion.rect x={158} y={rowY} width="234" height="36" rx="8" animate={{ fill: isActive ? '#8a2b9e' : '#fdfdfd' }} transition={{ duration: .3 }} />
            <motion.text x={186} y={rowY + 24} fontSize="16" fontWeight="700" animate={{ fill: isActive ? '#ffffff' : '#4a3560' }} transition={{ duration: .3 }}>{name}</motion.text>
            <motion.text x={168} y={rowY + 24} fontSize="14" fontWeight="800" animate={{ opacity: isActive ? 1 : 0, fill: '#ffffff' }} transition={{ duration: .3 }}>✓</motion.text>
          </g>
        )
      })}
      <motion.g key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
        <text x="430" y="158" fontSize="15" fontWeight="700" fill="#4a3560">{engines[active][0]}</text>
        <text x="430" y="182" fontSize="12" fill="#7c6b90">{engines[active][1]}</text>
      </motion.g>
    </svg>
  )
}

export default EnginesScene
