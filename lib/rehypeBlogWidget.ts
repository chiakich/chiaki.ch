// Markdown can't hold React components — post bodies are rendered to an HTML
// string and injected with dangerouslySetInnerHTML. This turns a ```widget
// fenced block into an empty placeholder div; components/blog/widgets portals
// the real component into it after mount.
//
// Running MDX instead would mean re-plumbing the whole remark/rehype chain for
// the sake of a handful of demos, so placeholders it is.

type Node = {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: Node[]
  value?: string
}

const codeChild = (node: Node): Node | undefined => {
  if (node.tagName !== 'pre') return undefined
  const code = node.children?.find((child) => child.tagName === 'code')
  const className = code?.properties?.className
  const names = Array.isArray(className) ? className.map(String) : []
  return names.includes('language-widget') ? code : undefined
}

const textOf = (node: Node): string =>
  node.children?.map((child) => child.value ?? textOf(child)).join('') ?? ''

const walk = (node: Node) => {
  const code = codeChild(node)
  if (code) {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(textOf(code))
    } catch {
      // Leave the block alone so the author sees the raw JSON and the mistake.
      return
    }
    const { name, ...props } = parsed
    if (typeof name !== 'string') return
    node.tagName = 'div'
    node.properties = {
      'data-blog-widget': name,
      'data-blog-widget-props': JSON.stringify(props),
    }
    node.children = []
    return
  }
  node.children?.forEach(walk)
}

export const rehypeBlogWidget = () => (tree: Node) => {
  walk(tree)
}
