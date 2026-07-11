import { Box, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'

const Heading = styled.h3
const Text = styled.p

interface FeatureSceneProps {
  number: string
  title: string
  description: string
  accent?: string
  children: React.ReactNode
  wide?: boolean
}

const FeatureScene = ({ number, title, description, accent = '#62a8ff', children, wide }: FeatureSceneProps) => (
  <MotionSection spanColumns={wide}>
    <Box height="100%">
      <Box backgroundColor="#101317" border="1px solid #242c35" overflow="hidden" height="100%" _hover={{ borderColor: 'var(--scene-accent)', transform: 'translateY(-3px)' }} style={{ '--scene-accent': accent, transition: 'all .3s ease' } as React.CSSProperties}>
        <Box aspectRatio="640 / 300" backgroundColor="#d8e3ef">{children}</Box>
        <Box px={{ base: 5, md: 6 }} py={6}>
          <Text fontFamily="mono" fontSize="xs" letterSpacing=".2em" color="var(--scene-accent)" fontWeight="900" mb={2}>FEATURE {number}</Text>
          <Heading fontSize="xl" mb={2}>{title}</Heading>
          <Text lineHeight="1.8" opacity={.72} fontSize="sm">{description}</Text>
        </Box>
      </Box>
    </Box>
  </MotionSection>
)

export default FeatureScene
