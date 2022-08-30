import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
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
        <Main />
        <NextScript />
      </Html>
    )
  }
}

export default MyDocument
