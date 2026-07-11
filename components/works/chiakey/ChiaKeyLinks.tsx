import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import ProjectLink from 'components/portfolio/ProjectLink'
import SectionHeading from 'components/portfolio/SectionHeading'

const Heading = styled.h3
const Text = styled.p
const Image = styled.img

const audiences = ['懷念 Yahoo! 奇摩輸入法／KeyKey 的手感', '想保存或研究 KeyKey／OpenVanilla 引擎', '想要一套行為穩定、不常改動的注音輸入法']

const ChiaKeyLinks = () => (
  <MotionSection>
    <SectionHeading en="DOWNLOAD" accent="#78b7ff">安裝</SectionHeading>
    <Grid columns={{ base: 1, md: 2 }} gap={8}>
      <Stack gap={5}>
        <Text lineHeight="1.9" opacity={.8}>下載簽章過的 .pkg 安裝，然後到「系統設定 → 鍵盤 → 文字輸入」加入千秋輸入法。支援 Apple Silicon。</Text>
        <HStack gap={3} flexWrap="wrap"><ProjectLink href="https://github.com/chiakich/ChiaKey/releases/latest" label="下載安裝包" detail=".pkg" accent="#78b7ff" /><ProjectLink href="https://github.com/chiakich/ChiaKey" label="原始碼" accent="#b8d9ff" /></HStack>
        <Text fontSize="xs" opacity={.48} lineHeight="1.7">ChiaKey 不是 Yahoo 官方產品。原始碼依 BSD-style 授權釋出；Yahoo! 名稱與貢獻者姓名不得在未取得書面同意時用於背書衍生產品。</Text>
      </Stack>
      <Box backgroundColor="#0d1620" border="1px solid #24394f" p={6} position="relative" overflow="hidden">
        <Heading fontSize="lg" mb={5}>適合這樣的你</Heading>
        <Stack gap={4}>{audiences.map((item, index) => <HStack key={item} alignItems="start" gap={3}><Text color="#78b7ff" fontFamily="mono">0{index + 1}</Text><Text lineHeight="1.7" opacity={.78}>{item}</Text></HStack>)}</Stack>
        <Image src="/assets/works/chiakey/chiaki.gif" alt="千秋角色動畫" position="absolute" right="-12px" bottom="-36px" width="120px" opacity={.24} />
      </Box>
    </Grid>
  </MotionSection>
)

export default ChiaKeyLinks
