import { useEffect, useState } from 'react'
import { Presets, SplitFlap } from 'react-split-flap'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import { useI18n } from 'i18n'

const Text = styled.p
const Span = styled.span
const Input = styled.input
const Button = styled.button

const ACCENT = '#ff5d52'
const SAMPLES = ['PATAPATA', 'KEIKYU', 'KAWASAKI', 'CHIAKI.CH']

export const FlapClock = () => {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime([now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, '0')).join(''))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Flex alignItems="center" gap="6px" width="fit-content">
      {[time.slice(0, 2), time.slice(2, 4), time.slice(4, 6)].map((part, i) => (
        <Flex key={i} alignItems="center" gap="6px">
          {i > 0 && <Span color={ACCENT} fontWeight="bold" fontSize="1.6rem">:</Span>}
          <SplitFlap value={part} chars={Presets.NUM} length={2} theme="dark" size="large" animateOnMount={false} />
        </Flex>
      ))}
    </Flex>
  )
}

const FlapPlayground = () => {
  const [value, setValue] = useState(SAMPLES[0])
  const { t } = useI18n()

  return (
    <Box>
      <Box overflowX="auto" pb={2}>
        <Box width="fit-content" mx="auto">
          <SplitFlap value={value} chars={Presets.ALPHANUM} length={9} align="left" theme="dark" size="large" timing={40} />
        </Box>
      </Box>
      <Flex mt={6} gap={3} justifyContent="center" flexWrap="wrap" alignItems="center">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase().slice(0, 9))}
          placeholder={t('splitFlapPage.inputPlaceholder')}
          aria-label={t('splitFlapPage.inputLabel')}
          backgroundColor="rgba(255,255,255,.06)"
          border="1px solid rgba(255,255,255,.14)"
          borderRadius="12px"
          px={4}
          py={2}
          color="white"
          fontFamily="monospace"
          letterSpacing=".1em"
          width="220px"
          _focus={{ outline: 'none', borderColor: ACCENT }}
        />
        <HStack gap={2} flexWrap="wrap">
          {SAMPLES.map((sample) => (
            <Button
              key={sample}
              onClick={() => setValue(sample)}
              cursor="pointer"
              fontSize="xs"
              px={3}
              py={2}
              borderRadius="980px"
              border="1px solid rgba(255,255,255,.16)"
              color="rgba(255,255,255,.75)"
              backgroundColor="transparent"
              _hover={{ borderColor: ACCENT, color: ACCENT }}
              style={{ transition: 'all .2s ease' }}
            >
              {sample}
            </Button>
          ))}
        </HStack>
      </Flex>
    </Box>
  )
}

export default FlapPlayground
