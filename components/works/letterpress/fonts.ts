/**
 * 試打區的字體由 emfont（font.emtech.cc）供應 —— 開源字體的動態子集服務，Apache-2.0。
 *
 * 關鍵是它支援按實際文字切字：POST /g/:font 帶 words，回來的 woff2 只含那幾個字。
 * 五個字大約 1.5 KB，所以「換一套字體」的成本幾乎是零，也才有辦法一次開放 155 套。
 * 自己預先切一份通包子集要 1 MB 起跳，那是完全不同的量級。
 *
 * 檔案的 CORS 是全開的，所以匯出 SVG／PNG 時可以把同一份子集抓下來內嵌。
 */

const BASE = 'https://font.emtech.cc'

export interface EmFont {
  id: string
  name: string
  category?: string
  weight?: number[]
  author?: string
}

/**
 * emfont 的字體清單。
 *
 * 清單裡有幾套的 weight 是空陣列（撰稿時是全字庫明體與全字庫楷體），那些在
 * /g 端點上一律回 500 —— 沒有字重等於沒佈署好。過濾掉，不要讓使用者選到會壞的。
 */
export const fetchFaces = async (): Promise<EmFont[]> => {
  const response = await fetch(`${BASE}/list`)
  if (!response.ok) throw new Error(`emfont /list ${response.status}`)
  const data = await response.json()
  const items: EmFont[] = Array.isArray(data) ? data : (data.fonts ?? data.data ?? [])
  return items
    .filter((item) => (item.weight?.length ?? 0) > 0)
    .map((item) => ({ ...item, name: typeof item.name === 'string' ? item.name : item.id }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
}

/** 挑一個這套字有的字重，優先 400。使用者沒指定時的預設。 */
export const pickWeight = (face: EmFont) => {
  const weights = face.weight ?? []
  if (!weights.length) return 400
  return weights.includes(400) ? 400 : weights[Math.floor(weights.length / 2)]
}

export interface LoadedFace {
  family: string
  /** 實際下載的位元組數。要讓使用者看到成本，就得是真的數字。 */
  bytes: number
  /** 匯出時要內嵌的同一份子集。 */
  buffer: ArrayBuffer
}

const cache = new Map<string, LoadedFace>()

/**
 * 依實際文字切一份子集載進來。回傳的 buffer 留著給匯出用，
 * 不然匯出時要再抓一次同樣的東西。
 */
export const loadFaceForText = async (
  face: EmFont,
  text: string,
  weight = pickWeight(face)
): Promise<LoadedFace> => {
  const words = [...new Set(text)].join('')
  const key = `${face.id}|${weight}|${words}`
  const hit = cache.get(key)
  if (hit) return hit

  const response = await fetch(`${BASE}/g/${face.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words, weight, min: true, format: 'woff2' }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.status !== 'success') {
    throw new Error(`emfont /g ${face.id}: ${payload?.message ?? response.status}`)
  }
  const url: string | undefined = payload?.location?.[0]
  if (!url) throw new Error(`emfont /g ${face.id}: 沒有回傳字體檔`)

  const file = await fetch(url)
  if (!file.ok) throw new Error(`emfont woff2 ${file.status}`)
  const buffer = await file.arrayBuffer()

  // family 帶上字重，不同字重要各自是一個 family —— 同名不同檔會互相蓋掉。
  const family = `emfont-${face.id}-${weight}`
  const fontFace = new FontFace(family, buffer)
  await fontFace.load()
  document.fonts.add(fontFace)

  const loaded: LoadedFace = { family, bytes: buffer.byteLength, buffer }
  cache.set(key, loaded)
  return loaded
}
