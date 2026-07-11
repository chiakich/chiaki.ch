import { Box, Grid, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img
const Code = styled.code

const lineage = [
  ['1 →', 'Yahoo! 奇摩輸入法', 'KeyKey，2008 年前後許多人的第一套智慧注音'],
  ['2 →', '開源釋出', 'BSD-style 授權，YahooArchive/KeyKey'],
  ['3 →', '社群保存', 'OpenVanilla 與 KeyKey-Boneyard 留下的程式碼'],
  ['NOW', 'ChiaKey', '整理建置、修復本體，在現代 macOS 繼續維護'],
]

const principles = [
  ['01', '熟悉的手感', '保留 KeyKey 的組字、候選窗與 bigram 語言模型，打起來就是原本那一套。'],
  ['02', '現代化建置', 'InputMethodKit、Apple Silicon、簽章與公證，用現在的 Xcode 就能建置。'],
  ['03', '保守步調', '不跟現代輸入法比功能。想要更多功能，README 會老實建議你用 McBopomofo 或 vChewing。'],
]

const ChiaKeyStory = () => (
  <Stack gap={14}>
    <MotionSection>
      <SectionHeading en="REVIVAL" accent="#c77dff">不是重寫，而是延續</SectionHeading>
      <Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
        <Stack gap={4} fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.86}>
          <Text>KeyKey 停止維護多年後，程式碼還留在 GitHub 上。ChiaKey 從這份程式碼出發，讓它重新能在現代 macOS 上建置、安裝、輸入。</Text>
          <Text>名字是 <Code fontSize=".9em" color="#d49bff">Chiaki</Code> 與 <Code fontSize=".9em" color="#d49bff">KeyKey</Code> 的諧音哏。</Text>
        </Stack>
        <Box border="1px solid #3c2a54" backgroundColor="#170e24" p={5}>
          <Image src="/assets/works/chiakey/about.webp" alt="ChiaKey About 畫面" width="100%" display="block" />
        </Box>
      </Grid>
    </MotionSection>
    <MotionSection>
      <Grid columns={{ base: 1, md: 4 }} gap={3}>
        {lineage.map(([label, title, description]) => (
          <Box key={title} border="1px solid #34244a" backgroundColor="#130c1f" p={5}>
            <Text fontFamily="mono" fontSize="xs" color="#c77dff" letterSpacing=".2em" mb={2}>{label}</Text>
            <Heading fontSize="md" mb={2}>{title}</Heading>
            <Text fontSize="xs" opacity={.6} lineHeight="1.8">{description}</Text>
          </Box>
        ))}
      </Grid>
    </MotionSection>
    <Grid columns={{ base: 1, md: 3 }} gap={4}>
      {principles.map(([number, title, description], index) => (
        <MotionSection key={number} delay={index * .08}>
          <Box borderTop="2px solid #b06ee8" backgroundColor="#150d20" p={6} height="100%">
            <Text fontFamily="mono" color="#c77dff" fontSize="xs" letterSpacing=".2em">{number}</Text>
            <Heading mt={3} mb={3} fontSize="xl">{title}</Heading>
            <Text opacity={.7} lineHeight="1.8" fontSize="sm">{description}</Text>
          </Box>
        </MotionSection>
      ))}
    </Grid>
  </Stack>
)

export default ChiaKeyStory
