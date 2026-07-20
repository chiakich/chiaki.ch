import Document, { Html, Head, Main, NextScript, type DocumentContext } from 'next/document'

type DocumentProps = { lang: string }

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    const locale = typeof ctx.query.locale === 'string' ? ctx.query.locale : 'tw'
    const lang = locale === 'ja' ? 'ja' : locale === 'en' ? 'en' : 'zh-TW'

    return { ...initialProps, lang }
  }

  render() {
    const { lang } = this.props as typeof this.props & DocumentProps
    return (
      <Html lang={lang}>
        <Head>
          <meta charSet="utf-8" />
          <meta name="keywords" content="千秋,稻荷社,Chiaki,個人網站,作品集" />
          <meta name="author" content="千秋" />
          <meta name="robots" content="index, follow" />

          <meta name="format-detection" content="telephone=no" />
          <meta name="application-name" content="千秋稻荷社" />
          <meta name="apple-mobile-web-app-title" content="千秋稻荷社" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />

          <link rel="preconnect" href="https://s3-ap-northeast-1.amazonaws.com" />
          <script
            src="//s3-ap-northeast-1.amazonaws.com/justfont-user-script/jf-56705.js"
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
