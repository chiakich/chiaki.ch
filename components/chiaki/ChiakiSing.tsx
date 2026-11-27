import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { DOWNLOADS, RELEASES, ZIP_HISTORY, listOf } from './voicebankData'
import { umamiAttrs } from 'lib/analytics'
import { INK, JOST, ORANGE, SNOW } from './chiakiData'
import { Container, DownArrow, Gauge, Pill, Reveal, RightArrow } from './parts'

const KOFI = 'https://ko-fi.com/chiakic'

const Text = styled.p
const Span = styled.span
const Heading = styled.h2
const Heading3 = styled.h3
const OrderedList = styled.ol
const ListItem = styled.li
const Details = styled.details
const Summary = styled.summary

// Opened before the hash jump so the zip steps are visible where it lands
const openOtherEditors = () => {
  const details = document.getElementById('other-editors')
  if (details instanceof HTMLDetailsElement) details.open = true
}

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

const AltBlock = ({ title, desc, steps, href, label, file, mirror }: { title: string; desc: string; steps: string[]; href: string | null; label: string; file: string; mirror?: { href: string; label: string } }) => (
  <Flex flexDirection="column" alignItems="flex-start" gap={4}>
    <Heading3 fontWeight="medium" fontSize="1.75rem" lineHeight="1.2" style={{ fontFamily: JOST }}>{title}</Heading3>
    <Text fontSize="15px" lineHeight="1.8">{desc}</Text>
    <Box alignSelf="stretch"><Steps steps={steps} /></Box>
    <Pill href={href} dot={LIGHT_DOT} track={['voicebank-download', { file }]} icon={<DownArrow />}>{label}</Pill>
    {mirror && <styled.a href={mirror.href} target="_blank" rel="noreferrer" fontSize="14px" textDecoration="underline" textUnderlineOffset="4px" _hover={{ opacity: 0.7 }}>{mirror.label}</styled.a>}
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
            <Flex mt={-5} flexWrap="wrap" columnGap={7} rowGap={1} fontSize="14px" fontWeight="bold">
              <styled.a href={RELEASES} target="_blank" rel="noreferrer" display="inline-flex" alignItems="center" minH="44px" textDecoration="underline" textUnderlineOffset="4px" _hover={{ opacity: 0.7 }} {...umamiAttrs('voicebank-more', { target: 'releases' })}>{t('chiakiPage.sing.moreVersions')} ↗</styled.a>
              <styled.a href="#other-editors" onClick={openOtherEditors} display="inline-flex" alignItems="center" minH="44px" textDecoration="underline" textUnderlineOffset="4px" _hover={{ opacity: 0.7 }} {...umamiAttrs('voicebank-more', { target: 'voicebank-only' })}>{t('chiakiPage.sing.voicebankOnly')} ↓</styled.a>
            </Flex>
            <Text mt={-4} fontFamily="mono" fontSize="xs" letterSpacing={{ base: '.18em', _en: '.04em' }}>{t('chiakiPage.sing.free')}</Text>
          </Reveal>

          <Reveal flex="1 1 420px" minW="0" delay={0.15}>
            <Text fontWeight="medium" fontSize="22px" letterSpacing=".02em" style={{ fontFamily: JOST }}>OpenUtau-Chiaki</Text>
            <Text mt={1} mb={7} fontSize="17px" lineHeight="2">{t('voicebankPage.app.desc')}</Text>
            <Steps large steps={listOf(t, 'voicebankPage.app.steps')} />
          </Reveal>
        </Flex>

        <Reveal mt={{ base: 12, md: 16 }}>
          <Details id="other-editors" scrollMarginTop="72px" style={{ borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
            <Summary display="flex" alignItems="center" justifyContent="space-between" gap={4} minH="64px" fontSize="17px" fontWeight="bold" cursor="pointer" listStyle="none" css={{ '&::-webkit-details-marker': { display: 'none' } }}>
              {t('chiakiPage.sing.otherEditors')}
              <Span aria-hidden display="flex" transition="transform .3s ease" css={{ 'details[open] &': { transform: 'rotate(180deg)' } }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" /></svg>
              </Span>
            </Summary>
            <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} columnGap={16} rowGap={10} pt={4} pb={10}>
              <AltBlock title="Chiaki.zip" desc={t('voicebankPage.zip.desc')} steps={listOf(t, 'voicebankPage.zip.steps')} href={DOWNLOADS.zip} label={t('voicebankPage.zip.button')} file="zip" mirror={{ href: ZIP_HISTORY, label: t('voicebankPage.zip.mirror') }} />
              <AltBlock title="Extra Phonemizers" desc={t('chiakiPage.sing.pluginDesc')} steps={listOf(t, 'voicebankPage.extra.steps')} href={DOWNLOADS.phonemizers} label={t('voicebankPage.extra.button')} file="phonemizers" />
            </Grid>
          </Details>
        </Reveal>

        {/* Last in the section so it never reads as a paywall, and the other-editors fold stays attached to the downloads */}
        <Reveal mt={{ base: 14, md: 20 }}>
          <Flex flexDirection={{ base: 'column', md: 'row' }} alignItems={{ base: 'stretch', md: 'center' }} justifyContent="space-between" gap={{ base: 6, md: 12 }} px={{ base: 6, md: 12 }} py={{ base: 8, md: 10 }} clipPath="polygon(0 0, 100% 0, 100% 100%, 28px 100%, 0 calc(100% - 28px))" style={{ backgroundColor: INK, color: SNOW }}>
            <Flex flexDirection="column" gap={4} maxW="50em">
              <Flex alignItems="center" columnGap="18px" fontFamily="mono" fontSize="13px" letterSpacing=".2em" style={{ color: ORANGE }}>
                <Span>SUPPORT</Span>
                <Gauge />
                <Span>KO-FI</Span>
              </Flex>
              <Text fontSize="15px" lineHeight="1.9">{t('chiakiPage.sing.support')}</Text>
              <Text fontSize="15px" lineHeight="1.9" fontWeight="bold">{t('chiakiPage.sing.supportAsk')}</Text>
            </Flex>
            <Flex flexShrink={0} flexDirection="column" style={{ fontFamily: JOST }}>
              <Pill href={KOFI} tone="outline" dot={{ backgroundColor: ORANGE, color: INK }} track={['support-click', { target: 'ko-fi' }]} icon={<RightArrow />}>{t('chiakiPage.sing.supportButton')}</Pill>
            </Flex>
          </Flex>
        </Reveal>
      </Container>
    </Box>
  )
}

export default ChiakiSing
