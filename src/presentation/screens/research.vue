<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAsyncData } from '#imports';
import { usePayloadLivePreview } from '../composables/usePayloadLivePreview';
import {
  Search,
  Filter,
  FileText,
  Download,
  ChevronRight,
  BookOpen,
  Library,
  FileCheck
} from 'lucide-vue-next';
import type { Component } from 'vue';

type ResearchCategory = { label: string; icon: string }
type ResearchPageGlobal = {
  header: {
    eyebrow?: string
    headlinePrefix?: string
    headlineEmphasis?: string
    body?: string
  }
  filtersSection?: {
    searchPlaceholder?: string
    categories?: ResearchCategory[]
    emptyStateHeading?: string
    emptyStateBody?: string
    clearFiltersLabel?: string
  }
  submitCtaSection?: {
    badge?: string
    heading?: string
    body?: string
    ctaLabel?: string
    ctaPath?: string
  }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } }
}

const ICON_MAP: Record<string, Component> = {
  Library,
  BookOpen,
  FileCheck,
  FileText,
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const searchQuery = ref('');
const activeCategory = ref('All');

type PayloadPub = {
  id: string; title: string; slug: string; author?: string | null
  category: string; publishedDate: string; summary: string
  pdf?: { url?: string } | null
}

const [{ data: rawPage }, { data: allResources }] = await Promise.all([
  useAsyncData('research-page-global', () =>
    $fetch<ResearchPageGlobal>(`${apiBase}/api/globals/research-page`),
  ),
  useAsyncData('researchData', () =>
    $fetch<{ docs: PayloadPub[] }>(`${apiBase}/api/publications?limit=100&sort=-publishedDate&depth=1`),
  ),
])

const { previewData: pageData } = usePayloadLivePreview(rawPage)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'Research & Methodologies — RuralNexus',
  meta: [
    { name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' },
    { property: 'og:image', content: () => pageData.value?.seo?.ogImage?.url ?? '' },
  ],
})

const categories = computed(() => {
  const fromGlobal = pageData.value?.filtersSection?.categories ?? []
  if (fromGlobal.length > 0) {
    return [
      { name: 'All', icon: Library as Component },
      ...fromGlobal.map(c => ({ name: c.label, icon: (ICON_MAP[c.icon] ?? FileText) as Component })),
    ]
  }
  return [
    { name: 'All', icon: Library as Component },
    { name: 'Research Paper', icon: BookOpen as Component },
    { name: 'Policy Brief', icon: FileCheck as Component },
    { name: 'Annual Report', icon: FileText as Component },
    { name: 'Workshop Notes', icon: FileText as Component },
  ]
})

function pubDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const filteredResources = computed(() => {
  const docs = (allResources.value?.docs ?? []).map(d => ({
    id: d.id,
    slug: d.slug,
    title: d.title,
    summary: d.summary,
    category: d.category,
    date: pubDisplayDate(d.publishedDate),
    pdfUrl: (d.pdf as { url?: string } | null)?.url,
  }))
  return docs.filter(doc => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q || doc.title.toLowerCase().includes(q) || doc.summary.toLowerCase().includes(q)
    const matchesCategory = activeCategory.value === 'All' || doc.category === activeCategory.value
    return matchesSearch && matchesCategory
  })
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-surface">
    <!-- Premium Header -->
    <section class="relative overflow-hidden bg-primary pt-32 pb-24 text-white">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-white"></div>
        <div class="absolute left-10 bottom-10 w-80 h-80 hex-mask border-2 border-white/20"></div>
      </div>

      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6">{{ pageData?.header?.eyebrow ?? 'Knowledge Sovereignty' }}</p>
          <h1 class="font-display text-5xl md:text-6xl font-bold leading-tight mb-8">
            {{ pageData?.header?.headlinePrefix ?? 'Research &' }} <span class="text-leaf-300 italic">{{ pageData?.header?.headlineEmphasis ?? 'Resources' }}</span>
          </h1>
          <p class="font-body text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">
            {{ pageData?.header?.body ?? 'Open access to our transdisciplinary methodologies, policy briefs, and agronomic tools engineered for rural resilience.' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Interactive Repository Area -->
    <section class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow w-full">

      <!-- Toolbar: Refined Search & Filter -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
        <!-- Search -->
        <div class="relative w-full lg:max-w-md group">
          <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
            <Search class="h-5 w-5 text-on-surface-variant/40" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="pageData?.filtersSection?.searchPlaceholder ?? 'Search papers, tools, keywords...'"
            class="w-full pl-14 pr-6 py-5 bg-white border border-outline-variant/10 rounded-[24px] shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-body text-sm"
          >
        </div>

        <!-- Category Filters -->
        <div class="flex flex-wrap gap-3">
          <button
            v-for="cat in categories"
            :key="cat.name"
            @click="activeCategory = cat.name"
            class="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
            :class="activeCategory === cat.name
              ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'"
          >
            <component :is="cat.icon" class="w-4 h-4" />
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Results Grid -->
      <div v-if="filteredResources.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article
          v-for="doc in filteredResources"
          :key="doc.id"
          class="group bg-surface-container-lowest p-8 rounded-[40px] border border-outline-variant/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
        >
          <div class="flex justify-between items-start mb-10">
            <div class="flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full">
               <component :is="categories.find(c => c.name === doc.category)?.icon || FileText" class="w-3.5 h-3.5" />
               <span class="text-[10px] font-bold uppercase tracking-widest">{{ doc.category }}</span>
            </div>
            <span class="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">{{ doc.date }}</span>
          </div>

          <h3 class="font-display font-bold text-xl mb-4 text-on-surface leading-snug group-hover:text-primary transition-colors">
            <NuxtLink :to="`/publications/${doc.slug}`">{{ doc.title }}</NuxtLink>
          </h3>

          <p class="font-body text-sm text-on-surface-variant mb-10 flex-grow line-clamp-4 opacity-70 leading-relaxed">
            {{ doc.summary }}
          </p>

          <div class="pt-8 border-t border-outline-variant/10 mt-auto flex justify-between items-center">
            <NuxtLink :to="`/publications/${doc.slug}`" class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest group/link">
              Read Abstract
              <ChevronRight class="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </NuxtLink>
            <a
              v-if="doc.pdfUrl"
              :href="doc.pdfUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="p-3 bg-surface-container-low text-on-surface-variant/60 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
              title="Download PDF"
            >
              <Download class="w-5 h-5" />
            </a>
            <button v-else class="p-3 bg-surface-container-low text-on-surface-variant/60 hover:bg-primary/10 hover:text-primary rounded-xl transition-all" title="Download PDF Access">
              <Download class="w-5 h-5" />
            </button>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-32 bg-surface-container-low/30 rounded-[48px] border-2 border-dashed border-outline-variant/20">
        <div class="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-8">
          <Library class="w-10 h-10 text-on-surface-variant opacity-20" />
        </div>
        <h3 class="text-xl font-display font-bold text-on-surface mb-2">{{ pageData?.filtersSection?.emptyStateHeading ?? 'No matching resources' }}</h3>
        <p class="text-on-surface-variant opacity-60 font-body mb-10 max-w-sm mx-auto">{{ pageData?.filtersSection?.emptyStateBody ?? "We couldn't find any papers or methodologies matching your current filter." }}</p>
        <button @click="searchQuery = ''; activeCategory = 'All'" class="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          {{ pageData?.filtersSection?.clearFiltersLabel ?? 'Clear All Filters' }}
        </button>
      </div>

    </section>

    <!-- Resource Submission CTA -->
    <section class="bg-surface-container-low py-24">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-outline-variant/10 text-[10px] font-bold text-primary uppercase tracking-widest mb-8">
           <Filter class="w-3 h-3" /> {{ pageData?.submitCtaSection?.badge ?? 'External Contributions' }}
        </div>
        <h2 class="font-display text-4xl font-bold mb-6 tracking-tight text-on-surface">{{ pageData?.submitCtaSection?.heading ?? 'Methodological Collaboration' }}</h2>
        <p class="text-lg text-on-surface-variant font-body opacity-70 mb-10 leading-relaxed max-w-2xl mx-auto">
          {{ pageData?.submitCtaSection?.body ?? 'Are you a researcher working on rural resilience? We provide a platform for peer-reviewed methodologies and open-source agronomic tools.' }}
        </p>
        <NuxtLink :to="pageData?.submitCtaSection?.ctaPath ?? '/contact'" class="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[22px] font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
          {{ pageData?.submitCtaSection?.ctaLabel ?? 'Submit Resource Proposal' }}
          <ChevronRight class="w-5 h-5" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
