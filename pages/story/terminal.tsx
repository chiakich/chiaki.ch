import type { NextPage } from 'next'
import Head from 'next/head'
import { Box } from 'styled-system/jsx'
import NightGame from 'components/story/night/NightGame'
import { makeStaticProps } from 'i18n/messages'

const TerminalPage: NextPage = () => (
  <>
    <Head>
      <title>終端</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
    {/* TopBar is 44px and the desktop-only SubNav below it is another 48px. */}
    <Box
      position="fixed"
      top={{ base: '44px', md: '92px' }}
      left="0"
      right="0"
      bottom="0"
      background="#030201"
      overflow="clip"
      overscrollBehavior="none"
    >
      <NightGame />
    </Box>
  </>
)

export default TerminalPage

export const getStaticProps = makeStaticProps('story/terminal')
