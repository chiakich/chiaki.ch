import type { NextPage } from 'next'
import { Box, Center, keyframes } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import DotBackground from 'components/DotBackground'
import AnimatedLogo from 'components/AnimatedLogo'
import BgImg from '@img/takuzosu-inari-shrine.jpg'
import LogoText from '@icon/logo_text_light.svg'

const spin = keyframes`
  from {transform: rotate(0deg);}
  to {transform: rotate(360deg)}`

const Home: NextPage = () => {
  return (
    <Box
      backgroundColor="black"
      backgroundImage={BgImg.src}
      backgroundSize="cover"
      width="100vw"
      height="100vh"
    >
      <DotBackground />
      <Center
        position="relative"
        width="100%"
        height="100%"
        justifyContent="center"
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Box
          animation={`${spin} infinite 15s linear`}
          width={{ base: '23vw', md: '8vw' }}
        >
          <AnimatedLogo />
        </Box>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <Box width={{ base: '85vw', md: '50vw' }} maxWidth="700px" m="30px 20px">
            <LogoText style={{ width: '100%' }} />
          </Box>
        </motion.div>

        <Box
          display={{ base: 'none', md: 'block' }}
          animation={`${spin} infinite 15s linear reverse`}
          width={{ base: '23vw', md: '8vw' }}
        >
          <AnimatedLogo />
        </Box>
      </Center>
    </Box>
  )
}

export default Home
