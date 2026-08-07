// The terminal deliberately uses the official Cubism Web Framework.  This
// small adapter preserves the old avatar component's compact imperative API
// while rendering in an isolated official-SDK document.  It also guarantees
// that every composed parameter arrives before the framework's physics pass.

type ParameterMap = Record<string, number>
type FrameHandler = () => void

class OfficialCubismModel {
  public x = 0
  public y = 0
  public readonly scale = { set: (_value: number) => undefined }
  public readonly anchor = { set: (_x: number, _y: number) => undefined }
  public readonly iframe: HTMLIFrameElement
  public readonly internalModel: {
    coreModel: { setParameterValueById: (id: string, value: number) => void }
    on: (event: string, handler: FrameHandler) => void
    off: (event: string, handler: FrameHandler) => void
  }

  private parameters: ParameterMap = {}
  private handlers = new Set<FrameHandler>()
  private frame: number | null = null

  public constructor() {
    this.iframe = document.createElement('iframe')
    this.iframe.title = 'Chiaki'
    this.iframe.src = '/assets/story/character/live2d-official/index.html'
    this.iframe.setAttribute('aria-hidden', 'true')
    Object.assign(this.iframe.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      border: '0',
      pointerEvents: 'none',
      background: 'transparent',
    })

    this.internalModel = {
      coreModel: {
        setParameterValueById: (id, value) => {
          this.parameters[id] = value
        },
      },
      on: (event, handler) => {
        if (event !== 'afterMotionUpdate') return
        this.handlers.add(handler)
        this.start()
      },
      off: (event, handler) => {
        if (event !== 'afterMotionUpdate') return
        this.handlers.delete(handler)
      },
    }
  }

  public expression(_name?: string): void {}

  public mount(canvas: HTMLCanvasElement): void {
    const parent = canvas.parentElement
    if (!parent) return
    parent.appendChild(this.iframe)
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      background: 'transparent',
      zIndex: '1',
    })
    this.iframe.style.zIndex = '0'
    this.start()
  }

  public destroy(): void {
    if (this.frame !== null) window.cancelAnimationFrame(this.frame)
    this.frame = null
    this.handlers.clear()
    this.iframe.remove()
  }

  private start(): void {
    if (this.frame !== null) return
    const tick = () => {
      for (const handler of this.handlers) handler()
      this.iframe.contentWindow?.postMessage(
        { type: 'chiaki-live2d-parameters', params: this.parameters },
        window.location.origin
      )
      this.frame = window.requestAnimationFrame(tick)
    }
    this.frame = window.requestAnimationFrame(tick)
  }
}

class OfficialCubismApplication {
  public readonly stage: { addChild: (model: OfficialCubismModel) => void }
  public readonly renderer: { resize: (width: number, height: number) => void }
  private model: OfficialCubismModel | null = null
  private canvas: HTMLCanvasElement

  public constructor({
    view,
  }: { view: HTMLCanvasElement } & Record<string, unknown>) {
    this.canvas = view
    this.stage = {
      addChild: model => {
        this.model = model
        model.mount(this.canvas)
      },
    }
    this.renderer = {
      resize: (width, height) => {
        this.canvas.width = Math.max(1, Math.round(width * devicePixelRatio))
        this.canvas.height = Math.max(1, Math.round(height * devicePixelRatio))
        if (this.model) {
          const narrow = width < 720
          this.model.iframe.style.transform = `scale(${narrow ? 1.55 : 1.82})`
          this.model.iframe.style.transformOrigin = narrow ? '50% 19%' : '42% 18%'
        }
      },
    }
  }

  public destroy(..._args: unknown[]): void {
    this.model?.destroy()
    this.canvas.remove()
  }
}

export const loadLive2DRuntime = async () => ({
  PIXI: { Application: OfficialCubismApplication },
  Live2DModel: {
    from: async (_modelPath: string, _options?: unknown) =>
      new OfficialCubismModel(),
  },
})
