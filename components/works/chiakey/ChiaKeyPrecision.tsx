import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useInView } from 'framer-motion'
import { Box, Container, Flex, HStack, Stack, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'

const Text = styled.p
const Span = styled.span
const Button = styled.button

// 四組都取自 chiaki-tw-homophone-bigram/bigrams.tsv：bopomofo 由資料列的 qstring 解碼，
// fallback 是同讀音下 unigram 權重最高的候選（沒有 bigram 時 walker 會選的詞）。
// 挑選條件有兩個，缺一不可：
//   一、fallback 代進去之後整句是壞的，不能是「也講得通」的另一種說法；
//   二、fallback 自己是高頻常用詞——這樣「把正確的詞加進詞庫就好」才站不住腳，
//       因為正確的詞早就在詞庫裡了，只是權重輸給同音的常用詞。
// 示範內容本身是中文輸入行為，不隨 locale 翻譯。
const examples = [
  {
    bopomofo: ['ㄐㄧㄥ', 'ㄧㄢˋ'],
    previous: '令人',
    fallback: '經驗',
    right: '驚豔',
  },
  {
    bopomofo: ['ㄗㄞˋ', 'ㄗㄨㄛˋ'],
    previous: '需要',
    fallback: '在做',
    right: '再做',
  },
  {
    bopomofo: ['ㄅㄨˊ', 'ㄗㄞˋ'],
    previous: '通常',
    fallback: '不再',
    right: '不在',
  },
  {
    bopomofo: ['ㄅㄧㄢˋ', 'ㄕˋ'],
    previous: '無法',
    fallback: '便是',
    right: '辨識',
  },
  { bopomofo: ['ㄒㄧㄣ', 'ㄐㄧ'], previous: '耍', fallback: '心肌', right: '心機' },
]

const ROW_COUNT = 394363
const HIGHLIGHT = 'linear-gradient(180deg, #a12cae 0%, #5f1069 100%)'

// 進場時從 0 數到 394,363。easeOut 讓尾數停得慢一點，數字才讀得到。
const RowCounter = ({ suffix }: { suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-120px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, ROW_COUNT, {
      duration: 2.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView])

  return (
    <Span
      ref={ref}
      display="flex"
      alignItems="baseline"
      justifyContent="center"
      gap={{ base: 1.5, md: 3 }}
      fontWeight="black"
      letterSpacing="-.04em"
      lineHeight="1"
      fontSize={{ base: '3.6rem', md: '7rem' }}
      style={{
        fontVariantNumeric: 'tabular-nums',
        background: 'linear-gradient(180deg, #ffffff 0%, #d49bff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {value.toLocaleString('en-US')}
      {/* 量詞跟著數字走，字級縮到三分之一才不會跟數字搶重量 */}
      {suffix && (
        <Span
          fontSize={{ base: '1.2rem', md: '2.2rem' }}
          fontWeight="bold"
          letterSpacing="0"
        >
          {suffix}
        </Span>
      )}
    </Span>
  )
}

// 一個字一格：字變了就上下抽換，沒變的字不動。
// 中文字寬固定 1em，格子可以寫死尺寸，抽換時不會把整行推歪。
const ResultChar = ({ char, changed }: { char: string; changed: boolean }) => {
  if (!changed) return <Span>{char}</Span>

  return (
    <Box
      position="relative"
      display="inline-block"
      width="1em"
      height="1.25em"
      verticalAlign="top"
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={char}
          initial={{ opacity: 0, y: '-.42em' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '.42em' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </Box>
  )
}

const ContextDemo = () => {
  const { t } = useI18n()
  const [step, setStep] = useState(0)
  const [corrected, setCorrected] = useState(false)
  // 使用者一動手就停掉自動播放，不要跟他搶控制權。
  const [auto, setAuto] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-80px' })

  // 自動腳本：未套用 1.5 秒 → 套用 2.6 秒 → 換下一個前文（換的瞬間回到未套用）。
  useEffect(() => {
    if (!auto || !inView) return
    const timer = window.setTimeout(
      () => {
        if (corrected) {
          setStep((current) => (current + 1) % examples.length)
          setCorrected(false)
        } else {
          setCorrected(true)
        }
      },
      corrected ? 2600 : 1500
    )
    return () => window.clearTimeout(timer)
  }, [auto, inView, corrected, step])

  const take = (run: () => void) => () => {
    setAuto(false)
    run()
  }
  const { previous, right, fallback, bopomofo } = examples[step]
  const shown = corrected ? right : fallback
  // t() 沒有插值，所以用 placeholder 換字，三份 locale 共用同一組樣板。
  const state = corrected
    ? t('chiakeyPage.precision.stateOn').replace('{p}', previous)
    : t('chiakeyPage.precision.stateOff')
        .replace('{a}', fallback)
        .replace('{b}', right)

  return (
    <Box ref={ref} maxW="720px" mx="auto" w="100%">
      <Box
        borderRadius={{ base: '24px', md: '32px' }}
        border="1px solid rgba(199,125,255,.18)"
        overflow="hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(31,18,48,.92) 0%, rgba(18,10,29,.92) 100%)',
          boxShadow: '0 40px 90px rgba(6,0,16,.6)',
        }}
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          px={{ base: 5, md: 6 }}
          py={3}
          borderBottom="1px solid rgba(255,255,255,.06)"
        >
          <HStack gap={2}>
            {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
              <Box
                key={color}
                width="9px"
                height="9px"
                borderRadius="full"
                style={{ background: color }}
              />
            ))}
          </HStack>
          <HStack gap={1.5}>
            {examples.map((example, position) => (
              <Button
                key={example.right}
                type="button"
                onClick={take(() => {
                  setStep(position)
                  setCorrected(false)
                })}
                aria-pressed={position === step}
                cursor="pointer"
                borderRadius="full"
                px={2.5}
                py={1}
                fontSize="11px"
                letterSpacing=".04em"
                transition="color .25s, background-color .25s"
                color={position === step ? '#e9c6ff' : 'rgba(255,255,255,.34)'}
                backgroundColor={
                  position === step ? 'rgba(199,125,255,.14)' : 'transparent'
                }
                _hover={{ color: '#e9c6ff' }}
              >
                {example.right}
              </Button>
            ))}
          </HStack>
        </Flex>

        {/* 整塊可點：再看一次的門檻越低越好，但它不是開關，所以不長得像開關 */}
        <Button
          type="button"
          onClick={take(() => setCorrected(!corrected))}
          aria-label={t('chiakeyPage.precision.replay')}
          cursor="pointer"
          display="flex"
          flexDirection="column"
          width="100%"
          px={{ base: 5, md: 10 }}
          py={{ base: 9, md: 12 }}
          gap={{ base: 5, md: 6 }}
          alignItems="center"
        >
          <HStack gap={{ base: 2, md: 3 }} minHeight="22px">
            {bopomofo.map((syllable, position) => (
              <Span
                key={`${step}-${position}`}
                fontSize={{ base: '13px', md: 'sm' }}
                letterSpacing=".08em"
                color="rgba(236,220,255,.4)"
              >
                {syllable}
              </Span>
            ))}
          </HStack>

          <Flex
            alignItems="baseline"
            justifyContent="center"
            flexWrap="nowrap"
            fontWeight="bold"
            letterSpacing=".04em"
            lineHeight="1.25"
            fontSize={{ base: '2.1rem', md: '3.2rem' }}
          >
            {/* 前文已經送出了，所以是靜的、暗的；正在被決定的只有後面那兩個字 */}
            <Span color="rgba(255,255,255,.42)" whiteSpace="nowrap">
              {previous}
            </Span>
            <motion.span
              animate={{
                background: corrected ? HIGHLIGHT : 'rgba(255,255,255,.07)',
                color: corrected ? '#ffffff' : 'rgba(255,255,255,.55)',
              }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'inline-block',
                marginLeft: 6,
                padding: '.1em .28em',
                borderRadius: 14,
                whiteSpace: 'nowrap',
              }}
            >
              {shown.split('').map((char, position) => (
                <ResultChar
                  key={position}
                  char={char}
                  changed={fallback[position] !== right[position]}
                />
              ))}
            </motion.span>
          </Flex>

          {/* 狀態說明取代原本的開關：套用前後各自有一句話，位置固定不推版面 */}
          <Box minHeight="22px" position="relative" width="100%">
            <AnimatePresence mode="wait">
              <motion.div
                key={corrected ? 'on' : 'off'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.24 }}
              >
                <Flex alignItems="center" justifyContent="center" gap={2}>
                  <Text
                    fontSize="xs"
                    letterSpacing=".06em"
                    style={{
                      color: corrected ? '#d9b4f7' : 'white',
                    }}
                  >
                    {state}
                  </Text>
                </Flex>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Button>
      </Box>
    </Box>
  )
}

const ChiaKeyPrecision = () => {
  const { t } = useI18n()

  return (
    <Box
      py={{ base: 20, md: 32 }}
      position="relative"
      overflow="hidden"
      background="radial-gradient(ellipse 120% 70% at 50% 0%, #2c1546 0%, #150c24 48%, #0e0716 100%)"
    >
      <Container maxW="1080px" px={{ base: '24px', md: '40px' }}>
        <Stack gap={{ base: 12, md: 16 }} alignItems="center" textAlign="center">
          <Stack gap={{ base: 4, md: 5 }} alignItems="center" maxW="760px">
            <Text
              color="#c77dff"
              fontWeight="bold"
              fontSize="sm"
              letterSpacing=".14em"
              textTransform="uppercase"
            >
              {t('chiakeyPage.precision.english')}
            </Text>
            <RowCounter suffix={t('chiakeyPage.precision.unitSuffix')} />
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              letterSpacing=".08em"
              color="#c9a6e8"
              mt={-1}
              mb={{ base: 2, md: 3 }}
            >
              {t('chiakeyPage.precision.unit')}
            </Text>
            <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" opacity={0.6}>
              {t('chiakeyPage.precision.lead')}
            </Text>
          </Stack>

          <ContextDemo />

          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            lineHeight="1.8"
            opacity={0.45}
            maxW="700px"
          >
            {t('chiakeyPage.precision.limitation')}
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}

export default ChiaKeyPrecision
