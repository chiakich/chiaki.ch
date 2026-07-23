import { motion } from 'framer-motion'
import { useI18n } from 'i18n'

// IDS（表意文字描述字元）拆字示意：⿰糹扁 → 編。
// 拆解式與部件都是真實的 IDS 資料。
const KumikoIdsDemo = () => {
  const { t } = useI18n()
  return (
  <svg viewBox="0 0 640 320" width="100%" role="img" aria-label={t('kumikoPage.idsDemo.ariaLabel')}>
    <rect width="640" height="320" rx="16" fill="#17181b" />
    <text x="72" y="84" fontSize="15" fill="#8e9096">{t('kumikoPage.idsDemo.missing')}</text>
    <text x="72" y="132" fontSize="34" fill="#4a4c52" fontFamily="monospace">U+7DE8</text>
    <text x="72" y="196" fontSize="15" fill="#8e9096">{t('kumikoPage.idsDemo.decomposition')}</text>
    <text x="72" y="244" fontSize="34" fill="#ffea2f" fontFamily="monospace">⿰ 糹 扁</text>

    <rect x="356" y="36" width="248" height="248" rx="8" fill="none" stroke="#34363b" />
    <line x1="480" y1="36" x2="480" y2="284" stroke="#34363b" strokeDasharray="4 6" />
    <line x1="356" y1="160" x2="604" y2="160" stroke="#34363b" strokeDasharray="4 6" />

    {/* 部件飛入 */}
    <motion.text y="212" fontSize="150" fill="#e8e8ec" textAnchor="middle" animate={{ x: [200, 424, 424, 424], opacity: [0, 1, 1, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .25, .55, .62] }}>糹</motion.text>
    <motion.text y="212" fontSize="150" fill="#e8e8ec" textAnchor="middle" animate={{ x: [700, 536, 536, 536], opacity: [0, 1, 1, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .25, .55, .62] }}>扁</motion.text>

    {/* 組合結果 */}
    <motion.text x="480" y="228" fontSize="200" fill="#ffea2f" textAnchor="middle" animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.96, 0.96, 1, 1, 1] }} style={{ transformOrigin: '480px 160px' }} transition={{ duration: 6, repeat: Infinity, times: [0, .58, .68, .92, 1] }}>編</motion.text>

    <motion.text x="480" y="308" fontSize="13" fill="#8e9096" textAnchor="middle" animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .58, .68, .92, 1] }}>{t('kumikoPage.idsDemo.caption')}</motion.text>
  </svg>
  )
}

export default KumikoIdsDemo
