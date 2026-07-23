import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, Container, HStack, Stack, styled } from 'styled-system/jsx'
import ProjectLink from 'components/portfolio/ProjectLink'
import { useI18n } from 'i18n'
import VerticalCandidateMenu from './VerticalCandidateMenu'

const Text = styled.p
const Heading = styled.h1
const Span = styled.span
const Kbd = styled.kbd
const Image = styled.img

// 大標題本身就是輸入過程：逐鍵打注音，
// 打到 ㄕㄨ 時 unigram 先猜「書」（顯示「千秋書」），
// ㄖㄨˋ 進來之後被「輸入」校正，最後停在「千秋輸入法」並開出候選窗。
// note 是 chiakeyPage.hero.notes 底下的 key，渲染時再翻譯。
const frames: { pressed: string; buffer: string; note?: string; menu?: boolean; hold: number }[] = [
  { pressed: 'ㄑ', buffer: 'ㄑ', hold: 130 },
  { pressed: 'ㄧ', buffer: 'ㄑㄧ', hold: 130 },
  { pressed: 'ㄢ', buffer: 'ㄑㄧㄢ', hold: 130 },
  { pressed: '␣', buffer: '千', note: 'toneSpace', hold: 340 },
  { pressed: 'ㄑ', buffer: '千ㄑ', hold: 130 },
  { pressed: 'ㄧ', buffer: '千ㄑㄧ', hold: 130 },
  { pressed: 'ㄡ', buffer: '千ㄑㄧㄡ', hold: 130 },
  { pressed: '␣', buffer: '千秋', hold: 340 },
  { pressed: 'ㄕ', buffer: '千秋ㄕ', hold: 130 },
  { pressed: 'ㄨ', buffer: '千秋ㄕㄨ', hold: 130 },
  { pressed: '␣', buffer: '千秋書', note: 'guess', hold: 620 },
  { pressed: 'ㄖ', buffer: '千秋書ㄖ', hold: 130 },
  { pressed: 'ㄨ', buffer: '千秋書ㄖㄨ', hold: 130 },
  { pressed: 'ˋ', buffer: '千秋輸入', note: 'correction', hold: 620 },
  { pressed: 'ㄈ', buffer: '千秋輸入ㄈ', hold: 130 },
  { pressed: 'ㄚ', buffer: '千秋輸入ㄈㄚ', hold: 130 },
  { pressed: 'ˇ', buffer: '千秋輸入法', note: 'done', menu: true, hold: 10000 },
]

const menuItems = ['輸入法', '法', '髮', '琺', '砝', '鍅', '灋', '珐']

const TypingTitle = () => {
  const { t } = useI18n()
  const [frame, setFrame] = useState(0)

  // 逐格 setTimeout 鏈：每一格照自己的停留時間排下一格。
  useEffect(() => {
    const timer = window.setTimeout(() => setFrame((frame + 1) % frames.length), frames[frame].hold)
    return () => window.clearTimeout(timer)
  }, [frame])

  const { pressed, buffer, note, menu } = frames[frame]

  return (
    <Stack alignItems="center" gap={5}>
      {/* 字級放在容器上讓游標（em 高）與候選窗定位（em 對齊「法」）都跟著縮放 */}
      <Box
        position="relative"
        display="inline-block"
        fontSize={{ base: '3rem', md: '5.6rem' }}
        minHeight={{ base: '4.4rem', md: '7rem' }}
      >
        <Span
          fontWeight="bold"
          letterSpacing=".02em"
          lineHeight="1.15"
          color="#ffffff"
          style={{ borderBottom: '5px solid #e8e8ec', paddingBottom: 4 }}
        >
          {buffer}
        </Span>
        <motion.span
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          style={{
            display: 'inline-block',
            width: 4,
            height: '.92em',
            marginLeft: 5,
            verticalAlign: '-.1em',
            backgroundColor: '#f5f5f7',
          }}
        />
        {/* 不用 AnimatePresence 退場：loop 重來時標題寬度瞬間縮短，
            殘留的選字框會跟著錨點往左飛，直接卸載比較乾淨 */}
        {menu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            style={{
              position: 'absolute',
              left: 'calc(100% - 1.1em)',
              top: '100%',
              zIndex: 5,
              WebkitMaskImage: 'linear-gradient(180deg, #000 26%, transparent 72%)',
              maskImage: 'linear-gradient(180deg, #000 26%, transparent 65%)',
            }}
          >
            <VerticalCandidateMenu items={menuItems} page="1/2" />
          </motion.div>
        )}
      </Box>
      <HStack gap={2} alignItems="center" minHeight="32px">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={frame}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Kbd
              display="inline-flex"
              minWidth="28px"
              height="28px"
              alignItems="center"
              justifyContent="center"
              px={2}
              borderRadius="7px"
              border="1px solid rgba(255,255,255,.3)"
              borderBottomWidth="3px"
              backgroundColor="#2c2733"
              fontSize="sm"
              fontWeight="bold"
            >
              {pressed}
            </Kbd>
          </motion.div>
        </AnimatePresence>
        <Text fontSize="sm" color="#b7aec3" ml={1} minWidth="180px" textAlign="left">
          {note ? t(`chiakeyPage.hero.notes.${note}`) : ''}
        </Text>
      </HStack>
      {/* 候選窗的保留區：選字框（下緣漸層淡出）浮在這塊空間裡，不會蓋到副標與按鈕 */}
      <Box height={{ base: '90px', md: '100px' }} width="100%" aria-hidden />
    </Stack>
  )
}

// 下載檔固定由 CDN 提供；版本則從 appcast 的 stable release 取得。
const pkgUrl = 'https://cdn.chiaki.ch/chiakey/ChiaKey.pkg'
const appcastUrl = 'https://cdn.chiaki.ch/chiakey/appcast.json'

const useLatestPkg = () => {
  const [pkg, setPkg] = useState<{ url: string; version: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(appcastUrl)
      .then((response) => (response.ok ? response.json() : null))
      .then((appcast: { stable?: { tag?: string } } | null) => {
        const version = appcast?.stable?.tag
        if (!cancelled && version) setPkg({ url: pkgUrl, version })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return pkg
}

const ChiaKeyHero = () => {
  const pkg = useLatestPkg()
  const { t } = useI18n()

  return (
    <Box
      pt={{ base: '76px', md: '116px' }}
      position="relative"
      overflow="hidden"
      background="radial-gradient(ellipse at 50% -10%, #b79bd2 0, #3d2159 42%, #1b0e2e 72%, #0e0716 100%)"
    >
      <Container
        maxW="1120px"
        px={{ base: '24px', md: '40px' }}
        pt={{ base: 14, md: 20 }}
        pb={{ base: 8, md: 10 }}
        position="relative"
      >
        <Stack alignItems="center" textAlign="center" gap={0}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/assets/works/chiakey/chiakey-icon.webp"
              alt={t('chiakeyPage.hero.iconAlt')}
              width={{ base: '76px', md: '104px' }}
              height={{ base: '76px', md: '104px' }}
              mx="auto"
              mb={5}
              borderRadius={{ base: '17px', md: '23px' }}
              boxShadow="0 18px 40px rgba(7,2,14,.38)"
            />
            <Heading
              fontFamily="mono"
              letterSpacing=".28em"
              color="#dcb8ff"
              fontSize="sm"
              fontWeight="black"
              mb={8}
            >
              {t('chiakeyPage.hero.title')}
              {/* keyword-rich h1 suffix for SEO/a11y; visually the short label is enough */}
              <Span
                position="absolute"
                width="1px"
                height="1px"
                margin="-1px"
                padding="0"
                overflow="hidden"
                border="0"
                style={{ clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
              >
                {t('chiakeyPage.hero.srSubtitle')}
              </Span>
            </Heading>
            <TypingTitle />
            <Text
              mt={8}
              fontSize={{ base: 'lg', md: '1.35rem' }}
              lineHeight="1.8"
              maxW="640px"
              mx="auto"
              color="#f4eaff"
              opacity={0.85}
            >
              {t('chiakeyPage.hero.lead')}
            </Text>
            <HStack mt={8} gap={4} justifyContent="center" flexWrap="wrap">
              <ProjectLink
                href={pkg?.url ?? pkgUrl}
                label={t('chiakeyPage.hero.download')}
                detail={pkg ? `${pkg.version} .pkg` : 'macOS .pkg'}
                accent="#d49bff"
                solid
                download={Boolean(pkg)}
              />
              <ProjectLink
                href="https://github.com/chiakich/ChiaKey"
                label={t('chiakeyPage.hero.source')}
                accent="#ecdcff"
              />
            </HStack>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  )
}

export default ChiaKeyHero
