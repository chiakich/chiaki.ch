import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import {
  Box,
  Container,
  Heading,
  Text,
  Link as ChakraLink,
  Stack,
  Icon,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import TopBar from './TopBar'
import FontsSubNav from './FontsSubNav'

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
          <Stack spacing={8}>
            <ChakraLink
              as={Link}
              href="/fonts"
              display="inline-flex"
              alignItems="center"
              color="blue.500"
              _hover={{ textDecoration: 'none', color: 'blue.600' }}
              mb={4}
            >
              <Icon as={ChevronLeftIcon} mr={1} />
              返回字體作品集
            </ChakraLink>

            <Stack spacing={4} color="white">
              <Heading as="h1" size="2xl">
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
              <Box
                as="iframe"
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
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
