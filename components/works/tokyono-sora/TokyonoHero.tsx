import { motion } from 'framer-motion'
import { Box, Container, HStack, Stack, styled } from 'styled-system/jsx'
import ProjectLink from 'components/portfolio/ProjectLink'
import ThemeComparison from './ThemeComparison'

const Heading = styled.h1
const Text = styled.p
const Image = styled.img

const TokyonoHero = () => (
  <Box pt="96px" minHeight="82vh" position="relative" overflow="hidden" backgroundColor="#708a9c">
    <Image src="/assets/works/tokyono-sora/light.webp" alt="" position="absolute" inset="0" width="100%" height="100%" objectFit="cover" opacity={.35} filter="blur(7px)" transform="scale(1.04)" />
    <Box position="absolute" inset="0" background="linear-gradient(180deg, rgba(23,45,59,.24), rgba(8,22,33,.88))" />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 24 }} position="relative">
      <Stack alignItems="center" textAlign="center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
          <Text color="#aaf5ff" fontSize="sm" fontWeight="700" letterSpacing=".14em" textTransform="uppercase">Plurk UI Redesign</Text>
          <Heading fontSize={{ base: '3.5rem', md: '6.5rem' }} mt={4} lineHeight="1" fontWeight="700" letterSpacing="-.03em">東京乃空</Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.9" maxW="720px" mt={5} opacity={.85}>免費、自由使用的噗浪 CSS 佈景。重排時間軸、毛玻璃面板、響應式排版——貼上一段 CSS 就能套用。</Text>
          <HStack justifyContent="center" mt={7}><ProjectLink href="https://github.com/chiakich/Tokyono-Sora" label="取得佈景 CSS" accent="#8eeaf4" /></HStack>
        </motion.div>
        <Box mt={10} width="100%"><ThemeComparison /></Box>
      </Stack>
    </Container>
  </Box>
)

export default TokyonoHero
