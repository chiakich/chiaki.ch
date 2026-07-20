import { Box, Container, Grid, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import TgJpgHero from './TgJpgHero'
import { useI18n } from 'i18n'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img

const TgJpgPage = () => {
  const { t } = useI18n()
  const pipeline = [0, 1, 2].map((index) => [
    String(index + 1).padStart(2, '0'),
    t(`tgJpgPage.steps.${index}.0`),
    t(`tgJpgPage.steps.${index}.1`),
  ])

  return <Box backgroundColor="#08121c" color="white" minHeight="100vh">
    <TgJpgHero />
    <Container
      maxW="1080px"
      px={{ base: '24px', md: '40px' }}
      py={{ base: 16, md: 20 }}
    >
      <Stack gap={20}>
        <MotionSection>
          <SectionHeading en="IDEA" accent="#57b5ff">
            {t('tgJpgPage.idea')}
          </SectionHeading>
          <Text
            maxW="760px"
            fontSize={{ base: 'md', md: 'lg' }}
            lineHeight="2"
            opacity={0.78}
          >
            {t('tgJpgPage.ideaText')}
          </Text>
        </MotionSection>
        <Box>
          <SectionHeading en="PIPELINE" accent="#57b5ff">
            {t('tgJpgPage.pipeline')}
          </SectionHeading>
          <Grid columns={{ base: 1, md: 3 }} gap={4}>
            {pipeline.map(([number, title, description], index) => (
              <MotionSection key={number} delay={index * 0.08}>
                <Box
                  backgroundColor="#111f2d"
                  borderRadius="24px"
                  p={7}
                  height="100%"
                >
                  <Text color="#57b5ff" fontWeight="700" fontSize="sm">
                    {number}
                  </Text>
                  <Heading fontSize="xl" my={3} letterSpacing="-.01em">
                    {title}
                  </Heading>
                  <Text opacity={0.65} lineHeight="1.8" fontSize="sm">
                    {description}
                  </Text>
                </Box>
              </MotionSection>
            ))}
          </Grid>
        </Box>
        <MotionSection>
          <Grid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
            <Box borderRadius="24px" overflow="hidden">
              <Image
                src="/assets/works/tg-jpg/chat.webp"
                alt={t('tgJpgPage.chatAlt')}
                width="100%"
                display="block"
              />
            </Box>
            <Box>
              <SectionHeading en="BUILT WITH RUST" accent="#57b5ff">
                {t('tgJpgPage.rust')}
              </SectionHeading>
              <Text lineHeight="1.9" opacity={0.75} mb={6}>
                {t('tgJpgPage.rustText')}
              </Text>
              <ProjectLink
                href="https://github.com/chiakich/rust-tg.jpg"
                label="GitHub Repository"
                accent="#57b5ff"
              />
            </Box>
          </Grid>
        </MotionSection>
      </Stack>
    </Container>
  </Box>
}

export default TgJpgPage
