import { useEffect, useState } from 'react'
import { Box } from 'styled-system/jsx'
import type { LogEntry } from 'lib/night/types'
import { Dots, Entry } from './NightLog'

const SHOWN = 3
// Lets the last whisper stay readable for a beat after the scene moves on.
const LINGER = 1800

const NightWhisper = ({ log, name }: { log: LogEntry[]; name: string }) => {
  let end = log.length - 1
  while (end >= 0 && !log[end].aside) end -= 1
  let start = end
  while (start > 0 && log[start - 1].aside) start -= 1

  const run = end >= 0 ? log.slice(start, end + 1) : []
  const lastId = run[run.length - 1]?.id
  const sceneMoved = end >= 0 && end < log.length - 1
  const typing = run[run.length - 1]?.kind === 'typing'
  const lines = run.filter((entry) => entry.kind !== 'typing').slice(-SHOWN)

  const [closed, setClosed] = useState<number | null>(null)
  useEffect(() => {
    if (!sceneMoved || lastId === undefined) return
    const timer = setTimeout(() => setClosed(lastId), LINGER)
    return () => clearTimeout(timer)
  }, [sceneMoved, lastId])

  const open = lastId !== undefined && closed !== lastId

  return (
    <Box
      display="grid"
      flexShrink="0"
      transition="grid-template-rows .35s ease"
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <Box overflow="hidden" minHeight="0">
        <Box
          borderTop="1px solid rgba(238,150,98,.45)"
          background="linear-gradient(180deg, rgba(42,16,6,.96), rgba(16,6,2,.98))"
          boxShadow="0 -12px 28px rgba(0,0,0,.45)"
          px={{ base: '14px', md: '20px' }}
          pt="12px"
          pb="12px"
          transition="transform .35s ease"
          style={{ transform: open ? 'none' : 'translateY(40%)' }}
        >
          <Box display="grid" gap="8px" maxWidth="680px" mx="auto">
            {lines.map((entry) => (
              <Entry key={entry.id} entry={entry} name={name} />
            ))}
            {typing && <Dots />}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default NightWhisper
