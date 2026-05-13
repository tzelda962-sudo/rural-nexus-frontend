<template>
  <div class="flex flex-col">
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center justify-center bg-primary-container overflow-hidden">
      <div class="absolute inset-0 z-0 opacity-20">
        <img
          :src="page?.hero?.backgroundImage?.url ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80'"
          alt="Agriculture Background"
          class="w-full h-full object-cover mix-blend-overlay"
        />
      </div>
      <div class="absolute top-1/4 left-10 w-64 h-64 border-4 border-leaf/30 rounded-lg transform rotate-12 pointer-events-none animate-floaty"></div>
      <div class="absolute bottom-1/4 right-10 w-96 h-96 hex-mask bg-cyan/10 pointer-events-none"></div>

      <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div class="mb-6 flex flex-wrap justify-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-leaf animate-floaty">
          <template v-for="(tag, i) in page?.hero?.eyebrowTags ?? []" :key="i">
            <span>{{ tag.value }}</span>
            <span v-if="i < (page?.hero?.eyebrowTags?.length ?? 1) - 1"> • </span>
          </template>
        </div>
        <h1 class="font-display font-bold text-5xl md:text-7xl leading-[1.1] mb-8 balance">
          {{ page?.hero?.headlineLine1 }} <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-leaf to-cyan italic">{{ page?.hero?.headlineEmphasis }}</span> <br/>
          {{ page?.hero?.headlineLine2 }}
        </h1>
        <p class="font-body text-lg md:text-xl text-surface-dim max-w-3xl mx-auto mb-12 leading-relaxed opacity-90">
          {{ page?.hero?.subtitle }}
        </p>
        <div class="flex flex-col sm:flex-row gap-6 justify-center">
          <NuxtLink
            :to="page?.hero?.secondaryCta?.path ?? '/about'"
            class="px-10 py-5 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/5 transition-all backdrop-blur-sm"
          >
            {{ page?.hero?.secondaryCta?.label ?? 'Who We Are' }}
          </NuxtLink>
          <NuxtLink
            :to="page?.hero?.primaryCta?.path ?? '/programs'"
            class="group px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3"
          >
            {{ page?.hero?.primaryCta?.label ?? 'Explore Our Programs' }}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </NuxtLink>
          
        </div>
      </div>
    </section>

    <!-- Who We Are Section -->
    <section class="py-24 bg-surface text-on-surface relative overflow-hidden">
      <div class="absolute -right-24 top-1/2 w-64 h-64 hex-mask bg-primary opacity-5 transform -translate-y-1/2"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-6">
              {{ page?.whoWeAre?.eyebrow ?? 'Global Identity' }}
            </p>
            <h2 class="font-display font-bold text-4xl lg:text-5xl mb-8 leading-tight tracking-tight">
              {{ page?.whoWeAre?.headingLine1 }} <br/>
              {{ page?.whoWeAre?.headingLine2Prefix }}
              <span class="text-leaf-600 italic"> {{ page?.whoWeAre?.headingLine2Emphasis }}</span>
              {{ page?.whoWeAre?.headingLine2Suffix }}
            </h2>
            <p class="text-lg text-on-surface-variant font-body mb-8 leading-relaxed opacity-80">
              {{ page?.whoWeAre?.body }}
            </p>
            <div class="grid grid-cols-2 gap-8 mb-10">
              <div v-for="stat in page?.whoWeAre?.stats ?? []" :key="stat.label">
                <p class="text-4xl font-display font-bold text-primary mb-2">{{ stat.value }}</p>
                <p class="text-sm font-bold text-on-surface-variant uppercase tracking-widest opacity-60">{{ stat.label }}</p>
              </div>
            </div>
            <NuxtLink
              :to="page?.whoWeAre?.ctaPath ?? '/about'"
              class="inline-flex items-center gap-3 text-primary font-bold text-sm tracking-[0.2em] uppercase hover:text-primary-container transition-all group"
            >
              {{ page?.whoWeAre?.ctaLabel ?? 'Meet the Leadership' }}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </NuxtLink>
          </div>
          <div class="relative">
            <div class="aspect-square bg-surface-container-low rounded-[60px] overflow-hidden hex-mask shadow-2xl relative z-10">
              <img
                :src="page?.whoWeAre?.image?.url ?? '/who-we-are-background.jpeg'"
                alt="Rural Innovation"
                class="w-full h-full object-cover"
              />
            </div>
            <!-- Floating Badge -->
            <div class="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-xl z-20 max-w-[240px]">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-leaf rounded-full flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <span class="font-bold text-sm text-on-surface">{{ page?.whoWeAre?.floatingBadge?.title ?? 'Scientific Rigor' }}</span>
              </div>
              <p class="text-xs text-on-surface-variant font-body">{{ page?.whoWeAre?.floatingBadge?.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-24 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="font-display font-bold text-4xl mb-12 tracking-tight">
          {{ page?.testimonialsSection?.heading ?? '"They say about us"' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="t in (testimonialsData?.docs ?? [])" :key="t.id" class="p-10 bg-surface rounded-[40px] shadow-sm hover:shadow-xl transition-all text-left group">
            <svg class="h-10 w-10 text-amber mb-8 opacity-30 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
            <p class="font-body text-on-surface-variant text-lg italic mb-10 leading-relaxed">"{{ t.quote }}"</p>
            <div class="flex items-center gap-4" v-if="t.organization">
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

    <!-- News & Highlights -->
    <section class="py-24 bg-surface relative overflow-hidden">
      <div class="absolute -left-32 top-0 w-[500px] h-[500px] hex-mask bg-surface-container-highest opacity-50 pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 class="font-display font-bold text-4xl mb-12 tracking-tight">
          {{ page?.newsSection?.heading ?? 'Latest Insights & Reports' }}
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div class="lg:col-span-7 flex flex-col gap-4">
            <NewsCard
              v-for="event in latestEvents"
              :key="event.id"
              :event="event"
            />
          </div>
          <div class="lg:col-span-5 flex flex-col gap-6">
            <div
              v-for="highlight in highlights"
              :key="highlight.id"
              class="p-10 rounded-[40px] bg-gradient-to-br from-primary-container to-primary text-white shadow-2xl relative overflow-hidden group"
            >
              <div class="absolute -right-10 -top-10 w-32 h-32 hex-mask bg-white/10 group-hover:scale-110 transition-transform"></div>
              <span class="inline-block px-4 py-1.5 bg-amber-500 text-on-tertiary-container text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-6">
                {{ highlight.highlightCategory }}
              </span>
              <h3 class="font-display font-bold text-2xl mb-4 leading-snug">{{ highlight.title }}</h3>
              <p class="opacity-80 font-body text-sm leading-relaxed mb-6">{{ highlight.summary }}</p>
              <NuxtLink :to="`/news/${(highlight as any).slug ?? highlight.id}`" class="text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Read Article <span>&rarr;</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & SDGs -->
    <section class="py-24 bg-navy text-white relative overflow-hidden">
      <div class="absolute -right-20 top-20 w-64 h-64 hex-mask bg-cyan/10 animate-floaty"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 class="font-display font-bold text-4xl mb-6">
            {{ page?.missionSdgSection?.heading ?? 'Aligned with the Global Goals' }}
          </h2>
          <p class="font-body text-lg opacity-80 mb-8 leading-relaxed">
            {{ page?.missionSdgSection?.body }}
          </p>
          <NuxtLink
            :to="page?.missionSdgSection?.ctaPath ?? '/research'"
            class="inline-flex items-center gap-2 border-b-2 border-leaf pb-1 font-bold hover:text-leaf transition-colors text-lg"
          >
            {{ page?.missionSdgSection?.ctaLabel ?? 'Read our 2026 Impact Report →' }}
          </NuxtLink>
        </div>

        <div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <a
              v-for="sdg in page?.missionSdgSection?.featuredSdgs ?? []"
              :key="sdg.goal"
              :href="SDG_LINKS[sdg.goal]"
              target="_blank"
              rel="noopener noreferrer"
              class="aspect-square p-4 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all group"
              :style="{ backgroundColor: SDG_COLORS[sdg.goal] ?? '#555' }"
            >
              <span class="font-bold text-xl text-white">{{ sdg.goal }}</span>
              <span class="font-display font-bold text-sm uppercase leading-tight text-white">{{ SDG_NAMES[sdg.goal] }}</span>
            </a>
          </div>
          <a
            href="https://www.un.org/sustainabledevelopment/sustainable-development-goals/"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 border border-white/30 text-white text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
          >
            View all 17 Goals
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
          </a>
        </div>
      </div>
    </section>

    <!-- Partners -->
    <section class="py-16 bg-surface-container-lowest border-t border-b border-surface-variant">
      <div class="max-w-7xl mx-auto px-4 text-center overflow-hidden">
        <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-10">
          {{ page?.partnersSection?.heading ?? 'Collaborating with global leaders & research institutions' }}
        </p>

        <div class="flex animate-[pulse_4s_ease-in-out_infinite] gap-12 sm:gap-24 opacity-50 grayscale justify-center flex-wrap">
          <div
            v-for="partner in page?.partnersSection?.partners ?? []"
            :key="partner.name"
            class="font-display font-bold text-2xl flex items-center gap-2"
          >
            <div v-if="partner.logoImage?.url" class="h-8 w-auto">
              <img :src="partner.logoImage.url" :alt="partner.name" class="h-full w-auto object-contain" />
            </div>
            <span v-else>{{ partner.name }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { GetHomeDataUseCase } from '@application/use_cases/GetHomeDataUseCase'
import { HttpProgramAreaRepository } from '@infrastructure/repositories/HttpProgramAreaRepository'
import { HttpNewsEventRepository } from '@infrastructure/repositories/HttpNewsEventRepository'
import { MockTeamRepository } from '@infrastructure/repositories/MockTeamRepository'
import { usePayloadLivePreview } from '../composables/usePayloadLivePreview'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const SDG_COLORS: Record<number, string> = {
  1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D', 5: '#FF3A21',
  6: '#26BDE2', 7: '#FCC30B', 8: '#A21942', 9: '#FD6925', 10: '#DD1367',
  11: '#FD9D24', 12: '#BF8B2E', 13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B',
  16: '#00689D', 17: '#19486A',
}
const SDG_NAMES: Record<number, string> = {
  1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health & Well-Being', 4: 'Quality Education',
  5: 'Gender Equality', 6: 'Clean Water & Sanitation', 7: 'Affordable & Clean Energy', 8: 'Decent Work & Economic Growth',
  9: 'Industry, Innovation & Infrastructure', 10: 'Reduced Inequalities', 11: 'Sustainable Cities & Communities',
  12: 'Responsible Consumption & Production', 13: 'Climate Action', 14: 'Life Below Water',
  15: 'Life on Land', 16: 'Peace, Justice & Strong Institutions', 17: 'Partnerships for the Goals',
}
const SDG_LINKS: Record<number, string> = {
  1: 'https://www.un.org/sustainabledevelopment/poverty/',
  2: 'https://www.un.org/sustainabledevelopment/hunger/',
  3: 'https://www.un.org/sustainabledevelopment/health/',
  4: 'https://www.un.org/sustainabledevelopment/education/',
  5: 'https://www.un.org/sustainabledevelopment/gender-equality/',
  6: 'https://www.un.org/sustainabledevelopment/water-and-sanitation/',
  7: 'https://www.un.org/sustainabledevelopment/energy/',
  8: 'https://www.un.org/sustainabledevelopment/economic-growth/',
  9: 'https://www.un.org/sustainabledevelopment/infrastructure-industrialization/',
  10: 'https://www.un.org/sustainabledevelopment/inequality/',
  11: 'https://www.un.org/sustainabledevelopment/cities/',
  12: 'https://www.un.org/sustainabledevelopment/sustainable-consumption-production/',
  13: 'https://www.un.org/sustainabledevelopment/climate-change/',
  14: 'https://www.un.org/sustainabledevelopment/oceans/',
  15: 'https://www.un.org/sustainabledevelopment/biodiversity/',
  16: 'https://www.un.org/sustainabledevelopment/peace-justice/',
  17: 'https://www.un.org/sustainabledevelopment/globalpartnerships/',
}

type HomePageGlobal = {
  hero?: {
    eyebrowTags?: { value: string }[]
    headlineLine1?: string; headlineEmphasis?: string; headlineLine2?: string
    subtitle?: string
    backgroundImage?: { url?: string } | null
    primaryCta?: { label?: string; path?: string }
    secondaryCta?: { label?: string; path?: string }
  }
  whoWeAre?: {
    eyebrow?: string
    headingLine1?: string; headingLine2Prefix?: string
    headingLine2Emphasis?: string; headingLine2Suffix?: string
    body?: string
    stats?: { value: string; label: string }[]
    ctaLabel?: string; ctaPath?: string
    image?: { url?: string } | null
    floatingBadge?: { title?: string; body?: string }
  }
  testimonialsSection?: { heading?: string }
  newsSection?: { heading?: string; latestEventsCount?: number; highlightsCount?: number }
  missionSdgSection?: {
    heading?: string; body?: string; ctaLabel?: string; ctaPath?: string
    featuredSdgs?: { goal: number }[]
  }
  partnersSection?: {
    heading?: string
    partners?: { name: string; style?: string; logoImage?: { url?: string } | null }[]
  }
}

type Testimonial = {
  id: string; quote: string; name: string; title?: string | null
  organization?: string | null; avatar?: { url?: string } | null
}

// Three fetches run in parallel on SSR
const { data: pageData } = useLazyAsyncData('home-page-global', () =>
  $fetch<HomePageGlobal>(`${apiBase}/api/globals/home-page`),
)
const { data: homeData } = useLazyAsyncData('homeData', () =>
  new GetHomeDataUseCase(
    new HttpProgramAreaRepository(apiBase),
    new HttpNewsEventRepository(apiBase),
    new MockTeamRepository(),
  ).execute(),
)
const { data: testimonialsData } = useLazyAsyncData('testimonials', () =>
  $fetch<{ docs: Testimonial[] }>(`${apiBase}/api/homepage-testimonials?limit=3&depth=1&sort=order`),
)

const { previewData: page } = usePayloadLivePreview<HomePageGlobal>(pageData)

const latestEvents = computed(() =>
  (homeData.value?.latestEvents ?? []).slice(0, page.value?.newsSection?.latestEventsCount ?? 4),
)
const highlights = computed(() =>
  (homeData.value?.highlightEvents ?? []).slice(0, page.value?.newsSection?.highlightsCount ?? 3),
)
</script>
