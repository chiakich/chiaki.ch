import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'
import { DEMOS, DOWNLOADS, LANGUAGES, RENDER_STEPS, demoSrc, type LanguageTier } from './voicebankData'

const Heading = styled.h2
const Text = styled.p
const Heading3 = styled.h3
const Span = styled.span
const Link = styled.a
const Button = styled.button
const Code = styled.code

type Translate = (key: string) => string

// i18n only resolves leaf strings, so walk an array until the first missing index
export const listOf = (t: Translate, prefix: string, leaf = '') => {
  const out: string[] = []
  for (let i = 0; ; i++) {
    const key = `${prefix}.${i}${leaf}`
    const value = t(key)
    if (value === key) return out
    out.push(value)
  }
}

const DownloadIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.8" aria-hidden><path d="M8 2v9M4 7l4 4 4-4M2 14h12" /></svg>
)

export const DownloadPill = ({ href, label, dark = false }: { href: string | null; label: string; dark?: boolean }) => {
  const { t } = useI18n()
  const style = { backgroundColor: dark ? '#1b2430' : '#ffffff', color: dark ? '#ffffff' : '#1b2430' }
  if (!href) {
    return (
      <Span display="inline-flex" alignItems="center" gap={3} minH="56px" px={7} borderRadius="30px" fontSize="sm" fontWeight="bold" opacity={.55} cursor="not-allowed" style={style} aria-disabled="true">
        {label}
        <Span fontSize="xs" fontWeight="regular">{t('voicebankPage.comingSoon')}</Span>
      </Span>
    )
  }
  return (
    <Link href={href} display="inline-flex" alignItems="center" justifyContent="center" gap={3} minH="56px" px={7} borderRadius="30px" fontSize="sm" fontWeight="bold" transition="transform .2s ease" _hover={{ transform: 'translateY(-1px)' }} style={style}>
      {label}
      <DownloadIcon color={dark ? '#df8a42' : '#a94f0f'} />
    </Link>
  )
}

const Steps = ({ steps }: { steps: string[] }) => (
  <Grid gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
    {steps.map((step, index) => (
      <Flex key={step} direction="column" gap="10px" backgroundColor="white" borderRadius="16px" p="22px">
        <Span fontFamily="'Jost', sans-serif" fontSize="1.75rem" fontWeight="medium" color="#a94f0f">{String(index + 1).padStart(2, '0')}</Span>
        <Text fontSize="sm" lineHeight="1.8">{step}</Text>
      </Flex>
    ))}
  </Grid>
)

const Item = ({ index, title, en, children }: { index: number; title: string; en: string; children: ReactNode }) => (
  <Box borderBottom="1px solid #1b2430">
    <Heading3 display="flex" alignItems="center" gap={{ base: 4, md: 6 }} py="30px" px={2}>
      <Span fontFamily="'Jost', sans-serif" fontWeight="medium" width="28px" flexShrink={0}>{String(index).padStart(2, '0')}</Span>
      <Flex flex="1" flexWrap="wrap" alignItems="baseline" columnGap={4} rowGap={1}>
        <Span fontSize="xl" fontWeight="bold">{title}</Span>
        <Span fontFamily="'Jost', sans-serif" fontWeight="normal">{en}</Span>
      </Flex>
    </Heading3>
    <Box pl={{ base: 2, md: '60px' }} pr={2} pb="44px">{children}</Box>
  </Box>
)

const Prose = ({ children }: { children: ReactNode }) => <Text fontSize="md" lineHeight="1.9" maxW="44em">{children}</Text>

const LanguageGroup = ({ tier, eyebrow }: { tier: LanguageTier; eyebrow: string }) => {
  const { t } = useI18n()
  const languages = LANGUAGES.filter((language) => language.tier === tier)
  return (
    <Flex direction="column" gap="14px">
      <Flex flexWrap="wrap" alignItems="baseline" columnGap="14px" rowGap={1}>
        <Span fontFamily="'Jost', sans-serif" fontSize="xs" fontWeight="medium" letterSpacing=".14em" color="#a94f0f">{eyebrow} · {languages.length}</Span>
        <Span fontWeight="bold">{t(`voicebankPage.languageList.${tier}.label`)}</Span>
        <Span fontSize="sm">{t(`voicebankPage.languageList.${tier}.desc`)}</Span>
      </Flex>
      <Grid gridTemplateColumns="repeat(auto-fill, minmax(132px, 1fr))" gap="10px">
        {languages.map((language) => (
          <Flex
            key={language.code}
            direction="column"
            gap="2px"
            borderRadius="12px"
            px="14px"
            py="12px"
            backgroundColor="white"
            style={{ borderTop: `4px solid ${tier === 'fluent' ? '#df8a42' : '#1b2430'}` }}
          >
            <Span fontFamily="'Jost', sans-serif" fontSize="1.4rem" fontWeight="medium">{language.code}</Span>
            <Span fontSize="sm">{language.name}</Span>
          </Flex>
        ))}
      </Grid>
    </Flex>
  )
}

const Demos = () => {
  const { t } = useI18n()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const nameOf = (code: string) => LANGUAGES.find((language) => language.code === code)?.name ?? code

  useEffect(() => () => audioRef.current?.pause(), [])

  const toggle = (code: string) => {
    const audio = audioRef.current ?? (audioRef.current = new Audio())
    if (playing === code) {
      audio.pause()
      setPlaying(null)
      return
    }
    audio.src = demoSrc(code)
    audio.onended = () => setPlaying(null)
    audio.play().then(() => setPlaying(code), () => setPlaying(null))
  }

  return (
    <Flex direction="column" gap="18px">
      <Text fontSize="sm" lineHeight="1.8" maxW="48em">{t('voicebankPage.demos.intro')}</Text>
      <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(auto-fill, minmax(340px, 1fr))' }} gap="10px">
        {DEMOS.map((demo) => {
          const isPlaying = playing === demo.code
          return (
            <Flex key={demo.code} alignItems="center" gap="14px" borderRadius="14px" py="10px" pl="10px" pr={4} backgroundColor="white">
              <Button
                type="button"
                onClick={() => toggle(demo.code)}
                aria-label={`${t(isPlaying ? 'voicebankPage.demos.pause' : 'voicebankPage.demos.play')} ${demo.title}`}
                aria-pressed={isPlaying}
                width="44px"
                height="44px"
                flexShrink={0}
                borderRadius="22px"
                backgroundColor="#1b2430"
                color="#df8a42"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
              >
                <svg width="12" height="14" viewBox="0 0 14 16" fill="currentColor" aria-hidden>
                  {isPlaying ? <path d="M2 1h3.5v14H2zM8.5 1H12v14H8.5z" /> : <path d="M1 1l12 7-12 7z" />}
                </svg>
              </Button>
              <Flex flex="1" minW="0" direction="column">
                <Span fontSize="sm" fontWeight="bold" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{demo.title}</Span>
                <Span fontSize="xs">{nameOf(demo.code)}{demo.selfComposed ? ` · ${t('voicebankPage.demos.selfComposed')}` : ''}</Span>
              </Flex>
              <Span fontFamily="'Jost', sans-serif" fontSize="xs" fontWeight="medium" letterSpacing=".08em">{demo.code}</Span>
            </Flex>
          )
        })}
      </Grid>
    </Flex>
  )
}

const VoicebankDownloads = () => {
  const { t } = useI18n()
  const notes = listOf(t, 'voicebankPage.extra.notes', '.lang').map((lang, index) => [lang, t(`voicebankPage.extra.notes.${index}.note`)])

  return (
    <Box as="section" id="download" pt={{ base: 20, md: '110px' }} scrollMarginTop="96px">
      <Heading fontFamily="'Jost', sans-serif" fontWeight="medium" fontSize={{ base: '3rem', md: 'clamp(3rem, 7vw, 6.1rem)' }} lineHeight="1" letterSpacing=".04em">VOICE BANK DATA</Heading>
      <Text mt="14px" fontSize="xl" fontWeight="bold">{t('voicebankPage.data.title')}</Text>
      <Text mt="18px" lineHeight="1.9" maxW="46em">{t('voicebankPage.data.intro')}</Text>

      <Box mt="44px" borderTop="1px solid #1b2430">
        <Item index={1} title={t('voicebankPage.app.title')} en="Recommended · voicebank built in">
          <Flex direction="column" gap={7}>
            <Prose>{t('voicebankPage.app.desc')}</Prose>
            <Flex flexWrap="wrap" gap="14px">
              <DownloadPill href={DOWNLOADS.appWindows} label="Windows" dark />
              <DownloadPill href={DOWNLOADS.appMac} label="macOS" dark />
            </Flex>
            <Steps steps={listOf(t, 'voicebankPage.app.steps')} />
          </Flex>
        </Item>

        <Item index={2} title={t('voicebankPage.zip.title')} en="Voicebank only · for OpenUtau">
          <Flex direction="column" gap={7}>
            <Prose>{t('voicebankPage.zip.desc')}</Prose>
            <Flex flexWrap="wrap" gap="14px">
              <DownloadPill href={DOWNLOADS.zip} label={t('voicebankPage.zip.button')} dark />
              <DownloadPill href={DOWNLOADS.finnish} label="Finnish Phonemizer" />
              <DownloadPill href={DOWNLOADS.latin} label="Latin Phonemizer" />
            </Flex>
            <Steps steps={listOf(t, 'voicebankPage.zip.steps')} />
          </Flex>
        </Item>

        <Item index={3} title={t('voicebankPage.extra.title')} en="Extra languages · 13 phonemizers">
          <Flex direction="column" gap={7}>
            <Prose>{t('voicebankPage.extra.desc')}</Prose>
            <Flex flexWrap="wrap" gap="14px">
              <DownloadPill href={DOWNLOADS.extraChiaki} label={t('voicebankPage.extra.buttonChiaki')} dark />
              <DownloadPill href={DOWNLOADS.extraOfficial} label={t('voicebankPage.extra.buttonOfficial')} />
            </Flex>
            <Steps steps={listOf(t, 'voicebankPage.extra.steps')} />
            <Grid as="dl" gridTemplateColumns={{ base: '1fr', md: 'auto 1fr' }} columnGap={6} rowGap={2} backgroundColor="white" borderRadius="16px" px="22px" py={5} fontSize="sm">
              <Box as="dt" fontWeight="bold">Plugin</Box>
              <Box as="dd" overflowWrap="anywhere"><Code>OpenUtau.Plugin.DiffSingerChiakiExtra.dll</Code></Box>
              <Box as="dt" fontWeight="bold">OpenUtau-Chiaki (macOS)</Box>
              <Box as="dd" overflowWrap="anywhere"><Code>~/Library/OpenUtau-Chiaki/Plugins/</Code></Box>
              <Box as="dt" fontWeight="bold">OpenUtau (macOS)</Box>
              <Box as="dd" overflowWrap="anywhere"><Code>~/Library/OpenUtau/Plugins/</Code></Box>
            </Grid>
            <Flex direction="column" gap={3}>
              <Span fontFamily="'Jost', sans-serif" fontSize="xs" fontWeight="medium" letterSpacing=".14em" color="#a94f0f">{t('voicebankPage.extra.notesTitle')}</Span>
              <Grid as="dl" gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap="10px">
                {notes.map(([lang, note]) => (
                  <Box key={lang} backgroundColor="#f6f8fa" borderRadius="14px" px="18px" py={4}>
                    <Box as="dt" fontSize="sm" fontWeight="bold">{lang}</Box>
                    <Box as="dd" mt="6px" fontSize="sm" lineHeight="1.8">{note}</Box>
                  </Box>
                ))}
              </Grid>
            </Flex>
          </Flex>
        </Item>

        <Item index={4} title={t('voicebankPage.languageList.title')} en="Languages">
          <Flex direction="column" gap={9}>
            <LanguageGroup tier="fluent" eyebrow="FLUENT" />
            <LanguageGroup tier="other" eyebrow="OTHER" />
          </Flex>
        </Item>

        <Item index={5} title={t('voicebankPage.render.title')} en="Render settings">
          <Grid gridTemplateColumns="repeat(auto-fit, minmax(180px, 240px))" gap="14px">
            {RENDER_STEPS.map(([label, value]) => (
              <Box key={label} backgroundColor="white" borderRadius="16px" px="22px" py="18px">
                <Span display="block" fontFamily="'Jost', sans-serif" fontSize="xs" letterSpacing=".14em">{label}</Span>
                <Span fontFamily="'Jost', sans-serif" fontSize="3.25rem" fontWeight="medium" lineHeight="1.1" color="#a94f0f">{value}</Span>
              </Box>
            ))}
          </Grid>
        </Item>

        <Item index={6} title={t('voicebankPage.demos.title')} en="Demo songs">
          <Demos />
        </Item>
      </Box>
    </Box>
  )
}

export default VoicebankDownloads
