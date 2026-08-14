import Head from 'next/head'
import { useEffect } from 'react'
import { makeStaticProps } from 'i18n/messages'
import { localizedPath, useI18n } from 'i18n'

const LegacyZipcodeRedirect = () => {
  const { locale } = useI18n()
  const destination = localizedPath('/works/tw-address-tools', locale)

  useEffect(() => {
    window.location.replace(destination)
  }, [destination])

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0; url=${destination}`} />
        <meta name="robots" content="noindex" />
      </Head>
      <p><a href={destination}>Continue to tw-address-tools</a></p>
    </>
  )
}

export default LegacyZipcodeRedirect

export const getStaticProps = makeStaticProps('works/tw-fuzzy-zipcode')
