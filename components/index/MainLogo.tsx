import { Box, Center } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { motion, useScroll, useTransform } from 'framer-motion'
import AnimatedLogo from 'components/index/AnimatedLogo'
import LogoText from '@icon/logo_text_light.svg'

const spin = keyframes`
  from {transform: rotate(0deg);}
  to {transform: rotate(360deg)}`

const MainLogo = () => {
  const { scrollY } = useScroll()

  // Different parallax speeds for different elements
  const leftLogoY = useTransform(scrollY, [0, 1000], [0, -200])
  const rightLogoY = useTransform(scrollY, [0, 1000], [0, -150])
  const textY = useTransform(scrollY, [0, 1000], [0, -200])
  const mobileLogoY = useTransform(scrollY, [0, 1000], [0, -120])

  return (
    <Center
      flexDirection={{ base: 'column', md: 'row' }}
      filter="drop-shadow(5px 5px 15px #000)"
      opacity={0.9}
      backdropFilter="blur(1px)"
    >
      <motion.div
        initial={{ x: 70 }}
        animate={{ x: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ y: leftLogoY }}
      >
        <Box
          display={{ base: 'none', md: 'block' }}
          animation={`${spin} infinite 15s linear`}
          width={{ base: '23vw', md: '6vw' }}
        >
          <AnimatedLogo />
        </Box>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ y: mobileLogoY }}
      >
        <Box
          display={{ base: 'block', md: 'none' }}
          animation={`${spin} infinite 15s linear`}
          width={{ base: '23vw', md: '6vw' }}
        >
          <AnimatedLogo />
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          opacity: { duration: 1, ease: 'easeInOut' },
          scale: { duration: 3, ease: [0, 0.78, 0, 1.0] },
        }}
        style={{ y: textY }}
      >
        <Box
          position="relative"
          width={{ base: '85vw', md: '50vw' }}
          maxWidth="700px"
          m="30px 20px"
        >
          <LogoText style={{ width: '100%' }} />
        </Box>
      </motion.div>

      <motion.div
        initial={{ x: -70 }}
        animate={{ x: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ y: rightLogoY }}
      >
        <Box
          display={{ base: 'none', md: 'block' }}
          animation={`${spin} infinite 15s linear reverse`}
          width={{ base: '23vw', md: '6vw' }}
        >
          <AnimatedLogo />
        </Box>
      </motion.div>
    </Center>
  )
}
export default MainLogo
