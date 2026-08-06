import dynamic from 'next/dynamic'
import { Box } from 'styled-system/jsx'
import { cdnBackground } from 'lib/cdnImage'
import SnowHudOverlay from 'components/story/SnowHudOverlay'

// The shell below (background still, lens, vignette, HUD) is plain CSS and
// renders server-side straight away. Only the WebGL layer needs three.js, so it
// is loaded client-side — otherwise Next preloads ~195 KB of three into
// /story's critical path for a canvas that sits behind the boot sequence.
const DepthScrollCanvas = dynamic(() => import('components/index/DepthScrollCanvas'), {
  ssr: false,
})

interface DepthScrollSectionProps {
  started?: boolean
}

const DepthScrollSection = ({ started = true }: DepthScrollSectionProps) => (
  <Box
    position="relative"
    height="100vh"
    minHeight="100svh"
    width="100%"
    overflow="hidden"
    backgroundColor="#0a1114"
    backgroundImage={cdnBackground('/assets/index/2x-2.webp', 1920)}
    backgroundSize="cover"
    backgroundPosition="center"
  >
    <DepthScrollCanvas />

    {/* Lens: blurred, darkened edges (a soft frame that fades to sharp centre) */}
    <Box
      position="absolute"
      inset="0"
      pointerEvents="none"
      zIndex="2"
      backdropFilter="blur(7px)"
      style={{
        WebkitMaskImage:
          'radial-gradient(ellipse 62% 62% at 50% 50%, transparent 46%, black 88%)',
        maskImage:
          'radial-gradient(ellipse 62% 62% at 50% 50%, transparent 46%, black 88%)',
      }}
    />
    {/* Vignette: dark corners like a camera */}
    <Box
      position="absolute"
      inset="0"
      pointerEvents="none"
      zIndex="2"
      background="radial-gradient(ellipse 75% 75% at 50% 48%, transparent 42%, rgba(0,0,0,.55) 82%, rgba(0,0,0,.86) 100%)"
    />
    <SnowHudOverlay started={started} />
  </Box>
)

export default DepthScrollSection
