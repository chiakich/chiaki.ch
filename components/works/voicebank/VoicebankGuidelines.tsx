import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { IMPROVE_EMAIL } from './voicebankData'
import { listOf } from './VoicebankDownloads'

const Heading = styled.h2
const Heading3 = styled.h3
const Text = styled.p
const Span = styled.span
const Link = styled.a
const List = styled.ul
const OrderedList = styled.ol
const ListItem = styled.li
const Details = styled.details
const Summary = styled.summary

export const VoicebankImprove = () => {
  const { t } = useI18n()
  return (
    <Flex id="improve" scrollMarginTop="96px" mt={12} backgroundColor="#1b2430" color="white" borderRadius="24px" p={{ base: 7, md: 11 }} flexWrap="wrap" alignItems="center" justifyContent="space-between" columnGap={10} rowGap={6}>
      <Flex flex="1 1 420px" minW="0" direction="column" gap="10px">
        <Span fontFamily="'Jost', sans-serif" fontSize="xs" fontWeight="medium" letterSpacing=".14em" color="#df8a42">HELP IMPROVE PRONUNCIATION</Span>
        <Heading3 fontSize="xl" fontWeight="bold">{t('voicebankPage.improve.title')}</Heading3>
        <Text fontSize="sm" lineHeight="1.9">{t('voicebankPage.improve.text')}</Text>
      </Flex>
      <Link href={`mailto:${IMPROVE_EMAIL}`} display="inline-flex" alignItems="center" gap="14px" minH="60px" px={8} borderRadius="30px" backgroundColor="white" color="#1b2430" fontFamily="'Jost', sans-serif" fontSize="md" fontWeight="medium" letterSpacing=".06em">
        {IMPROVE_EMAIL}
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="#a94f0f" strokeWidth="1.8" aria-hidden><path d="M1.5 2.5h15v11h-15z" /><path d="M1.5 2.5L9 9l7.5-6.5" /></svg>
      </Link>
    </Flex>
  )
}

const Terms = () => {
  const { t } = useI18n()
  const sections = listOf(t, 'voicebankPage.terms.sections', '.title')
  return (
    <Details mt={4} border="2px solid #1b2430" borderRadius="20px">
      <Summary display="flex" alignItems="center" justifyContent="space-between" gap={4} px={{ base: 6, md: 8 }} py={6} cursor="pointer" listStyle="none" css={{ '&::-webkit-details-marker': { display: 'none' } }}>
        <Span display="flex" flexDirection="column">
          <Span fontFamily="'Jost', sans-serif" fontSize="xs" letterSpacing=".14em">TERMS OF USE</Span>
          <Span fontSize="lg" fontWeight="bold">{t('voicebankPage.guidelines.fullTerms')}</Span>
        </Span>
        <Span aria-hidden color="#a94f0f" fontSize="1.4rem" transition="transform .2s ease" css={{ 'details[open] &': { transform: 'rotate(45deg)' } }}>+</Span>
      </Summary>
      <Box px={{ base: 6, md: 8 }} pb={8} maxW="52em">
        <Text fontFamily="mono" fontSize="xs" color="#4a5563">{t('voicebankPage.terms.updated')}</Text>
        <Text mt={3} lineHeight="1.9">{t('voicebankPage.terms.intro')}</Text>
        {sections.map((title, index) => (
          <Box key={title} mt={7}>
            <Heading3 fontWeight="bold" fontSize="md" mb={2}>{title}</Heading3>
            <OrderedList listStyleType="decimal" pl="1.4em" display="flex" flexDirection="column" gap={2}>
              {listOf(t, `voicebankPage.terms.sections.${index}.items`).map((item) => <ListItem key={item} lineHeight="1.9" fontSize="sm">{item}</ListItem>)}
            </OrderedList>
          </Box>
        ))}
      </Box>
    </Details>
  )
}

const VoicebankGuidelines = () => {
  const { t } = useI18n()
  return (
    <Box as="section" id="guidelines" pt={{ base: 20, md: '120px' }} scrollMarginTop="96px">
      <Heading fontFamily="'Jost', sans-serif" fontWeight="medium" fontSize={{ base: '3rem', md: 'clamp(3rem, 7vw, 6.1rem)' }} lineHeight="1" letterSpacing=".04em">GUIDELINES</Heading>
      <Text mt="14px" fontSize="xl" fontWeight="bold">{t('voicebankPage.guidelines.title')}</Text>

      <Grid mt={10} gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
        <Flex direction="column" gap={4} backgroundColor="white" borderRadius="24px" p="30px">
          <Span fontFamily="'Jost', sans-serif" fontSize="sm" fontWeight="medium" letterSpacing=".14em" color="#a94f0f">YOU MAY</Span>
          <List listStyleType="disc" pl="1.2em" lineHeight="2">
            {listOf(t, 'voicebankPage.guidelines.may').map((item) => <ListItem key={item}>{item}</ListItem>)}
          </List>
        </Flex>
        <Flex direction="column" gap={4} backgroundColor="#1b2430" color="white" borderRadius="24px" p="30px">
          <Span fontFamily="'Jost', sans-serif" fontSize="sm" fontWeight="medium" letterSpacing=".14em" color="#df8a42">YOU MAY NOT</Span>
          <List listStyleType="disc" pl="1.2em" lineHeight="2">
            {listOf(t, 'voicebankPage.guidelines.mayNot').map((item) => <ListItem key={item}>{item}</ListItem>)}
          </List>
        </Flex>
      </Grid>

      <Flex mt={4} direction="column" gap="6px" px="30px" py="22px" borderRadius="20px" backgroundColor="#d6dee6">
        <Span fontFamily="'Jost', sans-serif" fontSize="xs" letterSpacing=".14em">CREDIT</Span>
        <Span fontFamily="'Jost', sans-serif" fontSize="1.4rem" fontWeight="medium">Vocal: Chiaki</Span>
      </Flex>

      <Terms />
    </Box>
  )
}

export default VoicebankGuidelines
