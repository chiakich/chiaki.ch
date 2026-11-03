import { useState } from 'react'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { listOf } from './voicebankData'
import { NAVY, CREAM, TERM_COLORS, TERM_STATUSES } from './chiakiData'
import SectionTitle from './SectionTitle'

const Text = styled.p
const Span = styled.span
const Code = styled.code
const Heading4 = styled.h4
const List = styled.ul
const ListItem = styled.li
const Button = styled.button

const FullTerms = () => {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const sections = listOf(t, 'voicebankPage.terms.sections', '.title')
  return (
    <Box mt={6} borderRadius="24px" px={7} pt={7} pb={5} style={{ border: '1.5px solid rgba(34,48,90,.22)' }}>
      <Box id="chiaki-terms" position="relative" maxW="46em" overflow="hidden" fontSize="15px" lineHeight="1.8" color="rgba(34,48,90,.85)" style={{ maxHeight: open ? 'none' : 360 }}>
        <Text fontFamily="mono" fontSize="xs">{t('voicebankPage.terms.updated')}</Text>
        <Text mt={2}>{t('voicebankPage.terms.intro')}</Text>
        {sections.map((title, index) => (
          <Box key={title}>
            <Heading4 mt={7} mb={2} fontSize="md" fontWeight="bold">{title}</Heading4>
            <List listStyleType="disc" pl="1.2em">
              {listOf(t, `voicebankPage.terms.sections.${index}.items`).map((item) => <ListItem key={item} my="6px">{item}</ListItem>)}
            </List>
          </Box>
        ))}
        {!open && <Box aria-hidden position="absolute" left="0" right="0" bottom="0" height="160px" background="linear-gradient(180deg, rgba(255,248,239,0), #fff8ef)" />}
      </Box>
      <Button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="chiaki-terms"
        display="inline-flex"
        alignItems="center"
        minH="48px"
        mt={3}
        px="22px"
        borderRadius="24px"
        fontWeight="bold"
        cursor="pointer"
        style={{ border: `1.5px solid ${NAVY}`, color: NAVY }}
      >
        {t(open ? 'chiakiPage.terms.collapse' : 'chiakiPage.terms.readMore')}
      </Button>
    </Box>
  )
}

const ChiakiTerms = () => {
  const { t } = useI18n()
  return (
    <Box as="section" id="guidelines" scrollMarginTop="96px" mt={{ base: 24, md: '140px' }}>
      <SectionTitle>TERMS</SectionTitle>
      <Grid gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(auto-fill, minmax(270px, 1fr))' }} gap={{ base: 3, md: 4 }}>
        {TERM_STATUSES.map((status, index) => {
          const tone = TERM_COLORS[status]
          return (
            <Box key={index} backgroundColor="white" borderRadius={{ base: '16px', md: '20px' }} p={{ base: 4, md: 6 }} style={{ border: `1.5px solid ${tone.color}` }}>
              <Flex flexDirection={{ base: 'column-reverse', md: 'row' }} alignItems="flex-start" justifyContent="space-between" gap={{ base: 2, md: 3 }} mb="10px">
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" lineHeight="1.4">{t(`chiakiPage.terms.cards.${index}.title`)}</Text>
                <Span flexShrink={0} display="inline-flex" alignItems="center" gap="6px" height="28px" px="10px" borderRadius="14px" fontSize="13px" fontWeight="bold" style={{ backgroundColor: tone.bg, color: tone.color }}>
                  {tone.mark} {t(`chiakiPage.terms.status.${status}`)}
                </Span>
              </Flex>
              <Text fontSize={{ base: '13px', md: '15px' }} lineHeight="1.7" color="rgba(34,48,90,.8)">{t(`chiakiPage.terms.cards.${index}.text`)}</Text>
            </Box>
          )
        })}
      </Grid>
      <Flex mt={6} flexWrap="wrap" alignItems="center" columnGap={4} rowGap="10px" fontSize="15px">
        <Span>{t('chiakiPage.terms.credit')}</Span>
        <Code px="14px" py="6px" borderRadius="8px" fontFamily="mono" fontSize="15px" style={{ backgroundColor: NAVY, color: CREAM }}>Vocal: Chiaki</Code>
      </Flex>
      <FullTerms />
    </Box>
  )
}

export default ChiakiTerms
