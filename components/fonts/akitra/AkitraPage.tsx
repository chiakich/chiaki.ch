import { Box, Container } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import AkitraHero from './AkitraHero'
import AkitraSections from './AkitraSections'

const AkitraPage = () => <Box backgroundColor="black" color="white" minHeight="100vh"><TopBar /><AkitraHero /><Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}><AkitraSections /></Container></Box>

export default AkitraPage
