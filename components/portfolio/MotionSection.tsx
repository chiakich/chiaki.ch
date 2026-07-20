import { motion } from 'framer-motion'
import { Box } from 'styled-system/jsx'

interface MotionSectionProps {
  children: React.ReactNode
  delay?: number
  spanColumns?: boolean
}

const MotionBox = motion.create(Box)

const MotionSection = ({ children, delay = 0, spanColumns = false }: MotionSectionProps) => (
  <MotionBox
    gridColumn={spanColumns ? { md: 'span 2' } : undefined}
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-70px' }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </MotionBox>
)

export default MotionSection
