<script setup lang="ts">
import { computed } from 'vue'
import { FileText, Download, ExternalLink } from 'lucide-vue-next'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

type PublicationsPageGlobal = {
  header?: { eyebrow?: string; heading?: string; body?: string }
  ctaSection?: { heading?: string; body?: string; ctaLabel?: string; ctaPath?: string }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } | null }
}

const { data: pageData } = useAsyncData('publications-page-global', () =>
  $fetch<PublicationsPageGlobal>(`${apiBase}/api/globals/publications-page`).catch(() => ({} as PublicationsPageGlobal)),
)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'Publications — RuralNexus',
  meta: [{ name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' }],
})

type PayloadPub = {
  id: string; title: string; slug: string
  author?: string | null; category: string; publishedDate?: string | null; summary: string
  publicationType: 'internal' | 'external'
  externalUrl?: string | null
  pdf?: { url?: string } | null
}

const { data: pubsData } = await useAsyncData('publications-listing', () =>
  $fetch<{ docs: PayloadPub[] }>(
    `${apiBase}/api/publications?limit=50&sort=-publishedDate&depth=1`,
  ),
)

function pubDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const publications = computed(() =>
  (pubsData.value?.docs ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    author: p.author || null,
    category: p.category,
    date: p.publishedDate ? pubDate(p.publishedDate) : null,
    summary: p.summary,
    pdfUrl: (p.pdf as { url?: string } | null)?.url ?? null,
    publicationType: p.publicationType,
    externalUrl: p.externalUrl ?? null,
  })),
)
</script>

<template>
  <div class="flex flex-col bg-surface min-h-screen">
    <!-- Hero -->
    <section class="relative overflow-hidden bg-primary py-24 text-white">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-white"></div>
        <div class="absolute left-10 bottom-10 w-80 h-80 hex-mask border-2 border-white/20"></div>
      </div>
      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6">{{ pageData?.header?.eyebrow ?? 'Knowledge Base' }}</p>
          <h1 class="font-display text-5xl md:text-6xl font-bold leading-tight mb-8">
            <span class="text-leaf-300 italic">{{ pageData?.header?.heading ?? 'Publications' }}</span>
          </h1>
          <p class="font-body text-lg md:text-xl text-white/80 leading-relaxed balance">
            {{ pageData?.header?.body ?? 'Research papers, policy briefs, annual reports, and workshop outputs from our program teams.' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Publications Grid -->
    <main class="flex-grow py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="pub in publications"
            :key="pub.id"
            class="group bg-surface-container-lowest rounded-[28px] border border-outline-variant/10 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
          >
            <!-- Category + date -->
            <div class="px-6 pt-6 flex items-start justify-between gap-3 mb-4">
              <span class="text-[9px] font-bold text-primary uppercase tracking-[0.18em] px-3 py-1 bg-primary/5 rounded-full whitespace-nowrap">
                {{ pub.category }}
              </span>
              <span v-if="pub.date" class="text-[10px] text-on-surface-variant/50 font-bold whitespace-nowrap">
                {{ pub.date }}
              </span>
            </div>

            <!-- Body -->
            <div class="px-6 flex flex-col flex-grow">
              <h3 class="font-display font-bold text-base text-on-surface mb-3 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {{ pub.title }}
              </h3>
              <p v-if="pub.summary" class="text-sm text-on-surface-variant/70 font-body leading-relaxed line-clamp-3 flex-grow">
                {{ pub.summary }}
              </p>
              <p v-if="pub.author" class="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-3">
                {{ pub.author }}
              </p>
            </div>

            <!-- Actions -->
            <div class="px-6 pb-6 pt-4 mt-4 border-t border-outline-variant/10 flex flex-wrap gap-2">
              <a
                v-if="pub.pdfUrl"
                :href="pub.pdfUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all"
              >
                <Download class="w-3.5 h-3.5" /> PDF
              </a>
              <a
                v-if="pub.publicationType === 'external' && pub.externalUrl"
                :href="pub.externalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
              >
                <ExternalLink class="w-3.5 h-3.5" /> View
              </a>
              <NuxtLink
                v-else
                :to="`/publications/${pub.slug}`"
                class="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
              >
                <FileText class="w-3.5 h-3.5" /> Abstract
              </NuxtLink>
            </div>
          </article>
        </div>
      </div>
    </main>

    <!-- CTA -->
    <section class="bg-surface-container-low py-24">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="font-display text-3xl font-bold mb-6 tracking-tight">{{ pageData?.ctaSection?.heading ?? 'Catalysing Change Through Collaboration' }}</h2>
        <p class="text-lg text-on-surface-variant font-body opacity-70 mb-10 leading-relaxed">
          {{ pageData?.ctaSection?.body ?? 'We welcome proposals for co-hosting events, contributing to research publications, or partnering on field implementation projects.' }}
        </p>
        <NuxtLink :to="pageData?.ctaSection?.ctaPath ?? '/contact'" class="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-[22px] font-bold shadow-xl hover:shadow-2xl transition-all">
          {{ pageData?.ctaSection?.ctaLabel ?? 'Initiate Contact' }} <ExternalLink class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hex-mask { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
.balance { text-wrap: balance; }
</style>
