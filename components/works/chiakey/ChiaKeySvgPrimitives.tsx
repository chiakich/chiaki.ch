import { motion } from 'framer-motion'

export const SceneBackground = ({ title }: { title: string }) => (
  <>
    <rect width="640" height="300" rx="18" fill="url(#sceneBg)" />
    <defs>
      <linearGradient id="sceneBg" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#eef4fb" />
        <stop offset="1" stopColor="#cbd8e9" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#243a55" floodOpacity=".2" />
      </filter>
    </defs>
    <rect x="42" y="34" width="556" height="232" rx="14" fill="rgba(255,255,255,.9)" filter="url(#shadow)" />
    <circle cx="66" cy="56" r="5" fill="#ff5f57" />
    <circle cx="84" cy="56" r="5" fill="#febc2e" />
    <circle cx="102" cy="56" r="5" fill="#28c840" />
    <text x="320" y="61" textAnchor="middle" fontSize="12" fill="#69798c">{title}</text>
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
    <motion.rect x={x} y={y} width={width} height="38" rx="8" fill="#fff" stroke="#9aabbe" animate={active ? { fill: ['#fff', '#d7e9ff', '#fff'], stroke: ['#9aabbe', '#2f80ed', '#9aabbe'] } : undefined} transition={{ duration: .55, repeat: Infinity, repeatDelay: 2.8, delay }} />
    <text x={x + width / 2} y={y + 24} textAnchor="middle" fontSize="13" fontWeight="700" fill="#33465c">{label}</text>
  </motion.g>
)

export const InputLine = ({ text, x = 104, y = 132, width = 220, animated = true }: { text: string; x?: number; y?: number; width?: number; animated?: boolean }) => (
  <>
    <text x={x} y={y} fontSize="28" fill="#182431">{text}</text>
    {animated
      ? <motion.line x1={x} y1={y + 8} x2={x + width} y2={y + 8} stroke="#2f80ed" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }} transition={{ duration: 4.8, repeat: Infinity, times: [0, .32, .86, 1] }} />
      : <line x1={x} y1={y + 8} x2={x + width} y2={y + 8} stroke="#2f80ed" strokeWidth="3" strokeLinecap="round" />}
  </>
)

export const SvgCandidateMenu = ({ items, x = 356, y = 78, page = '1/8', animated = true }: { items: string[]; x?: number; y?: number; page?: string; animated?: boolean }) => {
  const rowHeight = 28
  const height = 46 + items.length * rowHeight
  const motionProps = animated
    ? { animate: { opacity: [0, 1, 1, 0], y: [8, 0, 0, 5] }, transition: { duration: 4.8, repeat: Infinity, times: [0, .2, .86, 1] } }
    : {}
  return (
    <motion.g {...motionProps}>
      <rect x={x} y={y} width="194" height={height} rx="16" fill="#000" stroke="#fff" strokeWidth="3" />
      <text x={x + 20} y={y + 19} fontSize="12" fill="white">▲</text>
      {items.map((item, index) => {
        const rowY = y + 26 + index * rowHeight
        return <g key={`${item}-${index}`}>
          {index === 0 && <rect x={x + 2} y={rowY} width="190" height={rowHeight} fill="#8a008a" />}
          {index === 0 && <circle cx={x + 26} cy={rowY + 14} r="12" fill="#230026" />}
          <text x={x + 26} y={rowY + 20} textAnchor="middle" fontSize="16" fontWeight="700" fill="white">{index + 1}</text>
          <text x={x + 51} y={rowY + 20} fontSize="18" fontWeight="700" fill="white">{item}</text>
        </g>
      })}
      <text x={x + 20} y={y + height - 9} fontSize="12" fill="white">▼</text>
      <text x={x + 165} y={y + height - 8} textAnchor="end" fontSize="12" fontWeight="700" fill="white">{page}</text>
    </motion.g>
  )
}
