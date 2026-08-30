import { Redacted } from 'kappan/react'
import { Box, styled } from 'styled-system/jsx'

const Text = styled.p

/**
 * 字體見本的一行：字體名接著樣字，整行用該字體排 —— 字體名本身就是樣張。
 * 排法跟級數見本一樣，上面一行英文小字，下面一行漢字。
 *
 * 字體用 inline style 蓋掉 --type，濾鏡與逐字歪斜完全沒動 ——
 * 質感層跟字體是分開的，換字不用改任何一條規則。
 */
const FaceRow = ({
  zh,
  name,
  note,
  stack,
  sample,
}: {
  zh: string
  name: string
  note: string
  stack: string
  sample: string
}) => (
  <Box textAlign="center">
    <Text className="tp" style={{ fontSize: 14, letterSpacing: '.01em', marginBottom: 10 }}>
      {`${name} · ${note}`}
    </Text>
    <Text
      className="sg lp-xl"
      style={{
        fontFamily: stack,
        fontSize: 42,
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: '.24em',
        textIndent: '.12em',
      }}
    >
      <Redacted text={`${zh}　${sample}`} />
    </Text>
  </Box>
)

export default FaceRow
