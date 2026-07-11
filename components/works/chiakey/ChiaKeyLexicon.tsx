import { Box, Flex, Grid, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'

const Heading = styled.h3
const Text = styled.p
const Code = styled.code

const steps = [
  ['ChiaKey-Lexicon', '詞庫在獨立 repo 整理，與輸入法本體分開發版'],
  ['GitHub Release', '產出 SQLite 詞庫檔，隨附 SHA-256 檢查碼'],
  ['偏好設定', '檢查更新、下載並驗證後才安裝'],
  ['~/Library/…/Lexicons/active', '啟用新詞庫；驗證失敗就退回內建詞庫'],
]

const ChiaKeyLexicon = () => (
  <MotionSection>
    <SectionHeading en="LEXICON" accent="#78b7ff">詞庫是另一個專案</SectionHeading>
    <Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="start">
      <Stack gap={4} lineHeight="2" opacity={.85}>
        <Text>詞彙資料不進輸入法的程式碼庫。<Code fontSize=".9em" color="#9ac8ff">ChiaKey-Lexicon</Code> 獨立整理台灣用語，更新詞庫不用重裝輸入法。</Text>
        <Text fontSize="sm" opacity={.8}>輸入法安裝後內建一份詞庫當底；使用者資料（自訂詞、選字紀錄）放在 <Code fontSize=".9em" color="#9ac8ff">~/Library/Application Support/ChiaKey</Code>。</Text>
        <Box><ProjectLink href="https://github.com/chiakich/ChiaKey-Lexicon" label="詞庫專案" detail="SQLite" accent="#78b7ff" /></Box>
      </Stack>
      <Stack gap={0} border="1px solid #24394f" backgroundColor="#0b131d">
        {steps.map(([title, description], index) => (
          <Flex key={title} gap={4} p={4} alignItems="baseline" borderBottom={index < steps.length - 1 ? '1px solid #1a2a3c' : 'none'}>
            <Text fontFamily="mono" fontSize="xs" color="#78b7ff" flexShrink={0}>0{index + 1}</Text>
            <Box>
              <Heading fontSize="sm" fontFamily="mono" mb={1}>{title}</Heading>
              <Text fontSize="xs" opacity={.6} lineHeight="1.7">{description}</Text>
            </Box>
          </Flex>
        ))}
      </Stack>
    </Grid>
  </MotionSection>
)

export default ChiaKeyLexicon
