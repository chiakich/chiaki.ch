import type { ReactNode } from 'react'
import { Box, Flex, styled } from 'styled-system/jsx'
import { INK, JOST, ORANGE, ORANGE_TEXT, SNOW } from './chiakiData'

const Heading = styled.h2
const Span = styled.span

const SectionTitle = ({ index, sub, aside, dark = false, gap = '64px', children }: { index: string; sub: string; aside?: ReactNode; dark?: boolean; gap?: string; children: ReactNode }) => (
  <>
    <Flex flexWrap="wrap" alignItems="flex-end" columnGap={7} rowGap={2} pb="22px">
      <Span pb="10px" fontFamily="mono" fontSize="13px" letterSpacing=".2em" style={{ color: dark ? ORANGE : ORANGE_TEXT }}>{index}</Span>
      <Heading fontWeight="medium" fontSize={{ base: '3.5rem', md: 'clamp(3.5rem, 9vw, 8rem)' }} lineHeight="0.86" letterSpacing="-.01em" style={{ fontFamily: JOST }}>{children}</Heading>
      <Span pb="6px" fontWeight="medium" fontSize={{ base: 'md', md: '21px' }} letterSpacing={{ base: '.3em', _en: '.04em' }}>{sub}</Span>
      {aside && <Box ml="auto">{aside}</Box>}
    </Flex>
    <Box aria-hidden height="2px" style={{ backgroundColor: dark ? SNOW : INK, marginBottom: gap }} />
  </>
)

export default SectionTitle
