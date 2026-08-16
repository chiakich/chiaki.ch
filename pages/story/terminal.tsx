import type { NextPage } from 'next'
import { useCallback, useState, type CSSProperties } from 'react'
import { Box } from 'styled-system/jsx'
import TerminalChat from 'components/story/terminal/TerminalChat'
import StoryBootLoader from 'components/story/StoryBootLoader'
import useTerminalViewport from 'components/story/terminal/useTerminalViewport'
import { makeStaticProps } from 'i18n/messages'

const TerminalPage: NextPage = () => {
  const [started, setStarted] = useState(false)
  const onComplete = useCallback(() => setStarted(true), [])
  const viewport = useTerminalViewport()
  const viewportStyle = {
    '--terminal-viewport-height': viewport.height
      ? `${viewport.height}px`
      : '100dvh',
    '--terminal-viewport-offset-top': `${viewport.offsetTop}px`,
  } as CSSProperties

  return (
    <Box
      position="fixed"
      top="var(--terminal-viewport-offset-top)"
      left="0"
      width="100%"
      height="var(--terminal-viewport-height)"
      bg="black"
      overflow="hidden"
      overscrollBehavior="none"
      style={viewportStyle}
    >
      {/* TopBar is 44px and the desktop-only SubNav below it is another 48px. */}
      <Box
        position="absolute"
        top={{ base: '44px', md: '92px' }}
        left="0"
        right="0"
        bottom="0"
      >
        <TerminalChat
          started={started}
          keyboardOpen={viewport.keyboardOpen}
        />
      </Box>
      <StoryBootLoader variant="terminal" onComplete={onComplete} />
    </Box>
  )
}

export default TerminalPage

export const getStaticProps = makeStaticProps('story/terminal')
