import { ref } from 'vue'

type ShareableTestimonial = {
  quote: string
  name: string
  title?: string | null
  organization?: string | null
}

/** Shares a testimonial via the native share sheet, falling back to copying text to the clipboard. */
export function useShareTestimonial() {
  const copiedId = ref<string | null>(null)

  async function share(id: string, t: ShareableTestimonial) {
    const attribution = [t.name, [t.title, t.organization].filter(Boolean).join(', ')]
      .filter(Boolean)
      .join(', ')
    const text = `"${t.quote}"${attribution ? ` — ${attribution}` : ''}`

    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'What partners say about Rural Nexus' })
        return
      } catch {
        // user cancelled or share failed, fall through to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      copiedId.value = id
      setTimeout(() => {
        if (copiedId.value === id) copiedId.value = null
      }, 2000)
    }
  }

  return { share, copiedId }
}
