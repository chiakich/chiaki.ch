import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import DownloadButton from 'components/fonts/shared/DownloadButton'
import HuninnTester from 'components/fonts/shared/HuninnTester'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'
import { HUNINN, huninnFeatures } from './huninnTheme'

const Heading = styled.h3
const Text = styled.p

const HuninnSections = () => <Stack gap={16}>
  <MotionSection><SectionHeading en="STORY" accent={HUNINN.yellow}>關於這套字</SectionHeading><Stack gap={4} maxW="720px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.9}><Text>「jf open 粉圓」是 justfont 發起的開源字型專案，以 Kosugi Maru 和 Varela Round 為基礎，針對台灣字形標準與使用習慣重新調整。</Text><Text>在 justfont 期間有幸參與製作。能把字體設計成果開放給整個社群，是一段很難得的經驗。</Text></Stack></MotionSection>
  <Box><SectionHeading en="FEATURES" accent={HUNINN.red}>特色</SectionHeading><Grid columns={{ base: 1, md: 3 }} gap={4}>{huninnFeatures.map((feature, index) => <MotionSection key={feature.en} delay={index * .08}><Box backgroundColor="#111" border="1px solid #222" borderTop="3px solid var(--feature-color)" p={6} height="100%" style={{ '--feature-color': feature.color } as React.CSSProperties}><Text fontSize="xs" letterSpacing=".2em" color="var(--feature-color)">{feature.en}</Text><Heading fontFamily="huninn" fontSize="xl" color={HUNINN.paper} my={3}>{feature.title}</Heading><Text fontSize="sm" lineHeight="1.9" opacity={.8}>{feature.description}</Text></Box></MotionSection>)}</Grid></Box>
  <Box><SectionHeading en="TYPE TESTER" accent={HUNINN.green}>打打看</SectionHeading><Text opacity={.7} mb={5}>輸入任何想試的字，完整字型會在這裡自動載入。</Text><HuninnTester /></Box>
  <MotionSection><SectionHeading en="LINKS" accent="#4E97F8">下載與更多</SectionHeading><Text fontSize="lg" lineHeight="1.9" opacity={.9} mb={6}>粉圓體由 justfont 維護，以 SIL Open Font License 1.1 釋出。</Text><HStack gap={4} flexWrap="wrap"><DownloadButton href="https://justfont.com/huninn/" label="JUSTFONT" sub="官方介紹頁" accent={HUNINN.paper} external /><DownloadButton href="https://github.com/justfont/open-huninn-font/releases/latest" label="DOWNLOAD" sub="GitHub Releases" accent={HUNINN.yellow} external /></HStack></MotionSection>
</Stack>

export default HuninnSections
