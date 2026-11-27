import type { Locale } from 'i18n'

const STORAGE_KEY = 'lang-pref'

// Storage can throw (Safari private mode, blocked site data); a lost preference only means the suggestion shows again.
export const readLangPref = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export const saveLangPref = (locale: Locale) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {}
}

// Chinese of any script reads the TW site better than the English one; anything unsupported falls back to English.
export const browserLocale = (): Locale => {
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of tags) {
    const lang = tag.toLowerCase()
    if (lang.startsWith('zh')) return 'tw'
    if (lang.startsWith('ja')) return 'ja'
    if (lang.startsWith('en')) return 'en'
  }
  return 'en'
}
