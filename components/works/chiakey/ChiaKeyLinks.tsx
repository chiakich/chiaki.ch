import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'
import { useI18n } from 'i18n'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img

const ChiaKeyLinks = () => {
  const { t } = useI18n()
  const audiences = [0, 1, 2].map((index) => t(`chiakeyPage.download.audiences.${index}`))

  return (
  <MotionSection>
    <SectionHeading en={t('chiakeyPage.download.english')} accent="#c77dff">
      {t('chiakeyPage.download.title')}
    </SectionHeading>
    <Grid columns={{ base: 1, md: 2 }} gap={8}>
      <Stack gap={5}>
        <Text lineHeight="1.9" opacity={0.8}>
          {t('chiakeyPage.download.description')}
        </Text>
        <HStack gap={3} flexWrap="wrap">
          <ProjectLink
            href="https://cdn.chiaki.ch/chiakey/ChiaKey.pkg"
            label={t('chiakeyPage.download.latest')}
            accent="#c77dff"
          />
          <ProjectLink
            href="https://github.com/chiakich/ChiaKey"
            label={t('chiakeyPage.download.source')}
            accent="#e3c8f5"
          />
        </HStack>
        <Text fontSize="xs" opacity={0.48} lineHeight="1.7">
          {t('chiakeyPage.download.disclaimer')}
        </Text>
      </Stack>
      <Box
        backgroundColor="#150d20"
        borderRadius="24px"
        p={7}
        position="relative"
        overflow="hidden"
      >
        <Heading fontSize="lg" mb={5}>
          {t('chiakeyPage.download.audienceTitle')}
        </Heading>
        <Stack gap={4}>
          {audiences.map((item, index) => (
            <HStack key={item} alignItems="start" gap={3}>
              <Text color="#c77dff" fontFamily="mono">
                0{index + 1}
              </Text>
              <Text lineHeight="1.7" opacity={0.78}>
                {item}
              </Text>
            </HStack>
          ))}
        </Stack>
        <Image
          src="/assets/works/chiakey/chiaki.gif"
          alt={t('chiakeyPage.download.imageAlt')}
          position="absolute"
          right="-12px"
          bottom="-36px"
          width="120px"
          opacity={0.24}
        />
      </Box>
    </Grid>
  </MotionSection>
  )
}

export default ChiaKeyLinks
