import Link from 'next/link'
import { motion } from 'framer-motion'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import { localizedPath, useI18n } from 'i18n'

const Heading = styled.h2
const Text = styled.p
const Span = styled.span
const MotionBox = motion.create(Box)

export interface FontCardData {
  id: string
  title: string
  en: string
  description: string
  tags: string[]
  href: string
  specimen: React.ReactNode
}

interface FontCardProps {
  font: FontCardData
  index: number
}

const FontCard = ({ font, index }: FontCardProps) => {
  const { locale, t } = useI18n()

  return <MotionBox initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .65 }}>
    <Link href={localizedPath(font.href, locale)} style={{ display: 'block' }}>
      <Flex
        direction={{ base: 'column', md: index % 2 ? 'row-reverse' : 'row' }}
        backgroundColor="#101010"
        border="1px solid #222"
        overflow="hidden"
        clipPath="polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)"
        _hover={{ borderColor: '#df8a4288', '& .specimen': { transform: 'scale(1.06)' }, '& .arrow': { transform: 'translateX(6px)' } }}
        style={{ transition: 'border-color .3s ease' }}
      >
        <Box flex={{ base: 'none', md: '0 0 46%' }} height={{ base: '180px', md: '260px' }}>{font.specimen}</Box>
        <Flex flex="1" direction="column" justifyContent="center" px={{ base: 6, md: 10 }} py={{ base: 6, md: 8 }} gap={3}>
          <Text fontFamily="mono" fontSize="xs" fontWeight="black" letterSpacing=".25em" color="#df8a42">{`FONT-${String(index + 1).padStart(2, '0')} // ${font.en}`}</Text>
          <Heading fontSize={{ base: '1.4rem', md: '1.8rem' }}>{font.title}</Heading>
          <Text opacity={.8} lineHeight="1.8">{font.description}</Text>
          <HStack gap={2} flexWrap="wrap">{font.tags.map((tag) => <Span key={tag} fontSize="xs" border="1px solid #333" px={2} py={.5} opacity={.7}>{tag}</Span>)}</HStack>
          <HStack color="#df8a42" fontWeight="bold"><Span>{t('fontsPage.view')}</Span><Span className="arrow" style={{ transition: 'transform .3s ease' }}>→</Span></HStack>
        </Flex>
      </Flex>
    </Link>
  </MotionBox>
}

export default FontCard
