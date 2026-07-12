import { motion } from 'framer-motion'
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'

const Heading = styled.h3
const Text = styled.p
const Code = styled.code

// 查詢時由上而下合成：使用者的資料優先，再落到詞庫與內建資料。
// 陣列順序 = 疊放順序（index 0 在最底層）。
const layers = [
  { name: '內建詞庫', desc: '隨安裝包出廠，第一次啟動就能打', fill: 'rgba(60,42,84,.92)', border: 'rgba(199,125,255,.25)' },
  { name: 'ChiaKey-Lexicon 綜合詞庫', desc: '獨立專案整理台灣用語，SQLite 經 GitHub Release 發佈', fill: 'rgba(95,16,105,.78)', border: 'rgba(199,125,255,.4)' },
  { name: '使用者詞庫', desc: 'Shift 選取或 Ctrl+n 加入的自訂詞，可匯入匯出', fill: 'rgba(161,44,174,.7)', border: 'rgba(199,125,255,.55)' },
  { name: '學習快取', desc: '選字紀錄與詞頻，安全輸入欄位不記錄', fill: 'rgba(199,125,255,.62)', border: 'rgba(236,220,255,.7)' },
]

const spreadY = (index: number) => 175 - index * 118
const stackedY = (index: number) => 60 - index * 40

const LexiconLayers = () => (
  <Box position="relative" height={{ base: '400px', md: '480px' }} style={{ perspective: '1400px' }} overflow="visible">
    {layers.map(({ name, fill, border }, index) => (
      <motion.div
        key={name}
        initial={{ y: spreadY(index), opacity: 0 }}
        whileInView={{ y: stackedY(index), opacity: 1 }}
        viewport={{ once: true, margin: '-120px' }}
        transition={{ duration: 1, delay: index * .16, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'absolute', left: '50%', top: '42%', marginLeft: 'max(-24vw, -210px)' }}
      >
        <Box
          width={{ base: '48vw', md: '420px' }}
          height={{ base: '110px', md: '150px' }}
          borderRadius="22px"
          p={4}
          style={{
            transform: 'rotateX(56deg) rotateZ(-38deg)',
            background: fill,
            border: `1px solid ${border}`,
            boxShadow: '0 30px 60px rgba(10,0,25,.45)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <Text fontSize="xs" fontWeight="700" letterSpacing=".08em" color="rgba(255,255,255,.92)">{name}</Text>
        </Box>
      </motion.div>
    ))}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-120px' }}
      transition={{ duration: .7, delay: .9 }}
      style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)' }}
    >
      <HStack gap={3} backgroundColor="#160e23" borderRadius="980px" px={5} py={2.5} whiteSpace="nowrap">
        <Text fontSize="sm" opacity={.75}>四層合成</Text>
        <Text color="#c77dff">→</Text>
        <Text fontSize="sm" fontWeight="700">候選排序</Text>
      </HStack>
    </motion.div>
  </Box>
)

const ChiaKeyLexicon = () => (
  <Stack gap={2}>
    <SectionHeading
      en="Lexicon"
      accent="#c77dff"
      center
      sub="每一次列出候選，都是四層資料疊在一起的結果——你的選字與自訂詞優先，再落到持續更新的綜合詞庫與內建資料。"
    >
      詞庫，是好幾層疊起來的
    </SectionHeading>
    <MotionSection>
      <LexiconLayers />
    </MotionSection>
    <Grid columns={{ base: 1, md: 4 }} gap={4} mt={{ base: 8, md: 12 }}>
      {[...layers].reverse().map(({ name, desc, border }, index) => (
        <MotionSection key={name} delay={index * .06}>
          <Box backgroundColor="#150d20" borderRadius="20px" p={5} height="100%">
            <HStack gap={2} mb={2}>
              <Box width="9px" height="9px" borderRadius="full" style={{ background: border }} />
              <Heading fontSize="sm">{name}</Heading>
            </HStack>
            <Text fontSize="xs" opacity={.6} lineHeight="1.8">{desc}</Text>
          </Box>
        </MotionSection>
      ))}
    </Grid>
    <MotionSection>
      <Box backgroundColor="#150d20" borderRadius="24px" p={{ base: 6, md: 8 }} mt={4}>
        <Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
          <Stack gap={3}>
            <Heading fontSize="xl" letterSpacing="-.01em">詞庫更新，不用重裝輸入法</Heading>
            <Text fontSize="sm" lineHeight="2" opacity={.7}>綜合詞庫在 <Code fontSize=".95em" color="#d49bff">ChiaKey-Lexicon</Code> 獨立發版：偏好設定裡檢查更新、下載後以 SHA-256 驗證，通過才會啟用到 <Code fontSize=".95em" color="#d49bff">Lexicons/active</Code>；驗證失敗就自動退回內建詞庫。你的自訂詞與選字紀錄則一直留在本機的 <Code fontSize=".95em" color="#d49bff">~/Library/Application Support/ChiaKey</Code>。</Text>
          </Stack>
          <HStack gap={3} flexWrap="wrap" justifyContent={{ base: 'flex-start', md: 'flex-end' }}>
            <ProjectLink href="https://github.com/chiakich/ChiaKey-Lexicon" label="詞庫專案" detail="SQLite" accent="#c77dff" />
          </HStack>
        </Grid>
      </Box>
    </MotionSection>
  </Stack>
)

export default ChiaKeyLexicon
