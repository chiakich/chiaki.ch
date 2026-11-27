export const PORTRAIT_SRC = '/assets/works/voicebank/portrait.webp'

export const RELEASES = 'https://github.com/chiakich/OpenUtau-chiaki/releases'

// Chiaki.zip is published only here; GitHub Releases carries the app and phonemizers
export const HF_REPO = 'https://huggingface.co/chiakic/chiaki-diffsinger'

export const ZIP_HISTORY = `${HF_REPO}#versions`

// A null URL renders the button as "coming soon".
export const DOWNLOADS: Record<'appWindows' | 'appMac' | 'zip' | 'phonemizers', string | null> = {
  appWindows: `${RELEASES}/latest/download/OpenUtau-Chiaki-win-x64-Setup.exe`,
  appMac: `${RELEASES}/latest/download/OpenUtau-Chiaki-osx-arm64.dmg`,
  zip: `${HF_REPO}/resolve/main/Chiaki.zip?download=true`,
  phonemizers: `${RELEASES}/download/phonemizers-v2/ChiakiPhonemizers.zip`,
}

export const IMPROVE_EMAIL = 'voice@chiaki.ch'

export const demoSrc = (code: string) => `/assets/works/voicebank/demos/${code.toLowerCase()}.m4a`

export const RENDER_STEPS: [string, number][] = [
  ['ACOUSTIC STEPS', 20],
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
