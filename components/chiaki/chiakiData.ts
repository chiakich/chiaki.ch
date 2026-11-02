export const INK = '#1b2430'
export const NAVY = '#22305a'
export const CREAM = '#fff8ef'
export const ORANGE = '#df8a42'
export const ORANGE_TEXT = '#a94f0f'
export const RUST = '#a5541c'

export type Tier = 'native' | 'fluent' | 'learning'

// Demo order doubles as the radio's station order
export const LANGS: { code: string; native: string; song: string; tag: string; tier: Tier }[] = [
  { code: 'JA', native: '日本語', song: 'さくらさくら', tag: 'ja', tier: 'native' },
  { code: 'ZH', native: '中文', song: '茉莉花', tag: 'zh-Hant', tier: 'native' },
  { code: 'EN', native: 'English', song: 'Scarborough Fair', tag: 'en', tier: 'native' },
  { code: 'KO', native: '한국어', song: '아리랑', tag: 'ko', tier: 'fluent' },
  { code: 'FR', native: 'Français', song: 'Au clair de la lune', tag: 'fr', tier: 'fluent' },
  { code: 'ES', native: 'Español', song: 'La cucaracha', tag: 'es', tier: 'fluent' },
  { code: 'IT', native: 'Italiano', song: 'Fra Martino', tag: 'it', tier: 'fluent' },
  { code: 'PT', native: 'Português', song: 'Noite Feliz', tag: 'pt', tier: 'fluent' },
  { code: 'DE', native: 'Deutsch', song: 'Hänschen klein', tag: 'de', tier: 'fluent' },
  { code: 'RU', native: 'Русский', song: 'Во поле берёза', tag: 'ru', tier: 'fluent' },
  { code: 'PL', native: 'Polski', song: 'Wlazł kotek na płotek', tag: 'pl', tier: 'fluent' },
  { code: 'UK', native: 'Українська', song: 'Щедрик', tag: 'uk', tier: 'fluent' },
  { code: 'TH', native: 'ไทย', song: 'จันทร์เจ้าขา', tag: 'th', tier: 'fluent' },
  { code: 'FI', native: 'Suomi', song: 'Ukko Nooa', tag: 'fi', tier: 'learning' },
  { code: 'LA', native: 'Latina', song: 'Gaudeamus igitur', tag: 'la', tier: 'learning' },
  { code: 'BE', native: 'Беларуская', song: 'Купалінка', tag: 'be', tier: 'learning' },
  { code: 'BG', native: 'Български', song: 'Хубава си, моя горо', tag: 'bg', tier: 'learning' },
  { code: 'MK', native: 'Македонски', song: 'Јовано, Јованке', tag: 'mk', tier: 'learning' },
  { code: 'HBS', native: 'Srpskohrvatski', song: 'Ajde Jano', tag: 'sh', tier: 'learning' },
  { code: 'LO', native: 'ລາວ', song: 'ດອກຈຳປາຫອມ', tag: 'lo', tier: 'learning' },
  { code: 'CA', native: 'Català', song: 'El cant dels ocells', tag: 'ca', tier: 'learning' },
  { code: 'GL', native: 'Galego', song: 'Negra sombra', tag: 'gl', tier: 'learning' },
  { code: 'ID', native: 'Bahasa Indonesia', song: 'Burung Kakatua', tag: 'id', tier: 'learning' },
  { code: 'MS', native: 'Bahasa Melayu', song: 'Rasa Sayang', tag: 'ms', tier: 'learning' },
  { code: 'EO', native: 'Esperanto', song: 'Brilu, brilu', tag: 'eo', tier: 'learning' },
  { code: 'SW', native: 'Kiswahili', song: 'Lala mtoto', tag: 'sw', tier: 'learning' },
  { code: 'HAW', native: 'ʻŌlelo Hawaiʻi', song: 'Aloha ʻOe', tag: 'haw', tier: 'learning' },
  { code: 'MI', native: 'Te Reo Māori', song: 'Pōkarekare Ana', tag: 'mi', tier: 'learning' },
]

// The spec section lists the mother tongues in the order she'd introduce them
export const NATIVE_ORDER = ['JA', 'EN', 'ZH']

export const PARAMS = ['TENC', 'GENC', 'VELC', 'PEXP', 'BREC']

export type TermStatus = 'ok' | 'ask' | 'no'
export const TERM_STATUSES: TermStatus[] = ['ok', 'ok', 'ok', 'ask', 'ask', 'no', 'no', 'no']

export const TERM_COLORS: Record<TermStatus, { color: string; bg: string; mark: string }> = {
  ok: { color: '#2f7d4f', bg: 'rgba(47,125,79,.12)', mark: '✓' },
  ask: { color: RUST, bg: 'rgba(223,138,66,.16)', mark: '!' },
  no: { color: '#a8322b', bg: 'rgba(168,50,43,.10)', mark: '✕' },
}

export const LOOKS: { id: string; src: string; bg: string }[] = [
  { id: 'default', src: '/assets/story/character/concept-art/default.webp', bg: '#fbe9d7' },
  { id: 'newOutfit', src: '/assets/story/character/concept-art/new-outfit.webp', bg: '#ffffff' },
  { id: 'birthday', src: '/assets/story/character/concept-art/birthday-outfit.webp', bg: '#f6e1dc' },
]
