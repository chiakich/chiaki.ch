import type { NextPage } from 'next'
import NextLink from 'next/link'
import { Box, Center, VStack, styled } from 'styled-system/jsx'
import { Button } from 'components/ui/controls'
import { makeStaticProps } from 'i18n/messages'

const Heading = styled.h1
const Text = styled.p

// Next's built-in 404 renders inside _app, so it needs a getStaticProps of its
// own — otherwise TopBar has no messages and the nav renders as raw keys.
const NotFound: NextPage = () => (
  <Box bg="black" color="white" minHeight="100vh">
    <Center minHeight="100vh" px="24px">
      <VStack gap={6} textAlign="center">
        <Text
          fontFamily="mono"
          fontSize={{ base: 'xs', md: 'sm' }}
          letterSpacing="0.35em"
          color="accent"
          fontWeight="bold"
        >
          404
        </Text>
        <Heading fontSize={{ base: '2xl', md: '4xl' }} fontWeight="bold">
          這裡沒有東西
        </Heading>
        <Text color="gray.400" maxW="42ch">
          你要找的頁面不存在，或是已經搬走了。
        </Text>
        <NextLink href="/">
          <Button colorScheme="whiteAlpha" variant="outline">
            回首頁
          </Button>
        </NextLink>
      </VStack>
    </Center>
  </Box>
)

export default NotFound

export const getStaticProps = makeStaticProps('')
