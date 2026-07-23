import { motion } from 'framer-motion'
import { SceneBackground } from '../ChiaKeySvgPrimitives'
import { useI18n } from 'i18n'

// 依實際行為：游標在句尾，按住 Shift、每按一次 ← 往前多選一個字，
// 按三次選到「鹽酥雞」，Enter 加入使用者詞庫；或直接按 Ctrl+3。
// 提示文字取自輸入法本體的 tooltip。
const stepTimes = [0, .12, .16, .24, .28, .36, .4, 1]

const AddPhraseScene = () => {
  const { t } = useI18n()
  return (
  <svg
    viewBox="0 0 640 300"
    width="100%"
    role="img"
    aria-label={t('chiakeyPage.scenes.addPhrase.ariaLabel')}
  >
    <SceneBackground title={t('chiakeyPage.scenes.addPhrase.title')} />
    {/* 選取範圍一格一格由句尾往前長 */}
    <motion.rect
      y="106"
      height="40"
      rx="4"
      fill="#e3c8f5"
      animate={{
        x: [272, 272, 244, 244, 216, 216, 188, 188],
        width: [0, 0, 28, 28, 56, 56, 84, 84],
      }}
      transition={{ duration: 6.5, repeat: Infinity, times: stepTimes }}
    />
    <text x="104" y="136" fontSize="28" fill="#241533">
      好吃的鹽酥雞
    </text>
    <line
      x1="104"
      y1="144"
      x2="272"
      y2="144"
      stroke="#8a2b9e"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line x1="272" y1="104" x2="272" y2="144" stroke="#241533" strokeWidth="2" />

    {/* shift 按住不放 */}
    <motion.g
      animate={{ y: [0, 3, 3, 3, 3, 3, 3, 0] }}
      transition={{
        duration: 6.5,
        repeat: Infinity,
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.66],
      }}
    >
      <rect
        x={104}
        y={196}
        width="64"
        height="38"
        rx="8"
        fill="#ecd8f7"
        stroke="#8a2b9e"
      />
      <text
        x="136"
        y="220"
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill="#4a3560"
      >
        shift
      </text>
    </motion.g>
    {/* ← 按三下 */}
    <motion.g
      animate={{ y: [0, 3, 0, 3, 0, 3, 0, 0] }}
      transition={{
        duration: 6.5,
        repeat: Infinity,
        times: [0, 0.12, 0.2, 0.24, 0.32, 0.36, 0.44, 1],
      }}
    >
      <rect
        x={176}
        y={196}
        width="44"
        height="38"
        rx="8"
        fill="#fff"
        stroke="#a795c0"
      />
      <text
        x="198"
        y="220"
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill="#4a3560"
      >
        ←
      </text>
    </motion.g>
    <motion.text
      x="232"
      y="220"
      fontSize="12"
      fill="#7c6b90"
      animate={{ opacity: [0, 0, 1, 1, 1] }}
      transition={{
        duration: 6.5,
        repeat: Infinity,
        times: [0, 0.12, 0.16, 0.44, 1],
      }}
    >
      × 3
    </motion.text>

    <motion.g
      animate={{ opacity: [0, 0, 1, 1, 0] }}
      transition={{
        duration: 6.5,
        repeat: Infinity,
        times: [0, 0.42, 0.48, 0.66, 0.72],
      }}
    >
      <rect x="286" y="180" width="292" height="34" rx="8" fill="#4a3560" />
      <text x="432" y="202" textAnchor="middle" fontSize="12.5" fill="#fff">
        {t('chiakeyPage.scenes.addPhrase.selecting')}
      </text>
    </motion.g>
    <motion.g
      animate={{ opacity: [0, 0, 0, 1, 1] }}
      transition={{
        duration: 6.5,
        repeat: Infinity,
        times: [0, 0.66, 0.72, 0.78, 1],
      }}
    >
      <circle cx="330" cy="82" r="13" fill="#28c840" />
      <path
        d="M324 82 L328.5 87 L337 77"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="352" y="87" fontSize="14" fill="#4a3560">
        {t('chiakeyPage.scenes.addPhrase.added')}
      </text>
    </motion.g>
    <text x="104" y="256" fontSize="12" fill="#7c6b90">
      {t('chiakeyPage.scenes.addPhrase.shortcut')}
    </text>
  </svg>
  )
}

export default AddPhraseScene
