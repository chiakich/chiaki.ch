import { Box, Container, Grid, Stack, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'

const Heading = styled.h2
const Text = styled.p

const SocietyIntro = () => {
  const { t } = useI18n()

  return <Box
    as="section"
    position="relative"
    overflow="hidden"
    background="linear-gradient(145deg, #120e0b 0%, #060606 58%, #11100d 100%)"
    color="white"
    py={{ base: '96px', md: '160px' }}
  >
    <Box
      position="absolute"
      inset="0"
      opacity=".2"
      pointerEvents="none"
      backgroundImage="radial-gradient(rgba(244, 142, 44, .5) 1px, transparent 1px)"
      backgroundSize="18px 18px"
    />
    <Box
      position="absolute"
      top="-18vw"
      right="-12vw"
      width="42vw"
      height="42vw"
      minW="360px"
      minH="360px"
      borderRadius="full"
      background="radial-gradient(circle, rgba(247, 97, 89, .2), transparent 68%)"
      pointerEvents="none"
    />

    <Container
      position="relative"
      maxW="width.section"
      px={{ base: '28px', md: '40px', lg: '60px' }}
    >
      <Grid
        columns={{ base: 1, md: 12 }}
        gap={{ base: 12, md: 8 }}
        alignItems="start"
      >
        <Stack gridColumn={{ md: 'span 4' }} gap={4}>
          <Text
            color="accentSoft"
            fontFamily="mono"
            fontSize="xs"
            fontWeight="bold"
            letterSpacing=".22em"
          >
            {t('home.eyebrow')}
          </Text>
          <Heading
            fontSize={{ base: '3rem', md: '4.5rem' }}
            lineHeight=".98"
            letterSpacing="-.06em"
          >
            {t('home.title')}
          </Heading>
          <Box width="52px" height="3px" backgroundColor="accent" />
        </Stack>

        <Stack gridColumn={{ md: 'span 7 / span 7' }} gap={{ base: 7, md: 10 }}>
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            lineHeight="1.75"
            fontWeight="regular"
          >
            {t('home.lead')}
          </Text>
          <Text
            maxW="680px"
            fontSize={{ base: 'md', md: 'lg' }}
            lineHeight="2"
            color="rgba(255, 255, 255, .72)"
          >
            {t('home.body')}
          </Text>
        </Stack>
      </Grid>
    </Container>
  </Box>
}

export default SocietyIntro
