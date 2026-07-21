import { motion } from 'framer-motion'
import { Box, Container, Stack, styled } from 'styled-system/jsx'
import WorkCard, { WorkCardData } from './WorkCard'
import { ChiaKeySpecimen, KumikoSpecimen, SplitFlapSpecimen, TgJpgSpecimen, TokyonoSpecimen } from './WorkSpecimens'
import { useI18n } from 'i18n'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const MotionBox = motion.create(Box)

const WorksIndexPage = () => {
  const { t } = useI18n()
  const works: WorkCardData[] = [
    { id: 'chiakey', title: t('worksPage.items.chiakey.title'), en: 'CHIAKEY', description: t('worksPage.items.chiakey.description'), tags: ['macOS', t('worksPage.items.chiakey.tag'), t('worksPage.items.chiakey.tag2')], href: '/works/chiakey', accent: '#b06ee8', specimen: <ChiaKeySpecimen /> },
    { id: 'kumiko', title: 'Kumiko Font Editor', en: 'FONT EDITOR', description: t('worksPage.items.kumiko.description'), tags: ['React', 'CJK', 'GitHub workflow'], href: '/works/kumiko', accent: '#ffea2f', specimen: <KumikoSpecimen /> },
    { id: 'tokyono-sora', title: t('worksPage.items.tokyono.title'), en: 'PLURK UI', description: t('worksPage.items.tokyono.description'), tags: ['UI Design', 'CSS', 'Plurk'], href: '/works/tokyono-sora', accent: '#68d5e3', specimen: <TokyonoSpecimen /> },
    { id: 'tg-jpg', title: 'tg.jpg', en: 'TELEGRAM BOT', description: t('worksPage.items.tgJpg.description'), tags: ['Rust', 'Telegram', 'Image search'], href: '/works/tg-jpg', accent: '#57b5ff', specimen: <TgJpgSpecimen /> },
    { id: 'split-flap', title: 'react-split-flap', en: 'REACT COMPONENT', description: t('worksPage.items.splitFlap.description'), tags: ['React', 'npm package', 'Animation'], href: '/works/split-flap', accent: '#ff5d52', specimen: <SplitFlapSpecimen /> },
  ]

  return <Box backgroundColor="#070708" color="white" minHeight="100vh">
    <Box pt="96px"><Container maxW="1080px" py={12} px={{ base: '24px', md: '40px' }}>
      <MotionBox initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} mb={16} textAlign="center">
        <Text fontSize="sm" letterSpacing=".14em" color="#7eb6ff" fontWeight="bold" textTransform="uppercase" mb={4}>{t('worksPage.eyebrow')}</Text>
        <Heading fontSize={{ base: '3rem', md: '4.8rem' }} lineHeight={1.05} fontWeight="bold" letterSpacing="-.03em" mb={5}>{t('worksPage.title')}</Heading>
        <Text maxW="620px" mx="auto" fontSize={{ base: 'md', md: 'lg' }} opacity={.7} lineHeight="1.9">{t('worksPage.intro')}</Text>
      </MotionBox>
      <Stack gap={10}>{works.map((work, index) => <WorkCard key={work.id} work={work} index={index} />)}</Stack>
    </Container></Box>
  </Box>
}

export default WorksIndexPage
