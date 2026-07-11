import { Box, Flex, HStack, Stack, styled } from 'styled-system/jsx'

const Text = styled.p
const Span = styled.span

interface VerticalCandidateMenuProps {
  items?: string[]
  page?: string
  compact?: boolean
}

const defaultItems = ['雞', '機', '幾', '基', '集', '級', '急', '及']

const VerticalCandidateMenu = ({ items = defaultItems, page = '1/23', compact = false }: VerticalCandidateMenuProps) => (
  <Box
    width={compact ? '184px' : '216px'}
    backgroundColor="#000"
    border="3px solid white"
    borderRadius={compact ? '15px' : '20px'}
    boxShadow="0 16px 32px rgba(0,0,0,.55)"
    overflow="hidden"
    color="white"
    py={1}
  >
    <Text textAlign="left" pl={5} fontSize={compact ? 'sm' : 'md'} lineHeight={compact ? '22px' : '28px'}>▲</Text>
    <Stack gap={0}>
      {items.map((item, index) => (
        <Flex key={`${item}-${index}`} height={compact ? '31px' : '40px'} alignItems="center" px={compact ? 3 : 4} gap={3} backgroundColor={index === 0 ? '#8a008a' : 'transparent'}>
          <Flex width={compact ? '25px' : '32px'} height={compact ? '25px' : '32px'} borderRadius="full" alignItems="center" justifyContent="center" flexShrink={0} backgroundColor={index === 0 ? '#230026' : 'transparent'} fontSize={compact ? 'md' : 'xl'} fontWeight="bold">{index + 1}</Flex>
          <Span fontSize={compact ? 'lg' : '1.65rem'} fontWeight="bold" lineHeight="1">{item}</Span>
        </Flex>
      ))}
    </Stack>
    <HStack justifyContent="space-between" px={5} height={compact ? '25px' : '31px'} fontSize={compact ? 'sm' : 'md'} fontWeight="bold"><Span>▼</Span><Span>{page}</Span></HStack>
  </Box>
)

export default VerticalCandidateMenu
