import { Box, Center } from '@chakra-ui/react'

const DotBackground = () => (
  <Box
    position="absolute"
    top="0"
    left="0"
    width="100vw"
    height="100vh"
    backgroundSize="auto auto, calc(3 / 16 * 1rem) calc(3 / 16 * 1rem)"
    backgroundImage="linear-gradient(to bottom,hsl(72deg 5% 5% / 0.5) 0%,
    hsl(72deg 5% 5% / 0) 100%),
    radial-gradient(
      rgb(75, 76, 71) 25%,
      transparent 25%
    )"
    sx={{
      maskImage: 'linear-gradient(to bottom,#000,50%,transparent)',
    }}
  />
)

export default DotBackground
