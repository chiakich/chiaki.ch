import { Box } from 'styled-system/jsx'

// Painted at `backgroundSize: 70vh` behind `opacity: 0.2`, so the 400w thumb is
// plenty — the full-size portrait would be wasted here.
const PORTRAIT_BG = "url('/assets/story/character/gallery/portrait-1-thumb.webp')"

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
      bg="white"
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
        backgroundImage: PORTRAIT_BG,
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
