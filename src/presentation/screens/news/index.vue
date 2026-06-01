<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Calendar, ExternalLink } from 'lucide-vue-next'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

type NewsPageGlobal = {
  header?: { eyebrow?: string; heading?: string; body?: string }
  ctaSection?: { heading?: string; body?: string; ctaLabel?: string; ctaPath?: string }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } | null }
}

const { data: pageData } = useAsyncData('news-page-global', () =>
  $fetch<NewsPageGlobal>(`${apiBase}/api/globals/news-page`).catch(() => ({} as NewsPageGlobal)),
)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'News & Events — RuralNexus',
  meta: [{ name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' }],
})

type PayloadNewsEvent = {
  id: string; title: string; slug: string; date: string; category: string; summary: string
  image?: { url?: string } | null
}

const { data: newsData } = await useAsyncData('news-listing', () =>
  $fetch<{ docs: PayloadNewsEvent[] }>(
    `${apiBase}/api/news-events?limit=20&sort=-date&depth=1`,
  ),
)

function newsDate(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

const newsItems = computed(() =>
  (newsData.value?.docs ?? []).map((n) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    type: n.category,
    date: newsDate(n.date),
    summary: n.summary,
    imageUrl: n.image?.url,
  })),
)

const typeColors: Record<string, string> = {
  Workshop: 'bg-primary/10 text-primary',
  Publication: 'bg-leaf/10 text-leaf',
  'Field Report': 'bg-cyan/10 text-cyan',
  Funding: 'bg-amber-500/10 text-amber-600',
  Policy: 'bg-sunset/10 text-sunset',
  News: 'bg-primary/10 text-primary',
}
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
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6">{{ pageData?.header?.eyebrow ?? 'Field Updates' }}</p>
          <h1 class="font-display text-5xl md:text-6xl font-bold leading-tight mb-8">
            <span class="text-leaf-300 italic">{{ pageData?.header?.heading ?? 'News & Events' }}</span>
          </h1>
          <p class="font-body text-lg md:text-xl text-white/80 leading-relaxed balance">
            {{ pageData?.header?.body ?? 'Latest field reports, workshops, publications, funding announcements, and policy updates from RuralNexus.' }}
          </p>
        </div>
      </div>
    </section>

    <!-- News Grid -->
    <main class="flex-grow py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-8">
          <article
            v-for="event in newsItems"
            :key="event.id"
            class="flex flex-col bg-surface-container-lowest rounded-[44px] overflow-hidden group hover:shadow-2xl transition-all duration-500"
          >
            <div class="p-10 flex-grow">
              <div class="flex justify-between items-start mb-10">
                <span
                  class="rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                  :class="typeColors[event.type] ?? 'bg-primary/5 text-primary'"
                >
                  {{ event.type }}
                </span>
                <div class="flex items-center gap-2 text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
                  <Calendar class="w-3.5 h-3.5" /> {{ event.date }}
                </div>
              </div>
              <h3 class="text-2xl font-display font-bold text-on-surface mb-4 leading-snug group-hover:text-primary transition-colors">
                {{ event.title }}
              </h3>
              <p class="text-sm font-body text-on-surface-variant leading-relaxed opacity-70 mb-10">
                {{ event.summary }}
              </p>
              <div class="flex items-center justify-end mt-auto pt-8 border-t border-outline-variant/10">
                <NuxtLink
                  :to="`/news/${event.slug}`"
                  class="flex items-center gap-3 text-xs font-bold text-primary uppercase tracking-widest group/btn"
                >
                  Read More
                  <ArrowRight class="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </NuxtLink>
              </div>
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
