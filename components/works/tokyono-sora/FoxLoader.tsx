import { motion } from 'framer-motion'
import { Box, styled } from 'styled-system/jsx'

const Image = styled.img

// 佈景實際使用的 loading.svg（自家製旋轉狐狸），取自 Tokyono-Sora repo。
const FoxLoader = () => (
  <Box width="100%" maxW="220px" mx="auto" position="relative">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}>
      <Image src="/assets/works/tokyono-sora/loading.svg" alt="東京乃空的旋轉狐狸載入動畫" width="100%" display="block" />
    </motion.div>
  </Box>
)

export default FoxLoader
