import { motion } from 'framer-motion'
import { Box, Flex, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'

const Heading = styled.h3
const Text = styled.p
const Code = styled.code
const Chip = styled.span

// ChiaKey-Lexicon 的四個資料層（release builder 依固定順序疊加），
// 裝到使用者機器上之後，runtime 再疊上使用者詞庫與學習快取。
// 陣列順序 = 疊放順序（index 0 在最底層）。
const layers: { name: string; local?: boolean; fill: string; border: string }[] = [
  { name: '相容性基底詞庫', fill: 'rgba(46,32,66,.94)', border: 'rgba(199,125,255,.22)' },
  { name: '外部詞庫', fill: 'rgba(66,26,84,.86)', border: 'rgba(199,125,255,.32)' },
  { name: '專案詞庫', fill: 'rgba(95,16,105,.78)', border: 'rgba(199,125,255,.45)' },
  { name: '校正層', fill: 'rgba(135,36,148,.72)', border: 'rgba(199,125,255,.58)' },
  { name: '使用者詞庫', local: true, fill: 'rgba(161,44,174,.66)', border: 'rgba(236,220,255,.65)' },
  { name: '學習快取', local: true, fill: 'rgba(199,125,255,.6)', border: 'rgba(236,220,255,.8)' },
]

const dataLayers = [
  {
    name: '相容性基底詞庫',
    goal: '維持 ChiaKey runtime、既有 schema 與模組表的相容性——KeyKey 時代的 database reader 與輸入模組需要的原始資料。',
    items: ['keykey-boneyard-bootstrap', 'keykey-punctuations-cin', 'keykey-module-cin', 'keykey-prepopulated-service-data', 'bpmf-ext-cin'],
  },
  {
    name: '外部詞庫',
    goal: '可審查、可再散布的現代繁中詞彙與讀音覆蓋。',
    items: ['libchewing-data', 'rime-essay', 'mozc-emoticon-data'],
  },
  {
    name: '專案詞庫',
    goal: '專案維護的小型 overlay：修正已知輸入缺漏、指定讀音、調整候選排序，加上網路用語、合成語料與 Common Voice 句料的 unigram／bigram 補充。',
    items: ['chiaki-modern-overlay', 'chiaki-auto-hotwords-overlay', 'chiaki-symbols-overlay', 'chiaki-web-overlay', 'chiaki-synthetic-overlay', 'openformosa-common-voice-25-zh-tw'],
  },
  {
    name: '校正層',
    goal: '小型已審查規則，讓預設繁中（zh-TW）輸出符合語言與地區期待：OpenCC t2tw 之後的 Rime 例外（地名「里」、「里肌」），以及句段碎片權重上限，抑制偷字造成的錯誤斷詞。',
    items: ['chiaki-rime-conversion-policy', 'chiaki-fragment-denylist'],
  },
]

const localLayers = [
  ['使用者詞庫', 'Shift 選取或 Ctrl+n 加入的自訂詞，留在你的機器上，可匯入匯出。'],
  ['學習快取', '選字紀錄與詞頻。安全輸入欄位不記錄。'],
]

const spreadY = (index: number) => 250 - index * 100
const stackedY = (index: number) => 90 - index * 36

const LexiconLayers = () => (
  <Box position="relative" height={{ base: '520px', md: '600px' }} style={{ perspective: '1400px' }} overflow="visible">
    {layers.map(({ name, local, fill, border }, index) => (
      <motion.div
        key={name}
        initial={{ y: spreadY(index), opacity: 0 }}
        whileInView={{ y: stackedY(index), opacity: 1 }}
        viewport={{ once: true, margin: '-120px' }}
        transition={{ duration: 1, delay: index * .14, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'absolute', left: '50%', top: '42%', marginLeft: 'max(-24vw, -210px)' }}
      >
        <Box
          width={{ base: '48vw', md: '420px' }}
          height={{ base: '104px', md: '140px' }}
          borderRadius="22px"
          p={4}
          style={{
            transform: 'rotateX(56deg) rotateZ(-38deg)',
            background: fill,
            border: `1px ${local ? 'dashed' : 'solid'} ${border}`,
            boxShadow: '0 30px 60px rgba(10,0,25,.45)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <HStack gap={2}>
            <Text fontSize="xs" fontWeight="700" letterSpacing=".08em" color="rgba(255,255,255,.92)">{name}</Text>
            {local && <Text fontSize="10px" color="rgba(236,220,255,.7)">· 你的機器</Text>}
          </HStack>
        </Box>
      </motion.div>
    ))}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-120px' }}
      transition={{ duration: .7, delay: 1.1 }}
      style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)' }}
    >
      <HStack gap={3} backgroundColor="#160e23" borderRadius="980px" px={5} py={2.5} whiteSpace="nowrap">
        <Text fontSize="sm" opacity={.75}>依固定順序疊加</Text>
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
      sub="詞庫不是一份單一清單。ChiaKey-Lexicon 把資料分成四層，release builder 依固定順序疊加、避免互相覆蓋造成不可追蹤；裝進你的 Mac 之後，再疊上屬於你的兩層。"
    >
      詞庫，是好幾層疊起來的
    </SectionHeading>
    <MotionSection>
      <LexiconLayers />
    </MotionSection>
    <Grid columns={{ base: 1, md: 2 }} gap={4} mt={{ base: 8, md: 12 }}>
      {dataLayers.map(({ name, goal, items }, index) => (
        <MotionSection key={name} delay={index * .06}>
          <Box backgroundColor="#150d20" borderRadius="20px" p={6} height="100%">
            <HStack gap={2} mb={2}>
              <Box width="9px" height="9px" borderRadius="full" style={{ background: layers[index].border }} />
              <Heading fontSize="md">{name}</Heading>
            </HStack>
            <Text fontSize="xs" opacity={.6} lineHeight="1.9" mb={3}>{goal}</Text>
            <Flex gap={1.5} flexWrap="wrap">
              {items.map((item) => (
                <Chip key={item} fontFamily="mono" fontSize="10px" backgroundColor="rgba(199,125,255,.08)" color="#cfa9ee" borderRadius="6px" px={2} py={1}>{item}</Chip>
              ))}
            </Flex>
          </Box>
        </MotionSection>
      ))}
    </Grid>
    <Grid columns={{ base: 1, md: 2 }} gap={4} mt={4}>
      {localLayers.map(([name, description], index) => (
        <MotionSection key={name} delay={index * .06}>
          <Box borderRadius="20px" p={6} height="100%" border="1px dashed rgba(236,220,255,.35)" backgroundColor="rgba(21,13,32,.6)">
            <HStack gap={2} mb={2}>
              <Box width="9px" height="9px" borderRadius="full" style={{ background: layers[4 + index].border }} />
              <Heading fontSize="md">{name}</Heading>
              <Text fontSize="10px" opacity={.5}>你的機器</Text>
            </HStack>
            <Text fontSize="xs" opacity={.6} lineHeight="1.9">{description}</Text>
          </Box>
        </MotionSection>
      ))}
    </Grid>
    <MotionSection>
      <Box backgroundColor="#150d20" borderRadius="24px" p={{ base: 6, md: 8 }} mt={4}>
        <Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
          <Stack gap={3}>
            <Heading fontSize="xl" letterSpacing="-.01em">詞庫更新，不用重裝輸入法</Heading>
            <Text fontSize="sm" lineHeight="2" opacity={.7}>四個資料層在 <Code fontSize=".95em" color="#d49bff">ChiaKey-Lexicon</Code> 合成 SQLite 後獨立發版：偏好設定裡檢查更新、下載後以 SHA-256 驗證，通過才會啟用到 <Code fontSize=".95em" color="#d49bff">Lexicons/active</Code>；驗證失敗就自動退回內建詞庫。你的自訂詞與選字紀錄一直留在本機的 <Code fontSize=".95em" color="#d49bff">~/Library/Application Support/ChiaKey</Code>。</Text>
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
