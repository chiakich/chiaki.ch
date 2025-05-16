import { useState } from 'react'
import { Box, Center } from '@chakra-ui/react'
import Image from 'next/image'
import DotBackground from 'components/index/DotBackground'
import MainLogo from './MainLogo'

const Cover = () => {
  const [isBgLoaded, setBgLoaded] = useState(false)
  return (
    <Box backgroundColor="black" backgroundSize="cover" width="100%" height="100%">
      <Box
        width="100%"
        height="100%"
        position="absolute"
        opacity={isBgLoaded ? 1 : 0}
        transform={`scale(${isBgLoaded ? '1.01' : '1'})`}
        transition="opacity 1.5s ease-in-out, transform 2s ease-in-out"
      >
        <Image
          src="/assets/img/takuzosu-inari-shrine.jpg"
          alt="bg"
          fill
          style={{ objectFit: 'cover' }}
          onLoad={() => {
            setBgLoaded(true)
          }}
        />
      </Box>
      <DotBackground />

      <Center height="100%">
        <MainLogo />
      </Center>
    </Box>
  )
}

export default Cover
