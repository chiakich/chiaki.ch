import type { NextPage } from 'next'
import React, { useState } from 'react'
import { Box, Center, styled } from 'styled-system/jsx'
import { Button } from 'components/ui/controls'
import { motion } from 'framer-motion'
import Image from 'next/image'
import DotBackground from 'components/index/DotBackground'
import AnimatedLogo from 'components/index/AnimatedLogo'
import { useI18n } from 'i18n'

const Link = styled.a

const Links: NextPage = () => {
  const [isBgLoaded, setBgLoaded] = useState(false)
  const { t } = useI18n()
  return (
    <Box width="100vw" height="100vh" overflow="hidden">
      <Box
        width="100%"
        height="100%"
        position="absolute"
        opacity={isBgLoaded ? 1 : 0}
        overflow="hidden"
        transition="opacity 1.5s ease-in-out"
      >
        <Image
          src="/assets/img/takuzosu-inari-shrine.jpg"
          alt={t('linksPage.backgroundAlt')}
          fill
          style={{
            objectFit: 'cover',
            transform: `scale(${isBgLoaded ? '1.01' : '1'})`,
            transition: 'transform 2s ease-in-out',
          }}
          onLoad={() => {
            setBgLoaded(true)
          }}
        />
      </Box>
      <DotBackground />

      <Center width="100%" height="100%" position="absolute">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
        >
          <Box animation="spin infinite 15s linear" width="100px">
            <AnimatedLogo fastAni />
          </Box>
        </motion.div>
      </Center>

      <Center width="100vw" height="100vh">
        <Center
          width={{ base: '85vw', md: '50vw' }}
          flexDirection="column"
          zIndex="tooltip"
          color="white"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 2, ease: 'easeOut' }}
          >
            <Center mb="30px" position="relative" flexDirection="column">
              <Image
                src="/assets/img/profile.jpg"
                alt={t('linksPage.profileAlt')}
                height={100}
                width={100}
                style={{
                  borderRadius: '50px',
                }}
              />
              <Box fontSize={30} my="20px">
                {t('linksPage.name')}
              </Box>
            </Center>
          </motion.div>

          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ delay: 1.2, duration: 0.7, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', width: '100%' }}
          >
            <Box
              width="100%"
              height="100%"
              borderTop="1px solid white"
              borderBottom="1px solid white"
            >
              <Center
                m="20px"
                gap="15px"
                fontWeight={700}
                flexDirection={{ base: 'column', lg: 'row' }}
              >
                <Button
                  as={Link}
                  width="100%"
                  maxWidth="300px"
                  href="https://www.plurk.com/chiakich"
                  bgColor="#FF574D"
                  isExternal
                >
                  Plurk
                </Button>

                <Button
                  as={Link}
                  width="100%"
                  maxWidth="300px"
                  href="https://instagram.com/akisakuya"
                  background="linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)"
                  isExternal
                >
                  Instagram
                </Button>

                <Button
                  as={Link}
                  border="1px solid white"
                  width="100%"
                  maxWidth="300px"
                  backdropFilter="blur(10px)"
                  bgColor="rgba(50, 50, 50, 0.5)"
                  href="/"
                >
                  {t('linksPage.website')}
                </Button>
              </Center>
            </Box>
          </motion.div>
        </Center>
      </Center>
    </Box>
  )
}

export default Links
