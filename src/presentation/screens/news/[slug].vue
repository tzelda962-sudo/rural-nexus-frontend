<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-vue-next'
import { lexicalToHtml } from '../../utils/lexicalToHtml'

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string
const slug = route.params.slug as string

type PayloadNewsEvent = {
  id: string; title: string; slug: string; date: string; author?: string | null
  summary: string; category: string; isHighlight: boolean
  content?: unknown; image?: { url?: string; alt?: string } | null
  seo?: { title?: string; description?: string; ogImage?: { url?: string } | null } | null
}

const { data, error } = await useAsyncData(`news-${slug}`, () =>
  $fetch<{ docs: PayloadNewsEvent[] }>(
    `${apiBase}/api/news-events?where[slug][equals]=${slug}&depth=2&limit=1`,
  ),
)

const article = computed(() => data.value?.docs[0] ?? null)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found' })
}

useHead({
  title: () => `${article.value?.seo?.title ?? article.value?.title} — RuralNexus`,
  meta: [
    { name: 'description', content: () => article.value?.seo?.description ?? article.value?.summary ?? '' },
    { property: 'og:image', content: () => article.value?.seo?.ogImage?.url ?? '' },
  ],
})

function displayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

const contentHtml = computed(() => lexicalToHtml(article.value?.content))
</script>

<template>
  <div v-if="article" class="bg-surface min-h-screen">
    <!-- Back nav -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      <NuxtLink to="/events" class="inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
        <ArrowLeft class="w-4 h-4" /> Back to Action Hub
      </NuxtLink>
    </div>

    <!-- Hero -->
    <header class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="flex flex-wrap gap-3 items-center mb-6">
        <span class="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
          {{ article.category }}
        </span>
        <span class="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
          <Calendar class="w-3.5 h-3.5" /> {{ displayDate(article.date) }}
        </span>
        <span v-if="article.author" class="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
          <User class="w-3.5 h-3.5" /> {{ article.author }}
        </span>
      </div>

      <h1 class="font-display text-4xl md:text-5xl font-bold leading-tight text-on-surface mb-6 tracking-tight">
        {{ article.title }}
      </h1>
      <p class="text-lg md:text-xl text-on-surface-variant font-body leading-relaxed opacity-70">
        {{ article.summary }}
      </p>
    </header>

    <!-- Feature image -->
    <div v-if="article.image?.url" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <img
        :src="article.image.url"
        :alt="article.image.alt ?? article.title"
        class="w-full rounded-[32px] object-cover aspect-[16/7]"
      >
    </div>

    <!-- Body content -->
    <article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 font-body text-on-surface leading-relaxed">
      <div v-if="contentHtml" v-html="contentHtml" class="prose-like" />
      <p v-else class="text-on-surface-variant opacity-60 italic">Full article content coming soon.</p>
    </article>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.prose-like :deep(h1), .prose-like :deep(h2), .prose-like :deep(h3) {
  @apply font-display font-bold text-on-surface;
}
.prose-like :deep(h1) { @apply text-3xl mt-10 mb-4; }
.prose-like :deep(h2) { @apply text-2xl mt-8 mb-3; }
.prose-like :deep(h3) { @apply text-xl mt-6 mb-2; }
.prose-like :deep(p) { @apply mb-5 text-on-surface-variant leading-relaxed; }
</style>
