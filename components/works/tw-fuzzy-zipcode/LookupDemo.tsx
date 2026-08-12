import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { Box, Flex, HStack, Stack, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'

const Text = styled.p
const Span = styled.span

const ACCENT = '#3fcf8e'
const INK = '#2a2724'
const POST_RED = '#b8362b'
const POST_BLUE = '#2b4c9b'
const PAPER = '#f3ecdd'

// 地址、郵遞區號與英譯都是套件的實際輸出，各語系共用；只有徽章與說明走 i18n。
// segments 是比對後補完的地址：added 為套件補回的片段，fixed 為正規化過的字。
interface Segment {
  text: string
  added?: boolean
  fixed?: boolean
}

interface Example {
  address: string
  segments: Segment[]
  zipcode: string
  english: string
}

export const EXAMPLES: Example[] = [
  {
    address: '臺北市信義區市府路1號',
    segments: [{ text: '臺北市信義區市府路1號' }],
    zipcode: '110204',
    english: 'No. 1, Shifu Rd., Xinyi Dist., Taipei City 110204, Taiwan (R.O.C.)',
  },
  {
    address: '台北市秀山街',
    segments: [
      { text: '臺', fixed: true },
      { text: '北市' },
      { text: '中正區', added: true },
      { text: '秀山街' },
    ],
    zipcode: '100005',
    english: 'Xiushan St., Zhongzheng Dist., Taipei City 100005, Taiwan (R.O.C.)',
  },
  {
    address: '松江路100號',
    segments: [{ text: '臺北市中山區', added: true }, { text: '松江路100號' }],
    zipcode: '104091',
    english: 'No. 100, Songjiang Rd., Zhongshan Dist., Taipei City 104091, Taiwan (R.O.C.)',
  },
  {
    address: '基隆愛三路郵局第5號信箱',
    segments: [{ text: '基隆愛三路郵局第5號信箱' }],
    zipcode: '200900',
    english: 'P.O. Box 5, Keelung Ai 3rd Road, Keelung City 200900, Taiwan (R.O.C.)',
  },
  {
    address: '松山區',
    segments: [{ text: '臺北市', added: true }, { text: '松山區' }],
    zipcode: '105',
    english: 'Songshan Dist., Taipei City 105, Taiwan (R.O.C.)',
  },
]

// found 之後的節奏：先補完地址，再落郵遞區號，最後蓋郵戳、浮出英譯。
const FILL_DELAY = 0.15
const ZIP_DELAY = 0.75
const POSTMARK_DELAY = 1.25
const ENGLISH_DELAY = 1.45

// phase: 0..address.length = 打字中（值 = 已打字數）、'found' = 補完並查到郵遞區號
type Phase = number | 'found'

const holdFor = (phase: Phase) => {
  if (phase === 'found') return 4200
  return phase === 0 ? 600 : 90
}

const Caret = () => (
  <m.span
    animate={{ opacity: [1, 1, 0, 0] }}
    transition={{ duration: 1, repeat: Infinity, times: [0, .5, .5, 1] }}
    style={{ display: 'inline-block', width: 2, height: '1em', verticalAlign: '-.1em', backgroundColor: INK }}
  />
)

// 補完後的地址：套件補回的片段像郵務人員用紅筆填上去那樣撐開，其餘文字順勢右移。
const CompletedAddress = ({ segments }: { segments: Segment[] }) => {
  let addedCount = 0

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.added) {
          const delay = FILL_DELAY + addedCount++ * 0.12
          return (
            <m.span
              key={index}
              initial={{ width: 0, opacity: 0, color: POST_RED }}
              animate={{ width: 'auto', opacity: 1, color: INK }}
              transition={{
                width: { duration: .45, delay, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: .45, delay },
                color: { duration: .5, delay: delay + 0.7 },
              }}
              style={{ display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}
            >
              {segment.text}
            </m.span>
          )
        }
        if (segment.fixed) {
          return (
            <m.span
              key={index}
              initial={{ color: POST_RED }}
              animate={{ color: INK }}
              transition={{ duration: .5, delay: FILL_DELAY + 0.6 }}
              style={{ display: 'inline-block' }}
            >
              {segment.text}
            </m.span>
          )
        }
        return <span key={index}>{segment.text}</span>
      })}
    </>
  )
}

// 信封左上角印好的六格郵遞區號框
const ZipBox = ({ value, index }: { value?: string; index: number }) => (
  <Box
    width={{ base: '22px', md: '26px' }}
    height={{ base: '28px', md: '34px' }}
    display="flex"
    alignItems="center"
    justifyContent="center"
    fontFamily="monospace"
    fontSize={{ base: 'md', md: 'lg' }}
    fontWeight="bold"
    style={{ border: `1px solid ${POST_RED}`, borderRadius: 2, color: INK }}
  >
    {value && (
      <m.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, delay: ZIP_DELAY + index * 0.07 }}>
        {value}
      </m.span>
    )}
  </Box>
)

const Stamp = () => (
  <Box
    flexShrink={0}
    p="3px"
    style={{ backgroundColor: '#ece3d0', border: `1px dashed ${INK}55`, transform: 'rotate(2.5deg)' }}
  >
    <Stack
      gap={1}
      width={{ base: '52px', md: '62px' }}
      height={{ base: '64px', md: '76px' }}
      alignItems="center"
      justifyContent="center"
      style={{ border: `1px solid ${POST_RED}`, background: 'linear-gradient(160deg,#f7f1e3,#e7dcc4)' }}
    >
      <svg width="30" height="26" viewBox="0 0 30 26" fill="none" stroke={POST_BLUE} strokeWidth="1.4" strokeLinejoin="round">
        <rect x="2" y="6" width="26" height="17" rx="1.5" />
        <path d="M2 8l13 8 13-8" />
      </svg>
      <Span fontSize="7px" letterSpacing=".12em" style={{ color: INK }}>TAIWAN</Span>
      <Span fontSize="9px" fontWeight="bold" style={{ color: POST_RED }}>3+3</Span>
    </Stack>
  </Box>
)

// 動畫元素本身就是絕對定位的那一層：包一層會做 transform 的 motion div 會把它變成
// 定位基準，動畫結束、transform 移除時郵戳就會整個跳位。
const Postmark = () => (
  <m.div
    initial={{ opacity: 0, scale: 1.5, rotate: -22 }}
    animate={{ opacity: .45, scale: 1, rotate: -12 }}
    transition={{ duration: .32, delay: POSTMARK_DELAY, ease: [0.22, 1, 0.36, 1] }}
    style={{
      position: 'absolute',
      right: '58%',
      top: -6,
      width: 64,
      height: 64,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      border: `2px solid ${POST_BLUE}`,
      color: POST_BLUE,
      pointerEvents: 'none',
    }}
  >
    <Span fontSize="13px" fontWeight="bold" letterSpacing=".04em">3+3</Span>
    <Span fontSize="6px" letterSpacing=".16em">ZIPCODE</Span>
    <Box width="72%" mt="2px" style={{ borderTop: `1px solid ${POST_BLUE}` }} />
    <Span fontSize="6px" letterSpacing=".14em" mt="2px">TAIWAN</Span>
  </m.div>
)

const LookupDemo = () => {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(0)
  const example = EXAMPLES[index]

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (phase === 'found') {
        setIndex((current) => (current + 1) % EXAMPLES.length)
        setPhase(0)
      } else {
        setPhase(phase < example.address.length ? phase + 1 : 'found')
      }
    }, holdFor(phase))
    return () => window.clearTimeout(timer)
  }, [phase, example.address.length])

  const typed = phase === 'found' ? example.address : example.address.slice(0, phase)
  const found = phase === 'found'

  return (
    <Stack gap={5} maxW="660px" width="100%" mx="auto">
      {/* 航空郵件斜紋邊框包住信封紙面 */}
      <Box
        p={{ base: '8px', md: '10px' }}
        borderRadius="6px"
        style={{
          background: `repeating-linear-gradient(45deg, ${POST_RED} 0 10px, ${PAPER} 10px 20px, ${POST_BLUE} 20px 30px, ${PAPER} 30px 40px)`,
          boxShadow: '0 34px 90px rgba(0,0,0,.5)',
        }}
      >
        <Box
          position="relative"
          px={{ base: 5, md: 8 }}
          py={{ base: 5, md: 7 }}
          minHeight={{ base: '300px', md: '340px' }}
          overflow="hidden"
          style={{
            background: `linear-gradient(150deg, #f7f2e6, ${PAPER} 55%, #e6dcc8)`,
            color: INK,
          }}
        >
          {/* 背面封口的折線 */}
          <Box
            position="absolute"
            style={{
              inset: 0,
              backgroundImage: `linear-gradient(to bottom right, transparent calc(50% - .5px), ${INK}14 50%, transparent calc(50% + .5px)), linear-gradient(to bottom left, transparent calc(50% - .5px), ${INK}14 50%, transparent calc(50% + .5px))`,
              backgroundSize: '50.5% 100%',
              backgroundPosition: 'left top, right top',
              backgroundRepeat: 'no-repeat',
              pointerEvents: 'none',
            }}
          />

          <Flex justifyContent="space-between" alignItems="flex-start" gap={4} position="relative">
            <Box>
              <Text fontSize="10px" letterSpacing=".18em" mb={2} style={{ color: `${INK}99` }}>
                {t('zipcodePage.demo.zipLabel')}
              </Text>
              <HStack gap={{ base: 1, md: 1.5 }}>
                {Array.from({ length: 6 }, (_, position) => (
                  <ZipBox
                    key={position}
                    index={position}
                    value={found ? example.zipcode[position] : undefined}
                  />
                ))}
              </HStack>
            </Box>
            <Box position="relative">
              <Stamp />
              {found && (
                <Postmark />
              )}
            </Box>
          </Flex>

          <Box position="relative" mt={{ base: 8, md: 10 }} pl={{ base: 0, md: 10 }}>
            <Text fontSize="10px" letterSpacing=".18em" mb={3} style={{ color: `${INK}99` }}>
              {t('zipcodePage.demo.recipient')}
            </Text>
            <Text fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.6" minHeight="1.6em">
              {found ? <CompletedAddress segments={example.segments} /> : typed}
              {!found && <Caret />}
            </Text>
            <Box minHeight={{ base: '58px', md: '46px' }} mt={3}>
              {found && (
                <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: ENGLISH_DELAY }}>
                  <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    lineHeight="1.7"
                    fontFamily="monospace"
                    style={{ color: `${INK}b0` }}
                  >
                    {example.english}
                  </Text>
                </m.div>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <HStack gap={3} flexWrap="wrap" justifyContent="center" minHeight="28px">
        {found && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3, delay: ENGLISH_DELAY }}>
            <HStack gap={3} flexWrap="wrap" justifyContent="center">
              <Span
                fontSize="xs"
                fontWeight="bold"
                borderRadius="980px"
                px={3}
                py={1}
                color={ACCENT}
                style={{ border: '1px solid rgba(63,207,142,.4)' }}
              >
                {t(`zipcodePage.demo.sources.${index}`)}
              </Span>
              <Text fontSize="sm" opacity={.6}>{t(`zipcodePage.demo.notes.${index}`)}</Text>
            </HStack>
          </m.div>
        )}
      </HStack>
    </Stack>
  )
}

export default LookupDemo
