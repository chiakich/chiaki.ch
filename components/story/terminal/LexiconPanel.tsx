import React from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import type { Token } from 'lib/terminal/lexicon'
import { useI18n } from 'i18n'

const Text = styled.p
const Label = styled.span

// Shows how the ChiaKey lexicon carved up the last thing the visitor typed.
// This is the honest window into the whole feature: no model, just a dictionary
// and a table, and here is the dictionary doing its half of the job.

const TokenChip = ({ token }: { token: Token }) => {
  const tone = token.modern
    ? { border: 'rgba(247,186,120,.75)', color: '#ffe0c0', bg: 'rgba(247,186,120,.14)' }
    : token.known
      ? { border: 'rgba(231,105,45,.38)', color: 'rgba(255,228,207,.9)', bg: 'rgba(231,105,45,.07)' }
      : { border: 'rgba(255,96,72,.45)', color: 'rgba(255,176,158,.92)', bg: 'rgba(255,60,40,.08)' }

  return (
    <Box
      px="7px"
      py="3px"
      border="1px solid"
      borderColor={tone.border}
      background={tone.bg}
      color={tone.color}
      fontSize={{ base: '13px', md: '14px' }}
      letterSpacing=".04em"
      whiteSpace="nowrap"
    >
      {token.text}
    </Box>
  )
}

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <Flex alignItems="center" gap="5px">
    <Box width="7px" height="7px" background={color} />
    <Label fontSize="10px" letterSpacing=".1em" color="rgba(238,150,98,.55)">
      {label}
    </Label>
  </Flex>
)

type LexiconPanelProps = {
  tokens: Token[]
  /** null until the dictionary has finished downloading. */
  wordCount: number | null
}

const LexiconPanel = ({ tokens, wordCount }: LexiconPanelProps) => {
  const { t } = useI18n()

  return (
    <Box
      borderTop="1px solid rgba(231,105,45,.18)"
      background="transparent"
      pt="14px"
    >
      <Flex justifyContent="space-between" alignItems="baseline" gap="12px" mb="10px">
        <Label
          fontFamily="nixie"
          fontSize="9px"
          letterSpacing=".22em"
          color="rgba(238,150,98,.5)"
        >
          {t('terminalPage.lexiconTitle')}
        </Label>
        <Label
          fontFamily="nixie"
          fontSize="9px"
          letterSpacing=".16em"
          color="rgba(238,150,98,.35)"
        >
          {wordCount === null
            ? t('terminalPage.lexiconLoading')
            : `${wordCount.toLocaleString('en-US')} ${t('terminalPage.lexiconEntries')}`}
        </Label>
      </Flex>

      {tokens.length === 0 ? (
        <Text fontSize="13px" color="rgba(238,150,98,.38)" lineHeight="1.7">
          {t('terminalPage.lexiconEmpty')}
        </Text>
      ) : (
        <Flex flexWrap="wrap" gap="5px">
          {tokens.map((token, index) => (
            <TokenChip key={`${token.text}-${index}`} token={token} />
          ))}
        </Flex>
      )}

      <Flex gap="14px" mt="12px" flexWrap="wrap">
        <LegendItem color="rgba(231,105,45,.55)" label={t('terminalPage.legendKnown')} />
        <LegendItem color="rgba(247,186,120,.85)" label={t('terminalPage.legendModern')} />
        <LegendItem color="rgba(255,96,72,.65)" label={t('terminalPage.legendUnknown')} />
      </Flex>
    </Box>
  )
}

export default LexiconPanel
