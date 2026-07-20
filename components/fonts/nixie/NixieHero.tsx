import { motion } from 'framer-motion'
import { Box, styled } from 'styled-system/jsx'
import { Button } from 'components/ui/controls'
import { NIXIE, NIXIE_BRIGHT, NIXIE_GLOW, WORLDLINES } from './nixieTheme'
import { useWorldline } from './useWorldline'
import { useI18n } from 'i18n'

const Text = styled.p
const Heading = styled.h1
const Span = styled.span
const MotionBox = motion(Box)

const RetroButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <Button
    background="silver"
    border="none"
    borderRadius="0"
    boxShadow="inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf"
    boxSizing="border-box"
    color="transparent"
    minHeight="23px"
    minWidth="75px"
    padding="0 12px"
    textShadow="0 0 #222"
    fontWeight="500"
    fontSize="xs"
    fontFamily="cubic"
    mx={2}
    justifyContent="center"
    _active={{
      boxShadow:
        'inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey',
      textShadow: '1px 1px #222',
    }}
    _hover={{ filter: 'brightness(1)', cursor: 'default' }}
    _focus={{ outline: '1px dotted #000', outlineOffset: '-4px' }}
    onClick={onClick}
  >
    {label}
  </Button>
)

// 動態色彩一律走 inline style：Panda 無法靜態抽取 import 進來的常數。
const NixieHero = () => {
  const { display, shifting, shift } = useWorldline()
  const { t } = useI18n()
  return (
    <>
      <Box
        pt="96px"
        minHeight="80vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        background="radial-gradient(ellipse at 50% 60%, #1a0a00, #020202 70%)"
      >
        <MotionBox
          textAlign="center"
          px={4}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <Heading
            letterSpacing=".4em"
            fontWeight="bold"
            mb={6}
            style={{ color: NIXIE }}
          >
            AKINIXIE NUMBER FONT
          </Heading>
          <Box
            position="relative"
            display="inline-block"
            cursor="pointer"
            onClick={shift}
            style={{ filter: shifting ? 'blur(1px) brightness(1.7)' : 'none' }}
            transition="filter 0.3s ease-in-out"
          >
            <Span
              position="absolute"
              inset="0"
              fontFamily="nixie"
              fontSize={{ base: '3.4rem', md: '8rem' }}
              opacity={0.22}
              color="#deab59"
            >
              $.$$$$$$
            </Span>
            <Text
              fontFamily="nixie"
              fontSize={{ base: '3.4rem', md: '8rem' }}
              style={{ color: NIXIE_BRIGHT, textShadow: NIXIE_GLOW }}
            >
              {display}
            </Text>
          </Box>
          <Box>
            <RetroButton onClick={shift} label={t('nixiePage.send')} />
            <RetroButton
              onClick={() => {
                window.open('/assets/fonts/AkiNixie.ttf')
              }}
              label={t('nixiePage.downloadButton')}
            />
            <Text mt={2} opacity={0.35} fontSize="xs">
              El Psy Kongroo
            </Text>
          </Box>
        </MotionBox>
      </Box>
      <Box
        backgroundColor="#0a0503"
        py={4}
        px={6}
        display="flex"
        justifyContent="center"
        gap={{ base: 6, md: 12 }}
        flexWrap="wrap"
      >
        {WORLDLINES.slice(0, 5).map((line, index) => (
          <Span
            key={line}
            fontFamily="nixie"
            fontSize={{ base: 'lg', md: '2xl' }}
            style={{
              color: index % 2 ? `${NIXIE}88` : NIXIE_BRIGHT,
              textShadow: index % 2 ? undefined : NIXIE_GLOW,
            }}
          >
            {line}
          </Span>
        ))}
      </Box>
    </>
  )
}

export default NixieHero
