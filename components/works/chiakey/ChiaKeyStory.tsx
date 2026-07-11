import { Box, Grid, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img

const principles = [
  ['01', '熟悉的節奏', '保留 KeyKey 的組字、候選窗與 bigram 語言模型，不把復興變成另一套陌生的輸入法。'],
  ['02', '台灣的詞彙', '詞庫由獨立專案整理與發佈，專注台灣日常真正會輸入的詞語與選字習慣。'],
  ['03', '現代化維護', '更新 InputMethodKit、安裝、簽章與 Apple Silicon 支援，讓舊引擎能被現代系統接住。'],
]

const ChiaKeyStory = () => (
  <Stack gap={14}>
    <MotionSection>
      <SectionHeading en="REVIVAL" accent="#78b7ff">不是重寫，而是延續</SectionHeading>
      <Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
        <Stack gap={4} fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.86}>
          <Text>千秋輸入法以 Yahoo! 奇摩輸入法、KeyKey 與 OpenVanilla 的開源程式碼為起點，保留許多人熟悉的候選窗與輸入手感。</Text>
          <Text>它是一個保守、小步前進的復興專案：修復輸入法本體、整理詞庫發佈方式，並逐步建立可延伸到其他平台的輸入核心。</Text>
        </Stack>
        <Box border="1px solid #273a50" backgroundColor="#0c1622" p={5}>
          <Image src="/assets/works/chiakey/about.webp" alt="ChiaKey About 畫面" width="100%" display="block" />
        </Box>
      </Grid>
    </MotionSection>
    <Grid columns={{ base: 1, md: 3 }} gap={4}>
      {principles.map(([number, title, description], index) => (
        <MotionSection key={number} delay={index * .08}>
          <Box borderTop="2px solid #6eaff7" backgroundColor="#0d141d" p={6} height="100%">
            <Text fontFamily="mono" color="#78b7ff" fontSize="xs" letterSpacing=".2em">{number}</Text>
            <Heading mt={3} mb={3} fontSize="xl">{title}</Heading>
            <Text opacity={.7} lineHeight="1.8" fontSize="sm">{description}</Text>
          </Box>
        </MotionSection>
      ))}
    </Grid>
  </Stack>
)

export default ChiaKeyStory
