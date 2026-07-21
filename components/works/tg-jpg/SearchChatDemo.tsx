import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Box, Flex, HStack, Stack, styled } from 'styled-system/jsx'

const Text = styled.p
const Span = styled.span
const Image = styled.img

// 依照實際的 Telegram 對話重現：
// 在輸入框逐字打出「騙人的吧.jpg」→ 送出 → 圖片ㄗ援改二回覆 demo 圖。
const MESSAGE = '騙人的吧.jpg'

// phase: 0..MESSAGE.length = 打字中（值 = 已打字數）
// sent = 訊息送出、replied = bot 回圖
type Phase = number | 'sent' | 'replied'

const holdFor = (phase: Phase) => {
  if (phase === 'sent') return 1000
  if (phase === 'replied') return 4200
  return phase === 0 ? 700 : 130
}

const nextPhase = (phase: Phase): Phase => {
  if (phase === 'sent') return 'replied'
  if (phase === 'replied') return 0
  return phase < MESSAGE.length ? phase + 1 : 'sent'
}

const Caret = () => (
  <motion.span animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1, repeat: Infinity, times: [0, .5, .5, 1] }} style={{ display: 'inline-block', width: 2, height: '1.1em', verticalAlign: '-.15em', backgroundColor: '#f5f5f7' }} />
)

const SearchChatDemo = () => {
  const [phase, setPhase] = useState<Phase>(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase(nextPhase(phase)), holdFor(phase))
    return () => window.clearTimeout(timer)
  }, [phase])

  const typed = typeof phase === 'number' ? MESSAGE.slice(0, phase) : ''
  const showMessage = phase === 'sent' || phase === 'replied'

  return (
    <Box maxW="640px" width="100%" mx="auto" backgroundColor="#17212b" borderRadius="24px" overflow="hidden" boxShadow="0 32px 90px rgba(0,0,0,.45)">
      <Stack gap={5} px={{ base: 5, md: 7 }} pt={{ base: 6, md: 8 }} pb={4} minHeight="420px" justifyContent="flex-end">
        {showMessage && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
            <Flex gap={3} alignItems="flex-start">
              <Flex width="40px" height="40px" borderRadius="full" flexShrink={0} alignItems="center" justifyContent="center" fontSize="md" fontWeight="bold" color="white" background="linear-gradient(135deg, #c77dff, #5f7bd8)">千</Flex>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="#b18be8" mb={1}>千秋 涼風</Text>
                <Text color="#f5f5f7">{MESSAGE}</Text>
              </Box>
            </Flex>
          </motion.div>
        )}
        {phase === 'replied' && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
            <Flex gap={3} alignItems="flex-start">
              <Image src="/assets/works/tg-jpg/bot-avatar.webp" alt="圖片ㄗ援改二的頭像" width="40px" height="40px" borderRadius="full" flexShrink={0} />
              <Box maxW="82%">
                <Text fontSize="sm" fontWeight="bold" color="#6ab3f3" mb={1}>圖片ㄗ援改二</Text>
                <Image src="/assets/works/tg-jpg/demo.webp" alt="機器人回覆的「騙人的吧」動畫截圖" width="100%" display="block" borderRadius="12px" />
              </Box>
            </Flex>
          </motion.div>
        )}
      </Stack>
      <HStack gap={3} px={{ base: 4, md: 5 }} py={3} borderTop="1px solid rgba(255,255,255,.06)">
        <Flex width="38px" height="38px" borderRadius="full" alignItems="center" justifyContent="center" flexShrink={0} border="1px solid rgba(255,255,255,.18)" color="#8ea8bf">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.5l-8.5 8.5a6 6 0 0 1-8.5-8.5L12.5 4a4 4 0 0 1 5.7 5.7L9.7 18a2 2 0 0 1-2.8-2.8l7.8-7.8" /></svg>
        </Flex>
        <Box flex="1" backgroundColor="#242f3d" borderRadius="980px" px={5} py={2.5} fontSize="md">
          {typed
            ? <Span color="#f5f5f7">{typed}<Caret /></Span>
            : showMessage
              ? <Span color="#5d6d7f">輸入訊息⋯</Span>
              : <Span color="#5d6d7f"><Caret />輸入訊息⋯</Span>}
        </Box>
      </HStack>
    </Box>
  )
}

export default SearchChatDemo
