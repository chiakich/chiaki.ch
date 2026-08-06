import { cloneElement, createContext, useCallback, useContext, useEffect, useMemo } from 'react'

export const locales = ['tw', 'ja', 'en'] as const
export type Locale = (typeof locales)[number]

export type TranslationValue = string | TranslationTree | TranslationValue[]

export interface TranslationTree {
  [key: string]: TranslationValue
}

// Only the namespaces this page needs, in this locale, handed over by
// getStaticProps — see i18n/messages.ts. Nothing here imports locales/*.json,
// which is what keeps the catalogs out of the client bundle.
type LocaleContextValue = { locale: Locale; messages: TranslationTree }

const LocaleContext = createContext<LocaleContextValue>({ locale: 'tw', messages: {} })

export const LocaleProvider = ({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages?: TranslationTree
  children: React.ReactNode
}) => {
  useEffect(() => {
    document.documentElement.lang =
      locale === 'tw' ? 'zh-TW' : locale === 'ja' ? 'ja' : 'en'
  }, [locale])

  const value = useMemo(() => ({ locale, messages: messages ?? {} }), [locale, messages])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

const getValue = (tree: TranslationTree, key: string): string | undefined => {
  const value = key.split('.').reduce<TranslationValue | undefined>((node, part) => {
    if (typeof node === 'string') return undefined
    if (Array.isArray(node)) return node[Number(part)]
    return node?.[part]
  }, tree)

  return typeof value === 'string' ? value : undefined
}

export const useI18n = () => {
  const { locale, messages } = useContext(LocaleContext)
  // The per-key fallback to the tw catalog now happens at build time in
  // i18n/messages.ts, so a miss here means the namespace wasn't requested for
  // this route (see PAGE_NAMESPACES) and the raw key is the useful signal.
  const t = useCallback((key: string) => getValue(messages, key) ?? key, [messages])

  return { locale, t }
}

// A small subset of react-i18next's Trans API. Translation strings can wrap
// link text in named tags, allowing each locale to choose its own word order.
export const Trans = ({
  i18nKey,
  components = {},
}: {
  i18nKey: string
  components?: Record<string, React.ReactElement>
}) => {
  const { t } = useI18n()
  const parts = t(i18nKey).split(/(<[a-zA-Z][\w-]*>[\s\S]*?<\/[a-zA-Z][\w-]*>)/g)

  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^<([a-zA-Z][\w-]*)>([\s\S]*)<\/\1>$/)
        if (!match) return part

        const component = components[match[1]]
        return component ? cloneElement(component, { key: index }, match[2]) : match[2]
      })}
    </>
  )
}

export const localizedPath = (path: string, locale: Locale) =>
  locale === 'tw' ? path : `/${locale}${path === '/' ? '' : path}`

export const pagePathFromLocalePath = (path: string) => {
  const segments = path.split('/').filter(Boolean)
  return locales.includes(segments[0] as Locale)
    ? `/${segments.slice(1).join('/')}` || '/'
    : path
}

// Must mirror the `routes` keys in pages/[locale]/[[...slug]].tsx —
// only these paths actually exist under /ja and /en.
const LOCALIZED_ROUTES = new Set([
  '',
  'profile',
  'story',
  'story/character',
  'story/character/art',
  'works',
  'works/chiakey',
  'works/kumiko',
  'works/tg-jpg',
  'works/split-flap',
  'works/tokyono-sora',
  'fonts',
  'fonts/akitra',
  'fonts/huninn',
  'fonts/nixie',
  'blog',
])

export const isLocalizedRoute = (pagePath: string) =>
  LOCALIZED_ROUTES.has(pagePath.replace(/^\//, ''))

// Pages like individual blog posts (/blog/<slug>) have no /ja or /en variant.
// Walk up to the nearest ancestor segment that does, e.g. /blog/<slug> -> /blog.
export const closestLocalizedRoute = (pagePath: string) => {
  const segments = pagePath.replace(/^\//, '').split('/')
  while (segments.length > 0) {
    if (LOCALIZED_ROUTES.has(segments.join('/'))) return `/${segments.join('/')}`
    segments.pop()
  }
  return '/'
}
