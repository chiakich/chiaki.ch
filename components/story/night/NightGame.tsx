import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import { CHANNEL_GOAL } from 'lib/night/engine'
import { NightPlayer } from 'lib/night/player'
import type { Snapshot } from 'lib/night/types'
import NightChoices from './NightChoices'
import NightHud from './NightHud'
import NightLog from './NightLog'
import NightStage, { type Rect } from './NightStage'
import NightWhisper from './NightWhisper'

const Button = styled.button
const Link = styled.a
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace'
const NAME = '千亞紀'
const GATE_KEY = 'night-slice-adult'

const START_LABEL: Record<string, string> = {
  'pre.start': '前日談 · 兩天（終端接通 → 監視器事件 → N1）',
  'n1.seed': 'N1 · 第一天（朝會 → 深夜 → 私人頻道）',
  'n2.start': 'N2 · 第二夜（頭目 → 打手，撞見）',
  'n3.start': 'N3 · 第三夜（攝影機、高潮時機）',
  'n4.start': 'N4 · 第四夜（標記夜，崩潰）',
  'n5.start': 'N5 · 第五夜（深夜 → 私人頻道）',
}

// Each scene has its own light: daylight through the station, a darkroom safelight at night,
// and only the terminal's glow once everyone is asleep.
const MODE_BACKGROUND: Record<string, string> = {
  day: 'radial-gradient(ellipse 72% 74% at 56% 35%, #2b1008 0%, #100704 46%, #030201 100%)',
  perf:
    'radial-gradient(ellipse 55% 42% at 50% -6%, rgba(255,48,24,.42) 0%, transparent 72%),' +
    'radial-gradient(ellipse 95% 85% at 50% 38%, #4a0606 0%, #1c0202 55%, #060000 100%)',
  private:
    'radial-gradient(ellipse 62% 48% at 50% 108%, rgba(140,170,210,.15) 0%, transparent 72%),' +
    'radial-gradient(ellipse 70% 70% at 50% 60%, #1e1208 0%, #0c0704 55%, #020101 100%)',
}

const readGate = () => {
  try {
    return sessionStorage.getItem(GATE_KEY) === '1'
  } catch {
    return false
  }
}

const writeGate = () => {
  try {
    sessionStorage.setItem(GATE_KEY, '1')
  } catch {
    // Private windows can refuse storage; the gate just asks again next time.
  }
}

const PrimaryButton = (props: React.ComponentProps<typeof Button>) => (
  <Button
    type="button"
    px="16px"
    py="10px"
    border="1px solid rgba(238,150,98,.6)"
    background="rgba(231,105,45,.16)"
    color="#fff"
    fontSize="14px"
    textAlign="left"
    cursor="pointer"
    transition="all .15s"
    _hover={{ background: 'rgba(231,105,45,.3)' }}
    {...props}
  />
)

const Panel = ({ children }: { children: React.ReactNode }) => (
  <Flex
    position="absolute"
    inset="0"
    alignItems="center"
    justifyContent="center"
    p="16px"
    zIndex="5"
  >
    <Box
      width="min(460px, 100%)"
      border="1px solid rgba(238,150,98,.4)"
      background="rgba(10,4,2,.94)"
      p={{ base: '20px', md: '28px' }}
      animation="lexiconReveal .35s ease both"
    >
      {children}
    </Box>
  </Flex>
)

const SummaryPanel = ({
  summary,
  onMenu,
}: {
  summary: NonNullable<Snapshot['summary']>
  onMenu: () => void
}) => (
  <Panel>
    <Box
      fontSize="10px"
      letterSpacing=".2em"
      color="rgba(238,150,98,.7)"
      style={{ fontFamily: MONO }}
    >
      DAY {summary.day} · END
    </Box>
    <Box
      mt="14px"
      display="grid"
      gap="8px"
      fontSize="14px"
      color="rgba(255,236,220,.92)"
    >
      <Box>
        通道 {summary.channel}/{CHANNEL_GOAL}
        <Box as="span" ml="8px" color="#ffb27a">
          {summary.delta >= 0 ? `+${summary.delta}` : summary.delta}
        </Box>
      </Box>
      <Box>剩餘電量 {summary.battery}</Box>
    </Box>
    <Box mt="16px" fontSize="11px" color="rgba(238,150,98,.7)">
      千亞紀對你的了解
    </Box>
    <Box
      as="ul"
      mt="6px"
      display="grid"
      gap="4px"
      fontSize="13px"
      color="rgba(255,236,220,.85)"
    >
      {summary.list.map((item) => (
        <Box as="li" key={item}>
          · {item}
        </Box>
      ))}
    </Box>
    <Box mt="22px">
      <PrimaryButton onClick={onMenu}>回到選單</PrimaryButton>
    </Box>
  </Panel>
)

const NightGame = () => {
  const [player, setPlayer] = useState<NightPlayer | null>(null)
  const [adult, setAdult] = useState(false)
  const [debug, setDebug] = useState(false)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    setAdult(readGate())
    setPlayer(new NightPlayer())
  }, [])

  if (!player) return null
  return (
    <Game
      player={player}
      adult={adult}
      onAdult={() => {
        writeGate()
        setAdult(true)
      }}
      debug={debug}
      setDebug={setDebug}
      speed={speed}
      setSpeed={(value) => {
        player.speed = value
        setSpeed(value)
      }}
    />
  )
}

type GameProps = {
  player: NightPlayer
  adult: boolean
  onAdult: () => void
  debug: boolean
  setDebug: (value: boolean) => void
  speed: number
  setSpeed: (value: number) => void
}

const Game = ({
  player,
  adult,
  onAdult,
  debug,
  setDebug,
  speed,
  setSpeed,
}: GameProps) => {
  const snapshot = useSyncExternalStore(
    player.subscribe,
    player.getSnapshot,
    player.getSnapshot
  )
  const frame = useRef<HTMLDivElement>(null)
  const { state, status } = snapshot
  const playing = status !== 'idle' || snapshot.log.length > 0

  useEffect(() => {
    if (!snapshot.shake) return
    frame.current?.animate(
      [
        { transform: 'translate3d(0,0,0)' },
        { transform: 'translate3d(-5px,2px,0)' },
        { transform: 'translate3d(5px,-2px,0)' },
        { transform: 'translate3d(-3px,1px,0)' },
        { transform: 'translate3d(0,0,0)' },
      ],
      { duration: 420, easing: 'ease-out' }
    )
  }, [snapshot.shake])

  useEffect(() => () => player.stop(), [player])

  const [jump, setJump] = useState<string | null>(null)
  useEffect(() => {
    // Testing aid: /story/terminal#n1.perf starts mid-script.
    const hash = decodeURIComponent(window.location.hash.slice(1))
    if (player.has(hash)) setJump(hash)
  }, [player])

  const blueprint = state.mode === 'perf'
  const bodySlot = useRef<HTMLDivElement>(null)
  const avatarSlot = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<Rect | null>(null)

  // One viewer for the whole night: it glides between the body map and the avatar
  // frame instead of remounting, which would reload the model.
  useLayoutEffect(() => {
    const slot = (blueprint ? bodySlot : avatarSlot).current
    const root = frame.current
    if (!slot || !root || !playing) {
      setRect(null)
      return
    }
    const measure = () => {
      const outer = root.getBoundingClientRect()
      const inner = slot.getBoundingClientRect()
      setRect({
        left: inner.left - outer.left,
        top: inner.top - outer.top,
        width: inner.width,
        height: inner.height,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(slot)
    observer.observe(root)
    return () => observer.disconnect()
  }, [blueprint, playing])

  return (
    <Box
      ref={frame}
      position="absolute"
      inset="0"
      display="flex"
      flexDirection="column"
      style={{ background: MODE_BACKGROUND[state.mode] }}
    >
      <Box
        position="absolute"
        inset="0"
        background="#000"
        zIndex="20"
        transition="opacity .5s ease"
        style={{
          opacity: snapshot.blackout ? 1 : 0,
          pointerEvents: snapshot.blackout ? 'auto' : 'none',
        }}
      />
      <Box
        position="absolute"
        inset="0"
        background="rgba(0,0,0,.62)"
        pointerEvents="none"
        transition="opacity 1.4s ease"
        zIndex="2"
        style={{ opacity: state.dim ? 1 : 0 }}
      />

      {playing && <NightHud state={state} debug={debug} />}

      {playing && (
        <Flex
          flex="1"
          minHeight="0"
          direction={blueprint ? { base: 'column', md: 'row' } : 'row'}
        >
          {blueprint && (
            <Box
              ref={bodySlot}
              flexShrink="0"
              height={{ base: '38%', md: 'auto' }}
              width={{ base: '100%', md: '40%' }}
              maxWidth={{ md: '440px' }}
              borderRight={{ md: '1px solid rgba(214,233,255,.22)' }}
              borderBottom={{ base: '1px solid rgba(214,233,255,.22)', md: 'none' }}
            />
          )}
          {!blueprint && (
            <Box
              flexShrink="0"
              pl={{ base: '14px', md: '20px' }}
              pt={{ base: '18px', md: '24px' }}
            >
              <Box
                ref={avatarSlot}
                width={{ base: '80px', md: '132px' }}
                aspectRatio="1"
              />
            </Box>
          )}
          <Flex flex="1" minHeight="0" minWidth="0" direction="column">
            <NightLog
              log={snapshot.log}
              name={NAME}
              onTap={player.skip}
              footer={
                <Box pt="4px" position="relative" zIndex="3">
                  <NightChoices
                    snapshot={snapshot}
                    onChoose={player.choose}
                    onInput={player.submitInput}
                  />
                </Box>
              }
            />
            {blueprint && <NightWhisper log={snapshot.log} name={NAME} />}
          </Flex>
        </Flex>
      )}

      {playing && (
        <NightStage
          rect={rect}
          blueprint={blueprint}
          face={state.face}
          eyes={state.eyes}
          tremble={snapshot.tremble}
          nod={snapshot.nod}
          thrust={snapshot.thrust}
          hots={snapshot.hots}
          onPress={player.pressHot}
        />
      )}

      <Flex
        flexShrink="0"
        justifyContent="space-between"
        alignItems="center"
        gap="8px"
        px={{ base: '14px', md: '20px' }}
        py="6px"
        borderTop="1px solid rgba(231,105,45,.16)"
        fontSize="10px"
        color="rgba(238,150,98,.6)"
        position="relative"
        zIndex="3"
        style={{ fontFamily: MONO }}
      >
        <Box />
        <Flex gap="10px">
          {[1, 2, 4].map((value) => (
            <Button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              color={speed === value ? '#ffb27a' : 'rgba(238,150,98,.5)'}
              cursor="pointer"
              background="transparent"
            >
              {value}x
            </Button>
          ))}
          <Button
            type="button"
            onClick={() => setDebug(!debug)}
            color={debug ? '#a0dcc8' : 'rgba(238,150,98,.5)'}
            cursor="pointer"
            background="transparent"
          >
            debug
          </Button>
          {playing && (
            <Button
              type="button"
              onClick={() => {
                player.stop()
                player.reset()
              }}
              color="rgba(255,255,255,.7)"
              cursor="pointer"
              background="transparent"
            >
              選單
            </Button>
          )}
        </Flex>
      </Flex>

      {!adult && (
        <Panel>
          <Box fontSize="16px" color="#fff">
            成人內容
          </Box>
          <Box
            mt="12px"
            fontSize="13px"
            lineHeight="1.8"
            color="rgba(255,236,220,.8)"
          >
            這是《終端》改版的試玩切片，含有露骨的性描寫。登場角色皆為成年人。請確認你已滿
            18 歲，且所在地區允許瀏覽此類內容。
          </Box>
          <Flex mt="20px" gap="10px" flexWrap="wrap">
            <PrimaryButton onClick={onAdult}>我已滿 18 歲</PrimaryButton>
            <Link
              href="/story"
              px="16px"
              py="10px"
              border="1px solid rgba(255,255,255,.3)"
              color="rgba(255,255,255,.8)"
              fontSize="14px"
            >
              離開
            </Link>
          </Flex>
        </Panel>
      )}

      {adult && !playing && (
        <Panel>
          <Box
            fontSize="10px"
            letterSpacing=".2em"
            color="rgba(238,150,98,.7)"
            style={{ fontFamily: MONO }}
          >
            TERMINAL · NEXT
          </Box>
          <Box mt="8px" fontSize="18px" color="#fff">
            試玩切片
          </Box>
          <Box mt="18px" display="grid" gap="10px">
            {jump && (
              <PrimaryButton onClick={() => player.start(jump)}>
                從 #{jump} 開始（測試）
              </PrimaryButton>
            )}
            {player.starts.map((id) => (
              <PrimaryButton key={id} onClick={() => player.start(id)}>
                {START_LABEL[id] ?? id}
              </PrimaryButton>
            ))}
          </Box>
        </Panel>
      )}

      {snapshot.summary && (
        <SummaryPanel summary={snapshot.summary} onMenu={player.reset} />
      )}
    </Box>
  )
}

export default NightGame
