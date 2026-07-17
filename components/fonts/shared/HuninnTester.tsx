import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from 'i18n'

const Text = styled.p
const Textarea = styled.textarea
const Input = styled.input
const Span = styled.span

// justfont huninn palette: dark controls, paper-white preview
const YELLOW = '#febb27'
const PAPER = '#eeefe9'
const INK = '#342c2c'

// Lazy-load the full 2MB woff2 only when the tester scrolls into view
const useFullHuninn = (ref: React.RefObject<HTMLElement | null>) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    const el = ref.current
    if (!el || status !== 'idle') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()
        setStatus('loading')
        const font = new FontFace(
          'huninn-full',
          'url(/assets/fonts/jf-openhuninn-2.1.woff2) format("woff2")'
        )
        font
          .load()
          .then((loaded) => {
            document.fonts.add(loaded)
            setStatus('ready')
          })
          .catch(() => setStatus('error'))
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, status])

  return status
}

const HuninnTester = () => {
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const status = useFullHuninn(containerRef)
  const [text, setText] = useState(() => t('huninnPage.defaultText'))
  const [size, setSize] = useState(48)

  return (
    <Box ref={containerRef}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        mb={4}
        alignItems={{ base: 'stretch', md: 'center' }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          flex="1"
          backgroundColor="#111"
          border="1px solid #333"
          px={4}
          py={3}
          fontSize="md"
          color="white"
          resize="none"
          _focus={{ outline: 'none', borderColor: '#febb27' }}
          placeholder={t('huninnPage.placeholder')}
        />
        <HStack gap={3} flexShrink={0}>
          <Span fontSize="sm" opacity={0.6} whiteSpace="nowrap">
            {size}px
          </Span>
          <Input
            type="range"
            min={20}
            max={120}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            width="160px"
            style={{ accentColor: YELLOW }}
          />
        </HStack>
      </Flex>

      <Box
        style={{ backgroundColor: PAPER }}
        clipPath="polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)"
        px={{ base: 5, md: 8 }}
        py={{ base: 6, md: 10 }}
        minHeight="180px"
        position="relative"
      >
        {status !== 'ready' && (
          <Text
            position="absolute"
            top={3}
            right={5}
            fontSize="xs"
            opacity={0.5}
            style={{ color: INK }}
          >
            {status === 'error'
              ? t('huninnPage.loadError')
              : t('huninnPage.loading')}
          </Text>
        )}
        <Text
          lineHeight="1.6"
          wordBreak="break-word"
          style={{ fontFamily: 'huninn-full, huninn, "Noto Sans TC", sans-serif', fontSize: size, color: INK }}
        >
          {text || ' '}
        </Text>
      </Box>
    </Box>
  )
}

export default HuninnTester
