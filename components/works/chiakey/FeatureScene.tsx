import { Box, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'

const Heading = styled.h3
const Text = styled.p

interface FeatureSceneProps {
  title: string
  description: string
  children: React.ReactNode
  wide?: boolean
}

// Apple 產品頁式的功能卡：大圓角、無邊框、示範畫面在上、標題與說明在下。
const FeatureScene = ({ title, description, children, wide }: FeatureSceneProps) => (
  <MotionSection spanColumns={wide}>
    <Box height="100%">
      <Box backgroundColor="#150d20" borderRadius="28px" overflow="hidden" height="100%" _hover={{ transform: 'translateY(-4px)' }} style={{ transition: 'transform .35s ease' }}>
        <Box aspectRatio="640 / 300" backgroundColor="#dcd2ea">{children}</Box>
        <Box px={{ base: 6, md: 8 }} py={7}>
          <Heading fontSize={{ base: 'xl', md: '1.4rem' }} mb={2} letterSpacing="-.01em">{title}</Heading>
          <Text lineHeight="1.8" opacity={.62} fontSize="sm">{description}</Text>
        </Box>
      </Box>
    </Box>
  </MotionSection>
)

export default FeatureScene
