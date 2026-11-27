import Link from 'next/link'
import { m } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { HStack, styled } from 'styled-system/jsx'
import { CloseIcon } from 'components/ui/icons'
import { isLocalizedRoute, localizedPath, pagePathFromLocalePath, useI18n, type Locale } from 'i18n'
import { browserLocale, readLangPref, saveLangPref } from 'i18n/preference'
import { track, umamiAttrs } from 'lib/analytics'

// Written in the suggested language, which the page's own message catalog does not carry.
const COPY: Record<Locale, { lang: string; message: string; action: string; dismiss: string }> = {
  tw: { lang: 'zh-TW', message: '這個頁面有繁體中文版', action: '切換', dismiss: '關閉' },
  ja: { lang: 'ja', message: 'このページは日本語でもご覧いただけます', action: '切り替える', dismiss: '閉じる' },
  en: { lang: 'en', message: 'This page is also available in English', action: 'Switch', dismiss: 'Dismiss' },
}

const Text = styled.p

const LanguageSuggest: React.FC = () => {
  const { locale } = useI18n()
  const pathname = usePathname() ?? '/'
  const pagePath = pagePathFromLocalePath(pathname)
  // Only the landing page of a visit asks; browsing on without answering hides it until the next visit.
  // Keyed on the full pathname so a locale switch to the same page also counts as moving on.
  const [suggestion, setSuggestion] = useState<{ to: Locale; pathname: string } | null>(null)
  const hasChecked = useRef(false)

  useEffect(() => {
    if (hasChecked.current) return
    hasChecked.current = true
    if (!isLocalizedRoute(pagePath) || readLangPref()) return
    const to = browserLocale()
    if (to === locale) return
    setSuggestion({ to, pathname })
    track('language-suggest-show', { from: locale, to })
  }, [locale, pagePath, pathname])

  if (!suggestion || suggestion.pathname !== pathname) return null

  const { to } = suggestion
  const copy = COPY[to]

  const dismiss = () => {
    saveLangPref(locale)
    track('language-suggest-dismiss', { from: locale, to })
    setSuggestion(null)
  }

  return (
    <m.div
      role="region"
      aria-label={copy.message}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        zIndex: 25,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <HStack
        lang={copy.lang}
        gap={3}
        maxW="100%"
        pl={4}
        pr={2}
        py={2}
        bg="rgba(31,31,34,.96)"
        color="white"
        border="1px solid rgba(255,255,255,.14)"
        borderRadius="10px"
        boxShadow="0 12px 30px rgba(0,0,0,.3)"
        fontSize="14px"
        pointerEvents="auto"
      >
        <Text m={0} lineHeight="1.4">
          {copy.message}
        </Text>
        <Link
          href={localizedPath(pagePath, to)}
          onClick={() => {
            saveLangPref(to)
            setSuggestion(null)
          }}
          {...umamiAttrs('language-suggest-accept', { from: locale, to })}
          style={{
            flexShrink: 0,
            padding: '.35rem .75rem',
            borderRadius: '6px',
            background: 'white',
            color: 'black',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {copy.action}
        </Link>
        <styled.button
          type="button"
          aria-label={copy.dismiss}
          onClick={dismiss}
          display="inline-flex"
          flexShrink={0}
          p={1}
          bg="transparent"
          border="0"
          color="white"
          opacity={0.6}
          cursor="pointer"
          _hover={{ opacity: 1 }}
        >
          <CloseIcon width={16} height={16} aria-hidden />
        </styled.button>
      </HStack>
    </m.div>
  )
}

export default LanguageSuggest
