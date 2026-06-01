<script setup lang="ts">
import { computed } from 'vue'
import { FileText, Download, ExternalLink } from 'lucide-vue-next'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

useHead({ title: 'Publications — RuralNexus' })

type PayloadPub = {
  id: string; title: string; slug: string
  author?: string | null; category: string; publishedDate: string; summary: string
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
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const publications = computed(() =>
  (pubsData.value?.docs ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    author: p.author ?? '',
    category: p.category,
    date: pubDate(p.publishedDate),
    summary: p.summary,
    pdfUrl: (p.pdf as { url?: string } | null)?.url,
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
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6">Knowledge Base</p>
          <h1 class="font-display text-5xl md:text-6xl font-bold leading-tight mb-8">
            <span class="text-leaf-300 italic">Publications</span>
          </h1>
          <p class="font-body text-lg md:text-xl text-white/80 leading-relaxed balance">
            Research papers, policy briefs, annual reports, and workshop outputs from our program teams.
          </p>
        </div>
      </div>
    </section>

    <!-- Publications List -->
    <main class="flex-grow py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-6">
          <div
            v-for="pub in publications"
            :key="pub.id"
            class="p-8 bg-surface-container-lowest rounded-[32px] border border-outline-variant/10 hover:border-primary/30 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group"
          >
            <div class="flex items-center gap-8">
              <div class="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant/40 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                <FileText class="w-8 h-8" />
              </div>
              <div>
                <span class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 block">{{ pub.category }}</span>
                <h3 class="text-xl font-display font-bold text-on-surface mb-2 tracking-tight">{{ pub.title }}</h3>
                <p class="text-sm text-on-surface-variant font-body opacity-70 mb-1 leading-relaxed">{{ pub.summary }}</p>
                <p class="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest">{{ pub.author }} • {{ pub.date }}</p>
              </div>
            </div>
            <div class="flex-shrink-0 flex flex-col gap-2">
              <a
                v-if="pub.pdfUrl"
                :href="pub.pdfUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-all"
              >
                <Download class="w-4 h-4" /> Download PDF
              </a>
              <!-- External publication -->
              <a
                v-if="pub.publicationType === 'external' && pub.externalUrl"
                :href="pub.externalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 px-6 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
              >
                <ExternalLink class="w-4 h-4" /> View Publication
              </a>
              <!-- Internal publication -->
              <NuxtLink
                v-else
                :to="`/publications/${pub.slug}`"
                class="flex items-center gap-3 px-6 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
              >
                Read Abstract
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- CTA -->
    <section class="bg-surface-container-low py-24">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="font-display text-3xl font-bold mb-6 tracking-tight">Catalysing Change Through Collaboration</h2>
        <p class="text-lg text-on-surface-variant font-body opacity-70 mb-10 leading-relaxed">
          We welcome proposals for co-hosting events, contributing to research publications, or partnering on field implementation projects.
        </p>
        <NuxtLink to="/contact" class="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-[22px] font-bold shadow-xl hover:shadow-2xl transition-all">
          Initiate Contact <ExternalLink class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hex-mask { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
.balance { text-wrap: balance; }
</style>
