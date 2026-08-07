import type * as Pixi from 'pixi.js'

const CUBISM_CORE_URL =
  'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'

let corePromise: Promise<void> | null = null

const loadCubismCore = () => {
  if (window.Live2DCubismCore) return Promise.resolve()
  if (corePromise) return corePromise

  corePromise = new Promise<void>((resolve, reject) => {
    const finish = () => {
      if (window.Live2DCubismCore) resolve()
      else reject(new Error('Cubism Core loaded without exposing its runtime'))
    }
    const fail = () => reject(new Error('Failed to load Cubism Core'))
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CUBISM_CORE_URL}"]`
    )

    if (existing) {
      existing.addEventListener('load', finish, { once: true })
      existing.addEventListener('error', fail, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = CUBISM_CORE_URL
    script.async = true
    script.addEventListener('load', finish, { once: true })
    script.addEventListener('error', fail, { once: true })
    document.head.appendChild(script)
  }).catch((error) => {
    corePromise = null
    throw error
  })

  return corePromise
}

export const loadLive2DRuntime = async () => {
  await loadCubismCore()
  const PIXI = await import('pixi.js')
  window.PIXI = PIXI as typeof Pixi
  const { Live2DModel } = await import('pixi-live2d-display/cubism4')
  return { PIXI, Live2DModel }
}
