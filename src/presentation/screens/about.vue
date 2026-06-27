<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <section
      class="py-32 bg-primary text-white relative overflow-hidden"
      :style="headerBgStyle"
    >
      <div class="absolute inset-0 bg-primary/80 pointer-events-none"></div>
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-white"></div>
        <div class="absolute left-10 bottom-10 w-80 h-80 hex-mask border-2 border-white/20"></div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-3xl">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6">
          {{ pageData?.header?.eyebrow ?? 'Who We Are' }}
        </p>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight tracking-tight">
          {{ pageData?.header?.heading ?? 'Empowering Rural Resilience' }}
          <span class="text-leaf-300 italic block">{{ pageData?.header?.headingEmphasis ?? 'Globally.' }}</span>
        </h1>
        <p class="text-lg md:text-xl text-white/80 max-w-3xl font-body leading-relaxed">
          {{ pageData?.header?.body ?? 'RuralNexus is an international network of researchers, agronomists, and project managers dedicated to empowering rural resilience through evidence-based innovation.' }}
        </p>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="py-24 bg-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="font-display text-3xl lg:text-4xl font-bold text-on-surface mb-16 tracking-tight">
          {{ pageData?.missionVision?.heading ?? 'Our Mission & Vision' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div class="p-10 bg-primary text-white rounded-[40px] relative overflow-hidden">
            <div class="absolute -right-10 -top-10 w-40 h-40 hex-mask bg-white/5"></div>
            <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6">Mission</p>
            <p class="text-lg font-body leading-relaxed text-white/90">
              {{ pageData?.missionVision?.mission ?? 'Our mission is to advance sustainable agrifood systems and inclusive rural transformation through transdisciplinary research, multi-stakeholder collaboration, and innovation that connects scientific knowledge with local action.' }}
            </p>
          </div>
          <div class="p-10 bg-surface-container-low rounded-[40px] border border-outline-variant/10">
            <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-6">Vision</p>
            <p class="text-lg font-body leading-relaxed text-on-surface-variant">
              {{ pageData?.missionVision?.vision ?? 'A world where rural communities are empowered to co-create resilient food systems, equitable value chains, and adaptive livelihoods — grounded in knowledge sovereignty and environmental stewardship.' }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Approach / How We Work -->
    <section class="py-24 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mb-10">
          <h2 class="font-display text-3xl lg:text-4xl font-bold text-on-surface mb-6 tracking-tight">
            {{ pageData?.approachSection?.heading ?? 'How We Work' }}
          </h2>
          <p class="text-on-surface-variant font-body leading-relaxed text-lg opacity-80">
            {{ pageData?.approachSection?.body ?? 'RuralNexus operates at the intersection of research, policy, and practice. We work across multiple program areas — each addressing a critical dimension of sustainable rural transformation — and our approach is built on collaboration, evidence, and local ownership.' }}
          </p>
        </div>

        <!-- Bullet points -->
        <ul class="mb-16 space-y-3 max-w-2xl">
          <li
            v-for="(item, i) in (pageData?.approachSection?.whatWeDoBullets ?? defaultBullets)"
            :key="i"
            class="flex items-start gap-3"
          >
            <span class="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-leaf"></span>
            <span class="text-on-surface-variant font-body leading-relaxed">{{ item.bullet }}</span>
          </li>
        </ul>

        <!-- What We Do? subheading + PA boxes -->
        <h3 class="font-display text-2xl font-bold text-on-surface mb-8">
          {{ pageData?.approachSection?.whatWeDoSubheading ?? 'What We Do?' }}
        </h3>
        <div v-if="programs?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div
            v-for="program in programs"
            :key="program.id"
            class="bg-white p-7 rounded-[28px] border border-outline-variant/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div
              class="w-10 h-10 hex-mask flex items-center justify-center text-white font-display font-bold text-sm mb-4 flex-shrink-0"
              :style="{ backgroundColor: getColor(program.colorTheme) }"
            >{{ program.code }}</div>
            <h4 class="font-display font-bold text-on-surface mb-2 leading-snug">{{ program.title }}</h4>
            <p class="text-sm text-on-surface-variant font-body opacity-70 leading-relaxed flex-grow">
              {{ program.shortDescription || program.description }}
            </p>
            <NuxtLink
              :to="`/programs/${program.slug}`"
              class="mt-4 text-xs font-bold text-primary uppercase tracking-widest hover:underline inline-flex items-center gap-1"
            >
              See more →
            </NuxtLink>
          </div>
        </div>
        <!-- Fallback pillars if no programs data -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div
            v-for="(pillar, i) in (pageData?.approachSection?.pillars ?? defaultPillars)"
            :key="i"
            class="bg-white p-8 rounded-[32px] border border-outline-variant/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div class="w-12 h-12 hex-mask bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg mb-6">
              {{ i + 1 }}
            </div>
            <h3 class="font-display font-bold text-on-surface mb-3">{{ pillar.title }}</h3>
            <p class="text-sm text-on-surface-variant font-body opacity-70 leading-relaxed">{{ pillar.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Where We Work -->
    <section class="py-24 bg-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="font-display text-3xl lg:text-4xl font-bold text-on-surface mb-6 tracking-tight">
          {{ pageData?.geographySection?.heading ?? 'Where We Work' }}
        </h2>
        <p class="text-on-surface-variant font-body leading-relaxed text-lg opacity-80 mb-10 max-w-2xl">
          {{ pageData?.geographySection?.body ?? 'Our interventions span Sub-Saharan Africa, with active field hubs across the continent.' }}
        </p>

        <!-- World Map -->
        <div class="mb-12">
          <MapTilerInterventionMap :countries="interventionCountries ?? []" />
        </div>

        <!-- Regions list + stats -->
        <!-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div class="space-y-4">
            <div
              v-for="region in (pageData?.geographySection?.regions ?? defaultRegions)"
              :key="region.name"
              class="flex items-start gap-4 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/5"
            >
              <div class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p class="font-bold text-sm text-on-surface">{{ region.name }}</p>
                <p class="text-xs text-on-surface-variant opacity-60 mt-0.5">{{ region.countries }}</p>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="p-8 bg-primary text-white rounded-[32px] text-center">
              <p class="font-display text-4xl font-bold text-leaf-300 mb-2">10+</p>
              <p class="text-sm font-bold text-white/70 uppercase tracking-widest">Countries</p>
            </div>
            <div class="p-8 bg-surface-container-low rounded-[32px] text-center border border-outline-variant/10">
              <p class="font-display text-4xl font-bold text-primary mb-2">50+</p>
              <p class="text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">Publications</p>
            </div>
            <div class="p-8 bg-surface-container-low rounded-[32px] text-center border border-outline-variant/10">
              <p class="font-display text-4xl font-bold text-primary mb-2">20+</p>
              <p class="text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">Field Projects</p>
            </div>
            <div class="p-8 bg-primary/5 rounded-[32px] text-center border border-primary/10">
              <p class="font-display text-4xl font-bold text-primary mb-2">15+</p>
              <p class="text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">Years Active</p>
            </div>
          </div>
        </div> -->
      </div>
    </section>

    <!-- Core Values -->
    <section class="py-24 bg-primary text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -left-24 -bottom-24 w-96 h-96 hex-mask bg-white"></div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 class="font-display text-3xl lg:text-4xl font-bold text-white mb-16 tracking-tight">
          {{ pageData?.valuesSection?.heading ?? 'Our Core Values' }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(val, i) in (pageData?.valuesSection?.values ?? defaultValues)"
            :key="i"
            class="p-8 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/10 transition-colors"
          >
            <div class="w-10 h-10 hex-mask bg-leaf flex items-center justify-center mb-6"></div>
            <h3 class="font-display font-bold text-white mb-3">{{ val.title }}</h3>
            <p class="text-sm text-white/70 font-body leading-relaxed">{{ val.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 bg-surface-container-low">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="font-display text-3xl font-bold text-on-surface mb-6 tracking-tight">Work With Us</h2>
        <p class="text-on-surface-variant font-body leading-relaxed opacity-70 mb-10">
          Whether you're a researcher, donor, government agency, or farmer organization — there's a role for you in the RuralNexus network.
        </p>
        <NuxtLink to="/contact" class="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[22px] font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
          Get In Touch
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePayloadLivePreview } from '../composables/usePayloadLivePreview'
import { HttpProgramAreaRepository } from '@infrastructure/repositories/HttpProgramAreaRepository'
import { HttpPartnersRepository, type InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'
import MapTilerInterventionMap from '../components/MapTilerInterventionMap.vue'
import { COLOR_PALETTE } from '../constants/colorPalette'

type AboutPillar = { title: string; description: string }
type AboutRegion = { name: string; countries: string }
type AboutValue = { title: string; description: string }

type AboutPageGlobal = {
  header?: {
    eyebrow?: string
    heading?: string
    headingEmphasis?: string
    body?: string
    backgroundImage?: { url?: string } | null
  }
  missionVision?: { heading?: string; mission?: string; vision?: string }
  approachSection?: {
    heading?: string
    body?: string
    whatWeDoSubheading?: string
    whatWeDoBullets?: { bullet: string }[]
    pillars?: AboutPillar[]
  }
  geographySection?: { heading?: string; body?: string; regions?: AboutRegion[] }
  valuesSection?: { heading?: string; values?: AboutValue[] }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } }
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const programRepo = new HttpProgramAreaRepository(apiBase)
const partnersRepo = new HttpPartnersRepository(apiBase)

const { data: rawPage } = useAsyncData('about-page-global', () =>
  $fetch<AboutPageGlobal>(`${apiBase}/api/globals/about-page`),
)
const { data: programs } = useAsyncData('about-programs', () => programRepo.getAll())
const { data: interventionCountries } = useAsyncData('about-intervention-countries', () =>
  partnersRepo.getInterventionCountries(),
)

const { previewData: pageData } = usePayloadLivePreview<AboutPageGlobal>(rawPage)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'Who We Are — RuralNexus',
  meta: [
    { name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' },
    { property: 'og:image', content: () => pageData.value?.seo?.ogImage?.url ?? '' },
  ],
})

const COLOR_HEX: Record<string, string> = COLOR_PALETTE
function getColor(theme: string): string {
  return COLOR_HEX[theme] ?? COLOR_HEX.primary ?? '#1a4314'
}

const headerBgStyle = computed(() => {
  const url = pageData.value?.header?.backgroundImage?.url
    ?? 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1400&q=80'
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
})

const defaultBullets = [
  { bullet: 'Design and implement transdisciplinary research programmes in agrifood systems' },
  { bullet: 'Facilitate multi-stakeholder innovation platforms connecting researchers, farmers, and policymakers' },
  { bullet: 'Co-develop context-specific tools and methodologies for sustainable rural transformation' },
  { bullet: 'Provide technical assistance, capacity building, and institutional strengthening' },
  { bullet: 'Publish and disseminate open-access knowledge resources for the global development community' },
]

const defaultPillars: AboutPillar[] = [
  { title: 'Participatory Action Research', description: 'We involve communities as co-investigators ensuring research reflects lived realities.' },
  { title: 'Multi-Stakeholder Platforms', description: 'We convene farmers, researchers, and policymakers to co-create scalable innovations.' },
  { title: 'Knowledge Sovereignty', description: 'Communities retain ownership of the innovations and tools co-developed with them.' },
  { title: 'Evidence-Based Scaling', description: 'Every intervention is rigorously assessed for adoption potential before wider dissemination.' },
]

const defaultRegions: AboutRegion[] = [
  { name: 'West Africa', countries: 'Burkina Faso, Ghana, Niger, Cameroon' },
  { name: 'East Africa', countries: 'Tanzania, Uganda, Kenya, Ethiopia' },
  { name: 'Southern Africa', countries: 'Zambia, Angola' },
  { name: 'Indian Ocean', countries: 'Madagascar' },
]

const defaultValues: AboutValue[] = [
  { title: 'Community First', description: 'Every decision is filtered through the question: does this serve the communities we work with?' },
  { title: 'Scientific Integrity', description: 'We uphold rigorous research standards while staying responsive to real-world complexity.' },
  { title: 'Inclusivity', description: 'We actively amplify the voices of women, youth, and marginalized groups within innovation systems.' },
]
</script>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}
</style>
