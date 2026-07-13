import Head from 'next/head'
import { useRouter } from 'next/router'

const SITE_URL = 'https://chiaki.ch'
const SITE_NAME = '千秋稻荷社'

type PageMeta = {
  title: string
  description: string
  image: string
}

const pageMetadata: Record<string, PageMeta> = {
  '/': {
    title: '千秋稻荷社 - Chiaki Inari Shrine',
    description:
      '千秋稻荷社是專注於技術、字型設計與次文化研究的個人同人社團。誕生於對開源精神與同人文化的熱愛，本社團的主要活動為畫畫、周邊製作發行、軟體工程、開源字體開發及模型製作相關等。期望透過每一場活動，將設計、科技與生活中的次文化樂趣，以最純粹的方式傳遞給同好。',
    image: '/og/home.jpeg',
  },
  '/about': {
    title: '關於千秋 - 千秋稻荷社',
    description:
      '您好！我是涼風千秋。畫畫、做設計師、寫程式的人。永遠都在挖坑與填坑的路上。',
    image: '/og/about.jpeg',
  },
  '/links': {
    title: '連結 - 千秋稻荷社',
    description: '社群與網站連結。',
    image: '/og/links.jpeg',
  },
  '/story': {
    title: '千秋稻荷社的故事',
    description: '探索千秋稻荷社、常世與人類記憶交會的故事。',
    image: '/og/story.jpeg',
  },
  '/story/character': {
    title: '涼風千秋 - 千秋稻荷社',
    description: '千秋稻荷社第一研究室室長，兼第▓▓代巫女：涼風千秋。',
    image: '/og/story-character.jpeg',
  },
  '/story/character/art': {
    title: '涼風千秋的作品 - 千秋稻荷社',
    description: '涼風千秋的角色插畫與創作作品集。',
    image: '/og/story-character-art.jpeg',
  },
  '/works': {
    title: '作品集 - 千秋稻荷社',
    description: '千秋設計與開發的軟體、工具與介面作品。',
    image: '/og/works.jpeg',
  },
  '/works/chiakey': {
    title: '千秋輸入法 ChiaKey - 千秋稻荷社',
    description:
      '以 Yahoo! 奇摩輸入法開源程式碼為基礎的現代 macOS 繁體中文注音輸入法。',
    image: '/og/works-chiakey.jpeg',
  },
  '/works/kumiko': {
    title: 'Kumiko Font Editor - 千秋稻荷社',
    description: '完全在瀏覽器運作的字體編輯與補字工具。',
    image: '/og/works-kumiko.jpeg',
  },
  '/works/tg-jpg': {
    title: 'tg.jpg Telegram Bot - 千秋稻荷社',
    description: '輸入.jpg，回覆第一張可用搜尋結果的 Telegram bot。',
    image: '/og/works-tg-jpg.jpeg',
  },
  '/works/split-flap': {
    title: 'react-split-flap - 千秋稻荷社',
    description: '重現車站翻頁顯示器的 React 元件，致敬京急川崎駅的パタパタ發車標。',
    image: '/og/works-split-flap.jpeg',
  },
  '/works/tokyono-sora': {
    title: '東京乃空 Tokyono Sora - 千秋稻荷社',
    description: '重新設計噗浪時間軸的 CSS 佈景。',
    image: '/og/works-tokyono-sora.jpeg',
  },
  '/fonts': {
    title: '字體集 - 千秋稻荷社',
    description: '千秋設計與參與製作的字體作品。',
    image: '/og/fonts.jpeg',
  },
  '/fonts/akitra': {
    title: '台鐵客貨車字體 - 千秋稻荷社',
    description: '以台鐵客貨車表記文字為藍本設計的字體。',
    image: '/og/fonts-akitra.jpeg',
  },
  '/fonts/nixie': {
    title: 'Nixie 數字字體 - 千秋稻荷社',
    description: '重現輝光管溫暖橙光的數字字體。',
    image: '/og/fonts-nixie.jpeg',
  },
  '/fonts/huninn': {
    title: 'jf open 粉圓 - 千秋稻荷社',
    description: 'justfont 推出的一款台灣開源圓體。',
    image: '/og/fonts-huninn.jpeg',
  },
}

const fallbackMetadata = pageMetadata['/']

const PageMeta = () => {
  const { pathname } = useRouter()
  const metadata = pageMetadata[pathname] ?? fallbackMetadata
  const canonicalUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`
  const imageUrl = `${SITE_URL}${metadata.image}`

  return (
    <Head>
      <title key="title">{metadata.title}</title>
      <meta key="description" name="description" content={metadata.description} />
      <link key="canonical" rel="canonical" href={canonicalUrl} />
      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:url" property="og:url" content={canonicalUrl} />
      <meta key="og:title" property="og:title" content={metadata.title} />
      <meta
        key="og:description"
        property="og:description"
        content={metadata.description}
      />
      <meta key="og:image" property="og:image" content={imageUrl} />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta key="og:image:alt" property="og:image:alt" content={metadata.title} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content="zh_TW" />
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:url" name="twitter:url" content={canonicalUrl} />
      <meta key="twitter:title" name="twitter:title" content={metadata.title} />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={metadata.description}
      />
      <meta key="twitter:image" name="twitter:image" content={imageUrl} />
      <meta
        key="twitter:image:alt"
        name="twitter:image:alt"
        content={metadata.title}
      />
    </Head>
  )
}

export default PageMeta
