import { Box, Container, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import WorksSubNav from 'components/works/WorksSubNav'
import TokyonoHero from './TokyonoHero'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img

const features = [
  ['LAYOUT', '重新安排河道', '行距、暱稱與大頭貼位置、配色、噗文欄寬都重新調整，時間軸更容易掃讀。'],
  ['GLASS', '背景與介面融合', '即時模糊的半透明面板，讓上傳的背景圖真正成為介面的一部分。'],
  ['RWD', '各種方向都能閱讀', '支援直向螢幕與瀏覽器縮放，排版不會散掉。'],
  ['NIXIE', '數字管卡馬值', '卡馬用自製數字管字體顯示；custom.css 可切換成世界線變動率樣式。'],
]

const TokyonoPage = () => (
  <Box backgroundColor="#081720" color="white" minHeight="100vh">
    <TopBar />
    <WorksSubNav />
    <TokyonoHero />
    <Container
      maxW="1080px"
      px={{ base: '24px', md: '40px' }}
      py={{ base: 16, md: 20 }}
    >
      <Stack gap={20}>
        <MotionSection>
          <SectionHeading en="DESIGN" accent="#8eeaf4">
            一條更舒服的河道
          </SectionHeading>
          <Text
            maxW="760px"
            lineHeight="2"
            fontSize={{ base: 'md', md: 'lg' }}
            opacity={0.78}
          >
            東京乃空不改變噗浪的核心互動，只重畫它的外觀：資訊層級、配色、間距，以及背景與介面的關係。整套佈景是純
            CSS，貼進噗浪的「自訂佈景風格」就會生效。
          </Text>
        </MotionSection>
        <Box>
          <SectionHeading en="DETAILS" accent="#8eeaf4">
            藏在時間軸裡的設計
          </SectionHeading>
          <Grid columns={{ base: 1, md: 2 }} gap={4}>
            {features.map(([en, title, description], index) => (
              <MotionSection key={en} delay={index * 0.06}>
                <Box
                  p={7}
                  height="100%"
                  backgroundColor="rgba(27,52,66,.62)"
                  borderRadius="24px"
                  backdropFilter="blur(12px)"
                >
                  <Text
                    fontFamily="mono"
                    color="#8eeaf4"
                    fontSize="xs"
                    letterSpacing=".18em"
                  >
                    {en}
                  </Text>
                  <Heading fontSize="xl" mt={3} mb={3}>
                    {title}
                  </Heading>
                  <Text opacity={0.7} lineHeight="1.8">
                    {description}
                  </Text>
                </Box>
              </MotionSection>
            ))}
          </Grid>
        </Box>
        <MotionSection>
          <SectionHeading en="SHOWCASE" accent="#8eeaf4">
            實際畫面
          </SectionHeading>
          <Grid columns={{ base: 1, md: 2 }} gap={4} alignItems="start">
            <Stack gap={4}>
              <Box borderRadius="20px" overflow="hidden">
                <Image
                  src="/assets/works/tokyono-sora/profile-karma.webp"
                  alt="毛玻璃個人資料面板與世界線變動率樣式的卡馬值"
                  width="100%"
                  display="block"
                />
              </Box>
              <Box borderRadius="20px" overflow="hidden">
                <Image
                  src="/assets/works/tokyono-sora/karma-nixie.webp"
                  alt="數字管字體顯示的卡馬值特寫"
                  width="100%"
                  display="block"
                />
              </Box>
              <Text fontSize="xs" opacity={0.55} lineHeight="1.7">
                個人資料面板與數字管卡馬值。切換世界線變動率樣式只要多貼一段
                custom.css。
              </Text>
            </Stack>
            <Stack gap={4}>
              <Box borderRadius="20px" overflow="hidden">
                <Image
                  src="/assets/works/tokyono-sora/rwd.webp"
                  alt="直向螢幕的響應式排版"
                  width="100%"
                  display="block"
                />
              </Box>
              <Text fontSize="xs" opacity={0.55} lineHeight="1.7">
                直向螢幕的排版。噗浪欄寬與元件位置會跟著視窗調整。
              </Text>
            </Stack>
          </Grid>
        </MotionSection>
        <MotionSection>
          <SectionHeading en="INSTALL" accent="#8eeaf4">
            貼上一段 CSS 就能使用
          </SectionHeading>
          <Text mb={6} maxW="720px" lineHeight="1.9" opacity={0.75}>
            把主題 CSS 貼到噗浪的「自訂佈景 → 自訂佈景風格」。即時模糊吃
            GPU；沒有硬體加速的機器可以用靜態模糊圖產生器，預先算好背景再套用。另附深色模式與頂欄的擴充
            CSS。
          </Text>
          <HStack gap={3} flexWrap="wrap">
            <ProjectLink
              href="https://github.com/chiakich/Tokyono-Sora/blob/main/TokynoSora.css"
              label="本體 CSS"
              accent="#8eeaf4"
            />
            <ProjectLink
              href="https://chiaki.uk/Tokyono-Sora"
              label="靜態模糊產生器"
              accent="#aef3fb"
            />
            <ProjectLink
              href="https://github.com/chiakich/Tokyono-Sora"
              label="安裝說明"
              accent="#fff"
            />
          </HStack>
        </MotionSection>
      </Stack>
    </Container>
  </Box>
)

export default TokyonoPage
