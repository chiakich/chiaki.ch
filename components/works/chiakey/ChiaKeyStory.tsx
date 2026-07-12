import { Box, Flex, Grid, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img
const Code = styled.code
const Link = styled.a

const lineage = [
  ['2008', '推出 Yahoo! 奇摩輸入法', '跨平臺的免費智慧輸入法'],
  [
    '2013',
    '專案關閉、程式碼開源',
    '採用 BSD-style 開源保存在 GitHub（YahooArchive/KeyKey）。最後一代安裝包經過社群不斷改造，延續至今。',
  ],
  ['2026', '蘋果宣佈終止支援x86架構', '最後一代安裝包將無法在 macOS 27 安裝'],
  ['現在', 'ChiaKey 開始', '修復本體、整理相容詞庫，將在現代 macOS 展開新的旅程'],
]

const quotes = [
  ['真的需要選字的次數應該不超過 3 次，真的是太強了。', 'The Will Will Web，2008', 'https://blog.miniasp.com/post/2008/06/01/Useful-tools-Yahoo-KeyKey'],
  ['用起來比新注音好太多，而初步的感覺不遜於自然輸入法和新酷音。', '電腦玩物，2008', 'https://www.playpcesor.com/2008/12/yahoo-10.html'],
]

const principles = [
  [
    '熟悉的手感',
    '嘗試保留 Yahoo! 奇摩輸入法的組字、候選窗與語言模型，打起來就是原本那一套。',
  ],
  [
    '現代化建置',
    'InputMethodKit、Apple Silicon、簽章與公證，用現在的 Xcode 就能建置。',
  ],
  [
    '保守步調',
    '不跟現代輸入法比功能。想要更多功能，README 會老實建議你用 McBopomofo 或 vChewing。',
  ],
]

const ChiaKeyStory = () => (
  <Stack gap={{ base: 14, md: 20 }}>
    <MotionSection>
      <SectionHeading
        en="History"
        accent="#c77dff"
        center
        sub="千秋輸入法繼承了 2008 年由 Yahoo! 奇摩推出的免費輸入法，整合了好打注音、傳統注音、倉頡與簡易。擁有令人愛不釋手的智慧選字。2013 年專案結束，程式碼以 BSD-style 授權開源在 GitHub。"
      >
        什麼是千秋輸入法？
      </SectionHeading>
      <Grid
        columns={{ base: 1, md: 2 }}
        gap={{ base: 8, md: 12 }}
        alignItems="start"
        mt={{ base: 2, md: 6 }}
      >
        <Stack gap={0} pt={2}>
          {lineage.map(([year, title, description], index) => (
            <Flex key={title} gap={5}>
              <Flex
                direction="column"
                alignItems="center"
                width="14px"
                flexShrink={0}
              >
                <Box
                  width="10px"
                  height="10px"
                  borderRadius="full"
                  backgroundColor={
                    index === lineage.length - 1 ? '#c77dff' : '#4c3564'
                  }
                  boxShadow={
                    index === lineage.length - 1 ? '0 0 12px #c77dff' : 'none'
                  }
                  mt="6px"
                />
                {index < lineage.length - 1 && (
                  <Box
                    width="2px"
                    flex="1"
                    backgroundColor="#34244a"
                    minHeight="52px"
                  />
                )}
              </Flex>
              <Box pb={index < lineage.length - 1 ? 6 : 0}>
                <Text
                  fontFamily="mono"
                  fontSize="xs"
                  color="#c77dff"
                  letterSpacing=".2em"
                  mb={1}
                >
                  {year}
                </Text>
                <Heading fontSize="md" mb={1}>
                  {title}
                </Heading>
                <Text fontSize="xs" opacity={0.6} lineHeight="1.8">
                  {description}
                </Text>
              </Box>
            </Flex>
          ))}
        </Stack>
        <Stack gap={4}>
          <Box backgroundColor="#160e23" borderRadius="24px" p={5} overflow="hidden">
            <Image
              src="/assets/works/chiakey/about.webp"
              alt="ChiaKey About 畫面"
              width="100%"
              display="block"
              borderRadius="12px"
            />
          </Box>
        </Stack>
      </Grid>
    </MotionSection>
    <MotionSection>
      <Text>
        KeyKey 停止維護多年後，程式碼還留在 GitHub 上。ChiaKey
        從這份程式碼出發，讓它重新能在現代 macOS 上建置、安裝、輸入。
      </Text>
    </MotionSection>
    <Grid columns={{ base: 1, md: 3 }} gap={4}>
      {principles.map(([title, description], index) => (
        <MotionSection key={title} delay={index * 0.08}>
          <Box backgroundColor="#150d20" borderRadius="24px" p={7} height="100%">
            <Heading mb={3} fontSize="xl" letterSpacing="-.01em">
              {title}
            </Heading>
            <Text opacity={0.65} lineHeight="1.8" fontSize="sm">
              {description}
            </Text>
          </Box>
        </MotionSection>
      ))}
    </Grid>
  </Stack>
)

export default ChiaKeyStory
