import { Box, Container, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import TokyonoHero from './TokyonoHero'
import { useI18n } from 'i18n'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img

const TokyonoPage = () => {
  const { t } = useI18n()
  const features = ['LAYOUT', 'GLASS', 'RWD', 'NIXIE'].map((name, index) => [name, t(`tokyonoPage.features.${index}.title`), t(`tokyonoPage.features.${index}.description`)])
  return (
  <Box backgroundColor="#081720" color="white" minHeight="100vh">
    <TopBar />
    <TokyonoHero />
    <Container
      maxW="1080px"
      px={{ base: '24px', md: '40px' }}
      py={{ base: 16, md: 20 }}
    >
      <Stack gap={20}>
        <MotionSection>
          <SectionHeading en="DESIGN" accent="#8eeaf4">
            {t('tokyonoPage.design')}
          </SectionHeading>
          <Text
            maxW="760px"
            lineHeight="2"
            fontSize={{ base: 'md', md: 'lg' }}
            opacity={0.78}
          >
            {t('tokyonoPage.designText')}
          </Text>
        </MotionSection>
        <Box>
          <SectionHeading en="DETAILS" accent="#8eeaf4">
            {t('tokyonoPage.details')}
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
            {t('tokyonoPage.showcase')}
          </SectionHeading>
          <Grid columns={{ base: 1, md: 2 }} gap={4} alignItems="start">
            <Stack gap={4}>
              <Box borderRadius="20px" overflow="hidden">
                <Image
                  src="/assets/works/tokyono-sora/profile-karma.webp"
                  alt={t('tokyonoPage.profileAlt')}
                  width="100%"
                  display="block"
                />
              </Box>
              <Box borderRadius="20px" overflow="hidden">
                <Image
                  src="/assets/works/tokyono-sora/karma-nixie.webp"
                  alt={t('tokyonoPage.karmaAlt')}
                  width="100%"
                  display="block"
                />
              </Box>
              <Text fontSize="xs" opacity={0.55} lineHeight="1.7">
                {t('tokyonoPage.profileCaption')}
              </Text>
            </Stack>
            <Stack gap={4}>
              <Box borderRadius="20px" overflow="hidden">
                <Image
                  src="/assets/works/tokyono-sora/rwd.webp"
                  alt={t('tokyonoPage.rwdAlt')}
                  width="100%"
                  display="block"
                />
              </Box>
              <Text fontSize="xs" opacity={0.55} lineHeight="1.7">
                {t('tokyonoPage.rwdCaption')}
              </Text>
            </Stack>
          </Grid>
        </MotionSection>
        <MotionSection>
          <SectionHeading en="INSTALL" accent="#8eeaf4">
            {t('tokyonoPage.install')}
          </SectionHeading>
          <Text mb={6} maxW="720px" lineHeight="1.9" opacity={0.75}>
            {t('tokyonoPage.installText')}
          </Text>
          <HStack gap={3} flexWrap="wrap">
            <ProjectLink
              href="https://github.com/chiakich/Tokyono-Sora/blob/main/TokynoSora.css"
              label={t('tokyonoPage.mainCss')}
              accent="#8eeaf4"
            />
            <ProjectLink
              href="https://chiaki.uk/Tokyono-Sora"
              label={t('tokyonoPage.blurGenerator')}
              accent="#aef3fb"
            />
            <ProjectLink
              href="https://github.com/chiakich/Tokyono-Sora"
              label={t('tokyonoPage.installGuide')}
              accent="#fff"
            />
          </HStack>
        </MotionSection>
      </Stack>
    </Container>
  </Box>
  )
}

export default TokyonoPage
