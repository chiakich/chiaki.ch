import { Box, Container, Flex, Grid, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import SplitFlapHero from './SplitFlapHero'
import dynamic from 'next/dynamic'

const FlapPlayground = dynamic(() => import('./FlapPlayground'), { ssr: false })
const FlapClock = dynamic(() => import('./FlapPlayground').then((m) => m.FlapClock), { ssr: false })
const FlapShowcase = dynamic(() => import('./FlapShowcase'), { ssr: false })

const Heading = styled.h3
const Text = styled.p
const Code = styled.code

const ACCENT = '#ff5d52'

const engineering = [
  ['01', '共用動畫時鐘', '所有翻頁格訂閱同一個 requestAnimationFrame 迴圈，同一幀到期的翻動合併成一次 React commit，幾百格同時翻也只有一次 render。'],
  ['02', '不重建 DOM', '翻頁格保持掛載、不換 key，並交替使用兩組 CSS animation name 直接從第一幀啟動；不需逐格讀寫 Web Animations API。'],
  ['03', '最小化合成層', '只有正在翻動的上下兩片會提升為 GPU 圖層。約 400 格的場景中合成層減少約 70%、GPU 時間減少約 27%。'],
]

const SplitFlapPage = () => (
  <Box backgroundColor="#0b0b0d" color="white" minHeight="100vh">
    <TopBar />
    <SplitFlapHero />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 20 }}>
      <Stack gap={20}>
        <MotionSection>
          <SectionHeading en="IDEA" accent={ACCENT}>
            把パタパタ留在網頁上
          </SectionHeading>
          <Text maxW="760px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={0.78}>
            京急川崎駅的翻頁式發車標在 2022 年退役，機械翻頁的聲音與節奏卻一直很迷人。react-split-flap
            用 CSS transform 重現這種質感：SplitFlap 逐字翻動字串，LongFlap 則能翻整塊
            ReactNode——圖片、圖示、整段排版都可以當成一片字盤。
          </Text>
        </MotionSection>

        <MotionSection>
          <SectionHeading en="PLAYGROUND" accent={ACCENT} sub="打幾個字試試，看看字盤是如何逐格翻到目標字元的。">
            嘗試輸入
          </SectionHeading>
          <FlapPlayground />
        </MotionSection>

        <MotionSection>
          <Grid columns={{ base: 1, md: 2 }} gap={10} alignItems="center">
            <Box>
              <SectionHeading en="ALWAYS LIVE" accent={ACCENT}>
                翻頁時鐘
              </SectionHeading>
              <Text lineHeight="1.9" opacity={0.75}>
                每秒翻動一次的即時時鐘。分頁切到背景時，動畫時鐘會退回粗粒度計時器，回到前景時字盤仍然停在正確的時刻。
              </Text>
            </Box>
            <Flex justifyContent={{ base: 'flex-start', md: 'center' }} overflowX="auto" pb={2}>
              <FlapClock />
            </Flex>
          </Grid>
        </MotionSection>

        <Box>
          <SectionHeading en="ENGINEERING" accent={ACCENT}>
            為大量字盤而生
          </SectionHeading>
          <Grid columns={{ base: 1, md: 3 }} gap={4} mb={12}>
            {engineering.map(([number, title, description], index) => (
              <MotionSection key={number} delay={index * 0.08}>
                <Box backgroundColor="#161215" borderRadius="24px" p={7} height="100%">
                  <Text color={ACCENT} fontWeight="700" fontSize="sm">{number}</Text>
                  <Heading fontSize="xl" my={3} letterSpacing="-.01em">{title}</Heading>
                  <Text opacity={0.65} lineHeight="1.8" fontSize="sm">{description}</Text>
                </Box>
              </MotionSection>
            ))}
          </Grid>
          <MotionSection>
            <Box backgroundColor="#161215" borderRadius="24px" px={{ base: 4, md: 10 }} py={{ base: 8, md: 10 }}>
              <FlapShowcase />
            </Box>
          </MotionSection>
        </Box>

        <MotionSection>
          <SectionHeading en="GET STARTED" accent={ACCENT}>
            馬上試用
          </SectionHeading>
          <Stack gap={4} maxW="640px" mb={7}>
            <Box backgroundColor="#161215" borderRadius="16px" px={6} py={4} fontFamily="monospace" fontSize="sm" lineHeight="2">
              <Text fontSize="10px" letterSpacing=".14em" color="#8b8b93" mb={1} fontFamily="var(--font-body, sans-serif)">TERMINAL</Text>
              <Code display="block"><Code color={ACCENT}>$ </Code>npm install react-split-flap</Code>
            </Box>
            <Box backgroundColor="#161215" borderRadius="16px" px={6} py={4} fontFamily="monospace" fontSize="sm" lineHeight="2">
              <Text fontSize="10px" letterSpacing=".14em" color="#8b8b93" mb={1} fontFamily="var(--font-body, sans-serif)">REACT</Text>
              <Code display="block" color="#8b8b93">{`import { SplitFlap, Presets } from 'react-split-flap'`}</Code>
              <Code display="block">{`<SplitFlap value="HELLO" chars={Presets.ALPHANUM} />`}</Code>
            </Box>
          </Stack>
          <Flex gap={3} flexWrap="wrap">
            <ProjectLink href="https://www.npmjs.com/package/react-split-flap" label="npm" detail="react-split-flap" solid accent={ACCENT} />
            <ProjectLink href="https://github.com/chiakich/react-split-flap" label="GitHub Repository" accent={ACCENT} />
            <ProjectLink href="https://chiakich.github.io/react-split-flap" label="完整 Demo" accent={ACCENT} />
          </Flex>
        </MotionSection>
      </Stack>
    </Container>
  </Box>
)

export default SplitFlapPage
