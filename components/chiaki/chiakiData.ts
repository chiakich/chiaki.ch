export const INK = '#161c26'
export const STEEL = '#4f5c6a'
export const SNOW = '#eef2f5'
export const PALE = '#e1e6eb'
export const PAPER = '#f7f9fa'
export const NIGHT = '#10151d'
export const MIST = '#b3bfcb'
export const LINE = 'rgba(22,28,38,.3)'
export const LINE_LIGHT = 'rgba(238,242,245,.3)'
export const ORANGE = '#df8a42'
// #df8a42 fails contrast as text on the snow ground
export const ORANGE_TEXT = '#9a4609'
export const TITLE_ORANGE = '#a94f0f'

export const JOST = "'Jost', var(--cjk), sans-serif"

// Seeded so server and client render identical flakes
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const flakes = (seed: number, count: number, width: number, height: number, radius: [number, number], alpha: [number, number]) => {
  const rand = seeded(seed)
  const pad = radius[1] + 1
  return Array.from({ length: count }, () => {
    const x = pad + rand() * (width - pad * 2)
    const y = pad + rand() * (height - pad * 2)
    const r = radius[0] + rand() * (radius[1] - radius[0])
    const a = alpha[0] + rand() * (alpha[1] - alpha[0])
    return `radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(255,255,255,${a.toFixed(2)}) ${r.toFixed(1)}px, transparent ${(r + 0.7).toFixed(1)}px)`
  }).join(', ')
}

// Large tiles with scattered flakes so the repeat doesn't read as a grid; height doubles as fall distance
export const SNOW_LAYERS = [
  { width: 560, height: 700, image: flakes(7, 22, 560, 700, [1.5, 2.4], [0.75, 0.95]), seconds: 18, sway: 14 },
  { width: 430, height: 540, image: flakes(23, 34, 430, 540, [0.9, 1.5], [0.5, 0.8]), seconds: 24, sway: 9 },
  { width: 310, height: 380, image: flakes(61, 44, 310, 380, [0.5, 1], [0.3, 0.55]), seconds: 32, sway: 5 },
]

// One continuous sky split across two sections: day to golden hour behind the terms, sunset to night in the song
// The sunset runs the whole height of the terms, starting at their title; the text panel carries its own translucent ground, so the song section only has to finish the fall into night
export const DUSK_TERMS = 'linear-gradient(180deg, transparent 0%, transparent 6%, #e6edf4 16%, #e0e6ec 28%, #ece0d0 42%, #f2d3b2 55%, #f3c79c 66%, #eea56f 78%, #da8469 88%, #b56b7b 95%, #825c88 100%)'
export const DUSK_SONG = 'linear-gradient(180deg, #825c88 0%, #524a7a 28%, #2e2f5a 56%, #1a1f38 80%, #10151d 100%)'

export const STARS ={ width: 900, height: 360, image: flakes(97, 70, 900, 360, [0.5, 1.3], [0.3, 0.85]) }

export const RUINS_FAR = 'M0 360V250h40v-60h26v-40h18v100h30v-70l22-14v84h40V170h12l10-30 10 30h14v190zM300 360V230l40-20v-30h24v170zM420 360V150h22l6-40 8 40h20v40l30 10v160zM600 360V240h60v-50l14-8 16 20v158zM760 360V180l26-30 24 18v40h40v152zM930 360V120h8v-30h6v30h8v40h30v200zM1060 360V220h36l18-40h22v70l40 10v100zM1180 360V200h60v160z'
export const RUINS_NEAR = 'M0 360V300h120v-30h80v90zM240 360v-50l70-20 60 10v60zM470 360v-70h90l20 30h60v40zM700 360v-40l80-30 90 20v50zM900 360v-60h140v60zM1080 360v-40l80-10 80 10v40z'

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

// The mother tongues are listed in the order she'd introduce them
export const NATIVE_ORDER = ['JA', 'EN', 'ZH']

export const TIERS: { tier: Tier; en: string; level: number }[] = [
  { tier: 'native', en: 'NATIVE', level: 3 },
  { tier: 'fluent', en: 'INTERMEDIATE', level: 2 },
  { tier: 'learning', en: 'LEARNING', level: 1 },
]

export const langsOf = (tier: Tier) =>
  tier === 'native'
    ? NATIVE_ORDER.map((code) => LANGS.find((lang) => lang.code === code)!)
    : LANGS.filter((lang) => lang.tier === tier)

export const PARAMS = ['TENC', 'GENC', 'VELC', 'PEXP', 'BREC']

export type TermStatus = 'ok' | 'ask' | 'no'
export const TERM_STATUSES: TermStatus[] = ['ok', 'ok', 'ok', 'ok', 'ask', 'no', 'no', 'no']

export const TERM_COLORS: Record<TermStatus, { color: string; bg: string; mark: string }> = {
  ok: { color: '#256b43', bg: 'rgba(37,107,67,.12)', mark: '✓' },
  ask: { color: '#8f4a12', bg: 'rgba(223,138,66,.2)', mark: '!' },
  no: { color: '#a02a24', bg: 'rgba(160,42,36,.1)', mark: '✕' },
}

export const LOOKS: { id: string; src: string; bg: string }[] = [
  { id: 'default', src: '/assets/story/character/concept-art/default.webp', bg: '#fbe9d7' },
  { id: 'birthday', src: '/assets/story/character/concept-art/birthday-outfit.webp', bg: '#f6e1dc' },
]

// The anchor the language list jumps to; the player listens for the pick
export const PICK_EVENT = 'chiaki:pick-language'

// Each player announces itself on play so the others on the page pause
export const PLAY_EVENT = 'chiaki:play'
