import { createContext, useCallback, useContext, useEffect } from 'react'
import tw from 'locales/tw.json'
import ja from 'locales/ja.json'
import en from 'locales/en.json'

export const locales = ['tw', 'ja', 'en'] as const
export type Locale = (typeof locales)[number]

interface TranslationTree {
  [key: string]: string | string[] | TranslationTree
}

const resources: Record<Locale, TranslationTree> = { tw, ja, en }

const LocaleContext = createContext<Locale>('tw')

export const LocaleProvider = ({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) => {
  useEffect(() => {
    document.documentElement.lang =
      locale === 'tw' ? 'zh-TW' : locale === 'ja' ? 'ja' : 'en'
  }, [locale])

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

const getValue = (tree: TranslationTree, key: string): string | undefined => {
  const value = key.split('.').reduce<string | string[] | TranslationTree | undefined>((node, part) => {
    if (typeof node === 'string') return undefined
    if (Array.isArray(node)) return node[Number(part)]
    return node?.[part]
  }, tree)

  return typeof value === 'string' ? value : undefined
}

export const useI18n = () => {
  const locale = useContext(LocaleContext)
  const t = useCallback(
    (key: string) =>
      getValue(resources[locale], key) ?? getValue(resources.tw, key) ?? key,
    [locale]
  )

  return { locale, t }
}

export const localizedPath = (path: string, locale: Locale) =>
  locale === 'tw' ? path : `/${locale}${path === '/' ? '' : path}`

export const pagePathFromLocalePath = (path: string) => {
  const segments = path.split('/').filter(Boolean)
  return locales.includes(segments[0] as Locale)
    ? `/${segments.slice(1).join('/')}` || '/'
    : path
}
