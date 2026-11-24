import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { IMPROVE_EMAIL } from './voicebankData'
import { INK, JOST, LANGS, LINE, ORANGE, ORANGE_TEXT, PICK_EVENT, STEEL, TIERS, langsOf, type Tier } from './chiakiData'
import { Container, Reveal } from './parts'
import SectionTitle from './SectionTitle'

const Text = styled.p
const Span = styled.span
const Link = styled.a
const Heading3 = styled.h3


const pick = (code: string) => window.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: code }))

const Level = ({ tier, level }: { tier: Tier; level: number }) => (
  <Flex aria-hidden gap="5px" mb="14px">
    {[1, 2, 3].map((step) => (
      <Span key={step} width="12px" height="12px" style={step <= level ? { backgroundColor: tier === 'native' ? ORANGE : INK } : { border: `1px solid ${INK}` }} />
    ))}
  </Flex>
)

const ChiakiLanguages = () => {
  const { t, locale } = useI18n()
  const [before, after] = t('chiakiPage.languages.lead').split('{total}')
  return (
    <Box as="section" id="languages" scrollMarginTop="72px">
      <Container py={{ base: 20, md: '130px' }} pb={{ md: '140px' }}>
        <Reveal>
          <SectionTitle index="02" sub={t('chiakiPage.sections.languages')}>LANGUAGES</SectionTitle>
        </Reveal>

        <Reveal mb={{ base: 12, md: '72px' }}>
          <Text fontWeight="black" fontSize={{ base: '1.75rem', md: 'clamp(1.875rem, 3.4vw, 3rem)' }} lineHeight="1.5" letterSpacing={{ base: '.06em', _en: '0' }}>
            {before}<Span fontWeight="medium" fontSize="1.5em" lineHeight="1" style={{ fontFamily: JOST, color: ORANGE_TEXT }}>{LANGS.length}</Span>{after}
          </Text>
        </Reveal>

        {TIERS.map(({ tier, en, level }, index) => {
          const langs = langsOf(tier)
          const count = String(langs.length).padStart(2, '0')
          const native = tier === 'native'
          return (
            <Reveal key={tier} display="flex" flexWrap="wrap" alignItems="flex-start" columnGap={12} rowGap={5} py={8} style={{ borderTop: index === 0 ? `2px solid ${INK}` : `1px solid ${LINE}`, borderBottom: index === TIERS.length - 1 ? `2px solid ${INK}` : undefined }}>
              <Box flex="0 1 260px" minW="0">
                <Level tier={tier} level={level} />
                <Heading3 fontWeight="black" fontSize="28px" letterSpacing={{ base: '.14em', _en: '.01em' }} lineHeight="1.3">{t(`chiakiPage.tier.${tier}`)}</Heading3>
                <Text mt={1} fontFamily="mono" fontSize="11px" letterSpacing=".2em" style={{ color: STEEL }}>{locale === 'en' ? `${count} LANGUAGES` : `${en} — ${count}`}</Text>
                {!native && <Text mt={3} fontSize="sm" lineHeight="1.8" style={{ color: STEEL }}>{t(`chiakiPage.spec.${tier === 'fluent' ? 'intermediateNote' : 'learningNote'}`)}</Text>}
                {tier === 'learning' && (
                  <Link href={`mailto:${IMPROVE_EMAIL}`} display="inline-flex" alignItems="center" gap={2} minH="44px" fontFamily="mono" fontSize="sm" fontWeight="bold" style={{ color: ORANGE_TEXT }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18v12H3zM3 7l9 7 9-7" /></svg>
                    {IMPROVE_EMAIL}
                  </Link>
                )}
              </Box>
              <Grid flex="1 1 560px" minW="0" gridTemplateColumns={native ? 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))' : 'repeat(auto-fill, minmax(min(210px, 100%), 1fr))'} columnGap={10}>
                {langs.map((lang) => {
                  const name = t(`chiakiPage.lang.${lang.code}`)
                  return (
                    <Link
                      key={lang.code}
                      href="#listen"
                      onClick={() => pick(lang.code)}
                      display="flex"
                      alignItems="baseline"
                      gap={native ? '14px' : 3}
                      minH={native ? '72px' : '54px'}
                      py={native ? '14px' : 3}
                      textDecoration="none"
                      transition="translate .3s cubic-bezier(.2,.7,.2,1), border-color .3s ease"
                      _hover={{ translate: '6px 0', borderBottomColor: '#df8a42!' }}
                      style={{ borderBottom: `1px ${tier === 'learning' ? 'dashed' : 'solid'} ${LINE}` }}
                    >
                      <Span flexShrink={0} width={native ? 'auto' : '30px'} fontFamily="mono" fontSize={native ? 'xs' : '11px'} style={{ color: ORANGE_TEXT }}>{lang.code}</Span>
                      {native
                        ? <Span fontWeight="black" fontSize="30px" letterSpacing={{ base: '.1em', _en: '0' }} lineHeight="1.3">{name}</Span>
                        : tier === 'fluent'
                          ? <Span fontSize="17px" fontWeight="bold" letterSpacing={{ base: '.05em', _en: '0' }}>{name}</Span>
                          : <Span letterSpacing={{ base: '.05em', _en: '0' }}>{name}</Span>}
                      {name !== lang.native && <Span lang={lang.tag} fontSize={native ? '15px' : '13px'} style={{ color: STEEL }}>{lang.native}</Span>}
                    </Link>
                  )
                })}
              </Grid>
            </Reveal>
          )
        })}
      </Container>
    </Box>
  )
}

export default ChiakiLanguages
