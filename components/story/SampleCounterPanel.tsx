import { useEffect, useRef, useState } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'

const Text = styled.p
const SUCCESS_SAMPLE = 3983433956
const START = SUCCESS_SAMPLE - 7
const REVEAL_TICKS = 46 // ~4.1s of being on screen before the success shows

// A sprout drawn with CSS (stem + two leaves), riding the germination line.
const Sprout = () => (
  <Box position="relative" width="16px" height="22px" flexShrink="0">
    <Box
      position="absolute"
      bottom="2px"
      left="50%"
      transform="translateX(-50%)"
      width="2px"
      height="12px"
      background="linear-gradient(#3fae72, #1f6f4a)"
      boxShadow="0 0 6px rgba(80,235,150,.6)"
    />
    <Box
      position="absolute"
      bottom="10px"
      left="2px"
      width="7px"
      height="5px"
      borderRadius="0 90% 0 90%"
      background="#7dffb0"
      transform="rotate(-18deg)"
      boxShadow="0 0 6px rgba(120,255,176,.7)"
    />
    <Box
      position="absolute"
      bottom="10px"
      right="2px"
      width="7px"
      height="5px"
      borderRadius="90% 0 90% 0"
      background="#7dffb0"
      transform="rotate(18deg)"
      boxShadow="0 0 6px rgba(120,255,176,.7)"
    />
    {/* pod / tray */}
    <Box
      position="absolute"
      bottom="0"
      left="50%"
      transform="translateX(-50%)"
      width="16px"
      height="3px"
      borderRadius="1px"
      background="rgba(190,120,60,.6)"
    />
  </Box>
)

const CONVEYOR_PODS = Array.from({ length: 14 })

const TubeDigits = ({
  value,
  color = '#ff8a22',
  size = { base: '1.5rem', md: '3rem' },
}: {
  value: string
  color?: string
  size?: { base: string; md: string }
}) => (
  <Box position="relative" display="inline-block">
    <Text
      position="absolute"
      inset="0"
      fontFamily="nixie"
      fontSize={size}
      color="rgba(178,119,55,.2)"
      aria-hidden="true"
    >
      {'8'.repeat(value.length)}
    </Text>
    <Text
      position="relative"
      fontFamily="nixie"
      fontSize={size}
      color={color}
      textShadow={`0 0 6px ${color}, 0 0 18px ${color}, 0 0 36px rgba(255,90,10,.32)`}
      animation="nixieShine .11s linear infinite"
    >
      {value}
    </Text>
  </Box>
)

const SampleCounterPanel = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  const visibleRef = useRef(false)
  const successRef = useRef(false)
  const ticksVisible = useRef(0)
  const [sample, setSample] = useState(START)
  const [failed, setFailed] = useState(START)
  const [success, setSuccess] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
      },
      { threshold: 0.3 }
    )
    observer.observe(root)

    // Failures pile up forever; the single success only reveals once the panel
    // has been on screen long enough that the viewer has surely seen it.
    const counter = window.setInterval(() => {
      if (!visibleRef.current) return
      setSample((value) => value + 1)
      setFailed((value) => value + 1)
      ticksVisible.current += 1
      if (ticksVisible.current >= REVEAL_TICKS && !successRef.current) {
        successRef.current = true
        setSuccess(1)
      }
    }, 90)

    return () => {
      observer.disconnect()
      window.clearInterval(counter)
    }
  }, [])

  return (
    <Box
      ref={rootRef}
      width="min(980px, calc(100vw - 32px))"
      px={{ base: '16px', md: '34px' }}
      py={{ base: '22px', md: '32px' }}
      border="1px solid rgba(190,92,43,.32)"
      background="radial-gradient(ellipse at center, rgba(38,12,4,.88), rgba(2,2,2,.96) 72%)"
      boxShadow="0 0 80px rgba(181,58,17,.16), inset 0 0 48px rgba(255,78,16,.07)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset="0"
        opacity=".16"
        backgroundImage="repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,113,44,.16) 4px)"
        pointerEvents="none"
      />
      <Flex
        position="relative"
        justifyContent="space-between"
        alignItems="center"
        mb={{ base: '14px', md: '18px' }}
      >
        <Text fontFamily="nixie" fontSize="10px" letterSpacing=".22em" color="rgba(246,141,63,.66)">
          CH-1000 / GERMINATION LINE
        </Text>
        <Text
          fontFamily="nixie"
          fontSize="9px"
          color={success ? '#79ffc0' : 'rgba(255,74,37,.72)'}
          textShadow={success ? '0 0 14px #4ef49d' : '0 0 10px #ff321c'}
        >
          ● {success ? 'SIGNAL ACQUIRED' : 'TESTING'}
        </Text>
      </Flex>

      {/* Germination conveyor: trays of seedlings ride endlessly across */}
      <Box
        position="relative"
        height="76px"
        mb={{ base: '18px', md: '24px' }}
        overflow="hidden"
        borderTop="1px solid rgba(190,92,43,.18)"
        borderBottom="1px solid rgba(190,92,43,.18)"
      >
        <Flex
          position="absolute"
          bottom="14px"
          left="0"
          width="200%"
          alignItems="flex-end"
          justifyContent="space-around"
          animation="conveyor 9s linear infinite"
        >
          {CONVEYOR_PODS.map((_, i) => (
            <Sprout key={i} />
          ))}
        </Flex>
        {/* belt */}
        <Box
          position="absolute"
          bottom="10px"
          left="0"
          right="0"
          height="2px"
          background="repeating-linear-gradient(90deg, rgba(255,150,80,.35) 0 10px, transparent 10px 20px)"
        />
      </Box>

      <Flex
        position="relative"
        gap={{ base: '20px', md: '54px' }}
        justifyContent="center"
        flexWrap="wrap"
        textAlign="center"
      >
        <Box>
          <Text fontFamily="nixie" fontSize="9px" letterSpacing=".17em" color="rgba(255,167,91,.45)" mb="8px">
            FAILED
          </Text>
          <TubeDigits value={String(failed)} />
        </Box>
        <Box>
          <Text fontFamily="nixie" fontSize="9px" letterSpacing=".17em" color="rgba(255,167,91,.45)" mb="8px">
            SUCCESS
          </Text>
          <TubeDigits value={String(success).padStart(7, '0')} color={success ? '#70ffae' : '#ff8a22'} />
        </Box>
      </Flex>

      {success ? (
        <Box position="relative" mt={{ base: '20px', md: '30px' }} textAlign="center">
          <Text
            fontFamily="nixie"
            fontSize={{ base: '11px', md: '14px' }}
            letterSpacing=".12em"
            color="rgba(126,255,183,.95)"
            textShadow="0 0 15px rgba(91,255,162,.65)"
          >
            種苗#{SUCCESS_SAMPLE} 偵測到微弱訊號
          </Text>
          <Text
            mt="8px"
            fontFamily="nixie"
            fontSize={{ base: '9px', md: '11px' }}
            letterSpacing=".12em"
            color="rgba(230,129,66,.4)"
          >
            種苗#{sample} ……応答なし
          </Text>
        </Box>
      ) : (
        <Text
          position="relative"
          mt={{ base: '20px', md: '30px' }}
          textAlign="center"
          fontFamily="nixie"
          fontSize={{ base: '10px', md: '13px' }}
          letterSpacing=".12em"
          color="rgba(230,129,66,.42)"
        >
          種苗#{sample} ……応答なし
        </Text>
      )}
    </Box>
  )
}

export default SampleCounterPanel
