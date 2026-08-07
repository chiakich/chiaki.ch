import type { NextPage } from 'next'
import NextLink from 'next/link'
import { Box, Center, Flex, styled } from 'styled-system/jsx'
import { Button } from 'components/ui/controls'
import TerminalChat from 'components/story/terminal/TerminalChat'
import { localizedPath, useI18n } from 'i18n'
import { makeStaticProps } from 'i18n/messages'

const Text = styled.p
const Heading = styled.h1
const Label = styled.span

const TerminalPage: NextPage = () => {
  const { locale, t } = useI18n()

  return (
    <Box bg="black" width="100%" minHeight="100vh" overflow="clip">
      {/* Faint scanline wash over the whole page, matching /story */}
      <Box
        position="fixed"
        inset="0"
        pointerEvents="none"
        zIndex="1"
        opacity=".25"
        backgroundImage="repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,.5) 3px)"
      />
      <Box
        position="fixed"
        inset="0"
        pointerEvents="none"
        zIndex="0"
        background="radial-gradient(ellipse at 50% 0%, rgba(28,42,46,.6), rgba(0,0,0,0) 60%)"
      />

      <Box position="relative" zIndex="2" pt={{ base: '96px', md: '120px' }} pb="80px">
        <Box
          maxWidth="width.section"
          mx="auto"
          px={{ base: '16px', md: '40px', lg: '60px' }}
          mb={{ base: '20px', md: '28px' }}
        >
          <Label
            fontFamily="nixie"
            fontSize="10px"
            letterSpacing=".24em"
            color="rgba(229,188,99,.55)"
          >
            {t('terminalPage.eyebrow')}
          </Label>
          <Heading
            mt="8px"
            fontSize={{ base: '1.7rem', md: '2.4rem' }}
            fontWeight="bold"
            color="rgba(248,244,235,.96)"
            letterSpacing=".02em"
          >
            {t('terminalPage.title')}
          </Heading>
          <Text
            mt="10px"
            maxWidth="640px"
            fontSize={{ base: '13px', md: '14px' }}
            lineHeight="1.9"
            color="rgba(190,215,208,.62)"
          >
            {t('terminalPage.intro')}
          </Text>
        </Box>

        <TerminalChat />

        {/* How it works — the point of the page is that there is no model here */}
        <Box
          maxWidth="width.section"
          mx="auto"
          px={{ base: '16px', md: '40px', lg: '60px' }}
          mt={{ base: '48px', md: '72px' }}
        >
          <Label
            fontFamily="nixie"
            fontSize="10px"
            letterSpacing=".24em"
            color="rgba(190,215,208,.45)"
          >
            {t('terminalPage.howTitle')}
          </Label>
          <Flex
            mt="16px"
            gap={{ base: '16px', md: '24px' }}
            direction={{ base: 'column', md: 'row' }}
          >
            {(['how1', 'how2', 'how3'] as const).map((key, index) => (
              <Box
                key={key}
                flex="1"
                borderTop="1px solid rgba(120,200,180,.2)"
                pt="12px"
              >
                <Label
                  fontFamily="nixie"
                  fontSize="9px"
                  letterSpacing=".2em"
                  color="rgba(229,188,99,.5)"
                >
                  {String(index + 1).padStart(2, '0')}
                </Label>
                <Text
                  mt="6px"
                  fontSize="13px"
                  lineHeight="1.9"
                  color="rgba(190,215,208,.66)"
                >
                  {t(`terminalPage.${key}`)}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>

        <Center mt={{ base: '48px', md: '64px' }} gap="12px" flexWrap="wrap" px="16px">
          <NextLink href={localizedPath('/story/character', locale)}>
            <Button colorScheme="whiteAlpha" variant="outline">
              {t('terminalPage.toCharacter')}
            </Button>
          </NextLink>
          <NextLink href={localizedPath('/works/chiakey', locale)}>
            <Button colorScheme="whiteAlpha" variant="outline">
              {t('terminalPage.toChiaKey')}
            </Button>
          </NextLink>
        </Center>
      </Box>
    </Box>
  )
}

export default TerminalPage

export const getStaticProps = makeStaticProps('story/terminal')
