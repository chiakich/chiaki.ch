import { Box, Container } from 'styled-system/jsx'
import TopBar from 'components/TopBar'
import HuninnHero from './HuninnHero'
import HuninnSections from './HuninnSections'

const HuninnPage = () => <Box backgroundColor="black" color="white" minHeight="100vh"><TopBar /><HuninnHero /><Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}><HuninnSections /></Container></Box>

export default HuninnPage
