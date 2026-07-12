import { motion } from 'framer-motion'
import { Box, Container, HStack, Stack, styled } from 'styled-system/jsx'
import ProjectLink from 'components/portfolio/ProjectLink'
import SearchChatDemo from './SearchChatDemo'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span

const TgJpgHero = () => (
  <Box
    pt="96px"
    background="radial-gradient(circle at 70% 20%, #1e4c70, #101d2a 48%, #071019 100%)"
    overflow="hidden"
  >
    <Container
      maxW="1080px"
      px={{ base: '24px', md: '40px' }}
      py={{ base: 14, md: 20 }}
    >
      <Stack gap={10}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
        >
          <Text
            color="#57b5ff"
            letterSpacing=".14em"
            fontSize="sm"
            fontWeight="700"
            textTransform="uppercase"
          >
            An “I’m feeling lucky” bot for images
          </Text>
          <Heading
            fontSize={{ base: '4rem', md: '7rem' }}
            lineHeight="1"
            mt={4}
            fontWeight="700"
            letterSpacing="-.03em"
          >
            tg<Span color="#57b5ff">.jpg</Span>
          </Heading>
          <Text
            mt={5}
            maxW="660px"
            fontSize={{ base: 'lg', md: 'xl' }}
            lineHeight="1.85"
            opacity={0.82}
          >
            在聊天裡打出 .jpg，機器人幫你回覆哏圖。支援 .jpg、.png、.gif。
          </Text>
          <HStack mt={7}>
            <ProjectLink
              href="https://t.me/tgjpg_bot"
              label="加入 Telegram"
              solid
              accent="#57b5ff"
            />
            <ProjectLink
              href="https://github.com/chiakich/rust-tg.jpg"
              label="查看原始碼"
              detail="Rust"
              accent="#57b5ff"
            />
          </HStack>
        </motion.div>
        <SearchChatDemo />
      </Stack>
    </Container>
  </Box>
)

export default TgJpgHero
