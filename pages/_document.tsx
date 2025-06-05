import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-TW">
        <Head>
          {/* Basic meta tags */}
          <meta charSet="utf-8" />
          <meta name="description" content="千秋的個人網站與作品展示" />
          <meta name="keywords" content="千秋,稻荷社,Chiaki,個人網站,作品集" />
          <meta name="author" content="千秋" />
          <meta name="robots" content="index, follow" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://chiaki.ch/" />
          <meta property="og:title" content="千秋稻荷社 - Chiaki Inari Shrine" />
          <meta property="og:description" content="千秋的個人網站與作品展示" />
          <meta property="og:image" content="https://chiaki.ch/thumbnail.jpeg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="千秋稻荷社" />
          <meta property="og:locale" content="zh_TW" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://chiaki.ch/" />
          <meta
            property="twitter:title"
            content="千秋稻荷社 - Chiaki Inari Shrine"
          />
          <meta property="twitter:description" content="千秋的個人網站與作品展示" />
          <meta
            property="twitter:image"
            content="https://chiaki.ch/thumbnail.jpeg"
          />

          {/* Additional SEO meta tags */}
          <meta name="format-detection" content="telephone=no" />
          <meta name="application-name" content="千秋稻荷社" />
          <meta name="apple-mobile-web-app-title" content="千秋稻荷社" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />

          <link rel="preconnect" href="https://s3-ap-northeast-1.amazonaws.com" />
          <script
            src="//s3-ap-northeast-1.amazonaws.com/justfont-user-script/jf-64294.js"
            async
          />
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#a25c01" />
          <meta name="msapplication-TileColor" content="#a25c01" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
