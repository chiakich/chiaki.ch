import { NextPage } from 'next'
import Link from 'next/link'
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import TopBar from '../../components/TopBar'
import FontsSubNav from '../../components/FontsSubNav'

const FontsIndex: NextPage = () => {
  const fonts = [
    {
      id: 'akitra',
      title: '台鐵客貨車字體',
      description: '基於台鐵客貨車表記文字設計的字體，重現台灣鐵道文化之美。',
      link: '/fonts/akitra',
      image: '/images/fonts/akitra-preview.png',
    },
    {
      id: 'nixie',
      title: 'Nixie 字體',
      description: '靈感來自輝光管顯示器的數位字體，包含數字與特殊符號。',
      link: '/fonts/nixie',
      image: '/images/fonts/nixie-preview.png',
    },
    {
      id: 'huninn',
      title: '粉圓字體',
      description: '在 justfont 期間製作的開源圓體字型，為台灣使用者優化設計。',
      link: '/fonts/huninn',
      image: '/images/fonts/huninn-preview.png',
    },
  ]

  const cardBg = useColorModeValue('white', 'gray.700')
  const cardHoverBg = useColorModeValue('gray.50', 'gray.600')

  return (
    <>
      <TopBar />
      <FontsSubNav />

      <Box pt="88px">
        <Container maxW="container.xl" py={8}>
          <Stack spacing={8} align="center" mb={12} color="white">
            <Heading as="h1" size="2xl" textAlign="center">
              字體作品集
            </Heading>
            <Text fontSize="xl" textAlign="center" maxW="2xl">
              這裡收錄了我設計與參與開發的字體作品，每個作品都承載著不同的故事與理念。
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
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
                    <Stack spacing={3}>
                      <Heading size="md">{font.title}</Heading>
                      <Text color="gray.600">{font.description}</Text>
                    </Stack>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </>
  )
}

export default FontsIndex
