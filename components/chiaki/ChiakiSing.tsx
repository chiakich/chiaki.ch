import type { ReactNode } from 'react'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { DOWNLOADS, listOf } from './voicebankData'
import { NAVY, CREAM, RUST } from './chiakiData'
import SectionTitle from './SectionTitle'

const Text = styled.p
const Span = styled.span
const Link = styled.a
const OrderedList = styled.ol
const ListItem = styled.li
const Details = styled.details
const Summary = styled.summary

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v9M4 7l4 4 4-4M2 14h12" /></svg>
)

const DownloadButton = ({ href, label, primary = false }: { href: string | null; label: string; primary?: boolean }) => {
  const { t } = useI18n()
  const style = primary
    ? { backgroundColor: NAVY, color: CREAM, border: 0 }
    : { backgroundColor: '#ffffff', color: NAVY, border: `1.5px solid ${NAVY}` }
  const shared = { display: 'inline-flex', alignItems: 'center', gap: '10px', minH: '52px', px: 6, borderRadius: '26px', fontWeight: 'bold', textDecoration: 'none' } as const
  if (!href) {
    return (
      <Span {...shared} opacity={.5} cursor="not-allowed" aria-disabled="true" style={style}>
        <DownloadIcon />{label}<Span fontSize="xs" fontWeight="regular">{t('voicebankPage.comingSoon')}</Span>
      </Span>
    )
  }
  return <Link href={href} {...shared} style={style}><DownloadIcon />{label}</Link>
}

const Steps = ({ steps }: { steps: string[] }) => (
  <OrderedList display="grid" gap="10px" lineHeight="1.7">
    {steps.map((step, index) => (
      <ListItem key={step} display="flex" gap="14px" alignItems="baseline">
        <Span fontFamily="'Jost', var(--cjk), sans-serif" fontSize="sm" fontWeight="medium" style={{ color: RUST }}>{String(index + 1).padStart(2, '0')}</Span>
        <Span>{step}</Span>
      </ListItem>
    ))}
  </OrderedList>
)

const AltCard = ({ title, desc, steps, children }: { title: string; desc: string; steps: string[]; children: ReactNode }) => (
  <Box backgroundColor="white" borderRadius="20px" p={7}>
    <Text fontFamily="'Jost', var(--cjk), sans-serif" fontSize="1.75rem" fontWeight="medium">{title}</Text>
    <Text mt={2} mb={5} fontSize="15px" lineHeight="1.8" color="rgba(34,48,90,.8)">{desc}</Text>
    <Steps steps={steps} />
    <Flex mt={6} flexWrap="wrap" gap="10px">{children}</Flex>
  </Box>
)

const ChiakiSing = () => {
  const { t } = useI18n()
  return (
    <Box as="section" id="download" scrollMarginTop="96px" mt={{ base: 24, md: '140px' }}>
      <SectionTitle>SING WITH ME</SectionTitle>

      <Flex flexWrap="wrap" columnGap={14} rowGap={8} backgroundColor="white" borderRadius="24px" p={{ base: 6, md: 12 }} boxShadow="0 10px 32px rgba(34,48,90,.06)">
        <Box flex="1 1 380px" minW="0">
          <Text fontFamily="'Jost', var(--cjk), sans-serif" fontSize={{ base: '2rem', md: 'clamp(2rem, 4vw, 3.25rem)' }} fontWeight="medium" lineHeight="1.1">OpenUtau-Chiaki</Text>
          <Text mt="14px" mb={7} fontSize="17px" lineHeight="1.8" maxW="30em">{t('voicebankPage.app.desc')}</Text>
          <Flex flexWrap="wrap" gap="10px">
            <DownloadButton href={DOWNLOADS.appMac} label="macOS" primary />
            <DownloadButton href={DOWNLOADS.appWindows} label="Windows" primary />
          </Flex>
        </Box>
        <Box flex="1 1 320px" minW="0" alignSelf="center">
          <Steps steps={listOf(t, 'voicebankPage.app.steps')} />
        </Box>
      </Flex>

      <Details mt={4} borderRadius="24px" style={{ border: '1.5px solid rgba(34,48,90,.22)' }}>
        <Summary display="flex" alignItems="center" justifyContent="space-between" gap={4} minH="64px" px={7} fontSize="17px" fontWeight="bold" cursor="pointer" listStyle="none" css={{ '&::-webkit-details-marker': { display: 'none' } }}>
          {t('chiakiPage.sing.otherEditors')}
          <Span aria-hidden display="flex" transition="transform .2s ease" css={{ 'details[open] &': { transform: 'rotate(180deg)' } }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" /></svg>
          </Span>
        </Summary>
        <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={4} px={4} pb={4}>
          <AltCard title="Chiaki.zip" desc={t('voicebankPage.zip.desc')} steps={listOf(t, 'voicebankPage.zip.steps')}>
            <DownloadButton href={DOWNLOADS.zip} label={t('voicebankPage.zip.button')} />
            <DownloadButton href={DOWNLOADS.finnish} label="Finnish Phonemizer" />
            <DownloadButton href={DOWNLOADS.latin} label="Latin Phonemizer" />
          </AltCard>
          <AltCard title="Language Plugins" desc={t('chiakiPage.sing.pluginDesc')} steps={listOf(t, 'voicebankPage.extra.steps')}>
            <DownloadButton href={DOWNLOADS.extraChiaki} label={t('voicebankPage.extra.buttonChiaki')} />
            <DownloadButton href={DOWNLOADS.extraOfficial} label={t('voicebankPage.extra.buttonOfficial')} />
          </AltCard>
        </Grid>
      </Details>
    </Box>
  )
}

export default ChiakiSing
