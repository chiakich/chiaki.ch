import { Box, Flex, Grid, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img
const Code = styled.code

const lineage = [
  ['Yahoo! 奇摩輸入法', 'KeyKey，2008 年前後許多人的第一套智慧注音'],
  ['開源釋出', 'BSD-style 授權，YahooArchive/KeyKey'],
  ['社群保存', 'OpenVanilla 與 KeyKey-Boneyard 留下的程式碼'],
  ['ChiaKey', '整理建置、修復本體，在現代 macOS 繼續維護'],
]

const principles = [
  ['01', '熟悉的手感', '保留 KeyKey 的組字、候選窗與 bigram 語言模型，打起來就是原本那一套。'],
  ['02', '現代化建置', 'InputMethodKit、Apple Silicon、簽章與公證，用現在的 Xcode 就能建置。'],
  ['03', '保守步調', '不跟現代輸入法比功能。想要更多功能，README 會老實建議你用 McBopomofo 或 vChewing。'],
]

const ChiaKeyStory = () => (
  <Stack gap={14}>
    <MotionSection>
      <SectionHeading en="REVIVAL" accent="#78b7ff">不是重寫，而是延續</SectionHeading>
      <Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
        <Stack gap={4} fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.86}>
          <Text>KeyKey 停止維護多年後，程式碼還留在 GitHub 上。ChiaKey 從這份程式碼出發，讓它重新能在現代 macOS 上建置、安裝、輸入。</Text>
          <Text>名字是 <Code fontSize=".9em" color="#9ac8ff">Chiaki</Code> 與 <Code fontSize=".9em" color="#9ac8ff">KeyKey</Code> 的諧音哏。</Text>
        </Stack>
        <Box border="1px solid #273a50" backgroundColor="#0c1622" p={5}>
          <Image src="/assets/works/chiakey/about.webp" alt="ChiaKey About 畫面" width="100%" display="block" />
        </Box>
      </Grid>
    </MotionSection>
    <MotionSection>
      <Grid columns={{ base: 1, md: 4 }} gap={0} border="1px solid #24394f" backgroundColor="#0b131d">
        {lineage.map(([title, description], index) => (
          <Flex key={title} direction="column" gap={2} p={5} borderRight={{ md: index < lineage.length - 1 ? '1px solid #24394f' : 'none' }} borderBottom={{ base: index < lineage.length - 1 ? '1px solid #24394f' : 'none', md: 'none' }} position="relative">
            <Text fontFamily="mono" fontSize="xs" color="#78b7ff" letterSpacing=".2em">{index === lineage.length - 1 ? 'NOW' : `${index + 1} →`}</Text>
            <Heading fontSize="md">{title}</Heading>
            <Text fontSize="xs" opacity={.6} lineHeight="1.8">{description}</Text>
          </Flex>
        ))}
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
