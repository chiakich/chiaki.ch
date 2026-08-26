import type { NextPage } from 'next'
import { useCallback, useState, type CSSProperties } from 'react'
import { Box } from 'styled-system/jsx'
import TerminalChat from 'components/story/terminal/TerminalChat'
import StoryBootLoader from 'components/story/StoryBootLoader'
import useTerminalViewport from 'components/story/terminal/useTerminalViewport'
import { makeStaticProps } from 'i18n/messages'

const TerminalPage: NextPage = () => {
  const [started, setStarted] = useState(false)
  const [avatarLoaded, setAvatarLoaded] = useState(false)
  const onComplete = useCallback(() => setStarted(true), [])
  const onAvatarLoaded = useCallback(() => setAvatarLoaded(true), [])
  const viewport = useTerminalViewport()
  const viewportStyle = {
    '--terminal-viewport-height': viewport.height
      ? `${viewport.height}px`
      : '100dvh',
    // With the keyboard up the frame keeps covering the whole layout viewport
    // — the strip that holds Safari's floating URL pill is page territory (the
    // pill only overlays it), so painting it keeps the scene continuous
    // instead of exposing the black body there.
    '--terminal-frame-height':
      viewport.keyboardOpen && viewport.height
        ? `${viewport.height + viewport.keyboardInset}px`
        : viewport.height
          ? `${viewport.height}px`
          : '100dvh',
    '--terminal-viewport-offset-top': `${viewport.offsetTop}px`,
    '--terminal-keyboard-inset': `${viewport.keyboardInset}px`,
  } as CSSProperties

  return (
    <Box
      position="fixed"
      top="var(--terminal-viewport-offset-top)"
      left="0"
      width="100%"
      height="var(--terminal-frame-height)"
      background="radial-gradient(ellipse 72% 74% at 56% 35%, #2b1008 0%, #100704 46%, #030201 100%)"
      overflow="hidden"
      overscrollBehavior="none"
      style={viewportStyle}
    >
      {/* TopBar is 44px and the desktop-only SubNav below it is another 48px. */}
      <Box
        position="absolute"
        top={{
          base: viewport.keyboardOpen ? '0' : '44px',
          md: viewport.keyboardOpen ? '0' : '92px',
        }}
        left="0"
        right="0"
        // Interactive UI stops at the visual viewport's bottom edge — right
        // above the URL pill; the frame behind keeps painting past it.
        bottom={viewport.keyboardOpen ? 'var(--terminal-keyboard-inset)' : '0'}
      >
        <TerminalChat
          started={started}
          keyboardOpen={viewport.keyboardOpen}
          onAvatarLoaded={onAvatarLoaded}
        />
      </Box>
      <StoryBootLoader
        variant="terminal"
        ready={avatarLoaded}
        onComplete={onComplete}
      />
    </Box>
  )
}

export default TerminalPage

export const getStaticProps = makeStaticProps('story/terminal')
