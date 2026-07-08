import { NextPage } from 'next'
import Head from 'next/head'
import { Box, Container, Flex, HStack, Stack, styled } from 'styled-system/jsx'
import { motion } from 'framer-motion'
import TopBar from 'components/TopBar'
import FontsSubNav from 'components/FontsSubNav'
import SectionHeading from 'components/works/SectionHeading'
import GlyphGrid from 'components/works/GlyphGrid'
import DownloadButton from 'components/works/DownloadButton'

const Text = styled.p
const Span = styled.span

const MotionBox = motion(Box)

// Taiwan Railway livery colors from the original specimen page
const CREAM = '#f6f1de'
const ORANGE = '#f8751b'
const BLUE = '#284b9d'

const GLYPH_GROUPS: { en: string; title: string; chars: string }[] = [
  {
    en: 'LATIN & DIGITS',
    title: '拉丁字母與數字',
    chars: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@',
  },
  {
    en: 'BOPOMOFO',
    title: '注音符號（車種記號）',
    chars: 'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦㄧㄨㄩ',
  },
  {
    en: 'CJK IDEOGRAPHS',
    title: '漢字（表記用字）',
    chars:
      '一三乗乘井仕仙令便保倉内冬分別制勤千半取台名和員喫噸嚢四国堂場夏夜大天定室宮寝小尾岡席年座廣式形復所扇持掌排換援救教料新日旭昭有本札東検槽機水温湯煙熊燈片物特理盛省福秋穂積空立等算管籍米終給置習職自苗荷行表試車道郵配重金釧鉄長門青静風食験高鷹鹿',
  },
  {
    en: 'HALFWIDTH KANA',
    title: '半形片假名',
    chars: 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞ',
  },
  {
    en: 'SYMBOLS',
    title: '符號',
    chars: 'ⅠⅡⅢ①②○➀➁〒',
  },
]

// Only characters that exist in the font may appear in akitra-rendered text
const specimenSamples = [
  '25BH2004',
  'ㄕㄊㄆ 重43 空18',
  '郵便車',
  '40C10108',
  '換算',
]

const AkitraPage: NextPage = () => {
  return (
    <Box backgroundColor="black" color="white" minHeight="100vh">
      <Head>
        <title>台鐵客貨車字體 - 千秋的字體作品</title>
        <meta
          name="description"
          content="基於台鐵客貨車表記文字設計的字體，重現台灣鐵道文化之美。"
        />
      </Head>

      <TopBar />
      <FontsSubNav />

      {/* Hero: tri-color livery panels with a wagon number plate */}
      <Box pt="88px" position="relative" overflow="hidden">
        <Flex height={{ base: '52vh', md: '62vh' }} minHeight="360px">
          {[CREAM, ORANGE, BLUE].map((color, i) => (
            <MotionBox
              key={color}
              flex="1"
              backgroundColor={color}
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </Flex>
        <MotionBox
          position="absolute"
          inset="88px 0 0 0"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Number plate */}
          <Box
            backgroundColor="#20242e"
            border="2px solid rgba(255,255,255,0.85)"
            boxShadow="0 12px 48px rgba(0,0,0,0.55)"
            px={{ base: 8, md: 14 }}
            py={{ base: 5, md: 8 }}
            textAlign="center"
          >
            <Text
              fontFamily="akitra"
              fontSize={{ base: '2.6rem', md: '4.6rem' }}
              lineHeight="1.1"
              color="white"
            >
              <Span fontSize="0.5em" verticalAlign="30%">
                35FPK
              </Span>
              11203
              <Span fontSize="0.5em" verticalAlign="30%">
                ㄒ
              </Span>
            </Text>
            <Text
              fontSize={{ base: '0.9rem', md: '1.2rem' }}
              color={ORANGE}
              mt={2}
              letterSpacing="0.3em"
              fontWeight="bold"
            >
              臺鐵客貨車表記文字
            </Text>
          </Box>
        </MotionBox>
      </Box>

      {/* Static specimen band */}
      <Flex
        backgroundColor="#20242e"
        borderTop="1px solid #333"
        borderBottom="1px solid #333"
        py={4}
        px={6}
        justifyContent="center"
        alignItems="center"
        gap={{ base: 6, md: 12 }}
        flexWrap="wrap"
        overflow="hidden"
      >
        {specimenSamples.map((s, i) => (
          <Span
            key={i}
            fontFamily="akitra"
            fontSize={{ base: 'lg', md: '2xl' }}
            color={i % 3 === 0 ? CREAM : i % 3 === 1 ? ORANGE : '#7f9be0'}
            whiteSpace="nowrap"
          >
            {s}
          </Span>
        ))}
      </Flex>

      <Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}>
        <Stack gap={16}>
          <MotionBox
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeading en="STORY" accent={ORANGE}>
              關於這套字
            </SectionHeading>
            <Stack gap={4} fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={0.9} maxW="720px">
              <Text>
                古早的台鐵客車與貨車車身上，塗著一套獨特的表記文字——車種代號、車號、自重、載重、換算輛數……這些由油漆工人一筆一筆描出來的字，有著手工時代特有的溫度與力道。
              </Text>
              <Text>
                這套字體以台鐵客貨車的表記文字為藍本重新繪製，收錄了車籍表記常用的
                284 個字符：數字與拉丁字母、作為車種記號的注音符號、表記用漢字，以及半形片假名。希望能把這份逐漸消失在鐵道邊的視覺記憶保存下來。
              </Text>
            </Stack>
          </MotionBox>

          {/* Usage example */}
          <MotionBox
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeading en="IN USE" accent={ORANGE}>
              表記範例
            </SectionHeading>
            <Flex
              gap={6}
              flexWrap="wrap"
              backgroundColor="#20242e"
              border="1px solid #333"
              px={{ base: 6, md: 10 }}
              py={{ base: 8, md: 10 }}
              alignItems="center"
              justifyContent="center"
            >
              <Box textAlign="center">
                <Text fontFamily="akitra" fontSize={{ base: '3rem', md: '4rem' }} lineHeight="1">
                  <Span fontSize="0.5em" display="block" textAlign="left" lineHeight="1">
                    25BH
                  </Span>
                  2004
                </Text>
              </Box>
              <Box
                fontFamily="akitra"
                fontSize={{ base: '1rem', md: '1.3rem' }}
                lineHeight="1.8"
                color={CREAM}
                textAlign="center"
              >
                ㄕㄊㄆ
                <br />
                重 43
                <br />
                空 18
              </Box>
              <Box
                fontFamily="akitra"
                fontSize={{ base: '1rem', md: '1.3rem' }}
                color="#7f9be0"
                textAlign="center"
                lineHeight="1.8"
              >
                郵便車
                <br />
                換算1.0
              </Box>
            </Flex>
            <Text fontSize="sm" opacity={0.6} mt={3}>
              車種記號使用注音符號是台鐵獨有的傳統：ㄕ代表守車、ㄊ代表鐵皮、ㄆ代表篷車等等。
            </Text>
          </MotionBox>

          {/* Glyph grids */}
          <Box>
            <SectionHeading en="GLYPHS" accent={ORANGE}>
              字符一覽
            </SectionHeading>
            <Stack gap={10}>
              {GLYPH_GROUPS.map((group) => (
                <Box key={group.en}>
                  <HStack gap={3} mb={4} alignItems="baseline">
                    <Text fontWeight="bold" fontSize="lg">
                      {group.title}
                    </Text>
                    <Text fontSize="xs" letterSpacing="0.2em" opacity={0.5}>
                      {group.en} · {Array.from(group.chars).length} GLYPHS
                    </Text>
                  </HStack>
                  <GlyphGrid chars={group.chars} fontFamily="akitra" accent={ORANGE} />
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Download */}
          <MotionBox
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeading en="DOWNLOAD" accent={ORANGE}>
              下載與授權
            </SectionHeading>
            <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" opacity={0.9} mb={6} maxW="720px">
              以 SIL Open Font License 1.1 釋出，歡迎自由使用於個人與商業專案。
            </Text>
            <HStack gap={4} flexWrap="wrap">
              <DownloadButton
                href="/assets/fonts/AkiTRA-Regular.otf"
                download="AkiTRA-Regular.otf"
                label="DOWNLOAD"
                sub="OTF"
                accent={ORANGE}
              />
              <DownloadButton
                href="https://github.com/chiakich/Chiaki-Taiwan-Railway-font"
                label="GITHUB"
                sub="原始檔"
                accent={CREAM}
                external
              />
            </HStack>
            <Text fontSize="sm" opacity={0.5} mt={4}>
              © 2023 Chiaki.C — SIL Open Font License 1.1
            </Text>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  )
}

export default AkitraPage
