<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, MapPin, Clock, Calendar, User } from 'lucide-vue-next'
import { lexicalToHtml } from '../../utils/lexicalToHtml'

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string
const slug = route.params.slug as string

type PayloadStory = {
  id: string; title: string; slug: string; excerpt: string; location: string
  program: string; readTime: string; date: string; author?: string | null
  gradient?: string | null; image?: { url?: string; alt?: string } | null
  content?: unknown; seo?: { title?: string; description?: string; ogImage?: { url?: string } | null } | null
}

const { data } = await useAsyncData(`story-${slug}`, () =>
  $fetch<{ docs: PayloadStory[] }>(
    `${apiBase}/api/stories?where[slug][equals]=${slug}&depth=2&limit=1`,
  ),
)

const story = computed(() => data.value?.docs[0] ?? null)

if (!story.value) {
  throw createError({ statusCode: 404, statusMessage: 'Story not found' })
}

useHead({
  title: () => `${story.value?.seo?.title ?? story.value?.title} — RuralNexus`,
  meta: [
    { name: 'description', content: () => story.value?.seo?.description ?? story.value?.excerpt ?? '' },
    { property: 'og:image', content: () => story.value?.seo?.ogImage?.url ?? '' },
  ],
})

function displayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const contentHtml = computed(() => lexicalToHtml(story.value?.content))
const heroGradient = computed(() => story.value?.gradient ?? 'from-emerald-600 to-leaf-500')
</script>

<template>
  <div v-if="story" class="bg-surface min-h-screen">
    <!-- Back nav -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      <NuxtLink to="/stories" class="inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
        <ArrowLeft class="w-4 h-4" /> Back to Stories
      </NuxtLink>
    </div>

    <!-- Hero visual -->
    <div
      class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-10"
    >
      <div
        class="relative w-full aspect-[16/7] rounded-[40px] overflow-hidden"
        :class="story.image?.url ? '' : `bg-gradient-to-br ${heroGradient}`"
      >
        <img v-if="story.image?.url" :src="story.image.url" :alt="story.image.alt ?? story.title" class="w-full h-full object-cover" />
        <div class="absolute inset-0 opacity-20 mix-blend-overlay" style="background-image: radial-gradient(circle at 30% 40%, white 0, transparent 60%);" />
        <div class="absolute left-8 top-8">
          <span class="rounded-full bg-white/95 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary shadow-lg">
            {{ story.program }}
          </span>
        </div>
        <div class="absolute bottom-8 left-8 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest">
          <MapPin class="w-3.5 h-3.5 opacity-70" /> {{ story.location }}
        </div>
      </div>
    </div>

    <!-- Meta + title -->
    <header class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-wrap gap-3 items-center mb-6 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
        <span class="flex items-center gap-1.5"><Calendar class="w-3.5 h-3.5" /> {{ displayDate(story.date) }}</span>
        <span class="flex items-center gap-1.5"><Clock class="w-3.5 h-3.5" /> {{ story.readTime }}</span>
        <span v-if="story.author" class="flex items-center gap-1.5"><User class="w-3.5 h-3.5" /> {{ story.author }}</span>
      </div>
      <h1 class="font-display text-4xl md:text-5xl font-bold leading-tight text-on-surface mb-6 tracking-tight">
        {{ story.title }}
      </h1>
      <p class="text-lg text-on-surface-variant font-body leading-relaxed opacity-70">
        {{ story.excerpt }}
      </p>
    </header>

    <!-- Body -->
    <article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 font-body text-on-surface">
      <div v-if="contentHtml" v-html="contentHtml" class="prose-like" />
      <p v-else class="text-on-surface-variant opacity-60 italic">Full story content coming soon.</p>
    </article>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.prose-like :deep(p) { @apply mb-5 text-on-surface-variant leading-relaxed; }
.prose-like :deep(h2), .prose-like :deep(h3) { @apply font-display font-bold text-on-surface mt-8 mb-3; }
.prose-like :deep(blockquote) { @apply border-l-4 border-primary pl-6 italic my-8 text-lg text-on-surface-variant; }
</style>
