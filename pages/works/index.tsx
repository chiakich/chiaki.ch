import { NextPage } from 'next'
import Link from 'next/link'
import { Box, Container, Flex, HStack, Stack, styled } from 'styled-system/jsx'
import { motion } from 'framer-motion'
import TopBar from '../../components/TopBar'
import FontsSubNav from '../../components/FontsSubNav'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span

const MotionBox = motion(Box)

const ACCENT = '#df8a42'

interface FontWork {
  id: string
  title: string
  en: string
  description: string
  tags: string[]
  link: string
  specimen: React.ReactNode
}

// Live type specimens rendered in each font as the card artwork
const AkitraSpecimen = () => (
  <Box
    position="relative"
    width="100%"
    height="100%"
    backgroundColor="#20242e"
    display="flex"
    alignItems="center"
    justifyContent="center"
    overflow="hidden"
  >
    {/* Taiwan Railway tri-color stripe */}
    <Box position="absolute" top="0" left="0" right="0" height="10px" display="flex">
      <Box flex="1" backgroundColor="#f6f1de" />
      <Box flex="1" backgroundColor="#f8751b" />
      <Box flex="1" backgroundColor="#284b9d" />
    </Box>
    <Text
      className="specimen"
      fontFamily="akitra"
      fontSize={{ base: '3rem', md: '4.2rem' }}
      color="white"
      style={{ transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
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
      position="absolute"
      bottom={3}
      right={4}
      fontFamily="akitra"
      fontSize="sm"
      color="#f8751b"
      opacity={0.9}
    >
      重43 空18 ㄕㄊㄆ
    </Text>
  </Box>
)

const NixieSpecimen = () => (
  <Box
    position="relative"
    width="100%"
    height="100%"
    backgroundColor="#050505"
    display="flex"
    alignItems="center"
    justifyContent="center"
    overflow="hidden"
  >
    <Text
      className="specimen"
      position="relative"
      fontFamily="nixie"
      fontSize={{ base: '3.4rem', md: '4.6rem' }}
      color="#ff9b28"
      animation="nixieShine 0.17s infinite"
      textShadow="0px 0px 6px rgba(255,65,0,0.7), 0px 0px 20px #ff8000, 0px 0px 10px rgb(118,18,3)"
      style={{ transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      <Span
        position="absolute"
        inset="0"
        opacity={0.25}
        color="rgba(222,169,89,0.38)"
        aria-hidden
      >
        $$$$$$
      </Span>
      0.1234
    </Text>
  </Box>
)

const HuninnSpecimen = () => (
  <Box
    position="relative"
    width="100%"
    height="100%"
    backgroundColor="#342c2c"
    display="flex"
    alignItems="center"
    justifyContent="center"
    overflow="hidden"
  >
    {/* Boba pearls */}
    {[
      { size: '90px', top: '-24px', left: '-20px', opacity: 0.35, color: '#febb27' },
      { size: '46px', bottom: '18px', left: '12%', opacity: 0.3, color: '#ec4618' },
      { size: '120px', bottom: '-48px', right: '-30px', opacity: 0.35, color: '#66ac35' },
      { size: '30px', top: '20px', right: '18%', opacity: 0.4, color: '#4E97F8' },
    ].map((p, i) => (
      <Box
        key={i}
        position="absolute"
        width={p.size}
        height={p.size}
        borderRadius="full"
        border="3px solid var(--pearl)"
        style={
          {
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            opacity: p.opacity,
            '--pearl': p.color,
          } as React.CSSProperties
        }
      />
    ))}
    <Text
      className="specimen"
      fontFamily="huninn"
      fontSize={{ base: '3.2rem', md: '4.4rem' }}
      color="#febb27"
      style={{ transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      粉圓體
    </Text>
  </Box>
)

const works: FontWork[] = [
  {
    id: 'akitra',
    title: '台鐵客貨車字體',
    en: 'AKITRA FONT',
    description:
      '基於台鐵客貨車表記文字設計的字體。收錄車種代號、車號、載重等常見表記，重現台灣鐵道文化的視覺記憶。',
    tags: ['自製字體', 'SIL OFL 1.1', '284 字符'],
    link: '/works/akitra',
    specimen: <AkitraSpecimen />,
  },
  {
    id: 'nixie',
    title: 'Nixie 數字字體',
    en: 'AKINIXIE FONT',
    description:
      '重現輝光管（Nixie Tube）顯示器溫暖橙光的數字字體，適合時鐘、計數器等復古科技感的場景。',
    tags: ['自製字體', 'CC BY-SA 4.0', '數字專用'],
    link: '/works/nixie',
    specimen: <NixieSpecimen />,
  },
  {
    id: 'huninn',
    title: 'jf open 粉圓',
    en: 'OPEN HUNINN',
    description:
      '在 justfont 參與製作的開源圓體字型。以 Kosugi Maru 為基礎、針對台灣的使用習慣調整，像珍珠一樣圓潤有彈性。',
    tags: ['參與設計', 'SIL OFL 1.1', 'justfont'],
    link: '/works/huninn',
    specimen: <HuninnSpecimen />,
  },
]

const FontsIndex: NextPage = () => {
  return (
    <Box backgroundColor="black" color="white" minHeight="100vh">
      <TopBar />
      <FontsSubNav />

      <Box pt="88px">
        <Container maxW="1080px" py={12} px={{ base: '24px', md: '40px' }}>
          <MotionBox
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            mb={14}
          >
            <Text
              fontFamily="mono"
              fontSize="sm"
              letterSpacing="0.35em"
              color={ACCENT}
              fontWeight="bold"
              mb={3}
            >
              WORKS&nbsp;&nbsp;//&nbsp;&nbsp;TYPEFACES
            </Text>
            <Heading
              fontSize={{ base: '3rem', md: '4.5rem' }}
              lineHeight={1.05}
              letterSpacing="-0.02em"
              fontWeight="900"
              mb={5}
            >
              作品
              <Span position="relative" display="inline-block" mx="0.08em">
                <Span
                  position="absolute"
                  inset="0.05em -0.08em -0.02em"
                  backgroundColor={ACCENT}
                  transform="skewX(-8deg)"
                  zIndex={0}
                />
                <Span position="relative" zIndex={1} color="black">
                  集
                </Span>
              </Span>
            </Heading>
            <Box
              width="180px"
              height="8px"
              mb={5}
              background={`repeating-linear-gradient(-45deg, ${ACCENT} 0 10px, transparent 10px 20px)`}
            />
            <Text fontSize={{ base: 'md', md: 'lg' }} maxW="560px" opacity={0.85} lineHeight="1.9">
              這裡收錄了我設計與參與開發的字體作品，每一款都承載著不同的故事與理念。
            </Text>
          </MotionBox>

          <Stack gap={10}>
            {works.map((work, i) => (
              <MotionBox
                key={work.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={work.link} style={{ display: 'block' }}>
                  <Flex
                    direction={{ base: 'column', md: i % 2 ? 'row-reverse' : 'row' }}
                    backgroundColor="#101010"
                    border="1px solid #222"
                    clipPath="polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)"
                    overflow="hidden"
                    cursor="pointer"
                    _hover={{
                      borderColor: `${ACCENT}88`,
                      '& .specimen': { transform: 'scale(1.06)' },
                      '& .cta-arrow': { transform: 'translateX(6px)' },
                    }}
                    style={{ transition: 'border-color 0.3s ease' }}
                  >
                    <Box
                      flex={{ base: 'none', md: '0 0 46%' }}
                      height={{ base: '180px', md: '260px' }}
                    >
                      {work.specimen}
                    </Box>
                    <Flex
                      flex="1"
                      direction="column"
                      justifyContent="center"
                      px={{ base: 6, md: 10 }}
                      py={{ base: 6, md: 8 }}
                      gap={3}
                    >
                      <Text
                        fontFamily="mono"
                        fontSize="xs"
                        fontWeight="900"
                        letterSpacing="0.25em"
                        color={ACCENT}
                      >
                        {`TYPE-${String(i + 1).padStart(2, '0')} // ${work.en}`}
                      </Text>
                      <Heading as="h2" fontSize={{ base: '1.4rem', md: '1.8rem' }} fontWeight="bold">
                        {work.title}
                      </Heading>
                      <Text fontSize={{ base: 'sm', md: 'md' }} opacity={0.8} lineHeight="1.8">
                        {work.description}
                      </Text>
                      <HStack gap={2} mt={1} flexWrap="wrap">
                        {work.tags.map((tag) => (
                          <Span
                            key={tag}
                            fontSize="xs"
                            border="1px solid #333"
                            borderRadius="2px"
                            px={2}
                            py={0.5}
                            opacity={0.7}
                          >
                            {tag}
                          </Span>
                        ))}
                      </HStack>
                      <HStack gap={2} mt={2} color={ACCENT} fontSize="sm" fontWeight="bold">
                        <Span>查看介紹</Span>
                        <Span
                          className="cta-arrow"
                          style={{ transition: 'transform 0.3s ease' }}
                        >
                          →
                        </Span>
                      </HStack>
                    </Flex>
                  </Flex>
                </Link>
              </MotionBox>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default FontsIndex
