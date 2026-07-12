import { motion } from 'framer-motion'

export const SceneBackground = ({ title }: { title: string }) => (
  <>
    <rect width="640" height="300" rx="18" fill="url(#sceneBg)" />
    <defs>
      <linearGradient id="sceneBg" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#f4effb" />
        <stop offset="1" stopColor="#d7cce8" />
      </linearGradient>
      <linearGradient id="candidateHighlight" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#a12cae" />
        <stop offset="1" stopColor="#5f1069" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#3b2455" floodOpacity=".2" />
      </filter>
    </defs>
    <rect x="42" y="34" width="556" height="232" rx="14" fill="rgba(255,255,255,.9)" filter="url(#shadow)" />
    <circle cx="66" cy="56" r="5" fill="#ff5f57" />
    <circle cx="84" cy="56" r="5" fill="#febc2e" />
    <circle cx="102" cy="56" r="5" fill="#28c840" />
    <text x="320" y="61" textAnchor="middle" fontSize="12" fill="#7c6b90">{title}</text>
  </>
)

interface KeycapProps {
  x: number
  y: number
  width?: number
  label: string
  active?: boolean
  delay?: number
}

export const Keycap = ({ x, y, width = 58, label, active = true, delay = 0 }: KeycapProps) => (
  <motion.g animate={active ? { y: [0, 3, 0] } : undefined} transition={{ duration: .55, repeat: Infinity, repeatDelay: 2.8, delay }}>
    <motion.rect x={x} y={y} width={width} height="38" rx="8" fill="#fff" stroke="#a795c0" animate={active ? { fill: ['#fff', '#ecd8f7', '#fff'], stroke: ['#a795c0', '#8a2b9e', '#a795c0'] } : undefined} transition={{ duration: .55, repeat: Infinity, repeatDelay: 2.8, delay }} />
    <text x={x + width / 2} y={y + 24} textAnchor="middle" fontSize="13" fontWeight="700" fill="#4a3560">{label}</text>
  </motion.g>
)

export const InputLine = ({ text, x = 104, y = 132, width = 220, animated = true }: { text: string; x?: number; y?: number; width?: number; animated?: boolean }) => (
  <>
    <text x={x} y={y} fontSize="28" fill="#241533">{text}</text>
    {animated
      ? <motion.line x1={x} y1={y + 8} x2={x + width} y2={y + 8} stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }} transition={{ duration: 4.8, repeat: Infinity, times: [0, .32, .86, 1] }} />
      : <line x1={x} y1={y + 8} x2={x + width} y2={y + 8} stroke="#8a2b9e" strokeWidth="3" strokeLinecap="round" />}
  </>
)

// SVG 版候選窗，樣式與 VerticalCandidateMenu 一致（黑底圓角、白圈黑數字、紫色漸層選取列）。
export const SvgCandidateMenu = ({ items, x = 356, y = 78, page = '1/21', highlightIndex = 0, animated = true }: { items: string[]; x?: number; y?: number; page?: string; highlightIndex?: number; animated?: boolean }) => {
  const rowHeight = 30
  const height = 48 + items.length * rowHeight
  const motionProps = animated
    ? { animate: { opacity: [0, 1, 1, 0], y: [8, 0, 0, 5] }, transition: { duration: 4.8, repeat: Infinity, times: [0, .2, .86, 1] } }
    : {}
  return (
    <motion.g {...motionProps}>
      <rect x={x} y={y} width="196" height={height} rx="22" fill="#050505" stroke="#f2f2f2" strokeWidth="3" />
      <text x={x + 98} y={y + 18} textAnchor="middle" fontSize="11" fill="white">▲</text>
      {items.map((item, index) => {
        const rowY = y + 24 + index * rowHeight
        return <g key={`${item}-${index}`}>
          {index === highlightIndex && <rect x={x + 3} y={rowY} width="190" height={rowHeight} fill="url(#candidateHighlight)" />}
          <circle cx={x + 26} cy={rowY + 15} r="11" fill="#050505" stroke="#f5f5f5" strokeWidth="1.5" />
          <text x={x + 26} y={rowY + 20} textAnchor="middle" fontSize="14" fontWeight="800" fill="#f5f5f5">{index + 1}</text>
          <text x={x + 48} y={rowY + 22} fontSize="19" fontWeight="700" fill="white">{item}</text>
        </g>
      })}
      <text x={x + 22} y={y + height - 10} fontSize="11" fill="white">▼</text>
      <text x={x + 176} y={y + height - 10} textAnchor="end" fontSize="11" fontWeight="700" fill="white">{page}</text>
    </motion.g>
  )
}
