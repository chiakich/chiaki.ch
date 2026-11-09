import { useState } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import {
  CHANNEL_CAP,
  CHANNEL_GOAL,
  channelOf,
  MAN_LABEL,
  MEN,
} from 'lib/night/engine'
import type { GameState } from 'lib/night/types'
import NightScope from './NightScope'

const Button = styled.button
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace'

const Label = ({ children }: { children: React.ReactNode }) => (
  <Box
    fontSize="9px"
    letterSpacing=".2em"
    color="rgba(238,150,98,.62)"
    style={{ fontFamily: MONO }}
  >
    {children}
  </Box>
)

type Props = { state: GameState; debug: boolean }

const NightHud = ({ state, debug }: Props) => {
  const [listOpen, setListOpen] = useState(false)
  const channel = channelOf(state)
  const delta = channel - state.channelAtDayStart
  const cells = Math.max(6, state.battery)
  const beat = `${(60 / Math.max(40, state.bpm)).toFixed(2)}s`

  return (
    <Box
      flexShrink="0"
      px={{ base: '14px', md: '20px' }}
      py="10px"
      borderBottom="1px solid rgba(231,105,45,.22)"
      background="rgba(7,3,1,.72)"
      position="relative"
    >
      <Flex gap={{ base: '14px', md: '24px' }} alignItems="flex-end" flexWrap="wrap">
        <Box>
          <Label>DAY</Label>
          <Box fontFamily="nixie" fontSize="22px" lineHeight="1" color="#ff7728">
            {state.day}
          </Box>
        </Box>

        <Flex alignItems="center" gap="2px" alignSelf="center">
          <Flex gap="3px" p="2px" border="1px solid rgba(238,150,98,.5)">
            {Array.from({ length: cells }, (_, index) => (
              <Box
                key={index}
                width="7px"
                height="12px"
                background={
                  index < state.battery ? '#df8a42' : 'rgba(238,150,98,.12)'
                }
                transition="background .3s"
              />
            ))}
          </Flex>
          <Box width="3px" height="7px" background="rgba(238,150,98,.5)" />
        </Flex>

        <Box flex="1" minWidth="120px">
          <Flex justifyContent="space-between">
            <Label>通道</Label>
            <Box
              fontSize="10px"
              color="rgba(255,230,210,.85)"
              style={{ fontFamily: MONO }}
            >
              {channel}/{CHANNEL_GOAL}
              {delta !== 0 && (
                <Box as="span" color="#ffb27a" ml="6px">
                  {delta > 0 ? `+${delta}` : delta}
                </Box>
              )}
            </Box>
          </Flex>
          <Box
            mt="5px"
            height="6px"
            background="rgba(238,150,98,.14)"
            position="relative"
          >
            <Box
              position="absolute"
              inset="0"
              background="linear-gradient(90deg,#a8481a,#df8a42)"
              transformOrigin="left"
              transition="transform .6s ease"
              style={{ transform: `scaleX(${Math.min(1, channel / CHANNEL_GOAL)})` }}
            />
          </Box>
        </Box>

        <Box textAlign="right" alignSelf="center">
          <Flex alignItems="center" gap="6px" justifyContent="flex-end">
            <Box
              width="7px"
              height="7px"
              borderRadius="50%"
              background="#ff5a3c"
              animation="heartbeat 1s infinite"
              style={{ animationDuration: beat }}
            />
            <Box fontFamily="nixie" fontSize="22px" lineHeight="1" color="#ff7728">
              {state.bpm}
            </Box>
          </Flex>
        </Box>

        <Button
          type="button"
          onClick={() => setListOpen((open) => !open)}
          px="8px"
          py="4px"
          border="1px solid rgba(238,150,98,.4)"
          background={listOpen ? 'rgba(231,105,45,.18)' : 'transparent'}
          color="rgba(255,230,210,.9)"
          fontSize="11px"
          cursor="pointer"
        >
          千亞紀對你的了解 {state.list.length}
        </Button>
      </Flex>

      {state.mode === 'perf' && state.target && (
        <Box mt="8px">
          <Flex justifyContent="space-between" alignItems="center">
            <Box fontSize="11px" color="rgba(255,230,210,.9)">
              {MAN_LABEL[state.target]}
            </Box>
          </Flex>
          <NightScope key={state.target} samples={state.waves[state.target]} />
        </Box>
      )}

      {debug && (
        <Box
          mt="6px"
          fontSize="10px"
          color="rgba(160,220,200,.8)"
          lineHeight="1.6"
          style={{ fontFamily: MONO }}
        >
          trust {state.trust} · mode {state.mode} ·{' '}
          {MEN.map(
            (man) =>
              `${man} ${state.men[man].desire}/${state.men[man].liking}/${state.men[man].possess} (cap ${CHANNEL_CAP[man]})`
          ).join(' · ')}
          <br />
          flags {Object.keys(state.flags).join(',') || '-'} · vars{' '}
          {Object.entries(state.vars)
            .map(([key, value]) => `${key}=${value}`)
            .join(',') || '-'}
        </Box>
      )}

      {listOpen && (
        <Box
          position="absolute"
          top="100%"
          right={{ base: '14px', md: '20px' }}
          zIndex="3"
          width="min(280px, calc(100vw - 32px))"
          border="1px solid rgba(238,150,98,.4)"
          background="rgba(14,6,3,.96)"
          p="12px"
          animation="lexiconReveal .25s ease both"
        >
          <Label>千亞紀對你的了解</Label>
          {state.list.length === 0 ? (
            <Box mt="8px" fontSize="12px" color="rgba(255,230,210,.5)">
              還是空的
            </Box>
          ) : (
            <Box as="ul" mt="8px" display="grid" gap="6px">
              {state.list.map((item) => (
                <Box
                  as="li"
                  key={item}
                  fontSize="12px"
                  color="rgba(255,236,220,.92)"
                  lineHeight="1.5"
                >
                  · {item}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default NightHud
