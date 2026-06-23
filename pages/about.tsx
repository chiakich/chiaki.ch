import type { NextPage } from 'next'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  List,
  ListItem,
  SimpleGrid,
  Link as ChakraLink,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import NextLink from 'next/link'
import TopBar from 'components/TopBar'

const MotionBox = motion(Box)

const interests: { title: string; description: string }[] = [
  {
    title: '設計',
    description:
      '喜歡以人為本、機能與美觀兼顧的設計。曾參與 justfont 粉圓字型，也做平面與網頁設計，想為更有設計感的社會盡一份力。',
  },
  {
    title: '繪畫',
    description:
      '喜歡畫畫，偶爾塗鴉。女僕、眼鏡、水手服、獸耳、褲襪、短髮都是我的菜。',
  },
  {
    title: '攝影',
    description:
      '喜歡用相機留下只存在於那個瞬間的事物。最近主力是底片相機。',
  },
  {
    title: '模型',
    description:
      '醉心於極小比例下濃縮的力與美，大多是 1/700 二戰日本軍艦與 1/72 飛機，最愛航空母艦。曾任台大模型社社長。',
  },
  {
    title: '同人活動',
    description:
      '不受商業限制、創作自由度更高的獨立創作。喜歡在 FF 等同人場直接和讀者交流。',
  },
  {
    title: 'Cosplay',
    description:
      '透過服裝與道具詮釋自己喜愛的角色，是一種演繹角色的表演藝術。',
  },
  {
    title: '旅行',
    description:
      '研究路線、探索新地區、體驗不同文化。喜歡各地的夜景與在地美食。',
  },
  {
    title: '開源',
    description:
      '把技術開放給他人、降低交流門檻，進而演變成合作開發的文化。我覺得這對社會很有幫助，也想把它傳承下去。',
  },
  {
    title: '在房間耍廢',
    description:
      '為了打造不用出門也能極致悠閒的環境，自己設計、發包裝潢了房間，工時約四個月。',
  },
]

interface SectionProps {
  title: string
  children: React.ReactNode
}

const Section = ({ title, children }: SectionProps) => (
  <MotionBox
    width="100%"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <Heading
      as="h2"
      fontSize={{ base: 'lg', md: 'xl' }}
      color="#df8a42"
      mb={4}
      letterSpacing="0.05em"
    >
      {title}
    </Heading>
    <Box fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" opacity={0.92}>
      {children}
    </Box>
  </MotionBox>
)

const About: NextPage = () => {
  return (
    <Box backgroundColor="black" color="white" minHeight="100vh">
      <TopBar />
      <Container maxW="720px" pt="88px" pb="120px" px={{ base: '24px', md: '20px' }}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <VStack spacing={5} align="center" textAlign="center" mb={16}>
            <Box
              borderRadius="full"
              overflow="hidden"
              boxSize={{ base: '110px', md: '130px' }}
              border="2px solid #df8a42"
            >
              <Image
                src="/assets/img/profile.jpg"
                alt="涼風千秋"
                width={130}
                height={130}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </Box>
            <Heading as="h1" fontSize={{ base: '3xl', md: '4xl' }}>
              涼風千秋
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="medium"
              color="#f5c8a1"
            >
              喜歡沒事找事做，沒坑找坑挖
            </Text>
            <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.9" maxW="520px">
              嗨，我是涼風千秋。
              <br />
              一個興趣比時間多很多的人——常常一個坑還沒填完，就又興沖沖地跳進下一個。
            </Text>
          </VStack>
        </MotionBox>

        <VStack spacing={14} align="start">
          <Section title="最近在玩的坑">
            <List spacing={3}>
              <ListItem>看動畫、打電動，特別吃科幻題材（Cyberpunk、終末地這種）</ListItem>
              <ListItem>最近開始收黑膠</ListItem>
              <ListItem>偏執地喜歡復古的東西，尤其是 20 世紀前後那個年代的設計感</ListItem>
            </List>
          </Section>

          <Section title="還有這些一直放在心上的東西">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={2}>
              {interests.map((item) => (
                <Box
                  key={item.title}
                  borderLeft="2px solid #df8a42"
                  pl={4}
                  py={1}
                >
                  <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} mb={1}>
                    {item.title}
                  </Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }} opacity={0.85} lineHeight="1.8">
                    {item.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Section>

          <Section title="白天的我">
            <Text>
              平常是個普通的軟體工程師，也做字體設計。
              <br />
              之前有人找我一起做字體分發相關的東西——所以如果你有什麼想一起搞的，歡迎丟訊息來聊聊，雖然我也不知道會長成什麼樣，但這種「不知道會變怎樣」的事我最喜歡了。
            </Text>
          </Section>

          <Section title="關於相處（先說在前面）">
            <Text>
              我大概算慢熟，而且——事情實在太多了——回訊息會很慢。
              <br />
              但「慢」不等於「不想理你」：想找我聊、想傳訊息給我，都非常歡迎，我有空一定會盡量回、盡量看。
              <br />
              只是要先跟大家說聲抱歉：我不一定每則貼文都會看到，不是故意已讀或無視，是忙起來真的會漏。要追上每個人的近況對我來說有點難，這點請多包涵。
            </Text>
          </Section>

          <Section title="一點小小的請求">
            <Text>
              這裡不太適合聊政治、也不太適合拿來批評什麼東西。
              <br />
              我一直覺得沒有什麼是絕對的善或惡，很多東西只是被放錯了地方而已。
              <br />
              帶著這樣的善意來，我們應該會很合得來。
            </Text>
          </Section>

          <Section title="找我">
            <Text>
              想找我的話，所有聯絡方式都整理在{' '}
              <ChakraLink as={NextLink} href="/links" color="#df8a42">
                這裡
              </ChakraLink>
              。
            </Text>
          </Section>
        </VStack>
      </Container>
    </Box>
  )
}

export default About
