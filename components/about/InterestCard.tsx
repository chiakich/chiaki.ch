import { Box, styled } from 'styled-system/jsx'
import { motion } from 'framer-motion'
import { ACCENT } from 'components/about/theme'

const Text = styled.p
const Span = styled.span

const MotionBox = motion(Box)

const InterestCard = ({
  index,
  title,
  en,
  description,
}: {
  index: number
  title: string
  en: string
  description: string
}) => (
  <MotionBox
    position="relative"
    backgroundColor="#111"
    border="1px solid #222"
    clipPath="polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)"
    px={5}
    py={4}
    overflow="hidden"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{
      duration: 0.5,
      delay: (index % 2) * 0.08,
      ease: 'easeOut',
    }}
    _hover={{
      borderColor: `${ACCENT}88`,
      transform: 'translateY(-3px)',
      '& .interest-en': { color: ACCENT, opacity: 0.9 },
    }}
    style={{
      transition: 'transform 0.25s ease, border-color 0.25s ease',
    }}
  >
    <Text
      className="interest-en"
      position="absolute"
      top={2}
      right={4}
      fontSize="xs"
      fontWeight="900"
      letterSpacing="0.2em"
      opacity={0.3}
      style={{ transition: 'color 0.25s ease, opacity 0.25s ease' }}
    >
      {en}
    </Text>
    <Text
      fontWeight="bold"
      fontSize={{ base: 'md', md: 'lg' }}
      mb={1}
    >
      <Span color={ACCENT} mr={2} fontSize="sm">
        {String(index + 1).padStart(2, '0')}
      </Span>
      {title}
    </Text>
    <Text
      fontSize={{ base: 'sm', md: 'md' }}
      opacity={0.85}
      lineHeight="1.8"
    >
      {description}
    </Text>
  </MotionBox>
)

export default InterestCard
