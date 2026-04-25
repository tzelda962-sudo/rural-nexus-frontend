<script setup lang="ts">
/**
 * Live Preview catch-all for Payload CMS admin.
 * URL pattern: /__preview/globals/{global-slug}
 *              /__preview/{collection-slug}/{doc-slug}
 *
 * Fetches the document once from the REST API, then listens for
 * postMessage updates sent by Payload's live-preview iframe bridge.
 */
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: false })

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const parts = computed(() => {
  const p = route.params.slug
  return Array.isArray(p) ? p : [p]
})

const isGlobal = computed(() => parts.value[0] === 'globals')
const resourceSlug = computed(() => parts.value[1] ?? '')
const collectionSlug = computed(() => !isGlobal.value ? parts.value[0] : null)

const apiUrl = computed(() =>
  isGlobal.value
    ? `${apiBase}/api/globals/${resourceSlug.value}`
    : `${apiBase}/api/${collectionSlug.value}?where[slug][equals]=${resourceSlug.value}&depth=2&limit=1`,
)

const { data: fetchedData } = await useAsyncData('preview-doc', () => $fetch(apiUrl.value))

const docData = ref<unknown>(
  isGlobal.value ? fetchedData.value : (fetchedData.value as { docs?: unknown[] })?.docs?.[0],
)
const isLive = ref(false)

onMounted(() => {
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.data?.type === 'payload-live-preview' && event.data.data) {
      docData.value = event.data.data
      isLive.value = true
    }
  })
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'payload-live-preview-ready' }, '*')
  }
})

useHead({ title: `Preview — ${resourceSlug.value}` })
</script>

<template>
  <div class="min-h-screen bg-surface-container-low font-body">
    <!-- Preview banner -->
    <div class="sticky top-0 z-50 flex items-center gap-3 bg-primary px-6 py-3 text-white text-sm font-bold">
      <span class="w-2 h-2 rounded-full bg-leaf animate-pulse" />
      <span>{{ isLive ? 'Live Preview — receiving updates' : 'Preview Mode' }}</span>
      <span class="ml-auto text-white/60 font-normal text-xs uppercase tracking-widest">{{ parts.join(' / ') }}</span>
    </div>

    <!-- Document data tree -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="docData" class="bg-white rounded-[24px] shadow-sm border border-outline-variant/10 p-8">
        <h1 class="font-display text-2xl font-bold text-on-surface mb-2">
          {{ (docData as Record<string, string>).title ?? resourceSlug }}
        </h1>
        <p class="text-sm text-on-surface-variant/50 font-mono mb-8">{{ isGlobal ? 'Global' : collectionSlug }} · {{ resourceSlug }}</p>

        <pre class="bg-surface-container-low rounded-xl p-6 text-xs overflow-auto max-h-[70vh] font-mono text-on-surface-variant leading-relaxed">{{ JSON.stringify(docData, null, 2) }}</pre>
      </div>

      <div v-else class="text-center py-24 text-on-surface-variant opacity-40">
        Could not load preview for <code class="font-mono">{{ parts.join('/') }}</code>
      </div>
    </div>
  </div>
</template>
