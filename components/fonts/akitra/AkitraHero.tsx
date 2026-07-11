import { motion } from 'framer-motion'
import { Box, Flex, styled } from 'styled-system/jsx'
import { AKITRA_COLORS } from './akitraData'

const Text = styled.p
const Span = styled.span
const MotionBox = motion(Box)

const samples = ['25BH2004', 'ㄕㄊㄆ 重43 空18', '郵便車', '40C10108', '換算']

const AkitraHero = () => (
  <>
    <Box pt="96px" position="relative" overflow="hidden">
      <Flex height={{ base: '52vh', md: '62vh' }} minHeight="360px">{Object.values(AKITRA_COLORS).map((color, index) => <MotionBox key={color} flex="1" backgroundColor={color} initial={{ y: '-100%' }} animate={{ y: 0 }} transition={{ duration: .7, delay: index * .12 }} />)}</Flex>
      <MotionBox position="absolute" inset="96px 0 0" display="flex" alignItems="center" justifyContent="center" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45 }}>
        <Box backgroundColor="#20242e" border="2px solid rgba(255,255,255,.85)" boxShadow="0 12px 48px rgba(0,0,0,.55)" px={{ base: 8, md: 14 }} py={{ base: 5, md: 8 }} textAlign="center">
          <Text fontFamily="akitra" fontSize={{ base: '2.6rem', md: '4.6rem' }} color="white"><Span fontSize=".5em" verticalAlign="30%">35FPK</Span>11203<Span fontSize=".5em" verticalAlign="30%">ㄒ</Span></Text>
          <Text color={AKITRA_COLORS.orange} mt={2} letterSpacing=".3em" fontWeight="bold">臺鐵客貨車表記文字</Text>
        </Box>
      </MotionBox>
    </Box>
    <Flex backgroundColor="#20242e" py={4} px={6} justifyContent="center" gap={{ base: 6, md: 12 }} flexWrap="wrap">{samples.map((sample, index) => <Span key={sample} fontFamily="akitra" fontSize={{ base: 'lg', md: '2xl' }} color={index % 3 === 0 ? AKITRA_COLORS.cream : index % 3 === 1 ? AKITRA_COLORS.orange : '#7f9be0'}>{sample}</Span>)}</Flex>
  </>
)

export default AkitraHero
