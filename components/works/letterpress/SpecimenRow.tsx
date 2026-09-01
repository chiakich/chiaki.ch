import { Redacted } from 'kappan/react'
import { Box, HStack, styled } from 'styled-system/jsx'

const Text = styled.p

/**
 * 見本帖的一行：上面一行級數名，下面一行漢字樣張。
 *
 * 字級與濾鏡都由字號 class 決定，這裡不指定 —— 幾號字該配哪支濾鏡是套件的事，
 * 見 kappan/css/sizes。號數與西文名並列，因為原帖上這兩套本來就是同一批活字的兩種叫法。
 */
const SpecimenRow = ({
  hao,
  name,
  cls,
  text,
}: {
  hao: string
  name: string
  cls: string
  text: string
}) => (
  <Box textAlign="center">
    <HStack justifyContent="center" gap={3} alignItems="baseline" mb={2}>
      <Text className="sg" style={{ fontSize: 13, letterSpacing: '.18em' }}>
        {hao}
      </Text>
      <Text className="tp" style={{ fontSize: 15, letterSpacing: '.01em' }}>
        {name}
      </Text>
    </HStack>
    <Text
      className={cls}
      style={{
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
