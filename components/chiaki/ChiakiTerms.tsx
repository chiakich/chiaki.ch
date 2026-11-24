import { useState } from 'react'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { listOf } from './voicebankData'
import { DUSK_TERMS, INK, PAPER, SNOW, TERM_COLORS, TERM_STATUSES } from './chiakiData'
import { Container, Reveal } from './parts'
import SectionTitle from './SectionTitle'

const Text = styled.p
const Span = styled.span
const Code = styled.code
const Heading3 = styled.h3
const Heading4 = styled.h4
const List = styled.ul
const ListItem = styled.li
const Button = styled.button

const FullTerms = () => {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const sections = listOf(t, 'voicebankPage.terms.sections', '.title')
  return (
    <Box mt={6} px={{ base: 5, md: 7 }} pt={7} pb={5} style={{ border: '1.5px solid rgba(22,28,38,.3)', backgroundColor: 'rgba(247,249,250,.6)' }}>
      {/* A mask, not a coloured overlay, since the dusk gradient still shows through the translucent panel */}
      <Box id="chiaki-terms" position="relative" maxW="46em" overflow="hidden" fontSize="15px" lineHeight="1.8" style={{ maxHeight: open ? 'none' : 360, maskImage: open ? undefined : 'linear-gradient(180deg, black 200px, transparent)' }}>
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
        px={6}
        borderRadius="999px"
        fontSize="15px"
        fontWeight="bold"
        cursor="pointer"
        style={{ border: `1.5px solid ${INK}` }}
      >
        {t(open ? 'chiakiPage.terms.collapse' : 'chiakiPage.terms.readMore')}
      </Button>
    </Box>
  )
}

const ChiakiTerms = () => {
  const { t } = useI18n()
  return (
    <Box as="section" id="terms" scrollMarginTop="72px" style={{ backgroundImage: DUSK_TERMS }}>
      <Container pt={{ base: 20, md: '130px' }} pb={{ base: 10, md: 20 }}>
        <Reveal>
          <SectionTitle index="06" sub={t('chiakiPage.sections.terms')} gap="56px">TERMS</SectionTitle>
        </Reveal>

        <Grid gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(auto-fill, minmax(270px, 1fr))' }} gap={{ base: 3, md: 4 }}>
          {TERM_STATUSES.map((status, index) => {
            const tone = TERM_COLORS[status]
            return (
              <Reveal key={index} delay={index * 0.04} p={{ base: 4, md: 6 }} style={{ backgroundColor: PAPER, border: `1.5px solid ${tone.color}` }}>
                <Flex flexDirection={{ base: 'column-reverse', md: 'row' }} alignItems="flex-start" justifyContent="space-between" gap={{ base: 2, md: 3 }} mb="10px">
                  <Heading3 fontSize={{ base: 'md', md: '19px' }} fontWeight="bold" lineHeight="1.4">{t(`chiakiPage.terms.cards.${index}.title`)}</Heading3>
                  <Span flexShrink={0} display="inline-flex" alignItems="center" gap="6px" height="28px" px="10px" fontSize="13px" fontWeight="bold" style={{ backgroundColor: tone.bg, color: tone.color }}>
                    {tone.mark} {t(`chiakiPage.terms.status.${status}`)}
                  </Span>
                </Flex>
                <Text fontSize={{ base: '13px', md: '15px' }} lineHeight="1.7">{t(`chiakiPage.terms.cards.${index}.text`)}</Text>
              </Reveal>
            )
          })}
        </Grid>

        <Flex mt={7} flexWrap="wrap" alignItems="center" columnGap={4} rowGap="10px" fontSize="15px">
          <Span>{t('chiakiPage.terms.credit')}</Span>
          <Code px="14px" py="6px" fontFamily="mono" fontSize="15px" style={{ backgroundColor: INK, color: SNOW }}>Vocal: Chiaki</Code>
        </Flex>
        <FullTerms />
      </Container>
    </Box>
  )
}

export default ChiakiTerms
