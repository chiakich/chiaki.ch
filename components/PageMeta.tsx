import Head from 'next/head'
import { useRouter } from 'next/router'
import { pagePathFromLocalePath, useI18n } from 'i18n'

const SITE_URL = 'https://chiaki.ch'
const SITE_NAME = '千秋稻荷社'

type PageMeta = {
  key: string
  image: string
}

const pageMetadata: Record<string, PageMeta> = {
  '/': { key: 'home', image: '/og/home.jpeg' },
  '/about': { key: 'about', image: '/og/about.jpeg' },
  '/links': { key: 'links', image: '/og/links.jpeg' },
  '/story': { key: 'story', image: '/og/story.jpeg' },
  '/story/character': { key: 'character', image: '/og/story-character.jpeg' },
  '/story/character/art': { key: 'art', image: '/og/story-character-art.jpeg' },
  '/works': { key: 'works', image: '/og/works.jpeg' },
  '/works/chiakey': { key: 'chiakey', image: '/og/works-chiakey.jpeg' },
  '/works/kumiko': { key: 'kumiko', image: '/og/works-kumiko.jpeg' },
  '/works/tg-jpg': { key: 'tgJpg', image: '/og/works-tg-jpg.jpeg' },
  '/works/split-flap': { key: 'splitFlap', image: '/og/works-split-flap.jpeg' },
  '/works/tokyono-sora': { key: 'tokyonoSora', image: '/og/works-tokyono-sora.jpeg' },
  '/fonts': { key: 'fonts', image: '/og/fonts.jpeg' },
  '/fonts/akitra': { key: 'akitra', image: '/og/fonts-akitra.jpeg' },
  '/fonts/nixie': { key: 'nixie', image: '/og/fonts-nixie.jpeg' },
  '/fonts/huninn': { key: 'huninn', image: '/og/fonts-huninn.jpeg' },
}

const fallbackMetadata = pageMetadata['/']

const PageMeta = () => {
  const { asPath } = useRouter()
  const { locale, t } = useI18n()
  const pathname = asPath.split(/[?#]/, 1)[0] || '/'
  const pagePath = pagePathFromLocalePath(pathname)
  const metadata = pageMetadata[pagePath] ?? fallbackMetadata
  const title = t(`meta.${metadata.key}.title`)
  const description = t(`meta.${metadata.key}.description`)
  const canonicalUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`
  const imageUrl = `${SITE_URL}${metadata.image}`

  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <link key="canonical" rel="canonical" href={canonicalUrl} />
      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:url" property="og:url" content={canonicalUrl} />
      <meta key="og:title" property="og:title" content={title} />
      <meta
        key="og:description"
        property="og:description"
        content={description}
      />
      <meta key="og:image" property="og:image" content={imageUrl} />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta key="og:image:alt" property="og:image:alt" content={title} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content={locale === 'ja' ? 'ja_JP' : locale === 'en' ? 'en_US' : 'zh_TW'} />
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:url" name="twitter:url" content={canonicalUrl} />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={description}
      />
      <meta key="twitter:image" name="twitter:image" content={imageUrl} />
      <meta
        key="twitter:image:alt"
        name="twitter:image:alt"
        content={title}
      />
    </Head>
  )
}

export default PageMeta
