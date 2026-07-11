import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'

const Heading = styled.h1
const Text = styled.p

const StoryHeroOverlay = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.55, 0.9], [1, 0.9, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, -90])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])

  return (
    <Box
      ref={sectionRef}
      position="absolute"
      inset="0 auto auto 0"
      width="100%"
      height="125vh"
      zIndex="4"
      pointerEvents="none"
      color="white"
    >
      <motion.div style={{ opacity, y, scale, height: '100vh' }}>
        <Flex
          position="relative"
          height="100%"
          px={{ base: '24px', md: '52px', lg: '72px' }}
          pt="112px"
          pb={{ base: '34px', md: '50px' }}
          flexDirection="column"
          justifyContent="space-between"
        >
          <Flex
            alignItems="center"
            justifyContent="space-between"
            fontFamily="nixie"
            fontSize="10px"
            letterSpacing="0.22em"
            textTransform="uppercase"
            color="rgba(255,255,255,.55)"
          >
            <Text>Archive / 00</Text>
            <Text display={{ base: 'none', md: 'block' }}>
              Chiaki Inari Shrine — The origin
            </Text>
          </Flex>

          <Box alignSelf="center" textAlign="center" mt="auto" mb="auto">
            <Box
              position="relative"
              width={{ base: '112px', md: '150px' }}
              height={{ base: '112px', md: '150px' }}
              mx="auto"
              mb={{ base: '28px', md: '36px' }}
            >
              <Box
                position="absolute"
                inset="0"
                border="1px solid rgba(184, 239, 226, .45)"
                borderRadius="50%"
                boxShadow="0 0 45px rgba(105, 210, 190, .14), inset 0 0 30px rgba(105, 210, 190, .08)"
                animation="spin 18s linear infinite"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: '-3px',
                  left: '50%',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#d8fff6',
                  boxShadow: '0 0 16px #87ead5',
                }}
              />
              <Flex
                position="absolute"
                inset="14%"
                border="1px solid rgba(255,255,255,.2)"
                borderRadius="50%"
                alignItems="center"
                justifyContent="center"
                backdropFilter="blur(8px)"
              >
                <Box
                  width="34%"
                  height="34%"
                  border="1px solid rgba(255,255,255,.7)"
                  transform="rotate(45deg)"
                  boxShadow="0 0 20px rgba(255,255,255,.15)"
                />
              </Flex>
            </Box>

            <Text
              fontFamily="nixie"
              fontSize="10px"
              letterSpacing="0.34em"
              color="rgba(218,255,247,.66)"
              textTransform="uppercase"
              mb="18px"
            >
              After the silence
            </Text>
            <Heading
              maxWidth="980px"
              fontSize={{ base: 'clamp(3rem, 14vw, 5.5rem)', md: 'clamp(5rem, 10vw, 9rem)' }}
              lineHeight="0.88"
              letterSpacing="-0.065em"
              fontWeight="400"
              textShadow="0 8px 50px rgba(0,0,0,.7)"
            >
              諸神離去之後
            </Heading>
          </Box>

          <Flex alignItems="flex-end" justifyContent="space-between">
            <Text
              maxWidth="260px"
              fontSize={{ base: '12px', md: '13px' }}
              lineHeight="1.75"
              color="rgba(255,255,255,.62)"
            >
              一段關於廢墟、種子，與重新相信的故事。
            </Text>
            <Flex alignItems="center" gap="12px">
              <Text
                fontFamily="nixie"
                fontSize="9px"
                letterSpacing=".25em"
                color="rgba(255,255,255,.52)"
              >
                SCROLL TO ENTER
              </Text>
              <Box
                width="1px"
                height="42px"
                background="linear-gradient(to bottom, rgba(255,255,255,.8), transparent)"
              />
            </Flex>
          </Flex>
        </Flex>
      </motion.div>
    </Box>
  )
}

export default StoryHeroOverlay
