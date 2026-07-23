import { motion } from 'framer-motion'
import { useI18n } from 'i18n'

// Step labels live in kumikoPage.workflowSteps (by index) in the locale files.
const steps = [
  ['01', 'GITHUB'],
  ['02', 'EDIT'],
  ['03', 'COMMIT'],
  ['04', 'PULL REQUEST'],
]

const KumikoWorkflow = () => {
  const { t } = useI18n()
  return (
    <svg viewBox="0 0 760 180" width="100%" role="img" aria-label={t('kumikoPage.workflowAria')}>
      <rect width="760" height="180" rx="16" fill="#17181b" />
      <motion.path d="M105 90 H655" stroke="#ffea2f" strokeWidth="2" strokeDasharray="6 8" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} />
      {steps.map(([number, en], index) => {
        const x = 96 + index * 188
        return (
          <motion.g key={number} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .16 }}>
            <circle cx={x} cy="90" r="28" fill="#24262a" stroke="#ffea2f" strokeWidth="2" />
            <text x={x} y="96" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ffea2f">{number}</text>
            <text x={x} y="42" textAnchor="middle" fontSize="10" letterSpacing="2" fill="#8e9096">{en}</text>
            <text x={x} y="145" textAnchor="middle" fontSize="14" fill="white">{t(`kumikoPage.workflowSteps.${index}`)}</text>
          </motion.g>
        )
      })}
    </svg>
  )
}

export default KumikoWorkflow
