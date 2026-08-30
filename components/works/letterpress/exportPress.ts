import { filtersMarkup, letterpressCss, type LetterpressOptions } from 'kappan'

/**
 * 把試打區的排版結果匯出成去背的 SVG 或 PNG。
 *
 * 做法是把編輯區的 HTML 包進 <foreignObject>，跟濾鏡定義與樣式一起塞進同一份 SVG。
 * 檔案必須完全自足 —— 瀏覽器把 SVG 當圖片畫的時候不會去抓任何外部資源，
 * 所以字體要 base64 內嵌。emfont 只切了實際用到的字，通常一兩 KB，內嵌得起。
 *
 * 去背：不畫紙，也不畫紙紋那幾層，只留字。
 */

const toBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export interface ExportInput {
  /** 編輯區本體。會照它目前的樣子輸出，包含字級 span 與逐字歪斜。 */
  node: HTMLElement
  options: LetterpressOptions
  /** emfont 切出來的子集，跟畫面上用的是同一份。 */
  font?: { family: string; buffer: ArrayBuffer }
  scale?: number
}

const buildSvg = ({ node, options, font }: ExportInput) => {
  // 匯出的檔案不能引用任何外部資源，所以直排標點那份 @font-face 要拿掉 ——
  // 它指的是站上的相對路徑，在別人的機器上開只會 404，畫進 canvas 還會污染畫布。
  const selfContained: LetterpressOptions = { ...options, punctFont: null }
  // 捲出去的部分也要，不然使用者拉小輸入框就等於裁掉自己的字。
  const rect = node.getBoundingClientRect()
  const width = Math.ceil(Math.max(rect.width, node.scrollWidth))
  const height = Math.ceil(Math.max(rect.height, node.scrollHeight))
  const style = getComputedStyle(node)

  const fontFace = font
    ? `@font-face { font-family: '${font.family}'; src: url(data:font/woff2;base64,${toBase64(font.buffer)}) format('woff2'); }`
    : ''

  // 複製一份。邊框只是藏起來不是拿掉 —— border-box 之下抽掉邊框會讓可用行寬變動，
  // 換行位置就跟畫面不一樣了。內距同理保留，反正背景是透明的，看不見。
  const clone = node.cloneNode(true) as HTMLElement
  clone.removeAttribute('contenteditable')
  clone.style.borderColor = 'transparent'
  clone.style.width = `${width}px`
  clone.style.height = `${height}px`
  clone.style.resize = 'none'
  clone.style.overflow = 'visible'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>${filtersMarkup(selfContained.idPrefix ?? 'lp')}</defs>
<style>
${escapeXml(fontFace)}
${escapeXml(letterpressCss(selfContained))}
/* 去背：紙與紙紋都不畫，.lp 的底色也要拿掉。 */
.lp { background: none; }
</style>
<foreignObject x="0" y="0" width="${width}" height="${height}">
<div xmlns="http://www.w3.org/1999/xhtml" class="lp" style="font-family:${style.fontFamily};font-size:${style.fontSize};line-height:${style.lineHeight};background:none">
${new XMLSerializer().serializeToString(clone)}
</div>
</foreignObject>
</svg>`
  return { svg, width, height }
}

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  // 不要在同一個 tick 就 revoke —— Firefox 是非同步取用這個 URL 的，
  // 太早釋放會拿到空檔或直接中斷下載。
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export const exportSvg = (input: ExportInput) => {
  download(new Blob([buildSvg(input).svg], { type: 'image/svg+xml' }), 'kappan.svg')
}

export const exportPng = async (input: ExportInput) => {
  const scale = input.scale ?? 2
  // 尺寸要跟 SVG 的 viewBox 一致，不能再量一次元素 —— 那會漏掉捲出去的部分。
  const { svg, width, height } = buildSvg(input)

  // 一定要用 data: URL。blob: 的 SVG 在 Chrome 裡是不透明來源，畫進 canvas
  // 之後 toBlob 會直接丟 SecurityError（Tainted canvases may not be exported）。
  const image = new Image()
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('SVG 轉點陣失敗'))
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })

  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('拿不到 canvas context')
  ctx.scale(scale, scale)
  ctx.drawImage(image, 0, 0)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (blob) download(blob, 'kappan.png')
}
