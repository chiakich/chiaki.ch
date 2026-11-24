import type { ReactNode } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { RENDER_STEPS } from './voicebankData'
import { INK, JOST, LINE, ORANGE, ORANGE_TEXT, PARAMS, STEEL } from './chiakiData'
import { Container, Reveal } from './parts'
import SectionTitle from './SectionTitle'

const Text = styled.p
const Span = styled.span

const border = (index: number, last: number) => ({ borderTop: index === 0 ? `2px solid ${INK}` : `1px solid ${LINE}`, borderBottom: index === last ? `1px solid ${LINE}` : undefined })

const Row = ({ label, index, children }: { label: string; index: number; children: ReactNode }) => (
  <Flex flexWrap="wrap" alignItems="baseline" columnGap={6} rowGap="2px" py="22px" style={border(index, 3)}>
    <Box as="dt" flex="0 0 140px" fontSize="sm" fontWeight="bold" letterSpacing={{ base: '.08em', _en: '.01em' }} style={{ color: STEEL }}>{label}</Box>
    <Box as="dd" minW="0">{children}</Box>
  </Flex>
)

const Value = ({ children }: { children: ReactNode }) => (
  <Span display="block" fontWeight="medium" fontSize="28px" lineHeight="1.3" style={{ fontFamily: JOST }}>{children}</Span>
)

// Purely illustrative: every parameter rests at zero and bends both ways
const Fader = () => (
  <Span aria-hidden flex="1 1 0" position="relative" height="28px">
    <Span position="absolute" left="0" right="0" top="8px" height="12px" backgroundImage="repeating-linear-gradient(90deg, rgba(22,28,38,.5) 0 1px, transparent 1px 10%)" borderRight="1px solid rgba(22,28,38,.5)" />
    <Span position="absolute" left="0" right="0" top="13.5px" height="1px" style={{ backgroundColor: INK }} />
    <Span position="absolute" left="50%" top="7px" width="14px" height="14px" ml="-7px" transform="rotate(45deg)" style={{ backgroundColor: ORANGE }} />
  </Span>
)

const ChiakiSpec = () => {
  const { t } = useI18n()
  return (
    <Box as="section" id="spec" scrollMarginTop="72px">
      <Container py={{ base: 20, md: '130px' }} pb={{ md: '140px' }}>
        <Reveal>
          <SectionTitle index="04" sub={t('chiakiPage.sections.spec')}>SPEC</SectionTitle>
        </Reveal>

        <Flex flexWrap="wrap" alignItems="flex-start" columnGap="96px" rowGap={14}>
          <Reveal as="dl" flex="1 1 400px" minW="0">
            <Row index={0} label={t('chiakiPage.spec.engine')}><Value>DiffSinger</Value></Row>
            <Row index={1} label={t('chiakiPage.spec.editor')}><Value>OpenUtau</Value></Row>
            <Row index={2} label={t('chiakiPage.spec.vocoder')}>
              <Value>Chiaki_Vocoder</Value>
              <Span display="block" mt={1} fontFamily="mono" fontSize="13px" style={{ color: STEEL }}>NSF-HiFiGAN · 44.1 kHz · hop 512</Span>
            </Row>
            <Row index={3} label={t('chiakiPage.spec.renderSteps')}>
              <Flex flexWrap="wrap" alignItems="baseline" columnGap="26px" rowGap={1} fontFamily="mono" fontSize="xs" letterSpacing=".14em">
                {RENDER_STEPS.map(([label, value]) => (
                  <Span key={label}>{label.replace(' STEPS', '')} <Span fontWeight="medium" fontSize="26px" letterSpacing="0" style={{ fontFamily: JOST }}>{value}</Span></Span>
                ))}
              </Flex>
            </Row>
          </Reveal>

          <Reveal flex="1.3 1 520px" minW="0" delay={0.15}>
            <Text mb="14px" fontSize="sm" fontWeight="bold" letterSpacing={{ base: '.08em', _en: '.01em' }} style={{ color: STEEL }}>{t('chiakiPage.spec.params')}</Text>
            {PARAMS.map((code, index) => (
              <Flex key={code} flexWrap="wrap" alignItems="center" columnGap={6} rowGap="6px" py="17px" style={border(index, PARAMS.length - 1)}>
                <Box flex={{ base: '0 0 140px', _en: '0 0 180px' }}>
                  <Span display="block" fontFamily="mono" fontSize="11px" letterSpacing=".2em" style={{ color: ORANGE_TEXT }}>{code}</Span>
                  <Span display="block" fontSize="xl" fontWeight="black" letterSpacing={{ base: '.1em', _en: '0' }} lineHeight="1.4">{t(`chiakiPage.params.${code}.name`)}</Span>
                </Box>
                <Flex flex="1 1 320px" minW="0" alignItems="center" gap={4} fontSize="sm">
                  <Span flex="0 0 5.5em" textAlign="right">{t(`chiakiPage.params.${code}.low`)}</Span>
                  <Fader />
                  <Span flex="0 0 5.5em">{t(`chiakiPage.params.${code}.high`)}</Span>
                </Flex>
                <Text flex="1 1 100%" pl={{ md: '164px', _en: { md: '204px' } }} fontSize="sm" lineHeight="1.8" style={{ color: STEEL }}>{t(`chiakiPage.params.${code}.desc`)}</Text>
              </Flex>
            ))}
          </Reveal>
        </Flex>
      </Container>
    </Box>
  )
}

export default ChiakiSpec
