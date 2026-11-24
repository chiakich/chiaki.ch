import { useState } from 'react'
import { Box, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { INK, JOST, LOOKS, ORANGE, PALE, PAPER, STEEL } from './chiakiData'
import { Container, Reveal } from './parts'
import SectionTitle from './SectionTitle'

const Text = styled.p
const Span = styled.span
const Img = styled.img
const Button = styled.button
const Figure = styled.figure

const ChiakiDesign = () => {
  const { t } = useI18n()
  const [lookIdx, setLookIdx] = useState(0)
  const look = LOOKS[lookIdx]
  const label = (id: string) => t(`chiakiPage.looks.${id}`)

  return (
    <Box as="section" id="design" scrollMarginTop="72px" style={{ backgroundColor: PALE }}>
      <Container py={{ base: 20, md: '130px' }} pb={{ md: '140px' }}>
        <Reveal>
          <SectionTitle
            index="05"
            sub={t('chiakiPage.sections.design')}
            aside={(
              <Span aria-hidden fontWeight="medium" fontSize="44px" lineHeight="1.1" style={{ fontFamily: JOST }}>
                {String(lookIdx + 1).padStart(2, '0')}
                <Span fontSize="lg"> / {String(LOOKS.length).padStart(2, '0')}</Span>
              </Span>
            )}
          >
            DESIGN
          </SectionTitle>
        </Reveal>

        <Reveal>
          <Figure position="relative" p={{ base: 2, md: '18px' }} style={{ backgroundColor: PAPER, border: `1px solid ${INK}` }}>
            <Span aria-hidden position="absolute" left="-7px" top="-7px" width="13px" height="13px" style={{ backgroundColor: INK }} />
            <Span aria-hidden position="absolute" right="-7px" bottom="-7px" width="13px" height="13px" style={{ backgroundColor: ORANGE }} />
            {/* Every look stays mounted so switching crossfades already-loaded images instead of reloading one */}
            <Box position="relative" height={{ base: '320px', md: 'clamp(320px, 52vw, 720px)' }} transition="background-color .6s ease" style={{ backgroundColor: look.bg }}>
              {LOOKS.map((item, index) => {
                const on = index === lookIdx
                return (
                  <Img
                    key={item.id}
                    src={item.src}
                    loading="lazy"
                    decoding="async"
                    alt={on ?t('chiakiPage.looks.alt').replace('{look}', label(item.id)) : ''}
                    aria-hidden={!on}
                    position="absolute"
                    inset="0"
                    width="100%"
                    height="100%"
                    objectFit="contain"
                    transition="opacity .6s ease, scale .8s cubic-bezier(.2,.7,.2,1)"
                    _motionReduce={{ transition: 'none' }}
                    style={{ opacity: on ? 1 : 0, scale: on ? '1' : '.97' }}
                  />
                )
              })}
            </Box>
          </Figure>
        </Reveal>

        <Grid columnGap={{ base: 3, md: 8 }} mt="30px" style={{ gridTemplateColumns: `repeat(${LOOKS.length}, minmax(0, 1fr))` }}>
          {LOOKS.map((item, index) => {
            const on = index === lookIdx
            return (
              <Button
                key={item.id}
                type="button"
                onClick={() => setLookIdx(index)}
                aria-pressed={on}
                display="flex"
                alignItems="center"
                gap={{ base: 2, md: '18px' }}
                minW="0"
                minH={{ base: '64px', md: '96px' }}
                py="14px"
                textAlign="left"
                cursor="pointer"
                style={{ borderTop: `2px solid ${on ? INK : 'rgba(22,28,38,.35)'}`, color: on ? INK : STEEL }}
              >
                <Img src={item.src} loading="lazy" decoding="async" alt="" width="104px" height="64px" objectFit="cover" flexShrink={0} display={{ base: 'none', md: 'block' }} style={{ backgroundColor: item.bg }} />
                <Span flex="1" minW="0">
                  <Span display="block" fontWeight="medium" fontSize="sm" letterSpacing=".1em" style={{ fontFamily: JOST }}>{String(index + 1).padStart(2, '0')}</Span>
                  <Span display="block" fontSize={{ base: 'md', md: '22px' }} fontWeight="black" letterSpacing={{ md: '.1em', _en: '0' }} lineHeight="1.3" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{label(item.id)}</Span>
                </Span>
                <Span aria-hidden flexShrink={0} width="12px" height="12px" style={on ? { backgroundColor: ORANGE } : { border: '1px solid currentColor' }} />
              </Button>
            )
          })}
        </Grid>
        <Text mt="22px" fontFamily="mono" fontSize="11px" letterSpacing=".2em" lineHeight="2.1" style={{ color: STEEL }}>CHARACTER DESIGN — 亞莓 / ILLUSTRATION — shONe</Text>
      </Container>
    </Box>
  )
}

export default ChiakiDesign
