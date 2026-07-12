import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, Container, HStack, Stack, styled } from 'styled-system/jsx'
import ProjectLink from 'components/portfolio/ProjectLink'
import VerticalCandidateMenu from './VerticalCandidateMenu'

const Heading = styled.h1
const Text = styled.p
const Span = styled.span
const Kbd = styled.kbd

// 依照實際輸入流程逐鍵重現：
// 注音直接出現在底線組字區，按聲調鍵的當下以 unigram 轉成漢字（延、蘇），
// 打到後面整句重新判斷組出「鹽酥雞」；↓ 開候選窗、數字鍵選字。
const frames = [
  { pressed: 'ㄧ', buffer: 'ㄧ', menu: false, committed: false, note: '逐鍵輸入注音', hold: 450 },
  { pressed: 'ㄢ', buffer: 'ㄧㄢ', menu: false, committed: false, note: '注音直接顯示在組字區', hold: 450 },
  { pressed: 'ˊ', buffer: '延', menu: false, committed: false, note: '按聲調鍵，當下轉成漢字', hold: 750 },
  { pressed: 'ㄙ', buffer: '延ㄙ', menu: false, committed: false, note: '接著打下一個字', hold: 450 },
  { pressed: 'ㄨ', buffer: '延ㄙㄨ', menu: false, committed: false, note: '接著打下一個字', hold: 450 },
  { pressed: '␣', buffer: '延蘇', menu: false, committed: false, note: '一聲是空白鍵，先轉成「蘇」', hold: 750 },
  { pressed: 'ㄐ', buffer: '延蘇ㄐ', menu: false, committed: false, note: '繼續打', hold: 450 },
  { pressed: 'ㄧ', buffer: '延蘇ㄐㄧ', menu: false, committed: false, note: '繼續打', hold: 450 },
  { pressed: '␣', buffer: '鹽酥雞', menu: false, committed: false, note: '看到整句，重新組出「鹽酥雞」', hold: 1000 },
  { pressed: '↓', buffer: '鹽酥雞', menu: true, committed: false, note: '按 ↓ 開啟候選窗', hold: 1500 },
  { pressed: '1', buffer: '鹽酥雞', menu: false, committed: true, note: '按數字鍵選字送出', hold: 1700 },
]

const TypingDemo = () => {
  const [frame, setFrame] = useState(0)

  // 逐格 setTimeout 鏈：每一格照自己的停留時間排下一格，不會跳格或提前重來。
  useEffect(() => {
    const timer = window.setTimeout(() => setFrame((frame + 1) % frames.length), frames[frame].hold)
    return () => window.clearTimeout(timer)
  }, [frame])

  const { pressed, buffer, menu, committed, note } = frames[frame]

  return (
    <Box backgroundColor="#1d1a21" border="1px solid rgba(255,255,255,.14)" borderRadius="24px" boxShadow="0 36px 90px rgba(15,0,35,.55)" overflow="hidden" maxW="760px" mx="auto" width="100%">
      <HStack height="42px" px={4} gap={2} borderBottom="1px solid rgba(255,255,255,.09)">
        {['#ff5f57', '#febc2e', '#28c840'].map((color) => <Box key={color} width="10px" height="10px" borderRadius="full" backgroundColor={color} />)}
        <Text ml={3} fontSize="xs" color="#a9a3b2">文字輸入</Text>
      </HStack>
      <Box minHeight={{ base: '420px', md: '440px' }} position="relative" color="white" overflow="hidden" px={{ base: 6, md: 9 }} py={8} textAlign="left">
        <Text fontSize={{ base: '1.9rem', md: '2.2rem' }} fontWeight="bold" lineHeight="1.7" color="#f5f5f7">
          今晚吃
          {committed
            ? <Span color="#f5f5f7">{buffer}</Span>
            : <Span color="#f5f5f7" style={{ borderBottom: '4px solid #e8e8ec', paddingBottom: 2 }}>{buffer}</Span>}
          <motion.span animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1, repeat: Infinity, times: [0, .5, .5, 1] }} style={{ display: 'inline-block', width: 2, height: '1.6rem', marginLeft: 2, verticalAlign: -3, backgroundColor: '#f5f5f7' }} />
        </Text>
        <HStack mt={4} gap={2} alignItems="center" minHeight="34px">
          <AnimatePresence mode="popLayout">
            <motion.div key={frame} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>
              <Kbd display="inline-flex" minWidth="30px" height="30px" alignItems="center" justifyContent="center" px={2} borderRadius="7px" border="1px solid rgba(255,255,255,.3)" borderBottomWidth="3px" backgroundColor="#2c2733" fontSize="sm" fontWeight="bold">{pressed}</Kbd>
            </motion.div>
          </AnimatePresence>
          <Text fontSize="sm" color="#948c9e" ml={2}>{note}</Text>
        </HStack>
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ opacity: 0, scale: .96, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: .28 }} style={{ position: 'absolute', left: 118, top: 108 }}>
              <VerticalCandidateMenu />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  )
}

// 解析 GitHub latest release 裡的 .pkg 資產，讓下載按鈕可以直接下載。
const releasesFallback = 'https://github.com/chiakich/ChiaKey/releases/latest'

const useLatestPkg = () => {
  const [pkg, setPkg] = useState<{ url: string; version: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('https://api.github.com/repos/chiakich/ChiaKey/releases/latest')
      .then((response) => (response.ok ? response.json() : null))
      .then((release) => {
        if (cancelled || !release) return
        const asset = release.assets?.find((item: { name?: string }) => item.name?.endsWith('.pkg'))
        if (asset?.browser_download_url) setPkg({ url: asset.browser_download_url, version: release.tag_name })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return pkg
}

const ChiaKeyHero = () => {
  const pkg = useLatestPkg()

  return (
    <Box pt="92px" position="relative" overflow="hidden" background="radial-gradient(ellipse at 50% -10%, #b79bd2 0, #3d2159 42%, #1b0e2e 72%, #0e0716 100%)">
      <Container maxW="1120px" px={{ base: '24px', md: '40px' }} pt={{ base: 14, md: 20 }} pb={{ base: 14, md: 20 }} position="relative">
        <Stack alignItems="center" textAlign="center" gap={0}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
            <Text fontFamily="mono" letterSpacing=".28em" color="#dcb8ff" fontSize="sm" fontWeight="900" mb={5}>CHIAKEY · FOR MODERN macOS</Text>
            <Heading fontSize={{ base: '3.6rem', md: '6rem' }} lineHeight="1.02" letterSpacing="-.03em" fontWeight="700">千秋輸入法</Heading>
            <Text mt={6} fontSize={{ base: 'lg', md: '1.35rem' }} lineHeight="1.8" maxW="640px" mx="auto" color="#f4eaff" opacity={.85}>KeyKey 的延續。熟悉的組字手感與候選窗，回到現代 macOS。</Text>
            <HStack mt={8} gap={4} justifyContent="center" flexWrap="wrap">
              <ProjectLink
                href={pkg?.url ?? releasesFallback}
                label="下載"
                detail={pkg ? `${pkg.version} · .pkg` : 'macOS .pkg'}
                accent="#d49bff"
                solid
                download={Boolean(pkg)}
              />
              <ProjectLink href="https://github.com/chiakich/ChiaKey" label="GitHub" accent="#ecdcff" />
            </HStack>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .3 }} style={{ width: '100%', marginTop: '56px' }}>
            <TypingDemo />
            <HStack mt={4} justifyContent="center" color="#ecdcff" fontSize="xs" letterSpacing=".16em"><Span width="7px" height="7px" borderRadius="full" backgroundColor="#6dff9d" boxShadow="0 0 10px #6dff9d" />INPUT METHOD ACTIVE</HStack>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  )
}

export default ChiaKeyHero
