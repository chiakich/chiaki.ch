import { useState } from 'react'
import dynamic from 'next/dynamic'
import { m } from 'framer-motion'
import { Box, Container, HStack, Stack, styled } from 'styled-system/jsx'
import { Copy, Check } from 'iconoir-react'
import ProjectLink from 'components/portfolio/ProjectLink'
import { useI18n } from 'i18n'

const LookupDemo = dynamic(() => import('./LookupDemo'), { ssr: false })

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const Button = styled.button

const ACCENT = '#3fcf8e'

const INSTALL_COMMAND = 'npm i tw-fuzzy-zipcode'

const InstallCommand = () => {
  const [copied, setCopied] = useState(false)
  const { t } = useI18n()

  return (
    <Button
      onClick={() => {
        navigator.clipboard?.writeText(INSTALL_COMMAND)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }}
      cursor="pointer"
      display="inline-flex"
      alignItems="center"
      gap={4}
      px={5}
      py={3}
      borderRadius="12px"
      border="1px solid rgba(255,255,255,.18)"
      backgroundColor="rgba(0,0,0,.35)"
      color="#f2f2f2"
      fontFamily="monospace"
      fontSize="sm"
      letterSpacing=".02em"
      _hover={{ borderColor: ACCENT }}
      style={{ transition: 'border-color .2s ease' }}
      title={t('zipcodePage.copyInstallCommand')}
    >
      <Span color={ACCENT}>$</Span> {INSTALL_COMMAND}
      <Span>{copied ? <Check color="green" /> : <Copy />}</Span>
    </Button>
  )
}

const ZipcodeHero = () => {
  const { t } = useI18n()

  return (
    <Box
      pt="96px"
      background="radial-gradient(circle at 28% 15%, #14402c, #0c1c16 48%, #080d0b 100%)"
      overflow="hidden"
    >
      <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 14, md: 20 }}>
        <Stack gap={12}>
          <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
            <Text color={ACCENT} letterSpacing=".14em" fontSize="sm" fontWeight="bold" textTransform="uppercase">
              {t('zipcodePage.eyebrow')}
            </Text>
            <Heading
              fontSize={{ base: '2.4rem', md: '4.6rem' }}
              lineHeight="1.05"
              mt={4}
              fontWeight="bold"
              letterSpacing="-.03em"
            >
              tw<Span color={ACCENT}>-</Span>fuzzy<Span color={ACCENT}>-</Span>zipcode
            </Heading>
            <Text mt={5} maxW="680px" fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.85" opacity={0.82}>
              {t('zipcodePage.hero')}
            </Text>
            <HStack mt={7} flexWrap="wrap" gap={3}>
              <InstallCommand />
              <ProjectLink href="https://zipcode.chiaki.ch/" label={t('zipcodePage.tryIt')} solid accent={ACCENT} />
              <ProjectLink
                href="https://www.npmjs.com/package/tw-fuzzy-zipcode"
                label="npm"
                detail="tw-fuzzy-zipcode"
                accent={ACCENT}
              />
              <ProjectLink
                href="https://github.com/chiakich/tw-fuzzy-zipcode"
                label={t('zipcodePage.source')}
                detail="MIT"
                accent={ACCENT}
              />
            </HStack>
          </m.div>
          <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.2 }}>
            <LookupDemo />
          </m.div>
        </Stack>
      </Container>
    </Box>
  )
}

export default ZipcodeHero
