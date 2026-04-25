<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Check, MapPin } from 'lucide-vue-next'
import { lexicalToHtml } from '../../utils/lexicalToHtml'

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string
const slug = route.params.slug as string

const SDG_META: Record<number, { title: string; color: string }> = {
  1: { title: 'No Poverty', color: '#E5243B' }, 2: { title: 'Zero Hunger', color: '#DDA63A' },
  3: { title: 'Good Health', color: '#4C9F38' }, 4: { title: 'Quality Education', color: '#C5192D' },
  5: { title: 'Gender Equality', color: '#FF3A21' }, 6: { title: 'Clean Water', color: '#26BDE2' },
  7: { title: 'Affordable Energy', color: '#FCC30B' }, 8: { title: 'Decent Work', color: '#A21942' },
  9: { title: 'Industry & Innovation', color: '#FD6925' }, 10: { title: 'Reduced Inequalities', color: '#DD1367' },
  11: { title: 'Sustainable Cities', color: '#FD9D24' }, 12: { title: 'Responsible Consumption', color: '#BF8B2E' },
  13: { title: 'Climate Action', color: '#3F7E44' }, 14: { title: 'Life Below Water', color: '#0A97D9' },
  15: { title: 'Life on Land', color: '#56C02B' }, 16: { title: 'Peace & Justice', color: '#00689D' },
  17: { title: 'Partnerships for Goals', color: '#19486A' },
}

type PayloadProgram = {
  id: string; code: string; title: string; slug: string; description: string; color: string
  heroImage?: { url?: string; alt?: string } | null
  longDescription?: unknown; methodologySection?: unknown
  sdgs?: { goal: number }[]
  initiatives?: { title: string; description: string; location?: string | null; status?: string | null; stat?: string | null }[]
  seo?: { title?: string; description?: string; ogImage?: { url?: string } | null } | null
}

const { data } = await useAsyncData(`program-${slug}`, () =>
  $fetch<{ docs: PayloadProgram[] }>(
    `${apiBase}/api/programs?where[slug][equals]=${slug}&depth=2&limit=1`,
  ),
)

const program = computed(() => data.value?.docs[0] ?? null)

if (!program.value) {
  throw createError({ statusCode: 404, statusMessage: 'Program not found' })
}

useHead({
  title: () => `${program.value?.seo?.title ?? program.value?.title} — RuralNexus Programs`,
  meta: [
    { name: 'description', content: () => program.value?.seo?.description ?? program.value?.description ?? '' },
    { property: 'og:image', content: () => program.value?.seo?.ogImage?.url ?? '' },
  ],
})

const longDescHtml = computed(() => lexicalToHtml(program.value?.longDescription))
const methodologyHtml = computed(() => lexicalToHtml(program.value?.methodologySection))

const COLOR_CLASS: Record<string, string> = {
  cyan: 'bg-cyan', primary: 'bg-primary-container', navy: 'bg-primary',
  amber: 'bg-amber', leaf: 'bg-leaf', emerald: 'bg-emerald-600',
}
</script>

<template>
  <div v-if="program" class="bg-surface min-h-screen">
    <!-- Back nav -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      <NuxtLink to="/programs" class="inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
        <ArrowLeft class="w-4 h-4" /> All Programs
      </NuxtLink>
    </div>

    <!-- Hero -->
    <header class="relative overflow-hidden bg-primary text-white py-24 mt-10">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-white" />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="inline-flex items-center justify-center w-20 h-20 hex-mask text-white font-display font-bold text-3xl mb-8 shadow-2xl"
          :class="COLOR_CLASS[program.color] ?? 'bg-primary-container'"
        >
          {{ program.code }}
        </div>
        <h1 class="font-display text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
          {{ program.title }}
        </h1>
        <p class="text-lg md:text-xl font-body text-white/80 leading-relaxed max-w-3xl">
          {{ program.description }}
        </p>

        <!-- SDGs -->
        <div v-if="program.sdgs?.length" class="flex flex-wrap gap-2 mt-10">
          <span
            v-for="s in program.sdgs"
            :key="s.goal"
            class="px-4 py-1.5 text-[10px] font-bold text-white rounded-xl shadow-lg"
            :style="{ backgroundColor: SDG_META[s.goal]?.color ?? '#555' }"
          >
            SDG {{ s.goal }} · {{ SDG_META[s.goal]?.title ?? `Goal ${s.goal}` }}
          </span>
        </div>
      </div>
    </header>

    <!-- Body -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-20">

      <!-- Long description -->
      <section v-if="longDescHtml">
        <h2 class="font-display text-2xl font-bold text-on-surface mb-6">About This Program</h2>
        <div v-html="longDescHtml" class="prose-like font-body text-on-surface" />
      </section>

      <!-- Methodology -->
      <section v-if="methodologyHtml">
        <h2 class="font-display text-2xl font-bold text-on-surface mb-6">Our Methodology</h2>
        <div v-html="methodologyHtml" class="prose-like font-body text-on-surface" />
      </section>

      <!-- Initiatives -->
      <section v-if="program.initiatives?.length">
        <h2 class="font-display text-2xl font-bold text-on-surface mb-10">Field Initiatives</h2>
        <div class="grid gap-8 md:grid-cols-2">
          <div
            v-for="init in program.initiatives"
            :key="init.title"
            class="p-8 bg-surface-container-lowest rounded-[32px] border border-outline-variant/10"
          >
            <div class="flex items-start gap-4 mb-4">
              <div class="mt-1 w-6 h-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Check class="w-3.5 h-3.5" />
              </div>
              <h3 class="font-display font-bold text-lg text-on-surface">{{ init.title }}</h3>
            </div>
            <p class="text-sm font-body text-on-surface-variant opacity-70 leading-relaxed mb-4">{{ init.description }}</p>
            <div class="flex flex-wrap gap-4 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
              <span v-if="init.location" class="flex items-center gap-1.5"><MapPin class="w-3 h-3" /> {{ init.location }}</span>
              <span v-if="init.status" class="px-3 py-1 bg-surface-container-low rounded-full">{{ init.status }}</span>
              <span v-if="init.stat" class="text-primary">{{ init.stat }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.hex-mask { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
.prose-like :deep(p) { @apply mb-5 text-on-surface-variant leading-relaxed; }
.prose-like :deep(h2), .prose-like :deep(h3) { @apply font-display font-bold text-on-surface mt-8 mb-3; }
</style>
