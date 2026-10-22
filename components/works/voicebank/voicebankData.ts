export const VOICEBANK_ACCENT = '#df8a42'
// Deeper than the brand orange so display type still reads on the pale snow ground
export const VOICEBANK_ACCENT_TEXT = '#a94f0f'
export const VOICEBANK_INK = '#1b2430'
export const VOICEBANK_GROUND = '#edf1f4'

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

export type LanguageTier = 'fluent' | 'other'

export const LANGUAGES: { code: string; name: string; tier: LanguageTier }[] = [
  { code: 'EN', name: 'English', tier: 'fluent' },
  { code: 'ZH', name: '中文', tier: 'fluent' },
  { code: 'JA', name: '日本語', tier: 'fluent' },
  { code: 'KO', name: '한국어', tier: 'other' },
  { code: 'FR', name: 'Français', tier: 'other' },
  { code: 'ES', name: 'Español', tier: 'other' },
  { code: 'IT', name: 'Italiano', tier: 'other' },
  { code: 'PT', name: 'Português', tier: 'other' },
  { code: 'DE', name: 'Deutsch', tier: 'other' },
  { code: 'RU', name: 'Русский', tier: 'other' },
  { code: 'PL', name: 'Polski', tier: 'other' },
  { code: 'UK', name: 'Українська', tier: 'other' },
  { code: 'TH', name: 'ไทย', tier: 'other' },
  { code: 'FI', name: 'Suomi', tier: 'other' },
  { code: 'LA', name: 'Latina', tier: 'other' },
  { code: 'BE', name: 'Беларуская', tier: 'other' },
  { code: 'BG', name: 'Български', tier: 'other' },
  { code: 'MK', name: 'Македонски', tier: 'other' },
  { code: 'HBS', name: 'Srpskohrvatski', tier: 'other' },
  { code: 'LO', name: 'ລາວ', tier: 'other' },
  { code: 'CA', name: 'Català', tier: 'other' },
  { code: 'GL', name: 'Galego', tier: 'other' },
  { code: 'ID', name: 'Bahasa Indonesia', tier: 'other' },
  { code: 'MS', name: 'Bahasa Melayu', tier: 'other' },
  { code: 'EO', name: 'Esperanto', tier: 'other' },
  { code: 'SW', name: 'Kiswahili', tier: 'other' },
  { code: 'HAW', name: 'ʻŌlelo Hawaiʻi', tier: 'other' },
  { code: 'MI', name: 'Te Reo Māori', tier: 'other' },
]

// `selfComposed`: no reliable score was found, so only the lyrics are traditional.
export const DEMOS: { code: string; title: string; selfComposed?: boolean }[] = [
  { code: 'JA', title: 'さくらさくら' },
  { code: 'ZH', title: '茉莉花' },
  { code: 'EN', title: 'Scarborough Fair' },
  { code: 'KO', title: '아리랑' },
  { code: 'FR', title: 'Au clair de la lune' },
  { code: 'ES', title: 'La cucaracha' },
  { code: 'IT', title: 'Fra Martino' },
  { code: 'PT', title: 'Noite Feliz' },
  { code: 'DE', title: 'Hänschen klein' },
  { code: 'RU', title: 'Во поле берёза' },
  { code: 'PL', title: 'Wlazł kotek na płotek' },
  { code: 'UK', title: 'Щедрик' },
  { code: 'TH', title: 'จันทร์เจ้าขา', selfComposed: true },
  { code: 'FI', title: 'Ukko Nooa' },
  { code: 'LA', title: 'Gaudeamus igitur' },
  { code: 'BE', title: 'Купалінка', selfComposed: true },
  { code: 'BG', title: 'Хубава си, моя горо', selfComposed: true },
  { code: 'MK', title: 'Јовано, Јованке', selfComposed: true },
  { code: 'HBS', title: 'Ajde Jano', selfComposed: true },
  { code: 'LO', title: 'ດອກຈຳປາຫອມ', selfComposed: true },
  { code: 'CA', title: 'El cant dels ocells', selfComposed: true },
  { code: 'GL', title: 'Negra sombra', selfComposed: true },
  { code: 'ID', title: 'Burung Kakatua' },
  { code: 'MS', title: 'Rasa Sayang' },
  { code: 'EO', title: 'Brilu, brilu' },
  { code: 'SW', title: 'Lala mtoto', selfComposed: true },
  { code: 'HAW', title: 'Aloha ʻOe', selfComposed: true },
  { code: 'MI', title: 'Pōkarekare Ana' },
]

export const demoSrc = (code: string) => `/assets/works/voicebank/demos/${code.toLowerCase()}.m4a`

export const RENDER_STEPS: [string, number][] = [
  ['ACOUSTIC STEPS', 40],
  ['VARIANCE STEPS', 40],
  ['PITCH STEPS', 10],
]
