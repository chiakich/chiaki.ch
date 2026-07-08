import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import {
  Box,
  Container,
  Stack,
  styled,
} from 'styled-system/jsx'
import { ChevronLeftIcon } from 'components/ui/icons'
import TopBar from './TopBar'
import FontsSubNav from './FontsSubNav'

const Heading = styled.h1
const Text = styled.p
const ChakraLink = styled.a
const Iframe = styled.iframe

interface FontPageProps {
  title: string
  description: string
  iframeUrl: string
}

const FontPage: NextPage<FontPageProps> = ({ title, description, iframeUrl }) => {
  return (
    <>
      <Head>
        <title>{title} - 千秋的字體作品</title>
        <meta name="description" content={description} />
      </Head>

      <TopBar />
      <FontsSubNav />

      <Box pt="88px">
        {' '}
        {/* Add padding-top to account for both TopBar and FontsSubNav */}
        <Container maxW="container.xl" py={8}>
          <Stack gap={8}>
            <ChakraLink
              as={Link}
              href="/works"
              display="inline-flex"
              alignItems="center"
              color="blue.500"
              _hover={{ textDecoration: 'none', color: 'blue.600' }}
              mb={4}
            >
              <styled.span mr={1}>
                <ChevronLeftIcon />
              </styled.span>
              返回作品集
            </ChakraLink>

            <Stack gap={4} color="white">
              <Heading fontSize={{ base: '2.25rem', md: '3rem' }} lineHeight={1.1} fontWeight="bold">
                {title}
              </Heading>
              <Text fontSize="xl">{description}</Text>
            </Stack>

            <Box
              position="relative"
              width="100%"
              height="0"
              paddingBottom="56.25%" // 16:9 aspect ratio
              borderRadius="lg"
              overflow="hidden"
              boxShadow="xl"
            >
              <Iframe
                position="absolute"
                top="0"
                left="0"
                w="100%"
                h="100%"
                src={iframeUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  )
}

export default FontPage
