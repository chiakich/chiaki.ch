import { motion } from 'framer-motion'

const steps = [
  ['01', 'GITHUB', '載入 UFO'],
  ['02', 'EDIT', '編輯字形'],
  ['03', 'COMMIT', '推送變更'],
  ['04', 'PULL REQUEST', '送出補字'],
]

const KumikoWorkflow = () => (
  <svg viewBox="0 0 760 180" width="100%" role="img" aria-label="從 GitHub 載入字體、編輯、提交並建立 Pull Request">
    <rect width="760" height="180" rx="16" fill="#17181b" />
    <motion.path d="M105 90 H655" stroke="#ffea2f" strokeWidth="2" strokeDasharray="6 8" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} />
    {steps.map(([number, en, label], index) => {
      const x = 96 + index * 188
      return (
        <motion.g key={number} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .16 }}>
          <circle cx={x} cy="90" r="28" fill="#24262a" stroke="#ffea2f" strokeWidth="2" />
          <text x={x} y="96" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ffea2f">{number}</text>
          <text x={x} y="42" textAnchor="middle" fontSize="10" letterSpacing="2" fill="#8e9096">{en}</text>
          <text x={x} y="145" textAnchor="middle" fontSize="14" fill="white">{label}</text>
        </motion.g>
      )
    })}
  </svg>
)

export default KumikoWorkflow
