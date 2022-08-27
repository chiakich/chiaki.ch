import type { NextPage } from 'next'
import { Box, Center, keyframes } from '@chakra-ui/react'
import { motion, useScroll } from 'framer-motion'
import DotBackground from 'components/DotBackground'
import AnimatedLogo from 'components/AnimatedLogo'
import BgImg from '@img/takuzosu-inari-shrine.jpg'
import LogoText from '@icon/logo_text_light.svg'
import LogoIcon from '@icon/logo_white.svg'

const spin = keyframes`
  from {transform: rotate(0deg);}
  to {transform: rotate(360deg)}`

const Home: NextPage = () => {
  return (
    <Box
      backgroundImage={BgImg.src}
      backgroundSize="cover"
      width="100vw"
      height="100vh"
    >
      <DotBackground />
      <Center position="relative" width="100%" height="100%" justifyContent="center">
        <Box animation={`${spin} infinite 15s linear`}>
          <AnimatedLogo />
        </Box>

        <LogoText style={{ width: '50%', maxWidth: '700px', margin: '0 20px' }} />

        <Box animation={`${spin} infinite 15s linear`}>
          <AnimatedLogo />
        </Box>
      </Center>
    </Box>
  )
}

export default Home
