import { motion } from 'framer-motion'
import { Box, Container, Stack, styled } from 'styled-system/jsx'
import FontCard, { FontCardData } from './FontCard'
import { AkitraSpecimen, HuninnSpecimen, NixieSpecimen } from './FontSpecimens'
import { useI18n } from 'i18n'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const MotionBox = motion.create(Box)

const FontsIndexPage = () => {
  const { t } = useI18n()
  const fonts: FontCardData[] = [
    { id: 'akitra', title: t('fontsPage.items.akitra.title'), en: 'AKITRA', description: t('fontsPage.items.akitra.description'), tags: [t('fontsPage.items.akitra.tags.0'), 'SIL OFL 1.1', t('fontsPage.items.akitra.tags.1')], href: '/fonts/akitra', specimen: <AkitraSpecimen /> },
    { id: 'nixie', title: t('fontsPage.items.nixie.title'), en: 'AKINIXIE', description: t('fontsPage.items.nixie.description'), tags: [t('fontsPage.items.nixie.tags.0'), 'CC BY-SA 4.0', t('fontsPage.items.nixie.tags.1')], href: '/fonts/nixie', specimen: <NixieSpecimen /> },
    { id: 'huninn', title: t('fontsPage.items.huninn.title'), en: 'OPEN HUNINN', description: t('fontsPage.items.huninn.description'), tags: [t('fontsPage.items.huninn.tags.0'), 'SIL OFL 1.1', 'justfont'], href: '/fonts/huninn', specimen: <HuninnSpecimen /> },
  ]

  return <Box backgroundColor="black" color="white" minHeight="100vh">
    <Box pt="96px">
      <Container maxW="1080px" py={12} px={{ base: '24px', md: '40px' }}>
        <MotionBox initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} mb={14}>
          <Text fontFamily="mono" fontSize="sm" letterSpacing=".35em" color="#df8a42" fontWeight="bold" mb={3}>{t('fontsPage.eyebrow')}</Text>
          <Heading fontSize={{ base: '3rem', md: '4.5rem' }} lineHeight={1.05} fontWeight="black" mb={5}>{t('fontsPage.title')}</Heading>
          <Box width="180px" height="8px" mb={5} background="repeating-linear-gradient(-45deg, #df8a42 0 10px, transparent 10px 20px)" />
          <Text maxW="600px" fontSize={{ base: 'md', md: 'lg' }} opacity={.85} lineHeight="1.9">{t('fontsPage.intro')}</Text>
        </MotionBox>
        <Stack gap={10}>{fonts.map((font, index) => <FontCard key={font.id} font={font} index={index} />)}</Stack>
      </Container>
    </Box>
  </Box>
}

export default FontsIndexPage
