import Link from 'next/link'
import { motion } from 'framer-motion'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'

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

const WorkCard = ({ work, index }: { work: WorkCardData; index: number }) => (
  <MotionBox initial={{ opacity: 0, y: 38 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .65 }}>
    <Link href={work.href} style={{ display: 'block' }}>
      <Flex direction={{ base: 'column', md: index % 2 ? 'row-reverse' : 'row' }} backgroundColor="#101113" border="1px solid #26272b" overflow="hidden" _hover={{ borderColor: 'var(--accent)', '& .art': { transform: 'scale(1.025)' }, '& .arrow': { transform: 'translateX(6px)' } }} style={{ '--accent': work.accent, transition: 'border-color .3s ease' } as React.CSSProperties}>
        <Box className="art" flex={{ base: 'none', md: '0 0 48%' }} height={{ base: '200px', md: '280px' }} style={{ transition: 'transform .45s ease' }}>{work.specimen}</Box>
        <Flex flex="1" direction="column" justifyContent="center" px={{ base: 6, md: 9 }} py={{ base: 7, md: 8 }} gap={3}>
          <Text fontFamily="mono" fontSize="xs" letterSpacing=".22em" color="var(--accent)" fontWeight="900">{`WORK-${String(index + 1).padStart(2, '0')} // ${work.en}`}</Text>
          <Heading fontSize={{ base: '1.5rem', md: '2rem' }}>{work.title}</Heading>
          <Text lineHeight="1.85" opacity={.8}>{work.description}</Text>
          <HStack gap={2} flexWrap="wrap">{work.tags.map((tag) => <Span key={tag} border="1px solid #38393e" px={2} py={.5} fontSize="xs" opacity={.7}>{tag}</Span>)}</HStack>
          <HStack color="var(--accent)" fontWeight="bold"><Span>查看作品</Span><Span className="arrow" style={{ transition: 'transform .3s ease' }}>→</Span></HStack>
        </Flex>
      </Flex>
    </Link>
  </MotionBox>
)

export default WorkCard
