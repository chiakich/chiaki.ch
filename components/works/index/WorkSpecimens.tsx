import dynamic from 'next/dynamic'
import { m } from 'framer-motion'
import { Box, Flex, Grid, HStack, styled } from 'styled-system/jsx'
import VerticalCandidateMenu from 'components/works/chiakey/VerticalCandidateMenu'
import { useI18n } from 'i18n'
import { LazyImg as Image } from 'components/ui/LazyImg'
import { LetterpressFilters, LetterpressStyles } from 'kappan/react'
import { DEMO_OPTIONS, demoCss } from 'components/works/letterpress/pressOptions'

// Flap components are client-only (react-split-flap injects styles at runtime)
export const SplitFlapSpecimen = dynamic(() => import('components/works/split-flap/BoardSpecimen'), { ssr: false })

const Text = styled.p
const Span = styled.span

export const ChiaKeySpecimen = () => {
  const { t } = useI18n()
  return (
  <Box width="100%" height="100%" backgroundColor="#1d1a21" position="relative" overflow="hidden" color="white">
    <Text position="absolute" style={{ top: 30, left: 24 }} fontSize="1.7rem" fontWeight="bold" color="#f5f5f7">
      今晚吃<Span style={{ borderBottom: '3px solid #e8e8ec', paddingBottom: 1 }}>鹽酥雞</Span>
    </Text>
    <Text position="absolute" style={{ top: 74, left: 24 }} fontSize="xs" color="#8b8b93">{t('worksPage.specimens.chiakeyHint')}</Text>
    <m.div style={{ position: 'absolute', left: '32%', top: '30%', transformOrigin: 'top left', scale: .74 }} animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, 6] }} transition={{ duration: 5, repeat: Infinity }}>
      <VerticalCandidateMenu compact />
    </m.div>
  </Box>
  )
}

export const KumikoSpecimen = () => {
  const { t } = useI18n()
  return (
  <Box width="100%" height="100%" backgroundColor="#17181b" position="relative" overflow="hidden">
    <Image src="/assets/works/kumiko/editor.webp" alt={t('worksPage.specimens.kumikoAlt')} width="100%" height="100%" objectFit="cover" objectPosition="center" opacity={.85} />
    <m.div style={{ position: 'absolute', left: 16, bottom: 14, background: 'rgba(23,24,27,.85)', border: '1px solid rgba(255,234,47,.4)', borderRadius: 8, padding: '6px 12px', fontFamily: 'monospace', color: '#ffea2f', fontSize: 13 }} animate={{ opacity: [.55, 1, .55] }} transition={{ duration: 3.2, repeat: Infinity }}>⿰糹扁 → 編</m.div>
  </Box>
  )
}

export const LetterpressSpecimen = () => {
  const { t } = useI18n()
  return (
  <Box className="lp" width="100%" height="100%" position="relative" overflow="hidden">
    {/* 這張卡是索引頁唯一用到質感層的地方，樣式與濾鏡就掛在這裡。
        demoCss 也要跟著 —— 一點明體子集的 @font-face 只寫在那裡，
        少了它這張卡會掉回系統明體，跟點進去之後的字不一樣。 */}
    <LetterpressStyles {...DEMO_OPTIONS} />
    <LetterpressFilters {...DEMO_OPTIONS} />
    <style dangerouslySetInnerHTML={{ __html: demoCss }} />
    <i className="lp-fibre" />
    <i className="lp-expose" />
    <i className="lp-grain" />
    <Box position="relative" zIndex={1} height="100%" display="flex" alignItems="center" justifyContent="center">
      <Text className="sg lp-v" style={{ fontSize: 'clamp(30px, 5vw, 44px)', letterSpacing: '.3em', textIndent: '.15em', fontWeight: 600 }}>
        {t('worksPage.specimens.letterpressSample')}
      </Text>
    </Box>
  </Box>
  )
}

export const TokyonoSpecimen = () => {
  const { t } = useI18n()
  return (
  <Box width="100%" height="100%" position="relative" overflow="hidden" backgroundColor="#70899c">
    <Image src="/assets/works/tokyono-sora/dark.webp" alt={t('worksPage.specimens.tokyonoAlt')} width="100%" height="100%" objectFit="cover" />
    {[['12%', '18%'], ['54%', '52%'], ['68%', '19%']].map(([left, top], index) => (
      <m.div key={index} style={{ position: 'absolute', left, top, width: index === 1 ? '34%' : '27%', height: 36, borderRadius: 9, background: 'rgba(237,247,251,.72)', backdropFilter: 'blur(8px)' }} animate={{ y: [0, -7, 0] }} transition={{ duration: 3.5 + index, repeat: Infinity }} />
    ))}
  </Box>
  )
}

export const TgJpgSpecimen = () => {
  const { t } = useI18n()
  return (
  <Flex width="100%" height="100%" backgroundColor="#142232" direction="column" justifyContent="center" px={{ base: 5, md: 8 }} gap={3} overflow="hidden">
    <m.div animate={{ x: [40, 0, 0], opacity: [0, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity }}>
      <Box ml="auto" width="68%" backgroundColor="#2d72a8" borderRadius="12px 12px 3px 12px" px={4} py={2} color="white">mic drop.gif</Box>
    </m.div>
    <m.div animate={{ y: [12, 0, 0], opacity: [0, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity, delay: .65 }}>
      <HStack width="78%" backgroundColor="#20364b" borderRadius="12px 12px 12px 3px" px={3} py={3} color="#7bc3ff">
        <Box width="32px" height="24px" borderRadius="5px" background="linear-gradient(135deg,#c9a06f,#593a27)" />
        <Text fontSize="sm">{t('worksPage.specimens.tgJpgReply')}</Text>
      </HStack>
    </m.div>
    <Grid columns={4} gap={2} mt={1}>{['GOOGLE', 'DDG', 'BING', 'SEND'].map((item, index) => <m.div key={item} animate={{ opacity: [.25, 1, .25] }} transition={{ duration: 2.2, repeat: Infinity, delay: index * .35 }}><Text fontSize="9px" color="#57b5ff">{item}</Text></m.div>)}</Grid>
  </Flex>
  )
}

export const ZipcodeSpecimen = () => {
  const { t } = useI18n()
  return (
  <Flex width="100%" height="100%" backgroundColor="#0f1a15" direction="column" justifyContent="center" px={{ base: 5, md: 8 }} gap={4} overflow="hidden">
    <Box backgroundColor="rgba(255,255,255,.05)" border="1px solid rgba(255,255,255,.08)" borderRadius="10px" px={4} py={2.5}>
      <Text fontSize="sm" color="#eafff5">松江路100號</Text>
    </Box>
    <HStack gap={1.5}>
      {'104091'.split('').map((digit, index) => (
        <m.div key={index} animate={{ opacity: [.15, 1, 1, .15] }} transition={{ duration: 3.4, repeat: Infinity, delay: index * .12 }} style={{ width: 26, height: 34, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 700, color: '#eafff5', background: 'rgba(63,207,142,.14)', border: '1px solid rgba(63,207,142,.45)' }}>{digit}</m.div>
      ))}
    </HStack>
    <Text fontSize="10px" color="#3fcf8e" letterSpacing=".08em">{t('worksPage.specimens.zipcodeHint')}</Text>
  </Flex>
  )
}
