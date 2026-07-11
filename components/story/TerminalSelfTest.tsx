import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'

const Text = styled.p

type Scene = 'lift' | 'crop' | 'conclusion'

const CLAY = '#d9895c' // Claude Code's clay/orange accent
const USER_PROMPT = 'Run scheduled tasks #36574'
const INTRO = '好的。我來再次檢查看看目前的狀態讀數。'

const checks: { text: string; scene: Scene }[] = [
  { text: '===升力測試===', scene: 'lift' },
  { text: '大氣密度：1.2250 kg/m3 [正常]。', scene: 'lift' },
  { text: '測試機翼升力：L = ½·ρV²·S·C_L', scene: 'lift' },
  { text: '理論值：1N ／ 實測：0.3N', scene: 'lift' },
  { text: '錯誤：低於理論值，原因未知。', scene: 'lift' },
  { text: '===作物成長狀態===', scene: 'crop' },
  { text: '土壤養分：符合基準 [正常]。', scene: 'crop' },
  { text: '理論產量：120% ／ 實測：34%', scene: 'crop' },
  { text: '錯誤：連續 11,247 日歉收，原因未知。', scene: 'crop' },
  { text: '===綜合診斷===', scene: 'conclusion' },
  { text: '所有參數均在正常範圍。', scene: 'conclusion' },
]
const CHECKS_TEXT = checks.map((c) => c.text).join('\n')

const ASSISTANT_REPLY = [
  '依然不太對勁。',
  '不過我把所有指標都跑過一遍——大氣、升力、作物產量，',
  '數字上全都「成立」，我找不到任何故障點。',
  '也許出問題的，並不是能被測量的東西。',
  '=== END OF DIAGNOSTIC ===',
].join('\n')

const art: Record<Scene, string[]> = {
  lift: [
    '  .--~~--.  ',
    ' (   ~~   ) ',
    "  `-.__.-'  ",
    '   | | |    ',
    '   v v v    ',
    ' _/=====\\_  ',
    '  L=0.3N    ',
  ],
  crop: [
    '   \\ | /    ',
    '    \\|/     ',
    '  ~~~#~~~   ',
    '  CH-1000   ',
    '  YIELD34%  ',
    '  NO REPLY  ',
    '            ',
  ],
  conclusion: [
    ' +--------+ ',
    ' |NOMINAL | ',
    ' +--------+ ',
    ' ~~~~~~~~~~ ',
    ' LUCK:0.00  ',
    ' NO ANOMALY ',
    '            ',
  ],
}

// Claude's spinner: a sparkle that grows and shrinks
const SPINNER = ['·', '✢', '✳', '∗', '✻', '✽', '✻', '∗', '✳', '✢']
const GERUNDS = ['診斷中', '檢查中', '比對數據', '正在推敲原因']

// step: 0 idle · 1 prompt · 2 intro · 3 running checks · 4 reply · 5 done
const TerminalSelfTest = ({ onComplete }: { onComplete?: () => void }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [typedUser, setTypedUser] = useState(0)
  const [typedIntro, setTypedIntro] = useState(0)
  const [typedChecks, setTypedChecks] = useState(0)
  const [typedReply, setTypedReply] = useState(0)
  const [spinPhase, setSpinPhase] = useState(0)
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStep((s) => (s === 0 ? 1 : s))
        } else {
          setStep(0)
          setTypedUser(0)
          setTypedIntro(0)
          setTypedChecks(0)
          setTypedReply(0)
          setSecs(0)
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  // Phase-1: type the human prompt
  useEffect(() => {
    if (step !== 1) return
    const id = window.setInterval(() => {
      setTypedUser((n) => {
        if (n >= USER_PROMPT.length) {
          window.clearInterval(id)
          window.setTimeout(() => setStep(2), 500)
          return n
        }
        return n + 1
      })
    }, 105)
    return () => window.clearInterval(id)
  }, [step])

  // Phase-2: assistant says it will take a look, before running any tools
  useEffect(() => {
    if (step !== 2) return
    const id = window.setInterval(() => {
      setTypedIntro((n) => {
        if (n >= INTRO.length) {
          window.clearInterval(id)
          window.setTimeout(() => setStep(3), 650)
          return n
        }
        return n + 1
      })
    }, 78)
    return () => window.clearInterval(id)
  }, [step])

  // Phase-3: stream the tool checks
  useEffect(() => {
    if (step !== 3) return
    const id = window.setInterval(() => {
      setTypedChecks((n) => {
        if (n >= CHECKS_TEXT.length) {
          window.clearInterval(id)
          window.setTimeout(() => setStep(4), 850)
          return n
        }
        return n + 1
      })
    }, 40)
    return () => window.clearInterval(id)
  }, [step])

  // Phase-4: type the assistant reply
  useEffect(() => {
    if (step !== 4) return
    const id = window.setInterval(() => {
      setTypedReply((n) => {
        if (n >= ASSISTANT_REPLY.length) {
          window.clearInterval(id)
          setStep(5)
          onComplete?.()
          return n
        }
        return n + 1
      })
    }, 78)
    return () => window.clearInterval(id)
  }, [step, onComplete])

  // Spinner + elapsed seconds while running (slowed down)
  useEffect(() => {
    if (step !== 3) return
    const spin = window.setInterval(() => setSpinPhase((p) => p + 1), 150)
    const clock = window.setInterval(() => setSecs((s) => s + 1), 1000)
    return () => {
      window.clearInterval(spin)
      window.clearInterval(clock)
    }
  }, [step])

  const currentScene = useMemo<Scene>(() => {
    if (step >= 4) return 'conclusion'
    let consumed = 0
    let scene: Scene = checks[0].scene
    for (const c of checks) {
      if (typedChecks > consumed) scene = c.scene
      consumed += c.text.length + 1
    }
    return scene
  }, [typedChecks, step])

  const running = step === 3
  const glyph = running ? SPINNER[spinPhase % SPINNER.length] : '✻' // settles and stays
  const gerund = GERUNDS[Math.floor(spinPhase / 8) % GERUNDS.length]

  return (
    <Box
      ref={rootRef}
      width="min(780px, calc(100vw - 36px))"
      minHeight="360px"
      px={{ base: '18px', md: '26px' }}
      py={{ base: '18px', md: '22px' }}
      border="1px solid rgba(89,213,183,.18)"
      borderRadius="12px"
      background="linear-gradient(rgba(6,20,16,.94), rgba(0,8,6,.97))"
      boxShadow="0 0 80px rgba(47,220,173,.16), inset 0 0 8px rgba(197,255,237,.14)"
      backdropFilter="blur(10px)"
      overflow="hidden"
      position="relative"
      animation="crtFlicker 7s linear infinite"
      fontFamily="cubic"
      fontSize={{ base: '13px', md: '17px' }}
      lineHeight="1.95"
      textAlign="left"
    >
      <Box
        position="absolute"
        inset="0"
        opacity=".16"
        backgroundImage="repeating-linear-gradient(0deg, transparent 0 3px, rgba(120,255,220,.1) 4px)"
        pointerEvents="none"
      />

      <Box position="relative">
        {/* Human prompt inside a rounded input box */}
        <Box
          border="1px solid"
          borderColor={`color-mix(in srgb, ${CLAY} 38%, transparent)`}
          borderRadius="8px"
          px="12px"
          py="7px"
          mb="14px"
          background="rgba(0,0,0,.28)"
        >
          <Flex gap="8px" alignItems="baseline">
            <Box as="span" style={{ color: CLAY }} flexShrink="0">
              &gt;
            </Box>
            <Box as="span" color="rgba(245,238,225,.96)">
              {USER_PROMPT.slice(0, typedUser)}
              {step === 1 && typedUser < USER_PROMPT.length && (
                <Box as="span" ml="1px" animation="cursorBlink .72s steps(1) infinite">
                  ▌
                </Box>
              )}
            </Box>
          </Flex>
        </Box>

        {/* Assistant acknowledges before running anything */}
        {step >= 2 && (
          <Text mb="14px" color="rgba(236,248,242,.96)">
            {INTRO.slice(0, typedIntro)}
            {step === 2 && typedIntro < INTRO.length && (
              <Box as="span" ml="1px" style={{ color: CLAY }} animation="cursorBlink .72s steps(1) infinite">
                ▌
              </Box>
            )}
          </Text>
        )}

        {/* Tool call: world-state diagnostic */}
        {step >= 3 && (
          <Box mb={step >= 4 ? '14px' : '0'}>
            <Flex gap="9px" alignItems="center" flexWrap="wrap">
              <Box
                as="span"
                flexShrink="0"
                fontSize={{ base: '14px', md: '17px' }}
                style={{ color: CLAY }}
                textShadow={`0 0 10px ${CLAY}`}
              >
                {glyph}
              </Box>
              <Box as="span" color="rgba(232,247,240,.92)">
                世界狀態診斷
              </Box>
              {running && (
                <>
                  <Box as="span" style={{ color: CLAY }} opacity=".9">
                    {gerund}…
                  </Box>
                  <Box as="span" color="rgba(150,200,185,.4)" fontSize="11px">
                    (esc to interrupt · {secs}s)
                  </Box>
                </>
              )}
            </Flex>

            {/* Tree-branched results */}
            <Flex mt="6px" gap="8px" alignItems="flex-start">
              <Box as="span" color="rgba(120,190,170,.5)" flexShrink="0" pl="4px">
                ⎿
              </Box>
              <Box flex="1" minWidth="0">
                <Box
                  whiteSpace="pre-wrap"
                  color="rgba(161,255,222,.72)"
                  textShadow="0 0 4px rgba(145,255,219,.55)"
                >
                  {CHECKS_TEXT.slice(0, typedChecks)}
                  {running && typedChecks < CHECKS_TEXT.length && (
                    <Box as="span" ml="1px" animation="cursorBlink .72s steps(1) infinite">
                      ▌
                    </Box>
                  )}
                </Box>
                {/* inline diagnostic sketch (the reactive ASCII art) */}
                <Box
                  key={currentScene}
                  display={{ base: 'none', md: 'block' }}
                  mt="8px"
                  animation="artReveal .5s ease both"
                  style={{ fontFamily: "'Courier New', ui-monospace, monospace" }}
                  fontSize="11px"
                  lineHeight="1.15"
                  color="rgba(120,235,195,.5)"
                >
                  {art[currentScene].map((row, y) => (
                    <Box key={y} whiteSpace="pre" opacity={(y * 3 + spinPhase) % 11 < 2 ? 0.35 : 0.8}>
                      {row}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Flex>
          </Box>
        )}

        {/* Assistant reply — plain text, like Claude's messages */}
        {step >= 4 && (
          <Text whiteSpace="pre-wrap" color="rgba(236,248,242,.96)">
            {ASSISTANT_REPLY.slice(0, typedReply)}
            {step === 4 && typedReply < ASSISTANT_REPLY.length && (
              <Box as="span" ml="1px" style={{ color: CLAY }} animation="cursorBlink .72s steps(1) infinite">
                ▌
              </Box>
            )}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export default TerminalSelfTest
