import Head from 'next/head'
import { useEffect } from 'react'
import { makeStaticProps } from 'i18n/messages'
import { localizedPath, useI18n } from 'i18n'

// Chiaki is the only character; Cloudflare 301s this path, this page is the static fallback.
const LegacyCharacterRedirect = () => {
  const { locale } = useI18n()
  const destination = localizedPath('/character/chiaki', locale)

  useEffect(() => {
    window.location.replace(destination)
  }, [destination])

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0; url=${destination}`} />
        <meta name="robots" content="noindex" />
      </Head>
      <p><a href={destination}>Continue to Chiaki</a></p>
    </>
  )
}

export default LegacyCharacterRedirect

export const getStaticProps = makeStaticProps('character')
