<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import {
  Droplets, Sprout, ShieldAlert, BookOpen, Tractor, Heart,
  Layers, Rocket, Globe, Target, Zap, Users, Check, FileText,
  Info, BarChart3, MapPin, MessageSquareQuote, Quote, ExternalLink,
} from 'lucide-vue-next'
import { lexicalToHtml } from '../utils/lexicalToHtml'
import DetailModal from '../components/DetailModal.vue'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

type ProjectsPageGlobal = {
  header?: { eyebrow?: string; heading?: string; body?: string }
  ctaSection?: { heading?: string; body?: string; ctaLabel?: string; ctaPath?: string }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } | null }
}

const { data: pageData } = useAsyncData('projects-page-global', () =>
  $fetch<ProjectsPageGlobal>(`${apiBase}/api/globals/projects-page`).catch(() => ({} as ProjectsPageGlobal)),
)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'Active Projects — RuralNexus',
  meta: [{ name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' }],
})

const ICON_MAP: Record<string, Component> = {
  Droplets, Sprout, ShieldAlert, BookOpen, Tractor, Heart,
  Layers, Rocket, Globe, Target, Zap, Users, Check, FileText,
  Info, BarChart3, MapPin, MessageSquareQuote, Quote, ExternalLink,
}

type Initiative = {
  title: string; slug: string; description: string
  stat?: string | null; location?: string | null; status?: string | null; icon?: string | null
  heroImage?: { url?: string } | null
  longDescription?: unknown
  link?: { linkLabel?: string; linkUrl?: string } | null
  program: { id: string; title: string; slug: string; code: string; color: string }
}

const { data: initiativesData } = await useAsyncData('projects-initiatives', () =>
  $fetch<{ docs: Initiative[] }>(`${apiBase}/api/initiatives?showcase=true`),
)

type ImpactPageGlobal = {
  assessmentSection?: {
    badges?: { value: string; label: string; description?: string | null; icon?: string | null }[]
  }
}

const { data: metricsData } = useAsyncData('impact-metrics', () =>
  $fetch<ImpactPageGlobal>(`${apiBase}/api/globals/impact-page`).catch(() => ({} as ImpactPageGlobal)),
)

const metricItems = computed(() =>
  (metricsData.value?.assessmentSection?.badges ?? []).map(b => ({
    metric: b.label,
    value: b.value,
    description: b.description ?? null,
    icon: b.icon ?? null,
  })),
)

const projects = computed(() =>
  (initiativesData.value?.docs ?? []).map((i, idx) => ({
    id: `${i.program.slug}-${idx}`,
    title: i.title,
    description: i.description,
    stat: i.stat ?? '',
    location: i.location ?? '',
    status: i.status ?? 'Active',
    icon: ICON_MAP[i.icon ?? ''] ?? Layers,
    programSlug: i.program.slug,
    programTitle: i.program.title,
    slug: i.slug,
    heroImage: i.heroImage ?? null,
    longDescription: i.longDescription ?? null,
    link: i.link ?? null,
  })),
)

const selectedProject = ref<typeof projects.value[number] | null>(null)
const selectedProjectHtml = computed(() => lexicalToHtml(selectedProject.value?.longDescription))
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
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6">{{ pageData?.header?.eyebrow ?? 'What We Do' }}</p>
          <h1 class="font-display text-5xl md:text-6xl font-bold leading-tight mb-8">
            <span class="text-leaf-300 italic">{{ pageData?.header?.heading ?? 'Active Projects' }}</span>
          </h1>
          <p class="font-body text-lg md:text-xl text-white/80 leading-relaxed balance">
            {{ pageData?.header?.body ?? 'Field initiatives and development projects currently underway across our program areas.' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Track Record -->
    <ImpactMetrics :items="metricItems" />
    <section class="pb-4 -mt-12 relative z-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-xs font-body text-on-surface-variant opacity-50 leading-relaxed italic">
          These figures reflect the past and ongoing track record of RuralNexus's CEO and other team members,
          accumulated across previous leadership roles, research engagements, and organizational affiliations —
          they are not exclusively attributable to RuralNexus's own direct projects.
        </p>
      </div>
    </section>

    <!-- Projects Grid -->
    <main class="flex-grow py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article
            v-for="proj in projects"
            :key="proj.id"
            class="group bg-surface-container-lowest p-8 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <div class="flex items-center justify-between mb-8">
              <div class="w-14 h-14 hex-mask bg-primary/5 group-hover:bg-primary transition-colors flex items-center justify-center text-primary group-hover:text-white">
                <component :is="proj.icon" class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-bold px-3 py-1 bg-surface-container-low rounded-full uppercase tracking-widest text-on-surface-variant">
                {{ proj.status }}
              </span>
            </div>
            <h3 class="text-lg font-display font-bold text-on-surface mb-3">{{ proj.title }}</h3>
            <p class="text-sm font-body text-on-surface-variant leading-relaxed opacity-70 mb-8">
              {{ proj.description }}
            </p>
            <div class="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant mb-6 opacity-50 uppercase tracking-widest">
              <MapPin class="w-3 h-3" /> {{ proj.location }}
            </div>
            <div class="border-t border-outline-variant/10 pt-6 flex items-end justify-between gap-4">
              <div>
                <p class="text-xl font-display font-bold text-primary mb-0.5">{{ proj.stat }}</p>
                <p class="text-[11px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest">Impact metric</p>
              </div>
              <button
                type="button"
                class="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline inline-flex items-center gap-1 flex-shrink-0"
                @click="selectedProject = proj"
              >
                View details →
              </button>
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

    <!-- ── Project detail modal ──────────────────────────────────────── -->
    <DetailModal :open="!!selectedProject" @close="selectedProject = null">
      <template v-if="selectedProject">
        <div v-if="selectedProject.heroImage?.url" class="w-full h-44 rounded-2xl overflow-hidden mb-5 -mt-2">
          <img :src="selectedProject.heroImage.url" :alt="selectedProject.title" class="w-full h-full object-cover" />
        </div>
        <div class="flex items-center justify-between gap-4 mb-4">
          <h3 class="font-display font-bold text-xl leading-tight">{{ selectedProject.title }}</h3>
          <span class="text-[10px] font-bold px-3 py-1 bg-surface-container rounded-full uppercase tracking-widest text-on-surface-variant flex-shrink-0">
            {{ selectedProject.status }}
          </span>
        </div>
        <p v-if="selectedProject.location" class="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-4">
          <MapPin class="w-3.5 h-3.5" /> {{ selectedProject.location }} · {{ selectedProject.programTitle }}
        </p>
        <p class="text-sm font-body text-on-surface-variant leading-relaxed mb-5">
          {{ selectedProject.description }}
        </p>
        <div v-if="selectedProjectHtml" v-html="selectedProjectHtml" class="prose-like font-body text-sm text-on-surface-variant mb-5" />
        <div v-if="selectedProject.stat" class="border-t border-outline-variant/10 pt-5 mb-5">
          <p class="text-xl font-display font-bold text-primary mb-0.5">{{ selectedProject.stat }}</p>
          <p class="text-[11px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest">Impact metric</p>
        </div>
        <a
          v-if="selectedProject.link?.linkUrl"
          :href="selectedProject.link.linkUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
        >
          {{ selectedProject.link.linkLabel || 'Learn more' }} <ExternalLink class="w-3.5 h-3.5" />
        </a>
      </template>
    </DetailModal>
  </div>
</template>

<style scoped>
.hex-mask { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
.balance { text-wrap: balance; }
</style>
