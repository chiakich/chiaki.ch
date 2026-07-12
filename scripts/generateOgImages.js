const { createReadStream, existsSync, mkdirSync, mkdtempSync, writeFileSync } = require('node:fs')
const { stat } = require('node:fs/promises')
const { createServer } = require('node:http')
const { join, normalize, resolve } = require('node:path')
const { spawn } = require('node:child_process')
const { tmpdir } = require('node:os')

const outputDir = resolve(process.cwd(), 'out')
const imageDir = resolve(process.cwd(), 'public', 'og')
const exportedImageDir = join(outputDir, 'og')
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const sitePort = 4173
const debugPort = 9222

const pages = [
  ['/', 'home'], ['/about', 'about'], ['/links', 'links'], ['/story', 'story'],
  ['/story/character', 'story-character'], ['/story/character/art', 'story-character-art'],
  ['/works', 'works'], ['/works/chiakey', 'works-chiakey'], ['/works/kumiko', 'works-kumiko'],
  ['/works/tg-jpg', 'works-tg-jpg'], ['/works/tokyono-sora', 'works-tokyono-sora'],
  ['/fonts', 'fonts'], ['/fonts/akitra', 'fonts-akitra'], ['/fonts/nixie', 'fonts-nixie'],
  ['/fonts/huninn', 'fonts-huninn'],
]

if (!existsSync(outputDir)) throw new Error('找不到 out 目錄。請先執行 next build。')
if (!existsSync(chromePath)) throw new Error(`找不到 Chrome：${chromePath}`)

const delay = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds))

const resolveFile = (requestPath) => {
  const pathname = decodeURIComponent(requestPath.split('?')[0])
  const relativePath = pathname === '/' ? 'index.html' : `${pathname.replace(/^\//, '')}${pathname.includes('.') ? '' : '.html'}`
  const filePath = normalize(join(outputDir, relativePath))
  return filePath.startsWith(`${outputDir}/`) ? filePath : null
}

const siteServer = createServer(async (request, response) => {
  const filePath = resolveFile(request.url || '/')
  if (!filePath || !existsSync(filePath) || !(await stat(filePath)).isFile()) {
    response.writeHead(404).end('Not found')
    return
  }
  const contentType = filePath.endsWith('.html') ? 'text/html; charset=utf-8'
    : filePath.endsWith('.js') ? 'application/javascript; charset=utf-8'
      : filePath.endsWith('.css') ? 'text/css; charset=utf-8'
        : filePath.endsWith('.svg') ? 'image/svg+xml'
          : filePath.endsWith('.png') ? 'image/png'
            : filePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
  response.writeHead(200, { 'Content-Type': contentType })
  createReadStream(filePath).pipe(response)
})

const waitForDebugTarget = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })
      if (response.ok) return response.json()
    } catch {
      // Chrome is still starting.
    }
    await delay(250)
  }
  throw new Error('Chrome 偵錯介面沒有啟動。')
}

const createCdpClient = async (url) => new Promise((resolvePromise, reject) => {
  const socket = new WebSocket(url)
  const pending = new Map()
  let requestId = 0
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    const pendingRequest = pending.get(message.id)
    if (!pendingRequest) return
    pending.delete(message.id)
    message.error ? pendingRequest.reject(new Error(message.error.message)) : pendingRequest.resolve(message.result)
  })
  socket.addEventListener('open', () => resolvePromise({
    send(method, params = {}) {
      const id = ++requestId
      socket.send(JSON.stringify({ id, method, params }))
      return new Promise((resolveRequest, rejectRequest) => pending.set(id, { resolve: resolveRequest, reject: rejectRequest }))
    },
    close() { socket.close() },
  }))
  socket.addEventListener('error', reject)
})

const waitForStableHero = async (browser) => {
  await browser.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise(async (resolve) => {
      const wait = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds))
      if (document.readyState !== 'complete') {
        await Promise.race([new Promise((done) => window.addEventListener('load', done, { once: true })), wait(10000)])
      }

      await wait(500)
      const inViewport = (element) => {
        const rect = element.getBoundingClientRect()
        return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
      }
      const images = Array.from(document.images).filter(inViewport)
      await Promise.race([
        Promise.all(images.map((image) => image.complete
          ? image.decode().catch(() => undefined)
          : new Promise((done) => image.addEventListener('load', done, { once: true }))
        )),
        wait(10000),
      ])
      await document.fonts?.ready
      await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))

      for (const animation of document.getAnimations()) {
        try {
          const timing = animation.effect?.getTiming()
          if (timing?.iterations === Infinity) animation.pause()
          else animation.finish()
        } catch {
          animation.pause()
        }
      }
      resolve()
    })`,
  })
}

const capture = async () => {
  mkdirSync(imageDir, { recursive: true })
  mkdirSync(exportedImageDir, { recursive: true })
  const profileDir = mkdtempSync(join(tmpdir(), 'chiaki-og-'))
  const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--disable-background-networking', '--disable-component-update',
    '--disable-sync', '--no-first-run', '--hide-scrollbars', `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${debugPort}`, 'about:blank',
  ], { stdio: 'ignore' })

  try {
    const target = await waitForDebugTarget()
    const browser = await createCdpClient(target.webSocketDebuggerUrl)
    await browser.send('Page.enable')
    await browser.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false })
    await browser.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })

    for (const [route, filename] of pages) {
      await browser.send('Page.navigate', { url: `http://127.0.0.1:${sitePort}${route}` })
      await waitForStableHero(browser)
      const { data } = await browser.send('Page.captureScreenshot', { format: 'jpeg', quality: 85, fromSurface: true })
      const image = Buffer.from(data, 'base64')
      writeFileSync(join(imageDir, `${filename}.jpeg`), image)
      writeFileSync(join(exportedImageDir, `${filename}.jpeg`), image)
      console.log(`Generated /og/${filename}.jpeg`)
    }
    browser.close()
  } finally {
    chrome.kill()
  }
}

siteServer.listen(sitePort, '127.0.0.1', async () => {
  try {
    await capture()
  } finally {
    siteServer.close()
  }
})
