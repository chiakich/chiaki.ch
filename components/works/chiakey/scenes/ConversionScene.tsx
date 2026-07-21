import { motion } from 'framer-motion'
import { Keycap, SceneBackground } from '../ChiaKeySvgPrimitives'
import { useI18n } from 'i18n'

// 依實際行為：⌃⌘G 開啟「繁體中文轉簡體」輸出濾鏡（單向繁→簡）。
// 時序：按下快捷鍵 → 選單勾選啟用 → 鍵盤退場 → 示範打字，
// 組字時畫面上還是繁體，送出的那一刻轉成簡體。
const ConversionScene = () => {
  const { t } = useI18n()
  return (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label={t('chiakeyPage.scenes.conversion.ariaLabel')}>
    <SceneBackground title={t('chiakeyPage.scenes.conversion.title')} />

    {/* 1. 按快捷鍵，然後鍵盤退場 */}
    <motion.g animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 8, repeat: Infinity, times: [0, .18, .26, 1] }}>
      <Keycap x={80} y={90} width={72} label="control" />
      <Keycap x={160} y={90} width={54} label="⌘" delay={.12} />
      <Keycap x={222} y={90} width={44} label="G" delay={.24} />
    </motion.g>

    {/* 2. 勾選啟用 */}
    <motion.g animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 8, repeat: Infinity, times: [0, .1, .16, 1] }}>
      <rect x="330" y="92" width="248" height="34" rx="8" fill="#fdfdfd" stroke="#a795c0" />
      <text x="372" y="115" fontSize="13.5" fill="#4a3560">{t('chiakeyPage.scenes.conversion.title')}</text>
      <motion.text x="352" y="115" fontSize="14" fontWeight="bold" fill="#28a04a" animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 8, repeat: Infinity, times: [0, .16, .2, 1] }}>✓</motion.text>
    </motion.g>

    {/* 3. 示範打字：組字中還是繁體 */}
    <motion.g animate={{ opacity: [0, 0, 1, 1, 0, 0] }} transition={{ duration: 8, repeat: Infinity, times: [0, .3, .38, .62, .68, 1] }}>
      <text x="104" y="182" fontSize="26" fill="#241533">臺灣的檔案</text>
      <line x1="104" y1="190" x2="244" y2="190" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
      <text x="262" y="182" fontSize="13" fill="#7c6b90">← {t('chiakeyPage.scenes.conversion.composing')}</text>
    </motion.g>
    <motion.g animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 8, repeat: Infinity, times: [0, .5, .56, .64, .7] }}>
      <Keycap x={430} y={160} width={64} label="enter" active={false} />
    </motion.g>
    {/* 4. 送出的瞬間轉成簡體（底線消失） */}
    <motion.g animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 8, repeat: Infinity, times: [0, .66, .74, 1] }}>
      <text x="104" y="182" fontSize="26" fill="#241533" fontFamily='sans-serif'>台湾的档案</text>
      <text x="262" y="182" fontSize="13" fill="#28a04a">✓ {t('chiakeyPage.scenes.conversion.committed')}</text>
    </motion.g>
    <text x="104" y="242" fontSize="12" fill="#7c6b90">{t('chiakeyPage.scenes.conversion.note')}</text>
  </svg>
  )
}

export default ConversionScene
