// Kept apart from chiakiData so the site-wide PageMeta can list the languages without pulling in the page's art data
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
