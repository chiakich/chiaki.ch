import { Box, Flex, Grid, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img
const Code = styled.code
const Link = styled.a

const lineage = [
  ['2008', 'Yahoo! 奇摩輸入法推出', '跨平臺的免費智慧輸入法。'],
  [
    '2013',
    '專案關閉、程式碼開源',
    '採用 BSD-style 開源保存在 GitHub（YahooArchive/KeyKey）。最後一代安裝包經過社群不斷改造，延續至今。',
  ],
  [
    '2026',
    '蘋果宣佈終止支援x86架構',
    '最後一代安裝包將無法在 macOS 26 之後的版本安裝。',
  ],
  [
    '',
    '千秋輸入法',
    '修復本體、整理相容詞庫，支援 Apple Silicon 與現代 macOS。',
  ],
]

const principles = [
  [
    '維持熟悉的手感',
    '首要目標為嘗試保留 Yahoo! 奇摩輸入法的組字、候選窗與語言模型，打起來就是原本那一套。',
  ],
  ['現代化改造', '改進安全性與演算法，以新 API 改寫，並為 Apple Silicon 編譯。'],
  [
    '保守步調',
    '千秋輸入法的目標，並非與現代輸入法比拼功能。本輸入法將專注在穩定性上。',
  ],
]

const ChiaKeyStory = () => (
  <Stack gap={{ base: 14, md: 20 }}>
    <MotionSection>
      <SectionHeading
        en="History"
        accent="#c77dff"
        center
        sub="千秋輸入法是基於 Yahoo! 奇摩輸入法的免費開源復刻專案，旨在修復並改進其功能，並嘗試重製與其手感相仿的詞庫。"
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
        Yahoo奇摩官方在專案停止後，大方的將其程式碼開源。千秋輸入法基於這份程式碼出發，替換過時API、修復遺漏內容，並有限度的改進其功能與效能，讓它重新能在現代
        macOS 上建置、安裝、輸入，並繼續維護。
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
