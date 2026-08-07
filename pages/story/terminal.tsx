import type { NextPage } from 'next'
import { useCallback, useState } from 'react'
import { Box } from 'styled-system/jsx'
import TerminalChat from 'components/story/terminal/TerminalChat'
import StoryBootLoader from 'components/story/StoryBootLoader'
import { makeStaticProps } from 'i18n/messages'

const TerminalPage: NextPage = () => {
  const [started, setStarted] = useState(false)
  const onComplete = useCallback(() => setStarted(true), [])

  return (
    <Box bg="black" width="100%" minHeight="100vh" overflow="clip">
      <Box position="relative" pt="92px">
        <TerminalChat started={started} />
      </Box>
      <StoryBootLoader variant="terminal" onComplete={onComplete} />
    </Box>
  )
}

export default TerminalPage

export const getStaticProps = makeStaticProps('story/terminal')
