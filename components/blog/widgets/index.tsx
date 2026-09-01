import { useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { LetterpressStyles } from 'kappan/react'
import { demoCss, DEMO_OPTIONS } from 'components/works/letterpress/pressOptions'
import LetterpressPress from './LetterpressPress'

/**
 * 把 ```widget 佔位符換成真的元件。
 *
 * 文章內文是 HTML 字串塞進 dangerouslySetInnerHTML 的，React 不管那棵子樹，
 * 所以掛載後再 createPortal 進去 —— 伺服器端輸出的是空的佔位 div，不會有
 * hydration 落差。代價是 widget 需要 JS，靜態輸出裡只有一個空盒子。
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.ComponentType<any>> = {
  'letterpress-press': LetterpressPress,
}

type Mount = { el: HTMLElement; name: string; props: Record<string, unknown> }

const BlogWidgets = ({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) => {
  const [mounts, setMounts] = useState<Mount[]>([])

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const found: Mount[] = []
    root.querySelectorAll<HTMLElement>('[data-blog-widget]').forEach((el) => {
      const name = el.dataset.blogWidget
      if (!name || !REGISTRY[name]) return
      try {
        found.push({ el, name, props: JSON.parse(el.dataset.blogWidgetProps || '{}') })
      } catch {
        // 壞掉的 props 就跳過，不要整篇文章陪葬。
      }
    })
    setMounts(found)
  }, [containerRef])

  if (!mounts.length) return null

  return (
    <>
      {/* 質感樣式整頁一份就好，濾鏡則是每個 widget 自己一組。 */}
      <LetterpressStyles {...DEMO_OPTIONS} />
      <style dangerouslySetInnerHTML={{ __html: demoCss }} />
      {mounts.map(({ el, name, props }, index) => {
        const Widget = REGISTRY[name]
        return createPortal(<Widget {...props} />, el, String(index))
      })}
    </>
  )
}

export default BlogWidgets
