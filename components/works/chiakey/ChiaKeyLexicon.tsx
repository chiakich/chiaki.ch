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
  { name: '基底詞庫與外部詞庫', fill: 'rgba(46,32,66,.94)', border: 'rgba(199,125,255,.22)' },
  { name: '專案大詞庫', fill: 'rgba(66,26,84,.86)', border: 'rgba(199,125,255,.32)' },
  { name: '自動熱門詞庫', fill: 'rgba(95,16,105,.78)', border: 'rgba(199,125,255,.45)' },
  { name: '台灣用法校正層', fill: 'rgba(135,36,148,.72)', border: 'rgba(199,125,255,.58)' },
  { name: '使用者詞庫＋學習快取', local: true, fill: 'rgba(178,68,190,.62)', border: 'rgba(236,220,255,.72)' },
]

const dataLayers = [
  {
    name: '相容性基底詞庫',
    goal: '維持 ChiaKey runtime、既有 schema 與模組表的相容性。',
    items: [
      'keykey-boneyard-bootstrap',
      'keykey-punctuations-cin',
      'keykey-module-cin',
      'keykey-prepopulated-service-data',
      'bpmf-ext-cin',
    ],
  },
  {
    name: '外部詞庫',
    goal: '包含新酷音、RIME等輸入法提供，成熟的繁中詞彙與讀音。',
    items: ['libchewing-data', 'rime-essay', 'mozc-emoticon-data'],
  },
  {
    name: '專案詞庫',
    goal: '由我們維護的自製詞庫：修正已知缺漏、指定讀音、調整候選排序，加上台灣用語、合成語料與自動熱門詞提煉的 unigram／bigram 補充。',
    items: [
      'chiaki-modern-overlay',
      'chiaki-auto-hotwords-overlay',
      'chiaki-synthetic-overlay',
      '...',
    ],
  },
  {
    name: '校正層',
    goal: '小型已審查規則，讓預設繁中（zh-TW）輸出符合台灣常用用法。以及校正句段碎片權重上限，抑制偷字造成的錯誤斷詞。',
    items: ['chiaki-rime-conversion-policy', 'chiaki-fragment-denylist'],
  },
]

const localLayers = [
  ['使用者詞庫', 'Shift 選取或 Ctrl+[數字鍵] 加入的自訂詞，留在你的機器上，可匯入匯出。'],
  ['學習快取', '選字紀錄與詞頻。'],
]

const spreadY = (index: number) => 115 - index * 105
const stackedY = (index: number) => 10 - index * 39

const LexiconLayers = () => (
  <Box
    position="relative"
    height={{ base: '450px', md: '450px' }}
    style={{ perspective: '1200px' }}
    overflow={{ base: 'hidden', md: 'visible' }}
  >
    {layers.map(({ name, local, fill, border }, index) => (
      <motion.div
        key={name}
        initial={{ y: spreadY(index), opacity: 0 }}
        whileInView={{ y: stackedY(index), opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: index * 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '42%',
          marginLeft: 'max(-24vw, -210px)',
        }}
      >
        <Box
          width={{ base: '48vw', md: '420px' }}
          height={{ base: '104px', md: '200px' }}
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
            <Text
              fontSize="md"
              fontWeight="700"
              letterSpacing=".08em"
              color="rgba(255,255,255,.92)"
            >
              {name}
            </Text>
            {local && (
              <Text fontSize="10px" color="rgba(236,220,255,.7)">
                · 你的機器
              </Text>
            )}
          </HStack>
        </Box>
      </motion.div>
    ))}
  </Box>
)

const ChiaKeyLexicon = () => (
  <Stack gap={2}>
    <SectionHeading
      en="Lexicon"
      accent="#c77dff"
      center
      sub="詞庫不只是一份單一清單。千秋輸入法的詞庫為了還原手感，融合了多來源詞庫，智慧選擇最適合台灣日常使用的詞彙；裝進你的 Mac 之後，再疊上屬於你的兩層。"
    >
      層層詞庫，更懂你
    </SectionHeading>
    <MotionSection>
      <LexiconLayers />
    </MotionSection>
    <Grid columns={{ base: 1, md: 2 }} gap={4} mt={{ base: 8, md: 12 }}>
      {dataLayers.map(({ name, goal, items }, index) => (
        <MotionSection key={name} delay={index * 0.06}>
          <Box backgroundColor="#150d20" borderRadius="20px" p={6} height="100%">
            <HStack gap={2} mb={2}>
              <Box
                width="9px"
                height="9px"
                borderRadius="full"
                style={{ background: layers[index].border }}
              />
              <Heading fontSize="md">{name}</Heading>
            </HStack>
            <Text fontSize="xs" opacity={0.6} lineHeight="1.9" mb={3}>
              {goal}
            </Text>
            <Flex gap={1.5} flexWrap="wrap">
              {items.map((item) => (
                <Chip
                  key={item}
                  fontFamily="mono"
                  fontSize="10px"
                  backgroundColor="rgba(199,125,255,.08)"
                  color="#cfa9ee"
                  borderRadius="6px"
                  px={2}
                  py={1}
                >
                  {item}
                </Chip>
              ))}
            </Flex>
          </Box>
        </MotionSection>
      ))}
    </Grid>
    <Grid columns={{ base: 1, md: 2 }} gap={4} mt={4}>
      {localLayers.map(([name, description], index) => (
        <MotionSection key={name} delay={index * 0.06}>
          <Box
            borderRadius="20px"
            p={6}
            height="100%"
            border="1px dashed rgba(236,220,255,.35)"
            backgroundColor="rgba(21,13,32,.6)"
          >
            <HStack gap={2} mb={2}>
              <Box
                width="9px"
                height="9px"
                borderRadius="full"
                style={{ background: layers[4].border }}
              />
              <Heading fontSize="md">{name}</Heading>
              <Text fontSize="10px" opacity={0.5}>
                你的機器
              </Text>
            </HStack>
            <Text fontSize="xs" opacity={0.6} lineHeight="1.9">
              {description}
            </Text>
          </Box>
        </MotionSection>
      ))}
    </Grid>
    <MotionSection>
      <Box
        backgroundColor="#150d20"
        borderRadius="24px"
        p={{ base: 6, md: 8 }}
        mt={4}
      >
        <Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
          <Stack gap={3}>
            <Heading fontSize="xl" letterSpacing="-.01em">
              詞庫更新，不用重裝輸入法
            </Heading>
            <Text fontSize="sm" lineHeight="2" opacity={0.7}>
              四個資料層詞庫會在{' '}
              <Code fontSize=".95em" color="#d49bff">
                ChiaKey-Lexicon
              </Code>{' '}
              合成後獨立更新。輸入法會自動檢查最新詞庫並驗證，通過才會啟用。你的自訂詞與選字紀錄則一直留在本機的資料庫。
            </Text>
          </Stack>
          <HStack
            gap={3}
            flexWrap="wrap"
            justifyContent={{ base: 'flex-start', md: 'flex-end' }}
          >
            <ProjectLink
              href="https://github.com/chiakich/ChiaKey-Lexicon"
              label="參與補詞"
              detail="GitHub"
              accent="#c77dff"
            />
          </HStack>
        </Grid>
      </Box>
    </MotionSection>
  </Stack>
)

export default ChiaKeyLexicon
