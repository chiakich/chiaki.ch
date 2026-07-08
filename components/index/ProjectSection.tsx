import { Box, styled } from 'styled-system/jsx'
import { Button } from 'components/ui/controls'
import Link from 'next/link'

const Heading = styled.h1

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
        fontSize={{ base: '2.25rem', md: '3rem' }}
        lineHeight={1.1}
        color="white"
        textAlign="center"
        fontWeight="bold"
        textShadow="2px 2px 4px rgba(0,0,0,0.3)"
      >
        Project 千秋稻荷社
      </Heading>

      <Link href="/story/character">
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
