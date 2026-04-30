<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Search, FileText, Newspaper, BookOpen, Layers, ArrowRight } from 'lucide-vue-next'

useHead({ title: 'Search — RuralNexus' })

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const query = ref((route.query.q as string) ?? '')

type SearchHit = {
  collection: string; id: string; title: string; slug?: string
  summary?: string; category?: string; href: string
}
type SearchResult = { query: string; hits: SearchHit[]; total: number }

const { data, refresh, pending } = await useAsyncData(
  'search',
  () => query.value.trim().length >= 2
    ? $fetch<SearchResult>(`${apiBase}/api/search?q=${encodeURIComponent(query.value.trim())}&limit=20`)
    : Promise.resolve(null),
  { watch: [query] },
)

const hits = computed(() => data.value?.hits ?? [])

const COLLECTION_ICON: Record<string, unknown> = {
  'news-events': Newspaper,
  stories: BookOpen,
  publications: FileText,
  programs: Layers,
}

function collectionLabel(slug: string): string {
  const map: Record<string, string> = {
    'news-events': 'News', stories: 'Field Story', publications: 'Publication', programs: 'Program',
  }
  return map[slug] ?? slug
}

watch(() => route.query.q, (q) => { query.value = (q as string) ?? '' })
</script>

<template>
  <div class="bg-surface min-h-screen py-24">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="font-display text-4xl font-bold text-on-surface mb-10 tracking-tight">Search</h1>

      <!-- Input -->
      <div class="relative mb-12">
        <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-surface-variant/40">
          <Search class="w-5 h-5" />
        </div>
        <input
          v-model="query"
          type="text"
          placeholder="Search programs, stories, publications, news..."
          class="w-full pl-14 pr-6 py-5 bg-white border border-outline-variant/10 rounded-[24px] shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-body text-sm"
          autofocus
        >
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-20 text-on-surface-variant opacity-40 font-body">
        Searching...
      </div>

      <!-- Results -->
      <div v-else-if="hits.length > 0" class="space-y-4">
        <p class="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest mb-6">
          {{ data?.total }} result{{ (data?.total ?? 0) !== 1 ? 's' : '' }} for "{{ data?.query }}"
        </p>
        <NuxtLink
          v-for="hit in hits"
          :key="hit.id"
          :to="hit.href"
          class="flex items-center gap-6 p-6 bg-surface-container-lowest rounded-[24px] border border-outline-variant/10 hover:border-primary/30 hover:shadow-lg transition-all group"
        >
          <div class="w-12 h-12 flex-shrink-0 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
            <component :is="COLLECTION_ICON[hit.collection] ?? FileText" class="w-5 h-5" />
          </div>
          <div class="flex-grow min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] font-bold text-primary uppercase tracking-widest">{{ collectionLabel(hit.collection) }}</span>
              <span v-if="hit.category" class="text-[10px] text-on-surface-variant/40 font-bold uppercase">· {{ hit.category }}</span>
            </div>
            <p class="font-display font-bold text-on-surface group-hover:text-primary transition-colors truncate">{{ hit.title }}</p>
            <p v-if="hit.summary" class="text-sm font-body text-on-surface-variant opacity-60 mt-1 line-clamp-1">{{ hit.summary }}</p>
          </div>
          <ArrowRight class="w-4 h-4 flex-shrink-0 text-primary/40 group-hover:text-primary transition-all group-hover:translate-x-1" />
        </NuxtLink>
      </div>

      <!-- Empty / prompt -->
      <div v-else-if="query.trim().length >= 2" class="text-center py-24 text-on-surface-variant opacity-50 font-body">
        No results for "{{ query }}"
      </div>
      <div v-else class="text-center py-24 text-on-surface-variant opacity-40 font-body">
        Type at least 2 characters to search.
      </div>
    </div>
  </div>
</template>
