import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { DOWNLOADS, listOf } from './voicebankData'
import { INK, JOST, ORANGE, SNOW } from './chiakiData'
import { Container, DownArrow, Gauge, Pill, Reveal } from './parts'

const Text = styled.p
const Span = styled.span
const Heading = styled.h2
const Heading3 = styled.h3
const OrderedList = styled.ol
const ListItem = styled.li
const Details = styled.details
const Summary = styled.summary

const RULE = 'rgba(22,28,38,.5)'
const LIGHT_DOT = { backgroundColor: SNOW, color: INK }

const Steps = ({ steps, large = false }: { steps: string[]; large?: boolean }) => (
  <OrderedList>
    {steps.map((step, index) => (
      <ListItem key={step} display="flex" alignItems="baseline" gap={large ? 7 : 4} py={large ? 6 : 3} style={{ borderTop: index === 0 ? `2px solid ${INK}` : `1px solid ${RULE}`, borderBottom: index === steps.length - 1 ? `2px solid ${INK}` : undefined }}>
        <Span fontWeight="medium" fontSize={large ? '40px' : 'xl'} lineHeight="1" style={{ fontFamily: JOST }}>{String(index + 1).padStart(2, '0')}</Span>
        <Span fontSize={large ? 'lg' : '15px'} fontWeight={large ? 'bold' : 'regular'} lineHeight="1.7">{step}</Span>
      </ListItem>
    ))}
  </OrderedList>
)

const AltBlock = ({ title, desc, steps, href, label, file }: { title: string; desc: string; steps: string[]; href: string | null; label: string; file: string }) => (
  <Flex flexDirection="column" alignItems="flex-start" gap={4}>
    <Heading3 fontWeight="medium" fontSize="1.75rem" lineHeight="1.2" style={{ fontFamily: JOST }}>{title}</Heading3>
    <Text fontSize="15px" lineHeight="1.8">{desc}</Text>
    <Box alignSelf="stretch"><Steps steps={steps} /></Box>
    <Pill href={href} dot={LIGHT_DOT} track={['voicebank-download', { file }]} icon={<DownArrow />}>{label}</Pill>
  </Flex>
)

const ChiakiSing = () => {
  const { t } = useI18n()
  return (
    <Box as="section" id="download" scrollMarginTop="72px" position="relative" overflow="hidden" pt={{ base: 20, md: '130px' }} pb={{ base: 20, md: '210px' }} style={{ backgroundColor: ORANGE, color: INK }}>
      <Text aria-hidden position="absolute" left="40px" bottom="-26px" fontWeight="bold" fontSize={{ base: '5.5rem', md: 'clamp(5.5rem, 16vw, 14.5rem)' }} lineHeight="0.9" whiteSpace="nowrap" color="transparent" style={{ fontFamily: JOST, WebkitTextStroke: '1.5px rgba(22,28,38,.3)' }}>DOWNLOAD</Text>
      <Container position="relative" zIndex={1}>
        <Flex flexWrap="wrap" alignItems="flex-start" columnGap="96px" rowGap={14}>
          <Reveal flex="1 1 520px" minW="0" display="flex" flexDirection="column" alignItems={{ base: 'stretch', md: 'flex-start' }} gap={6}>
            <Flex flexWrap="wrap" alignItems="center" columnGap="18px" rowGap="6px" fontFamily="mono" fontSize="13px" letterSpacing=".2em">
              <Span>03</Span>
              <Gauge />
              <Span>SING WITH ME</Span>
            </Flex>
            <Heading fontWeight="black" fontSize={{ base: '2.125rem', md: 'clamp(2.125rem, 4.6vw, 4rem)' }} lineHeight="1.4" letterSpacing={{ base: '.06em', _en: '0' }} whiteSpace="pre-line">{t('chiakiPage.sing.heading')}</Heading>
            <Flex flexDirection={{ base: 'column', md: 'row' }} flexWrap="wrap" gap={{ base: 3, md: '14px 16px' }} mt={4} style={{ fontFamily: JOST }}>
              <Pill href={DOWNLOADS.appMac} dot={LIGHT_DOT} track={['voicebank-download', { file: 'app-mac' }]} icon={<DownArrow />}>macOS (Apple Silicon)</Pill>
              <Pill href={DOWNLOADS.appWindows} dot={LIGHT_DOT} track={['voicebank-download', { file: 'app-windows' }]} icon={<DownArrow />}>Windows</Pill>
            </Flex>
            <Text mt={-2} fontFamily="mono" fontSize="xs" letterSpacing={{ base: '.18em', _en: '.04em' }}>{t('chiakiPage.sing.free')}</Text>
          </Reveal>

          <Reveal flex="1 1 420px" minW="0" delay={0.15}>
            <Text fontWeight="medium" fontSize="22px" letterSpacing=".02em" style={{ fontFamily: JOST }}>OpenUtau-Chiaki</Text>
            <Text mt={1} mb={7} fontSize="17px" lineHeight="2">{t('voicebankPage.app.desc')}</Text>
            <Steps large steps={listOf(t, 'voicebankPage.app.steps')} />
          </Reveal>
        </Flex>

        <Reveal mt={{ base: 12, md: 16 }}>
          <Details style={{ borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
            <Summary display="flex" alignItems="center" justifyContent="space-between" gap={4} minH="64px" fontSize="17px" fontWeight="bold" cursor="pointer" listStyle="none" css={{ '&::-webkit-details-marker': { display: 'none' } }}>
              {t('chiakiPage.sing.otherEditors')}
              <Span aria-hidden display="flex" transition="transform .3s ease" css={{ 'details[open] &': { transform: 'rotate(180deg)' } }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" /></svg>
              </Span>
            </Summary>
            <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} columnGap={16} rowGap={10} pt={4} pb={10}>
              <AltBlock title="Chiaki.zip" desc={t('voicebankPage.zip.desc')} steps={listOf(t, 'voicebankPage.zip.steps')} href={DOWNLOADS.zip} label={t('voicebankPage.zip.button')} file="zip" />
              <AltBlock title="Extra Phonemizers" desc={t('chiakiPage.sing.pluginDesc')} steps={listOf(t, 'voicebankPage.extra.steps')} href={DOWNLOADS.phonemizers} label={t('voicebankPage.extra.button')} file="phonemizers" />
            </Grid>
          </Details>
        </Reveal>
      </Container>
    </Box>
  )
}

export default ChiakiSing
