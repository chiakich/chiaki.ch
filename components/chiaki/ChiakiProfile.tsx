import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { INK, JOST, LINE, STEEL } from './chiakiData'
import { Container, Reveal } from './parts'

const Text = styled.p
const Span = styled.span
const Heading = styled.h2

const PROFILE_KEYS = ['birthday', 'age', 'height', 'voice', 'illust', 'design']

const ChiakiProfile = () => {
  const { t, locale } = useI18n()
  return (
    <Box as="section" id="profile">
      <Container pt={{ base: 0, md: 16 }} pb={{ base: 16, md: '120px' }}>
        <Flex flexWrap="wrap" alignItems="flex-start" columnGap="72px" rowGap={6}>
          <Reveal flex="0 1 230px" minW="0" display={{ base: 'none', md: 'block' }}>
            <Heading fontWeight="medium" fontSize="48px" lineHeight="1" letterSpacing="-.01em" style={{ fontFamily: JOST }}>PROFILE</Heading>
            <Text mt="10px" fontSize="17px" fontWeight="bold" letterSpacing={{ base: '.24em', _en: '.04em' }}>{t('chiakiPage.sections.profile')}</Text>
          </Reveal>
          <Grid as="dl" flex="1 1 640px" minW="0" gridTemplateColumns={{ base: 'repeat(3, minmax(0, 1fr))', md: 'repeat(auto-fit, minmax(250px, 1fr))' }} columnGap={{ base: 2, md: '44px' }} style={{ borderTop: `2px solid ${INK}` }}>
            {PROFILE_KEYS.map((key, index) => (
              <Reveal key={key} delay={index * 0.05} display={{ base: 'block', md: 'flex' }} alignItems="baseline" justifyContent="space-between" gap={4} py={{ base: '14px', md: '18px' }} style={{ borderBottom: `1px solid ${LINE}` }}>
                <Box as="dt" fontSize={{ base: '13px', md: '17px' }} fontWeight="bold" letterSpacing={{ base: '.08em', _en: '.01em' }}>
                  {t(`chiakiPage.profileLabel.${key}`)}
                  {locale !== 'en' && <Span display={{ base: 'none', md: 'inline' }} ml={3} fontFamily="mono" fontSize="11px" fontWeight="regular" letterSpacing=".18em" style={{ color: STEEL }}>{key.toUpperCase()}</Span>}
                </Box>
                <Box as="dd" mt={{ base: '2px', md: 0 }} fontSize={{ base: index < 3 ? 'xl' : 'md', md: '28px' }} fontWeight="black" lineHeight="1.3">{t(`chiakiPage.profile.${key}`)}</Box>
              </Reveal>
            ))}
          </Grid>
        </Flex>
      </Container>
    </Box>
  )
}

export default ChiakiProfile
