import { motion } from 'framer-motion'
import { Box, Flex, Grid, HStack, styled } from 'styled-system/jsx'
import VerticalCandidateMenu from 'components/works/chiakey/VerticalCandidateMenu'

const Text = styled.p
const Span = styled.span
const Image = styled.img

export const ChiaKeySpecimen = () => (
  <Box width="100%" height="100%" backgroundColor="#202024" position="relative" overflow="hidden" color="white">
    <Text position="absolute" style={{ top: 30, left: 24 }} fontSize="1.7rem" fontWeight="bold" color="#f5f5f7">
      今晚吃<Span borderBottom="2px solid #4c9dff">鹽酥雞</Span>
    </Text>
    <Text position="absolute" style={{ top: 74, left: 24 }} fontSize="xs" color="#8b8b93">組字中「ㄐㄧ」</Text>
    <motion.div style={{ position: 'absolute', left: '32%', top: '30%', transformOrigin: 'top left', scale: .74 }} animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, 6] }} transition={{ duration: 5, repeat: Infinity }}>
      <VerticalCandidateMenu compact />
    </motion.div>
  </Box>
)

export const KumikoSpecimen = () => (
  <Box width="100%" height="100%" backgroundColor="#17181b" position="relative" overflow="hidden">
    <Image src="/assets/works/kumiko/editor.webp" alt="Kumiko 字體編輯畫面" width="100%" height="100%" objectFit="cover" objectPosition="center" opacity={.78} />
    <motion.svg viewBox="0 0 200 120" style={{ position: 'absolute', inset: '12% 22%', width: '56%', height: '76%' }}>
      <motion.path d="M35 90 L35 30 L92 30 L92 90 M108 88 Q145 82 165 34" fill="none" stroke="#ffea2f" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, .55, 1] }} />
      {[35, 92, 108, 165].map((x, i) => <motion.rect key={x} x={x - 3} y={i < 2 ? 27 : i === 2 ? 85 : 31} width="6" height="6" fill="#ffea2f" animate={{ scale: [0, 1, 1] }} transition={{ duration: 4, repeat: Infinity, delay: i * .12 }} />)}
    </motion.svg>
  </Box>
)

export const TokyonoSpecimen = () => (
  <Box width="100%" height="100%" position="relative" overflow="hidden" backgroundColor="#70899c">
    <Image src="/assets/works/tokyono-sora/dark.webp" alt="東京乃空噗浪佈景" width="100%" height="100%" objectFit="cover" />
    {[['12%', '18%'], ['54%', '52%'], ['68%', '19%']].map(([left, top], index) => (
      <motion.div key={index} style={{ position: 'absolute', left, top, width: index === 1 ? '34%' : '27%', height: 36, borderRadius: 9, background: 'rgba(237,247,251,.72)', backdropFilter: 'blur(8px)' }} animate={{ y: [0, -7, 0] }} transition={{ duration: 3.5 + index, repeat: Infinity }} />
    ))}
  </Box>
)

export const TgJpgSpecimen = () => (
  <Flex width="100%" height="100%" backgroundColor="#142232" direction="column" justifyContent="center" px={{ base: 5, md: 8 }} gap={3} overflow="hidden">
    <motion.div animate={{ x: [40, 0, 0], opacity: [0, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity }}>
      <Box ml="auto" width="68%" backgroundColor="#2d72a8" borderRadius="12px 12px 3px 12px" px={4} py={2} color="white">mic drop.gif</Box>
    </motion.div>
    <motion.div animate={{ y: [12, 0, 0], opacity: [0, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity, delay: .65 }}>
      <HStack width="78%" backgroundColor="#20364b" borderRadius="12px 12px 12px 3px" px={3} py={3} color="#7bc3ff">
        <Box width="32px" height="24px" borderRadius="5px" background="linear-gradient(135deg,#c9a06f,#593a27)" />
        <Text fontSize="sm">找到第一張可以傳送的 GIF</Text>
      </HStack>
    </motion.div>
    <Grid columns={4} gap={2} mt={1}>{['GOOGLE', 'DDG', 'BING', 'SEND'].map((item, index) => <motion.div key={item} animate={{ opacity: [.25, 1, .25] }} transition={{ duration: 2.2, repeat: Infinity, delay: index * .35 }}><Text fontSize="9px" color="#57b5ff">{item}</Text></motion.div>)}</Grid>
  </Flex>
)
