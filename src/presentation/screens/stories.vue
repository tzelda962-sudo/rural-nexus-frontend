<script setup lang="ts">
import { computed } from 'vue';
import { MapPin, Clock, Calendar, ArrowRight, Plus, Quote } from 'lucide-vue-next';
import { usePayloadLivePreview } from '../composables/usePayloadLivePreview';

type StoriesPageGlobal = {
  header: {
    eyebrow?: string
    headline?: string
    body?: string
  }
  gridSection?: { heading?: string; body?: string }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } }
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

type PayloadStory = {
  id: string; title: string; slug: string; excerpt: string; location: string
  program: string; readTime: string; date: string; author?: string | null
  isFeatured: boolean; gradient?: string | null; image?: { url?: string } | null
}

const [{ data: rawPage }, { data: storiesData }] = await Promise.all([
  useAsyncData('stories-page-global', () =>
    $fetch<StoriesPageGlobal>(`${apiBase}/api/globals/stories-page`),
  ),
  useAsyncData('stories', () =>
    $fetch<{ docs: PayloadStory[] }>(`${apiBase}/api/stories?limit=50&depth=1&sort=-date`),
  ),
])

const { previewData: pageData } = usePayloadLivePreview(rawPage.value ?? {} as StoriesPageGlobal)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'Field Stories — RuralNexus',
  meta: [
    { name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' },
    { property: 'og:image', content: () => pageData.value?.seo?.ogImage?.url ?? '' },
  ],
})

function storyDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const featured = computed(() => {
  const f = storiesData.value?.docs.find(s => s.isFeatured)
  if (!f) return null
  return { ...f, date: storyDate(f.date), gradient: f.gradient ?? 'from-emerald-600 to-leaf-500' }
})

const stories = computed(() =>
  (storiesData.value?.docs ?? [])
    .filter(s => !s.isFeatured)
    .map(s => ({ ...s, date: storyDate(s.date), gradient: s.gradient ?? 'from-primary to-leaf-600' })),
)
</script>

<template>
  <div class="bg-surface min-h-screen">
    <!-- Premium Identity Header -->
    <section class="bg-white pt-32 pb-16 relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-primary"></div>
      </div>

      <div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
        <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4">
          {{ pageData?.header?.eyebrow ?? 'Field Dispatches' }}
        </p>
        <h1 class="font-display text-5xl md:text-6xl font-bold tracking-tight text-on-surface mb-8">
          {{ pageData?.header?.headline ?? 'Voices from the Nexus.' }}
        </h1>
        <p class="text-lg md:text-xl text-on-surface-variant font-body leading-relaxed max-w-2xl mx-auto opacity-70">
          {{ pageData?.header?.body ?? 'First-hand dispatches from our fellows and regional partners—documenting the transdisciplinary journey toward community sovereignty.' }}
        </p>
      </div>
    </section>

    <!-- Featured Masterpiece Card -->
    <section v-if="featured" class="bg-white pb-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <article class="group grid overflow-hidden rounded-[48px] border border-outline-variant/10 bg-white shadow-sm hover:shadow-2xl transition-all duration-700 lg:grid-cols-2">
          <div
            class="relative aspect-[16/10] bg-gradient-to-br lg:aspect-auto"
            :class="featured.gradient"
          >
            <div class="absolute inset-0 opacity-20 mix-blend-overlay" style="background-image: radial-gradient(circle at 25% 35%, white 0, transparent 50%); shadow: inset 0 0 100px rgba(0,0,0,0.1)" />
            <div class="absolute left-10 top-10 flex items-center gap-3">
              <span class="w-12 h-12 hex-mask bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                 <Quote class="w-5 h-5" />
              </span>
              <span class="rounded-full bg-white/95 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary shadow-xl">
                Featured Insight
              </span>
            </div>
          </div>

          <div class="flex flex-col justify-center p-10 sm:p-14 lg:p-20">
            <div class="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-primary mb-8">
              <span>{{ featured?.program }}</span>
              <span class="h-1 w-1 rounded-full bg-primary/30" />
              <span class="flex items-center gap-1.5"><MapPin class="w-3 h-3" /> {{ featured?.location }}</span>
              <span class="h-1 w-1 rounded-full bg-primary/30" />
              <span class="flex items-center gap-1.5"><Clock class="w-3 h-3" /> {{ featured?.readTime }}</span>
            </div>

            <h2 class="font-display text-3xl md:text-4xl font-bold leading-tight text-on-surface mb-6">
              {{ featured?.title }}
            </h2>
            <p class="text-base md:text-lg leading-relaxed text-on-surface-variant font-body opacity-70 mb-10">
              {{ featured?.excerpt }}
            </p>

            <div class="flex items-center justify-between mt-auto pt-10 border-t border-outline-variant/5">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 hex-mask bg-primary/10 flex items-center justify-center text-primary font-bold">
                   {{ featured?.author?.charAt(0) ?? 'R' }}
                </div>
                <div>
                  <p class="text-sm font-bold text-on-surface">{{ featured?.author ?? 'RuralNexus' }}</p>
                  <p class="text-xs text-on-surface-variant font-medium opacity-50">{{ featured?.date }}</p>
                </div>
              </div>
              <NuxtLink
                :to="featured ? `/stories/${featured.slug}` : '#'"
                class="inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition hover:scale-105"
              >
                Read Story
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Field Dispatch Grid -->
    <section class="bg-surface-container-low py-32 rounded-t-[64px] -mt-16 relative z-10 shadow-2xl">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div class="max-w-xl">
             <h2 class="font-display text-3xl font-bold tracking-tight text-on-surface mb-4">
              {{ pageData?.gridSection?.heading ?? 'More from the Ground' }}
            </h2>
            <p class="text-sm text-on-surface-variant font-body opacity-60">
              {{ pageData?.gridSection?.body ?? 'A curated selection of dispatches from our global node network, documenting sustainable breakthroughs and lessons learned.' }}
            </p>
          </div>
          <button
            type="button"
            class="flex items-center gap-2 rounded-2xl border border-outline-variant/10 bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface transition-all hover:bg-primary hover:text-white"
          >
            All Programs
          </button>
        </div>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="story in stories"
            :key="story.slug"
            class="group flex h-full flex-col overflow-hidden rounded-[40px] bg-white shadow-sm ring-1 ring-outline-variant/5 transition hover:-translate-y-2 hover:shadow-2xl"
          >
            <div
              class="relative aspect-[16/10] overflow-hidden bg-gradient-to-br"
              :class="story.gradient"
            >
              <div class="absolute inset-0 opacity-20 mix-blend-overlay" style="background-image: radial-gradient(circle at 35% 40%, white 0, transparent 50%);" />
              <div class="absolute left-6 top-6">
                <span class="rounded-full bg-white/95 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary shadow-lg group-hover:scale-105 transition-transform">
                  {{ story.program }}
                </span>
              </div>
              <div class="absolute bottom-6 left-6 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest">
                <MapPin class="w-3.5 h-3.5 opacity-60" />
                {{ story.location }}
              </div>
            </div>

            <div class="flex flex-1 flex-col p-8 lg:p-10">
              <h3 class="font-display text-xl font-bold leading-tight text-on-surface mb-4 group-hover:text-primary transition-colors">
                {{ story.title }}
              </h3>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant font-body opacity-60 mb-10">
                {{ story.excerpt }}
              </p>

              <div class="mt-auto flex items-center justify-between text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest border-t border-outline-variant/5 pt-8">
                <span class="flex items-center gap-2"><Calendar class="w-3.5 h-3.5" /> {{ story.date }}</span>
                <NuxtLink :to="`/stories/${story.slug}`" class="flex items-center gap-2 text-primary hover:opacity-70 transition-opacity">
                  <Clock class="w-3.5 h-3.5" /> {{ story.readTime }}
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>

        <!-- Dynamic Load -->
        <div class="mt-20 flex justify-center">
          <button
            type="button"
            class="group inline-flex items-center gap-3 rounded-[24px] border-2 border-primary/20 px-10 py-5 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
          >
            Explore All Dispatches
            <Plus class="h-4 w-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}
</style>
