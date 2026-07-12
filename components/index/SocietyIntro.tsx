import { Box, Container, Grid, Stack, styled } from 'styled-system/jsx'

const Heading = styled.h2
const Text = styled.p

const SocietyIntro = () => (
  <Box
    as="section"
    position="relative"
    overflow="hidden"
    background="linear-gradient(145deg, #120e0b 0%, #060606 58%, #11100d 100%)"
    color="white"
    py={{ base: '96px', md: '160px' }}
  >
    <Box
      position="absolute"
      inset="0"
      opacity=".2"
      pointerEvents="none"
      backgroundImage="radial-gradient(rgba(244, 142, 44, .5) 1px, transparent 1px)"
      backgroundSize="18px 18px"
    />
    <Box
      position="absolute"
      top="-18vw"
      right="-12vw"
      width="42vw"
      height="42vw"
      minW="360px"
      minH="360px"
      borderRadius="full"
      background="radial-gradient(circle, rgba(247, 97, 89, .2), transparent 68%)"
      pointerEvents="none"
    />

    <Container position="relative" maxW="width.section" px={{ base: '28px', md: '40px', lg: '60px' }}>
      <Grid columns={{ base: 1, md: 12 }} gap={{ base: 12, md: 8 }} alignItems="start">
        <Stack gridColumn={{ md: 'span 4' }} gap={4}>
          <Text
            color="accentSoft"
            fontFamily="mono"
            fontSize="xs"
            fontWeight="bold"
            letterSpacing=".22em"
          >
            ABOUT THE CIRCLE
          </Text>
          <Heading fontSize={{ base: '3rem', md: '4.5rem' }} lineHeight=".98" letterSpacing="-.06em">
            千秋稲荷社
          </Heading>
          <Box width="52px" height="3px" backgroundColor="accent" />
        </Stack>

        <Stack gridColumn={{ md: 'span 7 / span 7' }} gap={{ base: 7, md: 10 }}>
          <Text fontSize={{ base: 'xl', md: '2xl' }} lineHeight="1.75" fontWeight="medium">
            千秋稲荷社是專注於技術、字型設計與次文化研究的個人同人社團。
          </Text>
          <Text maxW="680px" fontSize={{ base: 'md', md: 'lg' }} lineHeight="2" color="rgba(255, 255, 255, .72)">
            誕生於對開源精神與同人文化的熱愛，本社團的主要活動為畫畫、周邊製作發行、軟體工程、開源字體開發及模型製作相關等。期望透過每一場活動，將設計、科技與生活中的次文化樂趣，以最純粹的方式傳遞給同好。
          </Text>
        </Stack>
      </Grid>
    </Container>
  </Box>
)

export default SocietyIntro
