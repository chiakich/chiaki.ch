import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Box, Container, HStack, Stack, styled } from 'styled-system/jsx'
import ProjectLink from 'components/portfolio/ProjectLink'
import { Copy, Check } from 'iconoir-react'
import { useI18n } from 'i18n'

const DepartureBoard = dynamic(() => import('./DepartureBoard'), { ssr: false })

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const Button = styled.button

const ACCENT = '#ff5d52'

const INSTALL_COMMAND = 'npm i react-split-flap'

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
      title={t('splitFlapPage.copyInstallCommand')}
    >
      <Span color={ACCENT}>$</Span> {INSTALL_COMMAND}
      <Span>{copied ? <Check color="green" /> : <Copy />}</Span>
    </Button>
  )
}

const SplitFlapHero = () => {
  const { t } = useI18n()
  return (
  <Box
    pt="96px"
    background="radial-gradient(circle at 30% 15%, #3a1815, #17100f 46%, #0b0b0d 100%)"
    overflow="hidden"
  >
    <Container maxW="1080px" px={{ base: '24px', md: '40px' }} py={{ base: 14, md: 20 }}>
      <Stack gap={12}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
          <Text color={ACCENT} letterSpacing=".14em" fontSize="sm" fontWeight="bold" textTransform="uppercase">
            {t('splitFlapPage.eyebrow')}
          </Text>
          <Heading
            fontSize={{ base: '2.6rem', md: '5rem' }}
            lineHeight="1.05"
            mt={4}
            fontWeight="bold"
            letterSpacing="-.03em"
          >
            react<Span color={ACCENT}>-</Span>split<Span color={ACCENT}>-</Span>flap
          </Heading>
          <Text mt={5} maxW="660px" fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.85" opacity={0.82}>
            {t('splitFlapPage.hero')}
          </Text>
          <HStack mt={7} flexWrap="wrap" gap={3}>
            <InstallCommand />
            <ProjectLink href="https://www.npmjs.com/package/react-split-flap" label="npm" detail="react-split-flap" solid accent={ACCENT} />
            <ProjectLink href="https://github.com/chiakich/react-split-flap" label={t('splitFlapPage.source')} detail="TypeScript" accent={ACCENT} />
          </HStack>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.2 }}>
          <DepartureBoard />
        </motion.div>
      </Stack>
    </Container>
  </Box>
  )
}

export default SplitFlapHero
