import { Box, Flex, styled } from 'styled-system/jsx'
import { motion } from 'framer-motion'

const Text = styled.p
const Span = styled.span
const MotionText = motion.create(Text)

export const AkitraSpecimen = () => (
  <Box width="100%" height="100%" backgroundColor="#20242e" position="relative" overflow="hidden">
    <Flex height="9px">
      {['#f6f1de', '#f8751b', '#284b9d'].map((color) => <Box key={color} flex="1" style={{ backgroundColor: color }} />)}
    </Flex>
    <Flex height="calc(100% - 9px)" alignItems="center" justifyContent="center">
      <Text className="specimen" fontFamily="akitra" fontSize={{ base: '3rem', md: '4.2rem' }} color="white" style={{ transition: 'transform .4s ease' }}>
        <Span fontSize=".5em" verticalAlign="30%">35FPK</Span>11203<Span fontSize=".5em" verticalAlign="30%">ㄒ</Span>
      </Text>
    </Flex>
    <Text position="absolute" bottom={3} right={4} fontFamily="akitra" color="#f8751b">重43 空18 ㄕㄊㄆ</Text>
  </Box>
)

export const NixieSpecimen = () => (
  <Flex width="100%" height="100%" backgroundColor="#050505" alignItems="center" justifyContent="center" overflow="hidden">
    <MotionText
      className="specimen"
      fontFamily="nixie"
      fontSize={{ base: '3.4rem', md: '4.6rem' }}
      color="#ff9b28"
      textShadow="0 0 6px rgba(255,65,0,.7), 0 0 20px #ff8000"
      animate={{ opacity: [1, .78, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] }}
      transition={{ duration: 2.8, repeat: Infinity }}
      style={{ transitionProperty: 'transform' }}
    >
      0.1234
    </MotionText>
  </Flex>
)

export const HuninnSpecimen = () => (
  <Flex width="100%" height="100%" backgroundColor="#342c2c" alignItems="center" justifyContent="center" position="relative" overflow="hidden">
    {[
      ['90px', '-22px', '-18px', '#febb27'],
      ['48px', '24px', '76%', '#ec4618'],
      ['116px', '132px', '78%', '#66ac35'],
    ].map(([size, top, left, color], index) => (
      <motion.div key={index} style={{ position: 'absolute', width: size, height: size, top, left, borderRadius: '50%', border: `3px solid ${color}`, opacity: .35 }} animate={{ y: [0, -12, 0] }} transition={{ duration: 4 + index, repeat: Infinity }} />
    ))}
    <Text className="specimen" fontFamily="huninn" fontSize={{ base: '3.2rem', md: '4.4rem' }} color="#febb27" position="relative" style={{ transition: 'transform .4s ease' }}>粉圓體</Text>
  </Flex>
)
