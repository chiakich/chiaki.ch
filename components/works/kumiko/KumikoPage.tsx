import { Box, Container, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import KumikoHero from './KumikoHero'
import KumikoIdsDemo from './KumikoIdsDemo'
import KumikoWorkflow from './KumikoWorkflow'
import { useI18n } from 'i18n'

const Heading = styled.h3
const Text = styled.p

const featureLabels = ['ZERO INSTALL', 'UNIVERSAL FORMAT', 'FONT COMPILE', 'OFFLINE DRAFT']

const KumikoPage = () => {
  const { t } = useI18n()
  const features = featureLabels.map((label, index) => [label, t(`kumikoPage.features.${index}.0`), t(`kumikoPage.features.${index}.1`)])
  return <Box backgroundColor="#101114" color="white" minHeight="100vh">
    <TopBar /><KumikoHero />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 20 }}><Stack gap={20}>
      <MotionSection><SectionHeading en="WHY KUMIKO" accent="#ffea2f">{t('kumikoPage.idea')}</SectionHeading><Text maxW="760px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={.78}>{t('kumikoPage.ideaText')}</Text></MotionSection>
      <MotionSection><SectionHeading en="WORKFLOW" accent="#ffea2f">{t('kumikoPage.workflow')}</SectionHeading><Box overflowX="auto"><Box minW="680px"><KumikoWorkflow /></Box></Box></MotionSection>
      <MotionSection><SectionHeading en="IDS ENGINE" accent="#ffea2f">{t('kumikoPage.ids')}</SectionHeading><Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center"><Text lineHeight="2" opacity={.78}>{t('kumikoPage.idsText')}</Text><Box borderRadius="24px" overflow="hidden"><KumikoIdsDemo /></Box></Grid></MotionSection>
      <Box><SectionHeading en="ARCHITECTURE" accent="#ffea2f">{t('kumikoPage.architecture')}</SectionHeading><Grid columns={{ base: 1, md: 2 }} gap={4}>{features.map(([en, title, description], index) => <MotionSection key={en} delay={index * .06}><Box backgroundColor="#18191d" borderRadius="24px" p={7} height="100%"><Text fontFamily="mono" color="#ffea2f" letterSpacing=".18em" fontSize="xs">{en}</Text><Heading mt={3} mb={3} fontSize="xl">{title}</Heading><Text lineHeight="1.8" opacity={.7}>{description}</Text></Box></MotionSection>)}</Grid></Box>
      <MotionSection><SectionHeading en="OPEN SOURCE" accent="#ffea2f">{t('kumikoPage.open')}</SectionHeading><HStack gap={3} flexWrap="wrap"><ProjectLink href="https://kumiko.chiaki.ch" label={t('kumikoPage.tryKumiko')} accent="#ffea2f" /><ProjectLink href="https://github.com/chiakich/kumiko-font-editor" label={t('kumikoPage.source')} detail="MIT" accent="#fff" /></HStack></MotionSection>
    </Stack></Container>
  </Box>
}

export default KumikoPage
