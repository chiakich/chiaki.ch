import { useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { demoCss } from 'components/works/letterpress/pressOptions'
import LetterpressPress from './LetterpressPress'

/**
 * 把 ```widget 佔位符換成真的元件。
 *
 * 文章內文是 HTML 字串塞進 dangerouslySetInnerHTML 的，React 不管那棵子樹，
 * 所以掛載後再 createPortal 進去 —— 伺服器端輸出的是空的佔位 div，不會有
 * hydration 落差。代價是 widget 需要 JS，靜態輸出裡只有一個空盒子。
 */

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
      {/* 只補字體檔。再掛一份 LetterpressStyles 會蓋掉整篇文章的 .lp。 */}
      <style dangerouslySetInnerHTML={{ __html: demoCss }} />
      {mounts.map(({ el, name, props }, index) => {
        const Widget = REGISTRY[name]
        return createPortal(<Widget {...props} />, el, String(index))
      })}
    </>
  )
}

export default BlogWidgets
