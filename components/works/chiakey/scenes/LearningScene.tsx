import { motion } from 'framer-motion'
import { SceneBackground, SvgCandidateMenu } from '../ChiaKeySvgPrimitives'
import { useI18n } from 'i18n'

// 依實際行為：選字會寫入使用者候選快取，下次相同讀音時排序提前。
const LearningScene = () => {
  const { t } = useI18n()
  return (
  <svg viewBox="0 0 640 300" width="100%" role="img" aria-label={t('chiakeyPage.scenes.learning.ariaLabel')}>
    <SceneBackground title={t('chiakeyPage.scenes.learning.title')} />
    <text x="160" y="92" textAnchor="middle" fontSize="13" fill="#7c6b90">{t('chiakeyPage.scenes.learning.first')}</text>
    <SvgCandidateMenu items={['在', '再', '載', '栽']} x={62} y={104} page="1/9" highlightIndex={1} animated={false} />
    <motion.g animate={{ opacity: [0, 0, 1, 1], x: [-8, -8, 0, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .4, .55, 1] }}>
      <path d="M282 190 H340" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />
      <path d="M332 182 L344 190 L332 198" fill="none" stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
    <text x="478" y="92" textAnchor="middle" fontSize="13" fill="#7c6b90">{t('chiakeyPage.scenes.learning.next')}</text>
    <motion.g animate={{ opacity: [0, 0, 1, 1], y: [8, 8, 0, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, .45, .6, 1] }}>
      <SvgCandidateMenu items={['再', '在', '載', '栽']} x={380} y={104} page="1/9" highlightIndex={0} animated={false} />
    </motion.g>
  </svg>
  )
}

export default LearningScene
