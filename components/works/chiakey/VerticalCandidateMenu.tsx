import { Box, Flex, HStack, Stack, styled } from 'styled-system/jsx'

const Text = styled.p
const Span = styled.span

interface VerticalCandidateMenuProps {
  items?: string[]
  page?: string
  highlightIndex?: number
  compact?: boolean
}

// 依照 ChiaKey 實際候選窗樣式重現：
// 黑底大圓角、白框、白色圓圈黑數字、選取列為紫色漸層。
const defaultItems = ['鹽酥雞', '機', '基', '績', '積', '雞', '奇', '幾']

// 尺寸相關的條件式任意值一律走 inline style——
// Panda 無法靜態抽取這種寫法，會整條樣式消失（白框就是這樣不見的）。
const highlightBackground = 'linear-gradient(180deg, #a12cae 0%, #5f1069 100%)'

const VerticalCandidateMenu = ({ items = defaultItems, page = '1/21', highlightIndex = 0, compact = false }: VerticalCandidateMenuProps) => {
  const size = compact
    ? { width: 178, border: '2px solid #f2f2f2', radius: 20, row: 30, circle: 21, number: 13, item: 18, arrow: 12, footer: 24 }
    : { width: 212, border: '3px solid #f2f2f2', radius: 26, row: 38, circle: 26, number: 15, item: 25, arrow: 13, footer: 30 }

  return (
    <Box
      backgroundColor="#050505"
      boxShadow="0 16px 32px rgba(0,0,0,.55)"
      overflow="hidden"
      color="white"
      py={1}
      style={{ width: size.width, border: size.border, borderRadius: size.radius }}
    >
      <Text textAlign="center" opacity={.92} style={{ fontSize: size.arrow, lineHeight: compact ? '18px' : '24px' }}>▲</Text>
      <Stack gap={0}>
        {items.map((item, index) => (
          <Flex
            key={`${item}-${index}`}
            alignItems="center"
            style={{
              height: size.row,
              paddingInline: compact ? 10 : 12,
              gap: compact ? 10 : 12,
              background: index === highlightIndex ? highlightBackground : 'transparent',
            }}
          >
            <Flex
              borderRadius="full"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              backgroundColor="#050505"
              color="#f5f5f5"
              fontWeight="black"
              style={{ width: size.circle, height: size.circle, fontSize: size.number }}
            >{index + 1}</Flex>
            <Span fontWeight="bold" lineHeight="1" letterSpacing=".08em" style={{ fontSize: size.item }}>{item}</Span>
          </Flex>
        ))}
      </Stack>
      <HStack justifyContent="space-between" px={4} fontWeight="bold" style={{ height: size.footer, fontSize: size.arrow }}><Span opacity={.92}>▼</Span><Span opacity={.92}>{page}</Span></HStack>
    </Box>
  )
}

export default VerticalCandidateMenu
