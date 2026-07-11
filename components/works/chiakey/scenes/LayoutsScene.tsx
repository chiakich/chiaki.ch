import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SceneBackground } from '../ChiaKeySvgPrimitives'

const layouts = ['標準', '倚天', '倚天26', '許氏', '漢語拼音']

// 依實際行為：許氏與倚天26 佔用數字列，選字鍵自動改為 asdfzxcv。
const selectionKeysFor = (layout: string) =>
  layout === '許氏' || layout === '倚天26' ? 'asdfzxcv'.split('') : '12345678'.split('')

const LayoutsScene = () => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % layouts.length), 1800)
    return () => window.clearInterval(timer)
  }, [])

  const selectionKeys = selectionKeysFor(layouts[active])

  return (
    <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="支援標準、倚天、倚天26、許氏與漢語拼音鍵盤配置">
      <SceneBackground title="鍵盤配置" />
      {layouts.map((layout, index) => {
        const width = layout.length * 15 + 28
        const x = 74 + layouts.slice(0, index).reduce((sum, item) => sum + item.length * 15 + 40, 0)
        const isActive = index === active
        return (
          <g key={layout}>
            <motion.rect x={x} y={96} width={width} height="34" rx="17" animate={{ fill: isActive ? '#2f80ed' : '#ffffff', stroke: isActive ? '#2f80ed' : '#9aabbe' }} transition={{ duration: .3 }} />
            <motion.text x={x + width / 2} y={118} textAnchor="middle" fontSize="14" fontWeight="700" animate={{ fill: isActive ? '#ffffff' : '#33465c' }} transition={{ duration: .3 }}>{layout}</motion.text>
          </g>
        )
      })}
      <text x="104" y="180" fontSize="13" fill="#69798c">選字鍵</text>
      {selectionKeys.map((key, index) => (
        <g key={`${active}-${key}`}>
          <motion.rect x={168 + index * 46} y={158} width="38" height="34" rx="7" fill="#fff" stroke="#9aabbe" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} />
          <motion.text x={187 + index * 46} y={180} textAnchor="middle" fontSize="14" fontWeight="700" fill="#33465c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * .04 }}>{key}</motion.text>
        </g>
      ))}
      <text x="104" y="234" fontSize="12" fill="#69798c">許氏與倚天26 佔用數字列，選字鍵自動改為 a s d f z x c v</text>
    </svg>
  )
}

export default LayoutsScene
