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

const VerticalCandidateMenu = ({ items = defaultItems, page = '1/21', highlightIndex = 0, compact = false }: VerticalCandidateMenuProps) => (
  <Box
    width={compact ? '178px' : '212px'}
    backgroundColor="#050505"
    border={compact ? '2px solid #f2f2f2' : '3px solid #f2f2f2'}
    borderRadius={compact ? '20px' : '26px'}
    boxShadow="0 16px 32px rgba(0,0,0,.55)"
    overflow="hidden"
    color="white"
    py={1}
  >
    <Text textAlign="center" fontSize={compact ? 'xs' : 'sm'} lineHeight={compact ? '18px' : '24px'} opacity={.92}>▲</Text>
    <Stack gap={0}>
      {items.map((item, index) => (
        <Flex
          key={`${item}-${index}`}
          height={compact ? '30px' : '38px'}
          alignItems="center"
          px={compact ? 2.5 : 3}
          gap={compact ? 2.5 : 3}
          background={index === highlightIndex ? 'linear-gradient(180deg, #a12cae 0%, #5f1069 100%)' : 'transparent'}
        >
          <Flex
            width={compact ? '21px' : '26px'}
            height={compact ? '21px' : '26px'}
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            backgroundColor="#f5f5f5"
            color="#0a0a0a"
            fontSize={compact ? 'sm' : 'md'}
            fontWeight="900"
          >{index + 1}</Flex>
          <Span fontSize={compact ? 'lg' : '1.55rem'} fontWeight="bold" lineHeight="1" letterSpacing=".08em">{item}</Span>
        </Flex>
      ))}
    </Stack>
    <HStack justifyContent="space-between" px={4} height={compact ? '24px' : '30px'} fontSize={compact ? 'xs' : 'sm'} fontWeight="bold"><Span opacity={.92}>▼</Span><Span opacity={.92}>{page}</Span></HStack>
  </Box>
)

export default VerticalCandidateMenu
