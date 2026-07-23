import { Box, Container } from 'styled-system/jsx'
import { HUNINN } from './huninnTheme'
import HuninnHero from './HuninnHero'
import HuninnSections from './HuninnSections'

const HuninnPage = () => <Box color="white" minHeight="100vh" style={{ backgroundColor: HUNINN.ink }}><HuninnHero /><Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}><HuninnSections /></Container></Box>

export default HuninnPage
