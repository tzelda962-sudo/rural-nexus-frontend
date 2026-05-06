<script setup lang="ts">
import { computed, watch } from 'vue'
import { ArrowLeft, FileText, Download, User, Calendar, Tag } from 'lucide-vue-next'
import { lexicalToHtml } from '../../utils/lexicalToHtml'

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string
const slug = route.params.slug as string

type PayloadPublication = {
  id: string; title: string; slug: string; author?: string | null
  category: string; publishedDate: string; summary: string
  abstract?: unknown; pdf?: { url?: string; filename?: string } | null
  featuredImage?: { url?: string; alt?: string } | null
  seo?: { title?: string; description?: string; ogImage?: { url?: string } | null } | null
}

const { data, pending } = useLazyAsyncData(`pub-${slug}`, () =>
  $fetch<{ docs: PayloadPublication[] }>(
    `${apiBase}/api/publications?where[slug][equals]=${slug}&depth=2&limit=1`,
  ),
)

const pub = computed(() => data.value?.docs[0] ?? null)

watch([pending, pub], ([isPending, p]) => {
  if (!isPending && !p) throw createError({ statusCode: 404, statusMessage: 'Publication not found' })
})

useHead({
  title: () => `${pub.value?.seo?.title ?? pub.value?.title} — RuralNexus Research`,
  meta: [
    { name: 'description', content: () => pub.value?.seo?.description ?? pub.value?.summary ?? '' },
    { property: 'og:image', content: () => pub.value?.seo?.ogImage?.url ?? '' },
  ],
})

function displayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const abstractHtml = computed(() => lexicalToHtml(pub.value?.abstract))
</script>

<template>
  <div v-if="pub" class="bg-surface min-h-screen">
    <!-- Back nav -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      <NuxtLink to="/research" class="inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
        <ArrowLeft class="w-4 h-4" /> Back to Research
      </NuxtLink>
    </div>

    <!-- Header -->
    <header class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="flex flex-wrap gap-3 items-center mb-8">
        <span class="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
          {{ pub.category }}
        </span>
        <span class="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
          <Calendar class="w-3.5 h-3.5" /> {{ displayDate(pub.publishedDate) }}
        </span>
        <span v-if="pub.author" class="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
          <User class="w-3.5 h-3.5" /> {{ pub.author }}
        </span>
      </div>

      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
        <div class="flex-grow">
          <h1 class="font-display text-4xl md:text-5xl font-bold leading-tight text-on-surface mb-6 tracking-tight">
            {{ pub.title }}
          </h1>
          <p class="text-lg text-on-surface-variant font-body leading-relaxed opacity-70">
            {{ pub.summary }}
          </p>
        </div>

        <!-- PDF Download -->
        <div class="flex-shrink-0">
          <a
            v-if="pub.pdf?.url"
            :href="pub.pdf.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            <Download class="w-5 h-5" /> Download PDF
          </a>
          <div v-else class="inline-flex items-center gap-3 px-8 py-4 bg-surface-container-low text-on-surface-variant rounded-2xl font-bold text-sm opacity-50">
            <FileText class="w-5 h-5" /> PDF Not Available
          </div>
        </div>
      </div>
    </header>

    <!-- Featured image -->
    <div v-if="pub.featuredImage?.url" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <img
        :src="pub.featuredImage.url"
        :alt="pub.featuredImage.alt ?? pub.title"
        class="w-full rounded-[32px] object-cover aspect-[16/7]"
      >
    </div>

    <!-- Abstract / body -->
    <article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div v-if="abstractHtml" v-html="abstractHtml" class="prose-like font-body text-on-surface" />
      <div v-else class="p-10 bg-surface-container-low rounded-[32px] text-on-surface-variant opacity-60 italic text-center">
        Abstract not yet available.
      </div>
    </article>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.prose-like :deep(p) { @apply mb-5 text-on-surface-variant leading-relaxed; }
.prose-like :deep(h2), .prose-like :deep(h3) { @apply font-display font-bold text-on-surface mt-8 mb-3; }
.prose-like :deep(blockquote) { @apply border-l-4 border-primary pl-6 italic my-8 text-lg text-on-surface-variant; }
</style>
