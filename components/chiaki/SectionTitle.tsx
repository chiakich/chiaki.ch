import type { ReactNode } from 'react'
import { Flex, styled } from 'styled-system/jsx'
import { NAVY } from './chiakiData'

const Heading = styled.h2

const SectionTitle = ({ children, aside }: { children: ReactNode; aside?: ReactNode }) => (
  <Flex flexWrap="wrap" alignItems="flex-end" justifyContent="space-between" gap={4} pb={3} mb={8} style={{ borderBottom: `2px solid ${NAVY}` }}>
    <Heading fontFamily="'Jost', var(--cjk), sans-serif" fontWeight="bold" fontSize={{ base: '3.5rem', md: 'clamp(3.5rem, 8vw, 7rem)' }} lineHeight=".85" letterSpacing="-0.01em">{children}</Heading>
    {aside}
  </Flex>
)

export default SectionTitle
