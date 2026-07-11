import { motion } from 'framer-motion'
import { Box, Container, HStack, Stack, styled } from 'styled-system/jsx'
import ProjectLink from 'components/portfolio/ProjectLink'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const Image = styled.img
const MotionBox = motion(Box)

const KumikoHero = () => (
  <Box pt="96px" backgroundColor="#18191c" position="relative" overflow="hidden">
    <Box position="absolute" inset="0" backgroundImage="linear-gradient(rgba(255,234,47,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,234,47,.035) 1px, transparent 1px)" backgroundSize="28px 28px" />
    <Container maxW="1180px" px={{ base: '24px', md: '40px' }} py={{ base: 14, md: 20 }} position="relative">
      <Stack alignItems="center" textAlign="center" gap={5}>
        <MotionBox initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
          <Text fontFamily="mono" letterSpacing=".28em" color="#ffea2f" fontSize="sm" fontWeight="900">ZERO-INSTALL · CJK · GITHUB-NATIVE</Text>
          <Heading fontSize={{ base: '3rem', md: '5.5rem' }} lineHeight="1.05" mt={4}>Kumiko <Span color="#ffea2f">Font Editor</Span></Heading>
          <Text maxW="760px" mx="auto" mt={5} fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.85" opacity={.8}>打開瀏覽器，就能直接替 GitHub 上的開源中文字體補字。</Text>
          <HStack justifyContent="center" gap={3} mt={7} flexWrap="wrap"><ProjectLink href="https://kumiko.chiaki.ch" label="線上試用" accent="#ffea2f" /><ProjectLink href="https://github.com/chiakich/kumiko-font-editor" label="GitHub" accent="#fafafa" /></HStack>
        </MotionBox>
        <MotionBox mt={8} width="100%" position="relative" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .25 }}>
          <Box border="1px solid #34363b" borderRadius="14px" overflow="hidden" boxShadow="0 36px 100px rgba(0,0,0,.55)"><Image src="/assets/works/kumiko/editor.webp" alt="Kumiko 字形與部件編輯畫面" width="100%" display="block" /></Box>
          {[['28%', '50%'], ['61%', '31%'], ['69%', '59%']].map(([left, top], index) => <motion.div key={index} style={{ position: 'absolute', left, top, width: 12, height: 12, background: '#ffea2f', boxShadow: '0 0 16px #ffea2f' }} animate={{ scale: [1, 1.8, 1], opacity: [.65, 1, .65] }} transition={{ duration: 2.4, repeat: Infinity, delay: index * .5 }} />)}
        </MotionBox>
      </Stack>
    </Container>
  </Box>
)

export default KumikoHero
