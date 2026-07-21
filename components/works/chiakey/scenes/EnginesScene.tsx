import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SceneBackground } from '../ChiaKeySvgPrimitives'
import { useI18n } from 'i18n'

// 實際註冊的輸入模組：好打注音（預設）、傳統注音，以及倉頡與簡易（CIN 表格模組）。
// 右側示範各模組的實際打法。
const engines: { name: string; keys: string[]; output: string; note: string }[] = [
  { name: '好打注音', keys: ['ㄒㄧㄢˋ', 'ㄗㄞˋ'], output: '現在', note: '整句一起判斷，幾乎不用選字' },
  { name: '傳統注音', keys: ['ㄇㄧㄥˊ'], output: '明', note: '一字一音，逐字選字（ㄅ半）' },
  { name: '倉頡', keys: ['日', '月'], output: '明', note: '拆字根輸入' },
  { name: '簡易', keys: ['木', '木'], output: '林、森…', note: '只取頭尾碼，再從候選挑字' },
]

const EnginesScene = () => {
  const { t } = useI18n()
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % engines.length), 2200)
    return () => window.clearInterval(timer)
  }, [])

  const engine = engines[active]

  return (
    <svg viewBox="0 0 640 300" width="100%" role="img" aria-label={t('chiakeyPage.scenes.engines.ariaLabel')}>
      <SceneBackground title={t('chiakeyPage.scenes.engines.title')} />
      <rect x="72" y="76" width="216" height="182" rx="12" fill="#fdfdfd" stroke="#a795c0" filter="url(#shadow)" />
      {engines.map(({ name }, index) => {
        const rowY = 90 + index * 42
        const isActive = index === active
        return (
          <g key={name}>
            <motion.rect x={80} y={rowY} width="200" height="36" rx="8" animate={{ fill: isActive ? '#8a2b9e' : '#fdfdfd' }} transition={{ duration: .3 }} />
            <motion.text x={110} y={rowY + 24} fontSize="16" fontWeight="bold" animate={{ fill: isActive ? '#ffffff' : '#4a3560' }} transition={{ duration: .3 }}>{name}</motion.text>
            <motion.text x={90} y={rowY + 24} fontSize="14" fontWeight="bold" fill="#ffffff" animate={{ opacity: isActive ? 1 : 0 }} transition={{ duration: .3 }}>✓</motion.text>
          </g>
        )
      })}
      <motion.g key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
        {engine.keys.map((key, index) => {
          const width = key.length * 15 + 22
          const x = 330 + engine.keys.slice(0, index).reduce((sum, item) => sum + item.length * 15 + 32, 0)
          return (
            <g key={`${key}-${index}`}>
              <rect x={x} y={128} width={width} height="38" rx="8" fill="#fff" stroke="#a795c0" />
              <text x={x + width / 2} y={152} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#4a3560">{key}</text>
            </g>
          )
        })}
        <text x="330" y="120" fontSize="12" fill="#7c6b90">{t('chiakeyPage.scenes.engines.input')}</text>
        <path d="M330 196 H366" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
        <path d="M358 188 L370 196 L358 204" fill="none" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="384" y="206" fontSize="28" fontWeight="bold" fill="#241533">{engine.output}</text>
        <text x="330" y="242" fontSize="12" fill="#7c6b90">{engine.note}</text>
      </motion.g>
    </svg>
  )
}

export default EnginesScene
