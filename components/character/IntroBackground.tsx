import { Box } from '@chakra-ui/react'

const delicateWirePatternStyles = {
  background: `
      repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(100, 100, 100, 0.1) 50px, rgba(100, 100, 100, 0.1) 51px),
      repeating-linear-gradient(60deg, transparent, transparent 50px, rgba(100, 100, 100, 0.1) 50px, rgba(100, 100, 100, 0.1) 51px),
      repeating-linear-gradient(120deg, transparent, transparent 50px, rgba(100, 100, 100, 0.1) 50px, rgba(100, 100, 100, 0.1) 51px)
    `,
  backgroundSize: '100% 100%',
}

const IntroBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      backgroundColor="white"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...delicateWirePatternStyles,
        backgroundAttachment: 'fixed',
        opacity: 0.8,
        zIndex: 0,
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundAttachment: 'fixed',
        backgroundImage: 'url(/assets/about/main_1.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: {
          base: 'right 10% top 10%',
          md: 'right 0% top 10%',
          xl: 'right 10% top 10%',
        },
        backgroundSize: '70vh',
        opacity: 0.2,
        zIndex: 0,
      }}
    >
      {children}
    </Box>
  )
}

export default IntroBackground
