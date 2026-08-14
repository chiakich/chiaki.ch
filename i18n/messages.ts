// BUILD-TIME ONLY. Import this from `getStaticProps` and nowhere else.
//
// It is the only module that touches locales/*.json. Next strips
// `getStaticProps` and its exclusive imports out of the client bundle, so
// keeping the JSON reachable only from here is what stops all three locales
// (~149 KB) from landing in the shared _app chunk on every page.
//
// Client code gets its strings from `pageProps.messages` via LocaleProvider.
import tw from 'locales/tw.json'
import ja from 'locales/ja.json'
import en from 'locales/en.json'
import type { Locale, TranslationTree, TranslationValue } from 'i18n'

const catalogs: Record<Locale, TranslationTree> = {
  tw: tw as TranslationTree,
  ja: ja as TranslationTree,
  en: en as TranslationTree,
}

// Rendered by _app on every page: TopBar (incl. the nav flyout, which shows the
// ChiaKey and Tokyono work titles) and PageMeta.
export const COMMON_NAMESPACES = [
  'accessibility',
  'chiakeyPage',
  'language',
  'meta',
  'nav',
  'tokyonoPage',
]

// Namespaces each route needs on top of COMMON. Derived from the t() / i18nKey
// calls reachable through each page's import graph — if you add a page or start
// using a new namespace in one, add it here or the strings render as raw keys.
export const PAGE_NAMESPACES: Record<string, string[]> = {
  '': ['home'],
  profile: ['profilePage'],
  story: [],
  'story/character': ['characterPage'],
  'story/character/art': ['characterPage'],
  'story/terminal': ['terminalPage'],
  works: ['worksPage'],
  'works/chiakey': [],
  'works/kumiko': ['kumikoPage'],
  'works/tg-jpg': ['tgJpgPage'],
  'works/split-flap': ['splitFlapPage'],
  'works/tw-address-tools': ['zipcodePage'],
  'works/tw-fuzzy-zipcode': [],
  'works/tokyono-sora': [],
  fonts: ['fontsPage'],
  'fonts/akitra': ['akitraPage'],
  'fonts/huninn': ['huninnPage'],
  'fonts/nixie': ['nixiePage'],
  blog: ['blogPage'],
  'blog/[slug]': [],
}

const isTree = (v: TranslationValue | undefined): v is TranslationTree =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

// useI18n used to fall back per key to the tw catalog at runtime, which only
// worked because every locale was in the bundle. Baking that fallback in here
// keeps the behaviour without shipping the extra locales — a key absent from
// ja/en still resolves to its Chinese string.
const mergeWithFallback = (
  base: TranslationValue | undefined,
  override: TranslationValue | undefined
): TranslationValue | undefined => {
  if (override === undefined) return base
  if (base === undefined) return override

  if (Array.isArray(base) && Array.isArray(override)) {
    return Array.from({ length: Math.max(base.length, override.length) }, (_, i) =>
      mergeWithFallback(base[i], override[i])
    ) as TranslationValue[]
  }

  if (isTree(base) && isTree(override)) {
    const out: TranslationTree = {}
    for (const key of new Set([...Object.keys(base), ...Object.keys(override)])) {
      const merged = mergeWithFallback(base[key], override[key])
      if (merged !== undefined) out[key] = merged
    }
    return out
  }

  return override
}

export const getMessages = (locale: Locale, route: string): TranslationTree => {
  const namespaces = [...COMMON_NAMESPACES, ...(PAGE_NAMESPACES[route] ?? [])]
  const catalog = catalogs[locale]
  const messages: TranslationTree = {}

  for (const namespace of namespaces) {
    const merged =
      locale === 'tw'
        ? catalogs.tw[namespace]
        : mergeWithFallback(catalogs.tw[namespace], catalog[namespace])
    if (merged !== undefined) messages[namespace] = merged
  }

  return messages
}

// Sugar for the default-locale pages, which have no other getStaticProps work:
//   export const getStaticProps = makeStaticProps('works/kumiko')
export const makeStaticProps =
  (route: string, locale: Locale = 'tw') =>
  async () => ({ props: { locale, messages: getMessages(locale, route) } })
