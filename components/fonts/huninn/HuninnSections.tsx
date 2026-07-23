import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import DownloadButton from 'components/fonts/shared/DownloadButton'
import HuninnTester from 'components/fonts/shared/HuninnTester'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'
import { HUNINN, huninnFeatures } from './huninnTheme'
import { useI18n } from 'i18n'

const Heading = styled.h3
const Text = styled.p

const HuninnSections = () => {
  const { t } = useI18n()
  return <Stack gap={16}>
    <MotionSection><SectionHeading en="STORY" accent={HUNINN.yellow}>{t('huninnPage.story')}</SectionHeading><Stack gap={4} maxW="720px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.9}><Text>{t('huninnPage.storyP1')}</Text><Text>{t('huninnPage.storyP2')}</Text></Stack></MotionSection>
    <Box><SectionHeading en="FEATURES" accent={HUNINN.red}>{t('huninnPage.features')}</SectionHeading><Grid columns={{ base: 1, md: 3 }} gap={4}>{huninnFeatures.map((feature, index) => <MotionSection key={feature.en} delay={index * .08}><Box backgroundColor="#211c16" borderRadius="20px" p={6} height="100%" style={{ '--feature-color': feature.color } as React.CSSProperties}><Box width="44px" height="8px" borderRadius="full" backgroundColor="var(--feature-color)" mb={4} /><Text fontSize="xs" letterSpacing=".2em" color="var(--feature-color)">{feature.en}</Text><Heading fontFamily="huninn" fontSize="xl" my={3} style={{ color: HUNINN.paper }}>{t(`huninnPage.featureCards.${index}.title`)}</Heading><Text fontSize="sm" lineHeight="1.9" opacity={.8}>{t(`huninnPage.featureCards.${index}.description`)}</Text></Box></MotionSection>)}</Grid></Box>
    <Box><SectionHeading en="TYPE TESTER" accent={HUNINN.green}>{t('huninnPage.tester')}</SectionHeading><Text opacity={.7} mb={5}>{t('huninnPage.testerDescription')}</Text><HuninnTester /></Box>
    <MotionSection><SectionHeading en="LINKS" accent="#4E97F8">{t('huninnPage.more')}</SectionHeading><Text fontSize="lg" lineHeight="1.9" opacity={.9} mb={6}>{t('huninnPage.license')}</Text><HStack gap={4} flexWrap="wrap"><DownloadButton href="https://justfont.com/huninn/" label="JUSTFONT" sub={t('huninnPage.official')} accent={HUNINN.paper} external /><DownloadButton href="https://github.com/justfont/open-huninn-font/releases/latest" label="DOWNLOAD" sub="GitHub Releases" accent={HUNINN.yellow} external /></HStack></MotionSection>
  </Stack>
}

export default HuninnSections
