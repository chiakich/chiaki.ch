import { useState } from 'react'
import { Box, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { LOOKS, NAVY, ORANGE } from './chiakiData'
import SectionTitle from './SectionTitle'

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
    <Box as="section" mt={{ base: 24, md: '140px' }}>
      <SectionTitle
        aside={(
          <Span aria-hidden pb={1} fontFamily="'Jost', var(--cjk), sans-serif" fontSize="2.5rem" fontWeight="medium">
            {String(lookIdx + 1).padStart(2, '0')}
            <Span fontSize="lg" color="rgba(34,48,90,.6)"> / {String(LOOKS.length).padStart(2, '0')}</Span>
          </Span>
        )}
      >
        DESIGN
      </SectionTitle>

      <Figure position="relative" backgroundColor="white" borderRadius="32px" p={{ base: 3, md: 6 }} boxShadow="0 12px 40px rgba(34,48,90,.10)">
        <Span aria-hidden position="absolute" top="-14px" left="48px" width="120px" height="28px" transform="rotate(-3deg)" background="rgba(223,138,66,.55)" />
        <Span aria-hidden position="absolute" top="-10px" right="64px" width="96px" height="26px" transform="rotate(4deg)" background="rgba(34,48,90,.22)" />
        <Img
          src={look.src}
          alt={t('chiakiPage.looks.alt').replace('{look}', label(look.id))}
          width="100%"
          height={{ base: '320px', md: 'clamp(320px, 52vw, 720px)' }}
          objectFit="contain"
          display="block"
          borderRadius="20px"
          style={{ backgroundColor: look.bg }}
        />
      </Figure>

      <Grid gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap={4} mt={5}>
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
              gap="14px"
              p="10px"
              borderRadius="20px"
              backgroundColor="white"
              textAlign="left"
              cursor="pointer"
              minW="0"
              style={{ border: `2px solid ${on ? ORANGE : 'rgba(34,48,90,.12)'}`, color: NAVY }}
            >
              <Img src={item.src} alt="" width="88px" height="64px" objectFit="cover" borderRadius="12px" flexShrink={0} display={{ base: 'none', md: 'block' }} style={{ backgroundColor: item.bg }} />
              <Span fontWeight="bold" minW="0" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{label(item.id)}</Span>
            </Button>
          )
        })}
      </Grid>
    </Box>
  )
}

export default ChiakiDesign
