import { Redacted } from 'kappan/react'
import { Box, styled } from 'styled-system/jsx'

const Text = styled.p

/** 字體用 inline style 蓋掉 --type；質感層跟字體是分開的，換字不動任何規則。 */
const FaceRow = ({ zh, stack, sample }: { zh: string; stack: string; sample: string }) => (
  <Box textAlign="center">
    <Text
      className="sg lp-f-x"
      style={{
        fontFamily: stack,
        fontSize: 42,
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: '.24em',
        textIndent: '.12em',
      }}
    >
      <Redacted text={`${zh}\u3000${sample}`} />
    </Text>
  </Box>
)

export default FaceRow
