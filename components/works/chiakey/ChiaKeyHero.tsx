import { motion } from 'framer-motion'
import { Box, Container, Flex, HStack, styled } from 'styled-system/jsx'
import ProjectLink from 'components/portfolio/ProjectLink'
import VerticalCandidateMenu from './VerticalCandidateMenu'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const MotionBox = motion(Box)

const ChiaKeyHero = () => (
  <Box pt="96px" minHeight={{ base: '760px', md: '86vh' }} position="relative" overflow="hidden" background="radial-gradient(circle at 65% 30%, #dcecff 0, #9ebbdc 34%, #14273e 78%, #07111e 100%)">
    <Box position="absolute" inset="0" backgroundImage="linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)" backgroundSize="32px 32px" />
    <Container maxW="1120px" height="100%" px={{ base: '24px', md: '40px' }} py={{ base: 14, md: 20 }} position="relative">
      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 12, md: 8 }} alignItems="center" minHeight={{ md: '620px' }}>
        <MotionBox flex="1" initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8 }}>
          <Text fontFamily="mono" letterSpacing=".28em" color="#a8d0ff" fontSize="sm" fontWeight="900" mb={4}>CHIAKEY · FOR MODERN macOS</Text>
          <Heading fontSize={{ base: '3.4rem', md: '5.6rem' }} lineHeight="1.04" letterSpacing="-.04em" mb={6}>千秋<Span color="#9ac8ff">輸入法</Span></Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.9" maxW="560px" color="#eaf4ff" opacity={.88}>延續 Yahoo! 奇摩輸入法與 KeyKey 熟悉的輸入節奏，讓經典的開源注音引擎在現代 macOS 上繼續生活。</Text>
          <HStack mt={8} gap={3} flexWrap="wrap">
            <ProjectLink href="https://github.com/chiakich/ChiaKey/releases/latest" label="下載最新版" detail="macOS .pkg" accent="#9ac8ff" />
            <ProjectLink href="https://github.com/chiakich/ChiaKey" label="GitHub" accent="#d8eaff" />
          </HStack>
        </MotionBox>

        <MotionBox flex="1" width="100%" initial={{ opacity: 0, y: 34, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: .9, delay: .25 }}>
          <Box backgroundColor="#202024" border="1px solid rgba(255,255,255,.22)" borderRadius="18px" boxShadow="0 36px 90px rgba(0,15,35,.55)" overflow="hidden">
            <HStack height="42px" px={4} gap={2} borderBottom="1px solid rgba(255,255,255,.09)">
              {['#ff5f57', '#febc2e', '#28c840'].map((color) => <Box key={color} width="10px" height="10px" borderRadius="full" backgroundColor={color} />)}
              <Text ml={3} fontSize="xs" color="#a3a3aa">文字輸入</Text>
            </HStack>
            <Box minHeight={{ base: '430px', md: '445px' }} position="relative" color="white" overflow="hidden" px={7} py={8}>
              <Text fontSize={{ base: '1.9rem', md: '2.2rem' }} fontWeight="bold" lineHeight="1.7" color="#f5f5f7">
                今晚吃<Span borderBottom="3px solid #4c9dff" color="#f5f5f7">鹽酥雞</Span>
                <Span display="inline-block" width="2px" height="1.6rem" ml="2px" verticalAlign="-3px" backgroundColor="#f5f5f7" />
              </Text>
              <Text mt={3} fontSize="sm" color="#8b8b93">正在組字「ㄐㄧ」— 按數字或空白鍵選字</Text>
              <motion.div initial={{ opacity: 0, scale: .94, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: .7, duration: .45 }} style={{ position: 'absolute', left: 128, top: 96 }}>
                <VerticalCandidateMenu />
              </motion.div>
            </Box>
          </Box>
          <HStack mt={4} justifyContent="flex-end" color="#ddecff" fontSize="xs" letterSpacing=".16em"><Span width="7px" height="7px" borderRadius="full" backgroundColor="#6dff9d" boxShadow="0 0 10px #6dff9d" />INPUT METHOD ACTIVE</HStack>
        </MotionBox>
      </Flex>
    </Container>
  </Box>
)

export default ChiaKeyHero
