import { Box, Heading, Button } from '@chakra-ui/react'
import Link from 'next/link'

const ProjectSection = () => {
  return (
    <Box
      height="100vh"
      width="100vw"
      backgroundColor="black"
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={8}
    >
      <Heading
        as="h1"
        size="2xl"
        color="white"
        textAlign="center"
        fontWeight="bold"
        textShadow="2px 2px 4px rgba(0,0,0,0.3)"
      >
        Project 千秋稻荷社
      </Heading>

      <Link href="/character">
        <Button
          size="lg"
          colorScheme="whiteAlpha"
          variant="outline"
          borderWidth="2px"
          color="white"
        >
          Character
        </Button>
      </Link>
    </Box>
  )
}

export default ProjectSection
