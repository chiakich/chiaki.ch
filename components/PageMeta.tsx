import Head from 'next/head'
import { useRouter } from 'next/router'
import { localizedPath, pagePathFromLocalePath, type Locale, useI18n } from 'i18n'

const SITE_URL = 'https://chiaki.ch'
const SITE_NAME = '千秋稻荷社'

type PageMeta = {
  key: string
  image: string
}

const pageMetadata: Record<string, PageMeta> = {
  '/': { key: 'home', image: '/og/home.jpeg' },
  '/profile': { key: 'profile', image: '/og/profile.jpeg' },
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
  '/blog': { key: 'blog', image: '/og/blog.jpeg' },
}

const fallbackMetadata = pageMetadata['/']

const languageTags: Record<Locale, string> = {
  tw: 'zh-TW',
  ja: 'ja',
  en: 'en',
}

// Extra JSON-LD fields merged into the page node (rich-result eligibility)
const pageSchemaExtras: Record<string, Record<string, unknown>> = {
  '/works/chiakey': {
    operatingSystem: 'macOS',
    applicationCategory: 'UtilitiesApplication',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'TWD' },
    downloadUrl: 'https://cdn.chiaki.ch/chiakey/ChiaKey.pkg',
    isBasedOn: 'https://github.com/YahooArchive/KeyKey',
  },
}

const pageSchemaType: Record<string, string> = {
  '/profile': 'ProfilePage',
  '/blog': 'Blog',
  '/works': 'CollectionPage',
  '/fonts': 'CollectionPage',
  '/works/chiakey': 'SoftwareApplication',
  '/works/kumiko': 'SoftwareApplication',
  '/works/tg-jpg': 'SoftwareSourceCode',
  '/works/split-flap': 'SoftwareSourceCode',
  '/works/tokyono-sora': 'SoftwareSourceCode',
  '/fonts/akitra': 'CreativeWork',
  '/fonts/nixie': 'CreativeWork',
  '/fonts/huninn': 'CreativeWork',
}

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
  const schemaType = pageSchemaType[pagePath] ?? 'WebPage'
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: languageTags[locale],
      },
      ...(pagePath === '/'
        ? [{
            '@type': 'Person',
            '@id': `${SITE_URL}/#chiaki`,
            name: '千秋',
            url: SITE_URL,
            sameAs: [
              'https://www.plurk.com/chiakich',
              'https://instagram.com/akisakuya',
              'https://github.com/chiakich',
            ],
          }]
        : []),
      {
        '@type': schemaType,
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        image: imageUrl,
        inLanguage: languageTags[locale],
        isPartOf: { '@id': `${SITE_URL}/#website` },
        ...(pageSchemaExtras[pagePath] ?? {}),
      },
    ],
  }

  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <link key="canonical" rel="canonical" href={canonicalUrl} />
      {(['tw', 'ja', 'en'] as Locale[]).map((alternateLocale) => (
        <link
          key={`alternate-${alternateLocale}`}
          rel="alternate"
          hrefLang={languageTags[alternateLocale]}
          href={`${SITE_URL}${localizedPath(pagePath, alternateLocale)}`}
        />
      ))}
      <link key="alternate-default" rel="alternate" hrefLang="x-default" href={`${SITE_URL}${pagePath === '/' ? '' : pagePath}`} />
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
      <script
        key="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  )
}

export default PageMeta
