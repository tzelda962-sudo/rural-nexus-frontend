<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePayloadLivePreview } from '../composables/usePayloadLivePreview';

type GalleryPageGlobal = {
  header: {
    eyebrow?: string
    headline?: string
    body?: string
  }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } }
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const activeCategory = ref('All')

const ASPECT_MAP: Record<string, string> = {
  '4/3': 'aspect-[4/3]',
  'square': 'aspect-square',
  '16/10': 'aspect-[16/10]',
  '3/4': 'aspect-[3/4]',
}

const SIZE_MAP: Record<string, string> = {
  '1x1': 'col-span-1',
  '2x1': 'col-span-2',
  '1x2': 'col-span-1',
}

type PayloadGalleryItem = {
  id: string; title: string; category: string; location: string; year: number
  gradient?: string | null; aspectRatio?: string; gridSize?: string
  image?: { url?: string } | null; caption?: string | null
}

type Testimonial = {
  id: string; quote: string; name: string; title?: string | null
  organization?: string | null; avatar?: { url?: string } | null
}

const { data: rawPage } = useAsyncData('gallery-page-global', () =>
  $fetch<GalleryPageGlobal>(`${apiBase}/api/globals/gallery-page`),
)
const { data: galleryData } = useAsyncData('gallery', () =>
  $fetch<{ docs: PayloadGalleryItem[] }>(`${apiBase}/api/gallery?limit=100`),
)
const { data: testimonialsData } = useAsyncData('testimonials', () =>
  $fetch<{ docs: Testimonial[] }>(`${apiBase}/api/homepage-testimonials?limit=3&depth=1&sort=order`),
)

const { previewData: pageData } = usePayloadLivePreview<GalleryPageGlobal>(rawPage)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'Media Gallery — RuralNexus',
  meta: [
    { name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' },
    { property: 'og:image', content: () => pageData.value?.seo?.ogImage?.url ?? '' },
  ],
})

const galleryItems = computed(() =>
  (galleryData.value?.docs ?? []).map(g => ({
    id: g.id,
    title: g.title,
    category: g.category,
    location: g.location,
    year: String(g.year),
    gradient: g.gradient ?? 'from-primary to-leaf-600',
    aspect: ASPECT_MAP[g.aspectRatio ?? '4/3'] ?? 'aspect-[4/3]',
    size: SIZE_MAP[g.gridSize ?? '1x1'] ?? 'col-span-1',
    imageUrl: g.image?.url,
  })),
)

const categories = computed(() => {
  const cats = new Set(galleryItems.value.map(g => g.category))
  return ['All', ...cats]
})

const filtered = computed(() =>
  activeCategory.value === 'All'
    ? galleryItems.value
    : galleryItems.value.filter(g => g.category === activeCategory.value),
)

const categoryColors: Record<string, string> = {
  'Field Work': 'bg-leaf/10 text-leaf',
  Community: 'bg-cyan/10 text-cyan',
  Research: 'bg-primary/10 text-primary',
  Events: 'bg-sunset/10 text-sunset',
  Partners: 'bg-amber-500/10 text-amber-600',
}
</script>

<template>
  <div class="flex flex-col bg-surface">
    <!-- Hero -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-primary to-leaf-700 py-20 text-white"
    >
      <div
        class="hex-mask absolute -left-16 bottom-0 h-72 w-72 bg-white opacity-[0.04] pointer-events-none"
      />
      <div
        class="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
      >
        <p class="text-sm font-bold uppercase tracking-widest opacity-70">
          {{ pageData?.header?.eyebrow ?? 'Visual Archive' }}
        </p>
        <h1 class="mt-4 font-display text-4xl font-bold md:text-5xl">
          {{ pageData?.header?.headline ?? 'Media & Gallery' }}
        </h1>
        <p
          class="mx-auto mt-5 max-w-2xl font-body text-lg leading-relaxed opacity-85"
        >
          {{ pageData?.header?.body ?? 'A visual record of the work — from field research to community convenings. Explore the people, places and moments that shape RuralNexus.' }}
        </p>
      </div>
    </section>

    <!-- Filter bar -->
    <section
      class="sticky top-[72px] z-30 border-b border-outline-variant/10 bg-surface/90 py-4 backdrop-blur"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            class="flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition"
            :class="
              activeCategory === cat
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            "
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </section>

    <!-- Masonry-ish grid -->
    <section class="py-16 bg-surface">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          <div
            v-for="item in filtered"
            :key="item.id"
            class="group relative cursor-pointer overflow-hidden rounded-2xl"
            :class="[item.aspect, item.size]"
          >
            <!-- Actual image or gradient fallback -->
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.title"
              class="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div
              v-else
              class="absolute inset-0 bg-gradient-to-br transition duration-500 group-hover:scale-105"
              :class="item.gradient"
            />
            <!-- Grid texture overlay -->
            <div
              class="absolute inset-0 opacity-10 mix-blend-overlay"
              style="
                background-image: radial-gradient(
                  circle at 30% 35%,
                  white 0,
                  transparent 50%
                );
              "
            />
            <!-- Hover overlay -->
            <div
              class="absolute inset-0 bg-black/0 transition group-hover:bg-black/40"
            />

            <!-- Category badge -->
            <div
              class="absolute left-4 top-4 z-10 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <span
                class="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                :class="categoryColors[item.category] ?? 'text-on-surface'"
              >
                {{ item.category }}
              </span>
            </div>

            <!-- Caption -->
            <div
              class="absolute inset-x-0 bottom-0 z-10 translate-y-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <p
                class="font-display text-sm font-semibold leading-snug text-white"
              >
                {{ item.title }}
              </p>
              <p class="mt-1 text-xs text-white/70">
                {{ item.location }} · {{ item.year }}
              </p>
            </div>
          </div>
        </div>

        <!-- Load more -->
        <div class="mt-12 flex justify-center">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-6 py-3 text-sm font-bold text-on-surface shadow-sm hover:border-primary hover:text-primary transition"
          >
            Load more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 5v14M5 12l7 7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
    <!-- Testimonials -->
    <section class="py-24 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Voices from the Field</p>
        <h2 class="font-display font-bold text-4xl mb-12 tracking-tight">What people say</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="t in (testimonialsData?.docs ?? [])"
            :key="t.id"
            class="p-10 bg-surface rounded-[40px] shadow-sm hover:shadow-xl transition-all text-left group"
          >
            <svg class="h-10 w-10 text-amber mb-8 opacity-30 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <p class="font-body text-on-surface-variant text-lg italic mb-10 leading-relaxed">"{{ t.quote }}"</p>
            <div v-if="t.organization" class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                <img v-if="t.avatar?.url" :src="t.avatar.url" :alt="t.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gradient-to-br from-primary/20 to-cyan/20"></div>
              </div>
              <div>
                <p class="font-bold text-on-surface">{{ t.name }}</p>
                <p class="text-xs uppercase tracking-widest text-primary font-bold mt-1">{{ [t.title, t.organization].filter(Boolean).join(', ') }}</p>
              </div>
            </div>
          </div>
        </div>
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
