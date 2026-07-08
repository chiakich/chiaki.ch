import { NextPage } from 'next'
import Link from 'next/link'
import {
  Box,
  Container,
  Grid,
  Stack,
  styled,
} from 'styled-system/jsx'
import TopBar from '../../components/TopBar'
import FontsSubNav from '../../components/FontsSubNav'

const Heading = styled.h1
const Text = styled.p
const Card = styled.div
const CardBody = styled.div

const FontsIndex: NextPage = () => {
  const fonts = [
    {
      id: 'akitra',
      title: '台鐵客貨車字體',
      description: '基於台鐵客貨車表記文字設計的字體，重現台灣鐵道文化之美。',
      link: '/works/akitra',
      image: '/images/fonts/akitra-preview.png',
    },
    {
      id: 'nixie',
      title: 'Nixie 字體',
      description: '靈感來自輝光管顯示器的數位字體，包含數字與特殊符號。',
      link: '/works/nixie',
      image: '/images/fonts/nixie-preview.png',
    },
    {
      id: 'huninn',
      title: '粉圓字體',
      description: '在 justfont 期間製作的開源圓體字型，為台灣使用者優化設計。',
      link: '/works/huninn',
      image: '/images/fonts/huninn-preview.png',
    },
  ]

  const cardBg = 'white'
  const cardHoverBg = 'gray.50'

  return (
    <>
      <TopBar />
      <FontsSubNav />

      <Box pt="88px">
        <Container maxW="container.xl" py={8}>
          <Stack gap={8} align="center" mb={12} color="white">
            <Heading fontSize={{ base: '2.25rem', md: '3rem' }} lineHeight={1.1} fontWeight="bold" textAlign="center">
              作品集
            </Heading>
            <Text fontSize="xl" textAlign="center" maxW="2xl">
              這裡收錄了我設計與參與開發的作品，每個作品都承載著不同的故事與理念。
            </Text>
          </Stack>

          <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {fonts.map((font) => (
              <Link
                href={font.link}
                key={font.id}
                style={{ textDecoration: 'none' }}
              >
                <Card
                  bg={cardBg}
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    bg: cardHoverBg,
                    shadow: 'lg',
                  }}
                  cursor="pointer"
                >
                  <CardBody>
                    <Stack gap={3}>
                      <Heading as="h2" fontSize="1.25rem" fontWeight="bold">{font.title}</Heading>
                      <Text color="gray.600">{font.description}</Text>
                    </Stack>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  )
}

export default FontsIndex
