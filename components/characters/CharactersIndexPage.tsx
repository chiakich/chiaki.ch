import { m } from 'framer-motion'
import { Box, Container, Stack, styled } from 'styled-system/jsx'
import DepthScrollSection from 'components/index/DepthScrollSection'
import WorkCard, { WorkCardData } from 'components/works/index/WorkCard'
import { PORTRAIT_SRC } from 'components/chiaki/voicebankData'
import { useI18n } from 'i18n'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const Img = styled.img
const MotionBox = m.create(Box)

const ChiakiSpecimen = () => (
  <Box width="100%" height="100%" minH={{ md: '360px' }} position="relative" overflow="hidden" backgroundImage="linear-gradient(180deg, #a9b7c5 0%, #c9d3dc 60%, #edf1f4 100%)">
    <Box position="absolute" top="-5%" right="-3%" width="52%" height="115%" background="linear-gradient(200deg, rgba(223,138,66,.34) 0%, rgba(223,138,66,.08) 65%, transparent 100%)" clipPath="polygon(28% 0, 100% 0, 100% 100%, 0 100%)" />
    <Box position="absolute" inset="0" backgroundImage="radial-gradient(circle, rgba(255,255,255,.9) 1.4px, transparent 2px), radial-gradient(circle, rgba(255,255,255,.6) 1px, transparent 1.4px)" backgroundSize="90px 80px, 52px 48px" />
    <Text aria-hidden position="absolute" left="24px" bottom="20px" fontWeight="bold" fontSize="1.6rem" lineHeight="1.05" letterSpacing=".08em" color="#1b2430">
      CHIAKI<br /><Span fontSize=".8rem" letterSpacing=".2em" color="#a94f0f">VIRTUAL SINGER</Span>
    </Text>
    <Img src={PORTRAIT_SRC} alt="" position="absolute" right="10%" top="18px" width="44%" />
  </Box>
)

const CharactersIndexPage = () => {
  const { t } = useI18n()
  const characters: WorkCardData[] = [
    {
      id: 'chiaki',
      title: t('charactersPage.items.chiaki.title'),
      en: 'CHIAKI',
      description: t('charactersPage.items.chiaki.description'),
      tags: [t('charactersPage.items.chiaki.tag'), 'DiffSinger', t('charactersPage.items.chiaki.tag2')],
      href: '/character/chiaki',
      accent: '#df8a42',
      specimen: <ChiakiSpecimen />,
      cta: t('charactersPage.view'),
    },
  ]

  return (
    <Box backgroundColor="#070708" color="white" minHeight="100vh">
      <DepthScrollSection />
      <Container maxW="1080px" py={{ base: 16, md: 24 }} px={{ base: '24px', md: '40px' }}>
        <MotionBox initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }} mb={16} textAlign="center">
          <Text fontSize="sm" letterSpacing=".14em" color="#f2b47e" fontWeight="bold" textTransform="uppercase" mb={4}>{t('charactersPage.eyebrow')}</Text>
          <Heading fontSize={{ base: '3rem', md: '4.8rem' }} lineHeight={1.05} fontWeight="bold" letterSpacing="-.03em" mb={5}>{t('charactersPage.title')}</Heading>
          <Text maxW="620px" mx="auto" fontSize={{ base: 'md', md: 'lg' }} opacity={.7} lineHeight="1.9">{t('charactersPage.intro')}</Text>
        </MotionBox>
        <Stack gap={10}>{characters.map((character, index) => <WorkCard key={character.id} work={character} index={index} />)}</Stack>
      </Container>
    </Box>
  )
}

export default CharactersIndexPage
