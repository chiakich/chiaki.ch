import { Box, Center, keyframes } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import AnimatedLogo from 'components/index/AnimatedLogo'
import LogoText from '@icon/logo_text_light.svg'

const spin = keyframes`
  from {transform: rotate(0deg);}
  to {transform: rotate(360deg)}`

const MainLogo = () => {
  return (
    <Center flexDirection={{ base: 'column', md: 'row' }}>
      <motion.div
        initial={{ x: 70 }}
        animate={{ x: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
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
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          opacity: { duration: 1, ease: 'easeInOut' },
          scale: { duration: 3, ease: 'easeOut' },
        }}
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
