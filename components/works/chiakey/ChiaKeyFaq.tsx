import { type ReactNode, useState } from 'react'
import Head from 'next/head'
import { Box, Stack, styled } from 'styled-system/jsx'
import MotionSection from 'components/portfolio/MotionSection'
import SectionHeading from 'components/portfolio/SectionHeading'
import { Trans, useI18n } from 'i18n'

const Button = styled.button
const Heading = styled.h3
const Text = styled.p
const Span = styled.span
const Link = styled.a

// Controlled accordion instead of <details>: the grid-rows 0fr→1fr trick
// animates height both ways while keeping the answer in the DOM for SEO.
const FaqItem = ({ q, a }: { q: string; a: ReactNode }) => {
  const [open, setOpen] = useState(false)

  return (
    <Box backgroundColor="#150d20" borderRadius="18px">
      <Button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={4}
        cursor="pointer"
        textAlign="left"
        px={{ base: 5, md: 7 }}
        py={5}
      >
        <Heading fontSize="md" letterSpacing="-.01em">
          {q}
        </Heading>
        <Span
          color="#c77dff"
          fontFamily="mono"
          fontSize="xl"
          lineHeight="1"
          flexShrink={0}
          transition="transform .25s"
          style={{ transform: open ? 'rotate(45deg)' : 'none' }}
          aria-hidden
        >
          +
        </Span>
      </Button>
      <Box
        display="grid"
        transition="grid-template-rows .3s ease"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <Box overflow="hidden" minHeight={0}>
          <Text
            px={{ base: 5, md: 7 }}
            pb={6}
            fontSize="sm"
            lineHeight="1.9"
            opacity={0.7}
          >
            {a}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

const ChiaKeyFaq = () => {
  const { t } = useI18n()
  const linkProps = {
    target: '_blank',
    rel: 'noopener noreferrer',
    color: '#d49bff',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    _hover: { color: '#f1d8ff' },
  }
  const items = [0, 1, 2, 3, 4, 5, 6, 7].map((index) => ({
    q: t(`chiakeyPage.faq.items.${index}.q`),
    answerKey: `chiakeyPage.faq.items.${index}.a`,
    a: index === 6 ? (
      <Trans
        i18nKey="chiakeyPage.faq.items.6.a"
        components={{
          koFi: <Link href="https://ko-fi.com/A0A21UAIV9" {...linkProps} />,
          ecpay: <Link href="https://p.ecpay.com.tw/2A3B186" {...linkProps} />,
        }}
      />
    ) : index === 7 ? (
      <Trans
        i18nKey="chiakeyPage.faq.items.7.a"
        components={{
          report: <Link href="https://github.com/chiakich/ChiaKey-Lexicon/issues/new/choose" {...linkProps} />,
        }}
      />
    ) : t(`chiakeyPage.faq.items.${index}.a`),
  }))

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, answerKey }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(answerKey).replace(/<\/?[a-zA-Z][\w-]*>/g, ''),
      },
    })),
  }

  return (
    <MotionSection>
      <Head>
        <script
          key="chiakey-faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <SectionHeading en={t('chiakeyPage.faq.english')} accent="#c77dff">
        {t('chiakeyPage.faq.title')}
      </SectionHeading>
      <Stack gap={3}>
        {items.map(({ q, a }) => (
          <FaqItem key={q} q={q} a={a} />
        ))}
      </Stack>
    </MotionSection>
  )
}

export default ChiaKeyFaq
