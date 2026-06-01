type LexicalTextNode = { type: 'text'; text?: string; format?: number }

type LexicalElementNode = {
  type: string
  tag?: string
  listType?: 'bullet' | 'number'
  fields?: { url?: string; newTab?: boolean }
  value?: { url?: string; alt?: string; width?: number; height?: number }
  relationTo?: string
  children?: LexicalNode[]
}

type LexicalNode = LexicalTextNode | LexicalElementNode

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderNode(node: LexicalNode): string {
  if (node.type === 'text') {
    const n = node as LexicalTextNode
    let text = escapeHtml(n.text ?? '')
    const fmt = n.format ?? 0
    if (fmt & 1) text = `<strong>${text}</strong>`
    if (fmt & 2) text = `<em>${text}</em>`
    if (fmt & 8) text = `<u>${text}</u>`
    if (fmt & 4) text = `<s>${text}</s>`
    if (fmt & 16) text = `<code class="bg-surface-container-low px-1 rounded text-sm font-mono">${text}</code>`
    return text
  }

  const el = node as LexicalElementNode
  const inner = () => (el.children ?? []).map(renderNode).join('')

  switch (el.type) {
    case 'paragraph':
      return `<p class="mb-4 leading-relaxed">${inner()}</p>`
    case 'heading':
      return `<${el.tag} class="font-display font-bold mt-8 mb-4">${inner()}</${el.tag}>`
    case 'list':
      return el.listType === 'number'
        ? `<ol class="list-decimal pl-6 mb-4 space-y-2">${inner()}</ol>`
        : `<ul class="list-disc pl-6 mb-4 space-y-2">${inner()}</ul>`
    case 'listitem':
      return `<li>${inner()}</li>`
    case 'quote':
      return `<blockquote class="border-l-4 border-primary pl-4 italic my-6 text-on-surface-variant">${inner()}</blockquote>`
    case 'link': {
      const href = escapeHtml(el.fields?.url ?? '#')
      const target = el.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${target} class="text-primary underline hover:opacity-70 transition-opacity">${inner()}</a>`
    }
    case 'linebreak':
      return '<br>'
    case 'upload': {
      const src = escapeHtml(el.value?.url ?? '')
      const alt = escapeHtml(el.value?.alt ?? '')
      if (!src) return ''
      return `<img src="${src}" alt="${alt}" class="w-full rounded-xl my-6 object-cover" />`
    }
    default:
      return inner()
  }
}

export function lexicalToHtml(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const root = (value as { root?: { children?: LexicalNode[] } }).root
  if (!root?.children) return ''
  return root.children.map(renderNode).join('')
}
