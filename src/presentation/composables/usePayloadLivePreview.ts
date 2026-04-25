import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'

export function usePayloadLivePreview<T extends object>(initial: T): {
  previewData: Ref<T>
  isPreview: Ref<boolean>
} {
  const previewData = ref(initial) as Ref<T>
  const isPreview = ref(false)

  if (import.meta.client) {
    onMounted(() => {
      const handler = (event: MessageEvent) => {
        if (
          event.data &&
          typeof event.data === 'object' &&
          event.data.type === 'payload-live-preview' &&
          event.data.data
        ) {
          previewData.value = event.data.data as T
          isPreview.value = true
        }
      }
      window.addEventListener('message', handler)

      // Signal readiness to the Payload admin iframe parent
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'payload-live-preview-ready' }, '*')
      }
    })
  }

  return { previewData, isPreview }
}
