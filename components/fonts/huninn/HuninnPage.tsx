import { Box, Container } from 'styled-system/jsx'
import HuninnHero from './HuninnHero'
import HuninnSections from './HuninnSections'

const HuninnPage = () => <Box backgroundColor="black" color="white" minHeight="100vh"><HuninnHero /><Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}><HuninnSections /></Container></Box>

export default HuninnPage
