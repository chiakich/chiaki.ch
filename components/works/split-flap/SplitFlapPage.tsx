import { Box, Container, Flex, Grid, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import SplitFlapHero from './SplitFlapHero'
import dynamic from 'next/dynamic'
import { useI18n } from 'i18n'

const FlapPlayground = dynamic(() => import('./FlapPlayground'), { ssr: false })
const FlapClock = dynamic(() => import('./FlapPlayground').then((m) => m.FlapClock), { ssr: false })
const FlapShowcase = dynamic(() => import('./FlapShowcase'), { ssr: false })

const Heading = styled.h3
const Text = styled.p
const Code = styled.code

const ACCENT = '#ff5d52'

const SplitFlapPage = () => {
  const { t } = useI18n()
  const engineering = ['01', '02', '03'].map((number, index) => [number, t(`splitFlapPage.engineering.${index}.title`), t(`splitFlapPage.engineering.${index}.description`)])

  return (
  <Box backgroundColor="#0b0b0d" color="white" minHeight="100vh">
    <SplitFlapHero />
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 16, md: 20 }}>
      <Stack gap={20}>
        <MotionSection>
          <SectionHeading en="IDEA" accent={ACCENT}>
            {t('splitFlapPage.idea')}
          </SectionHeading>
          <Text maxW="760px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" opacity={0.78}>
            {t('splitFlapPage.ideaText')}
          </Text>
        </MotionSection>

        <MotionSection>
          <SectionHeading en="PLAYGROUND" accent={ACCENT} sub={t('splitFlapPage.playgroundDescription')}>
            {t('splitFlapPage.playground')}
          </SectionHeading>
          <FlapPlayground />
        </MotionSection>

        <MotionSection>
          <Grid columns={{ base: 1, md: 2 }} gap={10} alignItems="center">
            <Box>
              <SectionHeading en="ALWAYS LIVE" accent={ACCENT}>
                {t('splitFlapPage.clock')}
              </SectionHeading>
              <Text lineHeight="1.9" opacity={0.75}>
                {t('splitFlapPage.clockText')}
              </Text>
            </Box>
            <Flex justifyContent={{ base: 'flex-start', md: 'center' }} overflowX="auto" pb={2}>
              <FlapClock />
            </Flex>
          </Grid>
        </MotionSection>

        <Box>
          <SectionHeading en="ENGINEERING" accent={ACCENT}>
            {t('splitFlapPage.engineeringTitle')}
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
            {t('splitFlapPage.getStarted')}
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
            <ProjectLink href="https://chiakich.github.io/react-split-flap" label={t('splitFlapPage.fullDemo')} accent={ACCENT} />
          </Flex>
        </MotionSection>
      </Stack>
    </Container>
  </Box>
  )
}

export default SplitFlapPage
