import { NextPage } from 'next'
import Head from 'next/head'
import { Box, Container, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import { motion } from 'framer-motion'
import TopBar from 'components/TopBar'
import FontsSubNav from 'components/FontsSubNav'
import SectionHeading from 'components/works/SectionHeading'
import DownloadButton from 'components/works/DownloadButton'
import HuninnTester from 'components/works/HuninnTester'

const Text = styled.p
const Heading = styled.h1
const Span = styled.span

const MotionBox = motion(Box)

// justfont huninn brand palette — the official page is playfully multicolored
const YELLOW = '#febb27'
const RED = '#ec4618'
const GREEN = '#66ac35'
const BLUE = '#2f72be'
const PAPER = '#eeefe9'

const pearls = [
  { size: 140, top: '10%', left: '6%', delay: 0, color: YELLOW },
  { size: 60, top: '22%', right: '12%', delay: 0.6, color: RED },
  { size: 90, bottom: '14%', left: '14%', delay: 1.2, color: BLUE },
  { size: 46, bottom: '28%', right: '22%', delay: 0.3, color: GREEN },
  { size: 200, bottom: '-10%', right: '-4%', delay: 0.9, color: YELLOW },
]

const features = [
  {
    title: '為台灣而調整',
    en: 'FOR TAIWAN',
    color: RED,
    description:
      '以 Kosugi Maru 與 Varela Round 為基礎，由 justfont 設計師逐字檢視，調整為符合台灣教育部標準與日常使用習慣的字形。',
  },
  {
    title: '完全開源',
    en: 'OPEN SOURCE',
    color: GREEN,
    description:
      'SIL Open Font License 1.1 授權，個人、商用都可以自由使用，也歡迎所有人參與造字與改進。',
  },
  {
    title: '具有日文漢字風格的字形',
    en: 'TRADITIONAL STYLE',
    color: BLUE,
    description:
      '嘗試融合了現代中文與日文漢字的筆畫與偏旁風格，讓整體看起來帶有一點日文風味。',
  },
]

const HuninnPage: NextPage = () => {
  return (
    <Box backgroundColor="black" color="white" minHeight="100vh">
      <Head>
        <title>jf open 粉圓 - 千秋的字體作品</title>
        <meta
          name="description"
          content="在 justfont 時機間參與製作的開源圓體字型「jf open 粉圓」，為台灣使用者設計。"
        />
      </Head>

      <TopBar />
      <FontsSubNav />

      {/* Hero */}
      <Box pt="88px" position="relative" overflow="hidden">
        {/* Floating boba pearls */}
        {pearls.map((p, i) => (
          <MotionBox
            key={i}
            position="absolute"
            width={`${p.size}px`}
            height={`${p.size}px`}
            borderRadius="full"
            border="3px solid var(--pearl)"
            opacity={0.28}
            style={
              {
                top: p.top,
                left: p.left,
                right: p.right,
                bottom: p.bottom,
                '--pearl': p.color,
              } as React.CSSProperties
            }
            animate={{ y: [0, -14, 0] }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
          />
        ))}
        {/* Halftone dots, echoing the about page */}
        <Box
          position="absolute"
          inset="0"
          backgroundImage="radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1.5px)"
          backgroundSize="22px 22px"
          maskImage="linear-gradient(180deg, transparent 20%, black 100%)"
          pointerEvents="none"
        />

        <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 24 }}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            textAlign="center"
            position="relative"
          >
            <Text fontSize="sm" letterSpacing="0.35em" color={YELLOW} fontWeight="bold" mb={5}>
              JF OPEN HUNINN · OPEN SOURCE TYPEFACE
            </Text>
            <Heading
              fontFamily="huninn"
              fontSize={{ base: '4rem', md: '7rem' }}
              lineHeight="1.1"
              fontWeight="normal"
              color={PAPER}
              mb={6}
            >
              粉
              <Span position="relative" display="inline-block">
                <Span
                  position="absolute"
                  inset="0.08em -0.04em 0"
                  backgroundColor={YELLOW}
                  transform="skewX(-8deg)"
                  zIndex={0}
                />
                <Span position="relative" zIndex={1} color="black">
                  圓
                </Span>
              </Span>
              體
            </Heading>
            <Text
              fontFamily="huninn"
              fontSize={{ base: 'lg', md: '2xl' }}
              color={PAPER}
              opacity={0.9}
              mb={2}
            >
              一款免費開源的台灣圓體，像粉圓一樣圓潤可愛。
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} opacity={0.6}>
              中文開源字型專案
            </Text>
          </MotionBox>
        </Container>
      </Box>

      {/* Static specimen band — multicolored like the justfont page */}
      <Box
        backgroundColor="#111"
        borderTop="1px solid #222"
        borderBottom="1px solid #222"
        py={4}
        px={6}
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={{ base: 4, md: 10 }}
        flexWrap="wrap"
        overflow="hidden"
      >
        {[
          { text: '視野無限廣，窗外有藍天', color: YELLOW },
          { text: '像珍珠一樣', color: RED },
          { text: '圓潤有彈性', color: GREEN },
          { text: '打字的好朋友', color: '#4E97F8' },
        ].map((s, i) => (
          <Span
            key={i}
            fontFamily="huninn"
            fontSize={{ base: 'lg', md: '2xl' }}
            color="var(--c)"
            style={{ '--c': s.color } as React.CSSProperties}
            whiteSpace="nowrap"
          >
            {s.text}
          </Span>
        ))}
      </Box>

      <Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}>
        <Stack gap={16}>
          <MotionBox
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeading en="STORY" accent={YELLOW}>
              關於這套字
            </SectionHeading>
            <Stack gap={4} fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={0.9} maxW="720px">
              <Text>
                「jf open 粉圓」是 justfont 發起的開源字型專案：以日本的 Kosugi
                Maru 和拉丁字母的 Varela Round
                為基礎，針對台灣的字形標準與使用習慣重新調整，收錄超過九千個常用字。
              </Text>
              <Text>
                在 justfont
                期間有幸參與了這套字的製作。能夠參與一套真正「所有人都能自由使用」的中文字型，把字體設計的成果開放給整個社群，是一段很難得的經驗。
              </Text>
            </Stack>
          </MotionBox>

          <Box>
            <SectionHeading en="FEATURES" accent={RED}>
              特色
            </SectionHeading>
            <Grid columns={{ base: 1, md: 3 }} gap={4}>
              {features.map((f, i) => (
                <MotionBox
                  key={f.en}
                  backgroundColor="#111"
                  border="1px solid #222"
                  borderTop="3px solid var(--fc)"
                  clipPath="polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)"
                  px={6}
                  py={7}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                  _hover={{ borderColor: 'var(--fc)', transform: 'translateY(-4px)' }}
                  style={
                    {
                      transition: 'transform 0.25s ease, border-color 0.25s ease',
                      '--fc': f.color,
                    } as React.CSSProperties
                  }
                >
                  <Text
                    fontSize="xs"
                    fontWeight="900"
                    letterSpacing="0.25em"
                    color="var(--fc)"
                    mb={2}
                  >
                    {f.en}
                  </Text>
                  <Text fontFamily="huninn" fontSize="xl" color={PAPER} mb={3}>
                    {f.title}
                  </Text>
                  <Text fontSize="sm" lineHeight="1.9" opacity={0.8}>
                    {f.description}
                  </Text>
                </MotionBox>
              ))}
            </Grid>
          </Box>

          <Box>
            <SectionHeading en="TYPE TESTER" accent={GREEN}>
              打打看
            </SectionHeading>
            <Text fontSize={{ base: 'sm', md: 'md' }} opacity={0.7} mb={5}>
              輸入任何想試的字，完整字型會在這裡自動載入。
            </Text>
            <HuninnTester />
          </Box>

          <MotionBox
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeading en="LINKS" accent="#4E97F8">
              下載與更多
            </SectionHeading>
            <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" opacity={0.9} mb={6} maxW="720px">
              粉圓體由 justfont 維護，以 SIL Open Font License 1.1
              釋出。完整介紹與最新版本請見官方頁面。
            </Text>
            <HStack gap={4} flexWrap="wrap">
              <DownloadButton
                href="https://justfont.com/huninn/"
                label="JUSTFONT"
                sub="官方介紹頁"
                accent={PAPER}
                external
              />
              <DownloadButton
                href="https://github.com/justfont/open-huninn-font/releases/latest"
                label="DOWNLOAD"
                sub="GitHub Releases"
                accent={YELLOW}
                external
              />
            </HStack>
            <Text fontSize="sm" opacity={0.5} mt={4}>
              © justfont — SIL Open Font License 1.1
            </Text>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  )
}

export default HuninnPage
