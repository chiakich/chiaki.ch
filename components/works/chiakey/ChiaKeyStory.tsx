import { Box, Flex, Grid, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'
import { useI18n } from 'i18n'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img
const Code = styled.code
const Link = styled.a

const ChiaKeyStory = () => {
  const { t } = useI18n()
  const lineage = ['2008', '2013', '2026', ''].map((year, index) => [year, t(`chiakeyPage.history.timeline.${index}.title`), t(`chiakeyPage.history.timeline.${index}.description`)])
  const principles = [0, 1, 2].map((index) => [t(`chiakeyPage.history.principles.${index}.title`), t(`chiakeyPage.history.principles.${index}.description`)])

  return (
  <Stack gap={{ base: 14, md: 20 }}>
    <MotionSection>
      <SectionHeading
        en={t('chiakeyPage.history.english')}
        accent="#c77dff"
        center
        sub={t('chiakeyPage.history.description')}
      >
        {t('chiakeyPage.history.title')}
      </SectionHeading>
      <Grid
        columns={{ base: 1, md: 2 }}
        gap={{ base: 8, md: 12 }}
        alignItems="start"
        mt={{ base: 2, md: 6 }}
      >
        <Stack gap={0} pt={2}>
          {lineage.map(([year, title, description], index) => (
            <Flex key={title} gap={5}>
              <Flex
                direction="column"
                alignItems="center"
                width="14px"
                flexShrink={0}
              >
                <Box
                  width="10px"
                  height="10px"
                  borderRadius="full"
                  backgroundColor={
                    index === lineage.length - 1 ? '#c77dff' : '#4c3564'
                  }
                  boxShadow={
                    index === lineage.length - 1 ? '0 0 12px #c77dff' : 'none'
                  }
                  mt="6px"
                />
                {index < lineage.length - 1 && (
                  <Box
                    width="2px"
                    flex="1"
                    backgroundColor="#34244a"
                    minHeight="52px"
                  />
                )}
              </Flex>
              <Box pb={index < lineage.length - 1 ? 6 : 0}>
                <Text
                  fontFamily="mono"
                  fontSize="xs"
                  color="#c77dff"
                  letterSpacing=".2em"
                  mb={1}
                >
                  {year}
                </Text>
                <Heading fontSize="md" mb={1}>
                  {title}
                </Heading>
                <Text fontSize="xs" opacity={0.6} lineHeight="1.8">
                  {description}
                </Text>
              </Box>
            </Flex>
          ))}
        </Stack>
        <Stack gap={4}>
          <Box backgroundColor="#160e23" borderRadius="24px" p={5} overflow="hidden">
            <Image
              src="/assets/works/chiakey/about.webp"
              alt={t('chiakeyPage.history.imageAlt')}
              width="100%"
              display="block"
              borderRadius="12px"
            />
          </Box>
        </Stack>
      </Grid>
    </MotionSection>
    <MotionSection>
      <Text>
        {t('chiakeyPage.history.body')}
      </Text>
    </MotionSection>
    <Grid columns={{ base: 1, md: 3 }} gap={4}>
      {principles.map(([title, description], index) => (
        <MotionSection key={title} delay={index * 0.08}>
          <Box backgroundColor="#150d20" borderRadius="24px" p={7} height="100%">
            <Heading mb={3} fontSize="xl" letterSpacing="-.01em">
              {title}
            </Heading>
            <Text opacity={0.65} lineHeight="1.8" fontSize="sm">
              {description}
            </Text>
          </Box>
        </MotionSection>
      ))}
    </Grid>
  </Stack>
  )
}

export default ChiaKeyStory
