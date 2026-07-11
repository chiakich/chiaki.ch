import Head from 'next/head'
import { Box, Container } from 'styled-system/jsx'
import FontsSubNav from 'components/fonts/FontsSubNav'
import TopBar from 'components/TopBar'
import AkitraHero from './AkitraHero'
import AkitraSections from './AkitraSections'

const AkitraPage = () => <Box backgroundColor="black" color="white" minHeight="100vh"><Head><title>台鐵客貨車字體 - Fonts</title><meta name="description" content="以台鐵客貨車表記文字為藍本設計的字體。" /></Head><TopBar /><FontsSubNav /><AkitraHero /><Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}><AkitraSections /></Container></Box>

export default AkitraPage
