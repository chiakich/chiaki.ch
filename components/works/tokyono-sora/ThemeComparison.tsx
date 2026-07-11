import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Box, HStack, styled } from 'styled-system/jsx'

const Button = styled.button
const Image = styled.img

const ThemeComparison = () => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setDark((value) => !value), 4200)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <Box position="relative" borderRadius="16px" overflow="hidden" border="1px solid rgba(255,255,255,.22)" boxShadow="0 30px 90px rgba(2,14,24,.5)">
      <Image src="/assets/works/tokyono-sora/light.webp" alt="東京乃空明亮介面" width="100%" display="block" />
      <motion.div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} animate={{ clipPath: dark ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' }} transition={{ duration: .8, ease: [0.22, 1, 0.36, 1] }}>
        <Image src="/assets/works/tokyono-sora/dark.webp" alt="東京乃空深色介面" width="100%" height="100%" objectFit="cover" />
      </motion.div>
      <HStack position="absolute" top={4} right={4} backgroundColor="rgba(10,22,31,.72)" backdropFilter="blur(12px)" borderRadius="full" p={1}>
        <Button onClick={() => setDark(false)} px={4} py={2} borderRadius="full" border="0" cursor="pointer" backgroundColor={!dark ? '#f2f8fa' : 'transparent'} color={!dark ? '#243947' : 'white'}>Light</Button>
        <Button onClick={() => setDark(true)} px={4} py={2} borderRadius="full" border="0" cursor="pointer" backgroundColor={dark ? '#243947' : 'transparent'} color="white">Dark</Button>
      </HStack>
      <motion.div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, background: '#fff', left: dark ? '100%' : '0%', boxShadow: '0 0 18px #fff' }} animate={{ left: dark ? '100%' : '0%' }} transition={{ duration: .8 }} />
    </Box>
  )
}

export default ThemeComparison
