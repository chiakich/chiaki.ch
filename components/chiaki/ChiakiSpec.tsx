import type { ReactNode } from 'react'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { RENDER_STEPS } from 'components/works/voicebank/voicebankData'
import { LANGS, NATIVE_ORDER, NAVY, ORANGE, CREAM, RUST, PARAMS, type Tier } from './chiakiData'
import SectionTitle from './SectionTitle'

const Text = styled.p
const Span = styled.span
const Heading3 = styled.h3

const TIER_STYLE: Record<Tier, { bg: string; fg: string; bd: string; code: string }> = {
  native: { bg: ORANGE, fg: NAVY, bd: ORANGE, code: NAVY },
  fluent: { bg: NAVY, fg: CREAM, bd: NAVY, code: '#f2b47e' },
  learning: { bg: 'transparent', fg: NAVY, bd: 'rgba(34,48,90,.22)', code: RUST },
}

const TIERS: { tier: Tier; title: string; langs: typeof LANGS }[] = [
  { tier: 'native', title: 'Native', langs: NATIVE_ORDER.map((code) => LANGS.find((lang) => lang.code === code)!) },
  { tier: 'fluent', title: 'Fluent', langs: LANGS.filter((lang) => lang.tier === 'fluent') },
  { tier: 'learning', title: 'Learning', langs: LANGS.filter((lang) => lang.tier === 'learning') },
]

const Card = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box backgroundColor="white" borderRadius="20px" p={6}>
    <Text mb="6px" fontSize="sm" color="rgba(34,48,90,.72)">{label}</Text>
    {children}
  </Box>
)

const ChiakiSpec = () => {
  const { t } = useI18n()
  return (
    <Box as="section" mt={{ base: 24, md: '140px' }}>
      <SectionTitle>SPEC</SectionTitle>

      <Box backgroundColor="white" borderRadius="24px" px={7} py={3} boxShadow="0 10px 32px rgba(34,48,90,.06)">
        {TIERS.map(({ tier, title, langs }, index) => {
          const style = TIER_STYLE[tier]
          return (
            <Flex key={tier} flexWrap="wrap" alignItems="baseline" columnGap={5} rowGap={2} py={4} borderBottom={index < TIERS.length - 1 ? '1px solid rgba(34,48,90,.08)' : 'none'}>
              <Box flex="0 0 200px" minW="0">
                <Text fontSize="17px" fontWeight="bold">{title}</Text>
                {tier === 'learning' && <Text mt="2px" fontSize="sm" color="rgba(34,48,90,.72)">{t('chiakiPage.spec.learningNote')}</Text>}
              </Box>
              <Flex flex="1 1 400px" minW="0" flexWrap="wrap" gap={2}>
                {langs.map((lang) => {
                  const name = t(`chiakiPage.lang.${lang.code}`)
                  return (
                    <Span key={lang.code} display="inline-flex" alignItems="center" gap={2} minH="40px" px="14px" borderRadius="20px" fontSize="15px" style={{ backgroundColor: style.bg, color: style.fg, border: `1px solid ${style.bd}` }}>
                      <Span fontFamily="mono" fontSize="xs" style={{ color: style.code }}>{lang.code}</Span>
                      {name}
                      {name !== lang.native && <Span lang={lang.tag} fontSize="13px" opacity={.6}>{lang.native}</Span>}
                    </Span>
                  )
                })}
              </Flex>
            </Flex>
          )
        })}
      </Box>

      <Grid gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap={4} mt={4}>
        <Card label={t('chiakiPage.spec.engine')}>
          <Text fontFamily="'Jost', var(--cjk), sans-serif" fontSize="2xl" fontWeight="medium">DiffSinger</Text>
        </Card>
        <Card label={t('chiakiPage.spec.editor')}>
          <Text fontFamily="'Jost', var(--cjk), sans-serif" fontSize="2xl" fontWeight="medium">OpenUtau</Text>
        </Card>
        <Card label={t('chiakiPage.spec.vocoder')}>
          <Text fontFamily="'Jost', var(--cjk), sans-serif" fontSize="2xl" fontWeight="medium">PC-NSF-HiFiGAN</Text>
          <Text mt={1} fontFamily="mono" fontSize="13px" color="rgba(34,48,90,.72)">44.1 kHz · hop 512</Text>
        </Card>
        <Card label={t('chiakiPage.spec.renderSteps')}>
          <Flex mt={1} flexWrap="wrap" columnGap={4} rowGap="6px" fontFamily="mono" fontSize="sm">
            {RENDER_STEPS.map(([label, value]) => (
              <Span key={label}>{label.replace(' STEPS', '')} <b>{value}</b></Span>
            ))}
          </Flex>
        </Card>
      </Grid>

      <Heading3 mt={12} mb={4} fontSize="lg" fontWeight="bold">{t('chiakiPage.spec.params')}</Heading3>
      <Grid gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap={4}>
        {PARAMS.map((code) => (
          <Box key={code} backgroundColor="white" borderRadius="20px" p={6} style={{ border: '1.5px solid rgba(34,48,90,.25)' }}>
            <Span display="block" mb={1} fontFamily="mono" fontSize="13px" style={{ color: RUST }}>{code}</Span>
            <Text mb={2} fontSize="xl" fontWeight="bold">{t(`chiakiPage.params.${code}.name`)}</Text>
            <Text fontSize="15px" lineHeight="1.7" color="rgba(34,48,90,.75)">{t(`chiakiPage.params.${code}.desc`)}</Text>
          </Box>
        ))}
      </Grid>
    </Box>
  )
}

export default ChiakiSpec
