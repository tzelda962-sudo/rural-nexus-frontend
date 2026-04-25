import { ref, watch, onMounted, isRef } from 'vue'
import type { Ref, MaybeRef } from 'vue'

export function usePayloadLivePreview<T extends object>(source: MaybeRef<T | null>): {
  previewData: Ref<T | null>
  isPreview: Ref<boolean>
} {
  const previewData = ref(isRef(source) ? source.value : source) as Ref<T | null>
  const isPreview = ref(false)

  // Keep previewData in sync with the source ref (handles navigation remounts
  // where useAsyncData resolves asynchronously after setup).
  if (isRef(source)) {
    watch(source, (val) => {
      if (!isPreview.value) {
        previewData.value = val
      }
    })
  }

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

      if (window.parent !== window) {
        window.parent.postMessage({ type: 'payload-live-preview-ready' }, '*')
      }
    })
  }

  return { previewData, isPreview }
}
