import { useEffect, useRef } from 'react'
import { Box, Flex } from 'styled-system/jsx'
import type { LogEntry } from 'lib/night/types'

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace'

export const Dots = () => (
  <Flex
    gap="4px"
    px="12px"
    py="10px"
    width="fit-content"
    background="rgba(231,105,45,.1)"
    borderLeft="2px solid #df8a42"
  >
    {[0, 1, 2].map((index) => (
      <Box
        key={index}
        width="5px"
        height="5px"
        borderRadius="50%"
        background="#df8a42"
        animation="hudPulse 1.2s infinite"
        style={{ animationDelay: `${index * 0.2}s` }}
      />
    ))}
  </Flex>
)

export const Entry = ({ entry, name }: { entry: LogEntry; name: string }) => {
  switch (entry.kind) {
    case 'narr':
      return (
        <Box
          fontSize="13px"
          lineHeight="1.85"
          color="rgba(255,226,204,.66)"
          px={{ base: '2px', md: '8px' }}
          animation="lexiconReveal .35s ease both"
        >
          {entry.text}
        </Box>
      )
    case 'say':
      // Scene speech reads as part of the prose; only lines meant for the player get a box.
      return (
        <Box
          fontSize="14px"
          lineHeight="1.85"
          color="rgba(255,236,222,.92)"
          px={{ base: '2px', md: '8px' }}
          animation="lexiconReveal .35s ease both"
        >
          {entry.text}
        </Box>
      )
    case 'sys':
      return (
        <Box
          fontSize="10px"
          letterSpacing=".14em"
          color="rgba(238,150,98,.7)"
          textAlign="center"
          py="2px"
          style={{ fontFamily: MONO }}
        >
          {entry.text}
        </Box>
      )
    case 'typing':
      return <Dots />
    case 'you':
      return (
        <Box display="flex" justifyContent="flex-end">
          <Box
            maxWidth="78%"
            px="12px"
            py="7px"
            fontSize="14px"
            lineHeight="1.6"
            color="#fff"
            border="1px solid rgba(255,255,255,.28)"
            background="rgba(255,255,255,.06)"
          >
            {entry.text}
          </Box>
        </Box>
      )
    case 'panel':
      return (
        <Box
          textAlign="right"
          fontSize="11px"
          letterSpacing=".08em"
          color="#ffb27a"
          style={{ fontFamily: MONO }}
        >
          ▸ {entry.text}
        </Box>
      )
    case 'type':
    case 'unsent': {
      const shown = entry.shown ?? entry.text.length
      const typing = entry.kind === 'type' && shown < entry.text.length
      return (
        <Box display="flex" flexDirection="column" alignItems="flex-start" gap="3px">
          <Box
            maxWidth="82%"
            px="12px"
            py="7px"
            fontSize="14px"
            lineHeight="1.65"
            color="rgba(255,238,222,.98)"
            borderLeft="2px solid #df8a42"
            background="rgba(231,105,45,.1)"
            whiteSpace="pre-wrap"
            opacity={
              entry.kind === 'unsent' && entry.deleting && shown === 0 ? 0.5 : 1
            }
            transition="opacity .4s"
          >
            {entry.text.slice(0, shown)}
            {entry.kind === 'unsent' && entry.deleting && (
              <Box
                as="span"
                color="rgba(255,226,204,.28)"
                textDecoration="line-through"
              >
                {entry.text.slice(shown)}
              </Box>
            )}
            {(typing || (entry.kind === 'unsent' && !entry.deleting)) && (
              <Box as="span" animation="cursorBlink 1s infinite" color="#df8a42">
                ▍
              </Box>
            )}
          </Box>
        </Box>
      )
    }
  }
}

type Props = {
  log: LogEntry[]
  name: string
  onTap: () => void
  footer?: React.ReactNode
}

const NightLog = ({ log, name, onTap, footer }: Props) => {
  const scroller = useRef<HTMLDivElement>(null)
  const last = log[log.length - 1]

  useEffect(() => {
    const element = scroller.current
    if (element) element.scrollTop = element.scrollHeight
  }, [log.length, last?.shown, footer])

  // The whisper dock squeezes this pane from below; keep the latest line in view.
  useEffect(() => {
    const element = scroller.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      element.scrollTop = element.scrollHeight
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Box
      ref={scroller}
      flex="1"
      minHeight="0"
      overflowY="auto"
      px={{ base: '14px', md: '20px' }}
      py="16px"
      onClick={onTap}
    >
      <Box display="grid" gap="12px" maxWidth="680px" mx="auto">
        {log.map(
          (entry) =>
            !entry.aside && <Entry key={entry.id} entry={entry} name={name} />
        )}
        {footer}
      </Box>
    </Box>
  )
}

export default NightLog
