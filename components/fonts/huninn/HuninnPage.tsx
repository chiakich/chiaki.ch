import Head from 'next/head'
import { Box, Container } from 'styled-system/jsx'
import FontsSubNav from 'components/fonts/FontsSubNav'
import TopBar from 'components/TopBar'
import HuninnHero from './HuninnHero'
import HuninnSections from './HuninnSections'

const HuninnPage = () => <Box backgroundColor="black" color="white" minHeight="100vh"><Head><title>jf open 粉圓 - Fonts</title><meta name="description" content="參與製作的台灣開源圓體。" /></Head><TopBar /><FontsSubNav /><HuninnHero /><Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}><HuninnSections /></Container></Box>

export default HuninnPage
