import Link from 'next/link'
import { motion } from 'framer-motion'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import { localizedPath, useI18n } from 'i18n'

const Heading = styled.h2
const Text = styled.p
const Span = styled.span
const MotionBox = motion(Box)

export interface WorkCardData {
  id: string
  title: string
  en: string
  description: string
  tags: string[]
  href: string
  accent: string
  specimen: React.ReactNode
}

const WorkCard = ({ work, index }: { work: WorkCardData; index: number }) => {
  const { locale, t } = useI18n()

  return <MotionBox initial={{ opacity: 0, y: 38 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .65 }}>
    <Link href={localizedPath(work.href, locale)} style={{ display: 'block' }}>
      <Flex direction={{ base: 'column', md: index % 2 ? 'row-reverse' : 'row' }} backgroundColor="#131316" borderRadius="28px" overflow="hidden" _hover={{ transform: 'translateY(-4px)', '& .art': { transform: 'scale(1.025)' }, '& .arrow': { transform: 'translateX(6px)' } }} style={{ '--accent': work.accent, transition: 'transform .35s ease' } as React.CSSProperties}>
        <Box className="art" flex={{ base: 'none', md: '0 0 48%' }} height={{ base: '200px', md: '280px' }} style={{ transition: 'transform .45s ease' }}>{work.specimen}</Box>
        <Flex flex="1" direction="column" justifyContent="center" px={{ base: 6, md: 10 }} py={{ base: 7, md: 8 }} gap={3}>
          <Text fontSize="xs" letterSpacing=".14em" color="var(--accent)" fontWeight="700" textTransform="uppercase">{work.en}</Text>
          <Heading fontSize={{ base: '1.5rem', md: '2rem' }} letterSpacing="-.02em">{work.title}</Heading>
          <Text lineHeight="1.85" opacity={.7} fontSize="sm">{work.description}</Text>
          <HStack gap={2} flexWrap="wrap">{work.tags.map((tag) => <Span key={tag} backgroundColor="rgba(255,255,255,.07)" borderRadius="980px" px={3} py={1} fontSize="xs" opacity={.75}>{tag}</Span>)}</HStack>
          <HStack color="var(--accent)" fontWeight="600"><Span>{t('worksPage.view')}</Span><Span className="arrow" style={{ transition: 'transform .3s ease' }}>→</Span></HStack>
        </Flex>
      </Flex>
    </Link>
  </MotionBox>
}

export default WorkCard
