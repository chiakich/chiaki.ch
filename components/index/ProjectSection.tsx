import { Box, Flex, styled } from 'styled-system/jsx'
import { Button } from 'components/ui/controls'
import Link from 'next/link'

const Heading = styled.h1

const ProjectSection = () => {
  return (
    <Box
      minHeight="100vh"
      width="100%"
      background="radial-gradient(circle at 50% 45%, rgba(56, 105, 106, .3), transparent 34%), #030505"
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={8}
      overflow="hidden"
    >
      <Box
        position="absolute"
        width={{ base: '72vw', md: '42vw' }}
        maxWidth="620px"
        aspectRatio="1"
        border="1px solid rgba(182, 238, 225, .16)"
        borderRadius="50%"
        animation="spin 32s linear infinite"
        _before={{
          content: '""',
          position: 'absolute',
          inset: '11%',
          border: '1px solid rgba(255,255,255,.09)',
          borderRadius: '50%',
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '-4px',
          left: '50%',
          width: '8px',
          height: '8px',
          background: '#d9fff5',
          borderRadius: '50%',
          boxShadow: '0 0 20px #8ce0cd',
        }}
      />
      <Box position="relative" zIndex="1" textAlign="center" px="24px">
        <Box
          fontFamily="nixie"
          fontSize="10px"
          letterSpacing=".32em"
          color="rgba(217,255,245,.55)"
          mb="22px"
        >
          ARCHIVE / 01
        </Box>
      <Heading
        fontSize={{ base: 'clamp(3.2rem, 14vw, 5rem)', md: 'clamp(5rem, 9vw, 8rem)' }}
        lineHeight={0.9}
        color="white"
        textAlign="center"
        fontWeight="400"
        letterSpacing="-.06em"
        textShadow="0 12px 40px rgba(0,0,0,.55)"
        mb="36px"
      >
        故事仍在生長
      </Heading>

      <Link href="/story/character">
        <Button
          size="lg"
          colorScheme="whiteAlpha"
          variant="outline"
          borderWidth="1px"
          color="white"
          borderRadius="999px"
          px="30px"
          letterSpacing=".14em"
          fontFamily="nixie"
          background="rgba(255,255,255,.03)"
          backdropFilter="blur(12px)"
          transition="transform .3s ease, background .3s ease, box-shadow .3s ease"
          _hover={{
            transform: 'translateY(-3px)',
            background: 'rgba(182,238,225,.1)',
            boxShadow: '0 10px 40px rgba(96,190,172,.16)',
          }}
        >
          MEET THE CHARACTER &nbsp; →
        </Button>
      </Link>
      </Box>
      <Flex
        position="absolute"
        bottom={{ base: '28px', md: '42px' }}
        left={{ base: '24px', md: '52px' }}
        right={{ base: '24px', md: '52px' }}
        justifyContent="space-between"
        fontFamily="nixie"
        fontSize="9px"
        letterSpacing=".2em"
        color="rgba(255,255,255,.35)"
      >
        <Box>CHIAKI INARI SHRINE</Box>
        <Box>TO BE CONTINUED</Box>
      </Flex>
    </Box>
  )
}

export default ProjectSection
