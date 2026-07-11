import { motion } from 'framer-motion'
import { Box, HStack, Stack, styled } from 'styled-system/jsx'

const Text = styled.p

const engines = ['SERPER', 'GOOGLE', 'DUCKDUCKGO', 'BING']

const SearchChatDemo = () => (
  <Box maxW="680px" mx="auto" backgroundColor="#172534" border="1px solid #2b4157" borderRadius="18px" overflow="hidden" boxShadow="0 32px 90px rgba(0,0,0,.45)">
    <HStack height="46px" px={5} backgroundColor="#203448"><Box width="10px" height="10px" backgroundColor="#57b5ff" borderRadius="full" /><Text fontWeight="bold">圖片ㄗ援改二</Text><Text ml="auto" fontSize="xs" color="#8ea8bf">online</Text></HStack>
    <Stack gap={5} p={{ base: 5, md: 8 }} minHeight="390px">
      <motion.div animate={{ opacity: [0, 1, 1], x: [35, 0, 0] }} transition={{ duration: 5.5, repeat: Infinity }}>
        <Box ml="auto" width="fit-content" maxW="78%" backgroundColor="#2c7ab5" borderRadius="14px 14px 3px 14px" px={4} py={3}>mic drop.gif</Box>
      </motion.div>
      <motion.div animate={{ opacity: [0, 0, 1, 1], y: [10, 10, 0, 0] }} transition={{ duration: 5.5, repeat: Infinity, times: [0, .15, .28, 1] }}>
        <Box width="86%" backgroundColor="#21384c" borderRadius="14px 14px 14px 3px" p={4}>
          <Text color="#8fcaef" fontSize="sm" mb={3}>正在找第一張可以傳送的圖片⋯</Text>
          <HStack gap={2} flexWrap="wrap">{engines.map((engine, index) => <motion.div key={engine} animate={{ color: ['#668096', '#71dca0', '#668096'] }} transition={{ duration: 2.4, repeat: Infinity, delay: index * .42 }}><Box border="1px solid currentColor" borderRadius="full" px={2} py={1} fontSize="9px">{engine}</Box></motion.div>)}</HStack>
        </Box>
      </motion.div>
      <motion.div animate={{ opacity: [0, 0, 0, 1, 1], y: [15, 15, 15, 0, 0] }} transition={{ duration: 5.5, repeat: Infinity, times: [0, .38, .48, .62, 1] }}>
        <Box width="86%" backgroundColor="#21384c" borderRadius="14px 14px 14px 3px" overflow="hidden">
          <Box height="150px" background="linear-gradient(135deg,#b58e61,#4c3528)" position="relative" overflow="hidden"><motion.div style={{ position: 'absolute', left: '35%', top: '18%', width: '30%', height: '66%', borderRadius: '50% 50% 15% 15%', background: '#20242b' }} animate={{ rotate: [-4, 5, -4] }} transition={{ duration: 1.2, repeat: Infinity }} /><Text position="absolute" left={3} top={2} backgroundColor="rgba(0,0,0,.55)" borderRadius="full" px={2} py={1} fontSize="xs">GIF</Text></Box>
          <Text px={4} py={3} color="#8fcaef" fontSize="sm">第一張可用結果 · 已傳送</Text>
        </Box>
      </motion.div>
    </Stack>
  </Box>
)

export default SearchChatDemo
