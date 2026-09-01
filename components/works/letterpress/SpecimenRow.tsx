import { Redacted } from 'kappan/react'
import { Box, styled } from 'styled-system/jsx'

const Text = styled.p

/**
 * 見本帖的一行：上面一行英文級數名，下面一行漢字樣張。
 *
 * 31px 以上換上 .lp-f-x 那支濾鏡。噪點的週期是絕對長度，不會跟著字級放大，
 * 一般那三支套在 68px 的字上細到看不見，斑駁感就整個不見了。
 */
const SpecimenRow = ({ name, size, text }: { name: string; size: number; text: string }) => (
  <Box textAlign="center">
    <Text
      className="tp"
      style={{ fontSize: 15, letterSpacing: '.01em', marginBottom: Math.round(size * 0.18) }}
    >
      {name}
    </Text>
    <Text
      className={`sg${size >= 31 ? ' lp-f-x' : ''}`}
      style={{
        fontSize: size,
        fontWeight: 600,
        lineHeight: 1.25,
        // 見本帖的字距開得很大。置中時尾端會多出一個字距，往右補半個才回得到正中間。
        letterSpacing: '.42em',
        textIndent: '.21em',
      }}
    >
      <Redacted text={text} />
    </Text>
  </Box>
)

export default SpecimenRow
