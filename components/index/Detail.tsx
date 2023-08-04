import { Box, Grid, Heading } from '@chakra-ui/react'

const Detail = () => {
  return (
    <Box height="200vh" width="100%">
      <Box
        position="sticky"
        top="0"
        backgroundColor="white"
        height="100vh"
        overflow="hidden"
      >
        <Box
          height="100%"
          maxWidth="900px"
          marginX={{ base: '10px', md: '100px', lg: 'auto' }}
          fontFamily="creamfont"
        >
          <Grid p="15px" gap="15px">
            <Heading mt="40px">千秋稲荷社とは</Heading>
            <Box mb="40px">
              千秋稲荷社是涼風千秋創立的複合社團。同三萬稲荷神社一般，我們的願望與使命便是「庇佑所有人生活富饒快樂」。
              <br />
              本社受理祈願五穀豐登、商業興盛、家庭安全、實現諸願望等各式委託，於網路的世界為大家服務。
            </Box>
            <Heading mb="20px">社務</Heading>
            <Heading size="lg">字體設計</Heading>
            <Box>
              我們有專業的字體設計經驗，無論是標準字設計、形象字型設計、字體選擇與字體排版諮詢服務，都能夠根據客戶需求，創作出符合品牌形象和風格的獨特字體，提高品牌識別度和形象。
            </Box>
            <Heading size="lg">網頁設計</Heading>
            <Box>
              我們提供網頁設計服務，包括視覺設計、網站架構、網站內容策略等方面，讓您的網站能夠更好地展示品牌形象和產品資訊。
            </Box>
            <Heading size="lg">插畫</Heading>
            <Box>
              接受插畫委託，包括全彩插圖、全身半身立繪、大頭貼、服裝設計與角色設計。
            </Box>
            <Heading size="lg">御守製作</Heading>
            <Box>
              我們提供客製化御守製作服務，將您想提供的圖片、文字等資訊傳給我們，我們會為您製作出獨一無二的御守，並在完成後寄送給您。
            </Box>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}

export default Detail
