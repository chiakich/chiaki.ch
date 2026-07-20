import { Box, Container } from 'styled-system/jsx'
import NixieHero from './NixieHero'
import NixieSections from './NixieSections'

const NixiePage = () => <Box backgroundColor="#020202" color="white" minHeight="100vh"><NixieHero /><Container maxW="1080px" py={16} px={{ base: '24px', md: '40px' }}><NixieSections /></Container></Box>

export default NixiePage
