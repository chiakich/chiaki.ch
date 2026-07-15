import { motion } from 'framer-motion'
import { Box, Container, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import FontCard, { FontCardData } from './FontCard'
import { AkitraSpecimen, HuninnSpecimen, NixieSpecimen } from './FontSpecimens'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const MotionBox = motion(Box)

const fonts: FontCardData[] = [
  { id: 'akitra', title: '台鐵客貨車字體', en: 'AKITRA', description: '以台鐵客貨車表記文字為藍本，保存鐵道車號、載重與車種記號的視覺記憶。', tags: ['自製字體', 'SIL OFL 1.1', '284 字符'], href: '/fonts/akitra', specimen: <AkitraSpecimen /> },
  { id: 'nixie', title: 'Nixie 數字字體', en: 'AKINIXIE', description: '重現輝光管顯示器溫暖橙光的數字字體，適合時鐘與復古科技場景。', tags: ['自製字體', 'CC BY-SA 4.0', '數字專用'], href: '/fonts/nixie', specimen: <NixieSpecimen /> },
  { id: 'huninn', title: 'jf open 粉圓', en: 'OPEN HUNINN', description: '在 justfont 參與製作的台灣開源圓體，像粉圓一樣圓潤而有彈性。', tags: ['參與設計', 'SIL OFL 1.1', 'justfont'], href: '/fonts/huninn', specimen: <HuninnSpecimen /> },
]

const FontsIndexPage = () => (
  <Box backgroundColor="black" color="white" minHeight="100vh">
    <TopBar />
    <Box pt="96px">
      <Container maxW="1080px" py={12} px={{ base: '24px', md: '40px' }}>
        <MotionBox initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} mb={14}>
          <Text fontFamily="mono" fontSize="sm" letterSpacing=".35em" color="#df8a42" fontWeight="bold" mb={3}>FONTS&nbsp;&nbsp;//&nbsp;&nbsp;TYPEFACES</Text>
          <Heading fontSize={{ base: '3rem', md: '4.5rem' }} lineHeight={1.05} fontWeight="900" mb={5}>字體<Span color="#df8a42">集</Span></Heading>
          <Box width="180px" height="8px" mb={5} background="repeating-linear-gradient(-45deg, #df8a42 0 10px, transparent 10px 20px)" />
          <Text maxW="600px" fontSize={{ base: 'md', md: 'lg' }} opacity={.85} lineHeight="1.9">從台灣鐵道上的表記文字、輝光管數字，到為台灣調整的開源圓體。每套字都從一段具體的文化與使用經驗開始。</Text>
        </MotionBox>
        <Stack gap={10}>{fonts.map((font, index) => <FontCard key={font.id} font={font} index={index} />)}</Stack>
      </Container>
    </Box>
  </Box>
)

export default FontsIndexPage
