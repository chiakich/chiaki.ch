export const PORTRAIT_SRC = '/assets/works/voicebank/portrait.webp'

// Release files are not hosted yet; a null URL renders the button as "coming soon".
export const DOWNLOADS: Record<'appWindows' | 'appMac' | 'zip' | 'extraChiaki' | 'extraOfficial' | 'finnish' | 'latin', string | null> = {
  appWindows: null,
  appMac: null,
  zip: null,
  extraChiaki: null,
  extraOfficial: null,
  finnish: null,
  latin: null,
}

export const IMPROVE_EMAIL = 'voice@chiaki.ch'

export const demoSrc = (code: string) => `/assets/works/voicebank/demos/${code.toLowerCase()}.m4a`

export const RENDER_STEPS: [string, number][] = [
  ['ACOUSTIC STEPS', 40],
  ['VARIANCE STEPS', 40],
  ['PITCH STEPS', 10],
]

type Translate = (key: string) => string

// i18n only resolves leaf strings, so walk an array until the first missing index
export const listOf = (t: Translate, prefix: string, leaf = '') => {
  const out: string[] = []
  for (let i = 0; ; i++) {
    const key = `${prefix}.${i}${leaf}`
    const value = t(key)
    if (value === key) return out
    out.push(value)
  }
}
