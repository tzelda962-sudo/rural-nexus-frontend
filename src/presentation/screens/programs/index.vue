<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAsyncData } from '#imports'
import { GetHomeDataUseCase } from '@application/use_cases/GetHomeDataUseCase'
import { HttpProgramAreaRepository } from '@infrastructure/repositories/HttpProgramAreaRepository'
import { HttpNewsEventRepository } from '@infrastructure/repositories/HttpNewsEventRepository'
import { MockTeamRepository } from '@infrastructure/repositories/MockTeamRepository'
import { Check, X, ArrowRight, Globe, Layers, ChevronRight } from 'lucide-vue-next'
import { usePayloadLivePreview } from '../../composables/usePayloadLivePreview'
import type { ProgramArea } from '@domain/entities/ProgramArea'

type ProgramsPageGlobal = {
  header: {
    eyebrow?: string
    headlinePrefix?: string
    headlineEmphasis?: string
    body?: string
  }
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { url?: string } }
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const { data: rawPage } = useAsyncData('programs-page-global', () =>
  $fetch<ProgramsPageGlobal>(`${apiBase}/api/globals/programs-page`),
)
const { data: homeData } = useAsyncData('programsPillars', () =>
  new GetHomeDataUseCase(
    new HttpProgramAreaRepository(apiBase),
    new HttpNewsEventRepository(apiBase),
    new MockTeamRepository(),
  ).execute(),
)

const { previewData: pageData } = usePayloadLivePreview<ProgramsPageGlobal>(rawPage)

useHead({
  title: () => pageData.value?.seo?.metaTitle ?? 'Our Programs: Structural Glue — RuralNexus',
  meta: [
    { name: 'description', content: () => pageData.value?.seo?.metaDescription ?? '' },
    { property: 'og:image', content: () => pageData.value?.seo?.ogImage?.url ?? '' },
  ],
})

// Color palette matching the CSS design tokens
type HexColors = { bg: string; glow: string; ring: string; light: string }
const DEFAULT_COLORS: HexColors = { bg: '#1a4314', glow: 'rgba(26,67,20,0.45)', ring: 'rgba(26,67,20,0.7)', light: 'rgba(26,67,20,0.12)' }
const COLOR_MAP: Record<string, HexColors> = {
  cyan:    { bg: '#06b6d4', glow: 'rgba(6,182,212,0.45)',   ring: 'rgba(6,182,212,0.7)',   light: 'rgba(6,182,212,0.12)' },
  primary: DEFAULT_COLORS,
  navy:    { bg: '#0B192C', glow: 'rgba(11,25,44,0.5)',     ring: 'rgba(11,25,44,0.7)',    light: 'rgba(11,25,44,0.10)' },
  amber:   { bg: '#f59e0b', glow: 'rgba(245,158,11,0.45)', ring: 'rgba(245,158,11,0.7)', light: 'rgba(245,158,11,0.12)' },
  leaf:    { bg: '#4ade80', glow: 'rgba(74,222,128,0.45)', ring: 'rgba(74,222,128,0.7)', light: 'rgba(74,222,128,0.12)' },
}
function getColors(theme: string): HexColors { return COLOR_MAP[theme] ?? DEFAULT_COLORS }

// Honeycomb row splitting: 3 → 2 → 3 → 2 …
const programRows = computed(() => {
  const programs = homeData.value?.programAreas ?? []
  const rows: ProgramArea[][] = []
  let i = 0, toggle = true
  while (i < programs.length) {
    const size = toggle ? 3 : 2
    rows.push(programs.slice(i, i + size))
    i += size
    toggle = !toggle
  }
  return rows
})

// Selected program & panel state
const selected = ref<ProgramArea | null>(null)
const activeProgram = computed(() => selected.value)
function toggleProgram(p: ProgramArea) {
  selected.value = selected.value?.id === p.id ? null : p
}
function closePanel() { selected.value = null }

// Intersection Observer for entrance animation
const gridRef = ref<HTMLElement | null>(null)
const gridVisible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => { if (entries[0]?.isIntersecting) { gridVisible.value = true; observer?.disconnect() } },
    { threshold: 0.08 },
  )
  if (gridRef.value) observer.observe(gridRef.value)
})
onUnmounted(() => observer?.disconnect())

// Fallback: if data arrives after the observer already fired (or never fired), show the grid
watch(homeData, (val) => {
  if (val?.programAreas?.length && !gridVisible.value) {
    gridVisible.value = true
  }
}, { immediate: true })

// Stagger index: flat index across all rows for animation delay
function staggerIndex(rowIdx: number, colIdx: number) {
  let n = colIdx
  for (let r = 0; r < rowIdx; r++) n += programRows.value[r]?.length ?? 0
  return n
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-surface">

    <!-- ── Hero ─────────────────────────────────────────────── -->
    <header class="relative pt-32 pb-52 overflow-hidden bg-primary text-white">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-white"></div>
        <div class="absolute right-48 top-48 w-64 h-64 hex-mask bg-leaf"></div>
        <div class="absolute left-10 bottom-10 w-80 h-80 hex-mask border-2 border-white/20"></div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-3xl">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf mb-6">
            {{ pageData?.header?.eyebrow ?? 'Our Structural Methodology' }}
          </p>
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight">
            {{ pageData?.header?.headlinePrefix ?? 'Our' }}
            <span class="text-leaf italic">{{ pageData?.header?.headlineEmphasis ?? 'Programs.' }}</span>
          </h1>
          <p class="text-lg md:text-xl font-body text-white/80 leading-relaxed py-4 max-w-2xl">
            {{ pageData?.header?.body ?? 'RuralNexus operates through strategic program areas that provide the structural glue needed for multi-stakeholder and transdisciplinary innovation.' }}
          </p>
          <div class="flex flex-wrap gap-8 mt-10 pt-10 border-t border-white/10">
            <div class="flex items-center gap-3">
              <Layers class="w-5 h-5 text-leaf" />
              <span class="text-sm font-bold tracking-widest uppercase">Pillar Based Action</span>
            </div>
            <div class="flex items-center gap-3">
              <Globe class="w-5 h-5 text-leaf" />
              <span class="text-sm font-bold tracking-widest uppercase">Transdisciplinary Scope</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ── Hexagonal Constellation ──────────────────────────── -->
    <section class="relative -mt-36 pb-32 z-20 overflow-hidden">

      <!-- Ambient background decorations -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div class="absolute top-20 left-8 w-72 h-72 hex-mask bg-primary/5 rotate-12 animate-slow-spin"></div>
        <div class="absolute bottom-10 right-0 w-96 h-96 hex-mask bg-leaf/5 -rotate-6 animate-slow-spin-reverse"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5 animate-pulse-ring"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-primary/5 animate-pulse-ring" style="animation-delay: 1.5s"></div>
      </div>

      <div ref="gridRef" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Mobile: animated card stack -->
        <div class="flex flex-col gap-6 lg:hidden">
          <button
            v-for="(program, i) in (homeData?.programAreas ?? [])"
            :key="program.id"
            class="mobile-card text-left"
            :class="{ 'mobile-card-visible': gridVisible, 'mobile-card-selected': selected?.id === program.id }"
            :style="{
              '--delay': `${i * 0.1}s`,
              '--accent': getColors(program.colorTheme).bg,
              '--glow': getColors(program.colorTheme).glow,
            } as any"
            @click="toggleProgram(program)"
          >
            <div class="flex items-center gap-4 mb-3">
              <div
                class="w-12 h-12 hex-mask flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0"
                :style="{ backgroundColor: getColors(program.colorTheme).bg }"
              >{{ program.code }}</div>
              <div class="min-w-0">
                <p class="font-display font-bold text-base leading-tight">{{ program.title }}</p>
                <p class="text-xs text-on-surface-variant opacity-60 uppercase tracking-wider mt-0.5">{{ program.code }}</p>
              </div>
              <ChevronRight
                class="w-5 h-5 text-on-surface-variant opacity-40 ml-auto flex-shrink-0 transition-transform duration-300"
                :class="{ 'rotate-90': selected?.id === program.id }"
              />
            </div>
            <!-- Mobile expand -->
            <div
              class="overflow-hidden transition-all duration-500"
              :style="{ maxHeight: selected?.id === program.id ? '1000px' : '0px' }"
            >
              <div class="pt-3 pb-1 space-y-4">
                <p class="text-sm text-on-surface-variant font-body leading-relaxed opacity-80">
                  {{ program.shortDescription || program.description }}
                </p>

                <!-- Key Activities -->
                <ul v-if="program.keyActivities?.length" class="space-y-2">
                  <li v-for="(act, i) in program.keyActivities" :key="i" class="flex gap-2.5 items-start">
                    <div
                      class="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      :style="{ backgroundColor: getColors(program.colorTheme).bg }"
                    >{{ i + 1 }}</div>
                    <span class="text-xs text-on-surface-variant font-body leading-relaxed opacity-80">{{ act }}</span>
                  </li>
                </ul>

                <!-- SDG chips -->
                <div v-if="program.sdgs?.length" class="flex flex-wrap gap-1.5">
                  <span
                    v-for="sdg in program.sdgs" :key="sdg.code"
                    class="px-2.5 py-1 text-[10px] font-bold text-white rounded-lg"
                    :style="{ backgroundColor: sdg.color }"
                  >{{ sdg.code }}</span>
                </div>

                <!-- Read more -->
                <NuxtLink
                  :to="`/programs/${program.slug}`"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold mt-1"
                  :style="{ backgroundColor: getColors(program.colorTheme).bg }"
                >
                  Read more <ArrowRight class="w-4 h-4" />
                </NuxtLink>
              </div>
            </div>
          </button>
        </div>

        <!-- Desktop: Hexagonal Honeycomb -->
        <div class="hidden lg:block">

          <!-- Interdependence indicator -->
          <div class="flex items-center justify-center gap-3 mb-8">
            <span class="h-px flex-1 bg-gradient-to-r from-transparent to-outline-variant/30"></span>
            <div class="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-full">
              <Globe class="w-3.5 h-3.5 text-primary opacity-60" />
              <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant opacity-60">All program areas are interconnected — click to explore</span>
            </div>
            <span class="h-px flex-1 bg-gradient-to-l from-transparent to-outline-variant/30"></span>
          </div>

          <!-- Hex grid rows -->
          <div class="hex-grid relative">
            <div
              v-for="(row, rowIdx) in programRows"
              :key="rowIdx"
              class="hex-row"
              :class="{ 'hex-row-offset': rowIdx % 2 === 1 }"
            >
              <button
                v-for="(program, colIdx) in row"
                :key="program.id"
                class="hex-cell"
                :class="{
                  'hex-visible': gridVisible,
                  'hex-selected': selected?.id === program.id,
                }"
                :style="{
                  '--delay': `${staggerIndex(rowIdx, colIdx) * 0.13}s`,
                  '--float-delay': `${staggerIndex(rowIdx, colIdx) * 0.6}s`,
                  '--bg': getColors(program.colorTheme).bg,
                  '--glow': getColors(program.colorTheme).glow,
                  '--ring': getColors(program.colorTheme).ring,
                } as any"
                :aria-label="program.title"
                @click="toggleProgram(program)"
              >
                <!-- Spinning ring on selected -->
                <span v-if="selected?.id === program.id" class="hex-ring" aria-hidden="true" />

                <!-- Content -->
                <span class="hex-content">
                  <span class="hex-code-label">{{ program.code }}</span>
                  <span class="hex-title-label">{{ program.title }}</span>
                </span>

                <!-- Hover shimmer -->
                <span class="hex-shimmer" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Detail panel -->
          <Transition name="panel">
            <div v-if="activeProgram" class="detail-panel" :key="activeProgram.id">
              <!-- accent bar -->
              <div class="detail-accent" :style="{ backgroundColor: getColors(activeProgram.colorTheme).bg }" />

              <button class="detail-close" @click="closePanel" aria-label="Close">
                <X class="w-5 h-5" />
              </button>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-12 p-10 md:p-12">
                <!-- Left -->
                <div>
                  <div class="flex items-center gap-4 mb-6">
                    <div
                      class="w-16 h-16 hex-mask flex items-center justify-center text-white font-display font-bold text-2xl flex-shrink-0"
                      :style="{ backgroundColor: getColors(activeProgram.colorTheme).bg }"
                    >{{ activeProgram.code }}</div>
                    <div>
                      <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant opacity-50">Program Area</p>
                      <h3 class="font-display font-bold text-2xl leading-tight mt-1">{{ activeProgram.title }}</h3>
                    </div>
                  </div>
                  <p class="font-body text-on-surface-variant leading-relaxed text-sm opacity-80 mb-8">
                    {{ activeProgram.description }}
                  </p>
                  <div v-if="activeProgram.sdgs?.length">
                    <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant opacity-50 mb-4">Strategic SDG Alignment</p>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="sdg in activeProgram.sdgs" :key="sdg.code"
                        class="px-3 py-1.5 text-[10px] font-bold text-white rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform"
                        :style="{ backgroundColor: sdg.color }"
                      >{{ sdg.code }}</span>
                    </div>
                  </div>
                </div>

                <!-- Right -->
                <div>
                  <!-- Key Activities -->
                  <div v-if="activeProgram.keyActivities?.length" class="mb-8">
                    <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant opacity-50 mb-6">Key Activities</p>
                    <ul class="space-y-3">
                      <li
                        v-for="(act, i) in activeProgram.keyActivities" :key="act"
                        class="flex gap-3 items-start initiative-item"
                        :style="{ '--init-delay': `${i * 0.06}s` }"
                      >
                        <div
                          class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          :style="{ backgroundColor: getColors(activeProgram.colorTheme).bg }"
                        >{{ i + 1 }}</div>
                        <span class="text-sm text-on-surface-variant font-body leading-relaxed">{{ act }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Active Field Initiatives -->
                  <div v-if="activeProgram.initiatives?.length">
                    <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant opacity-50 mb-4">Active Field Initiatives</p>
                    <ul class="space-y-4">
                      <li
                        v-for="(init, i) in activeProgram.initiatives" :key="init.title"
                        class="flex gap-4 items-start initiative-item"
                        :style="{ '--init-delay': `${(activeProgram.keyActivities?.length ?? 0) * 0.06 + i * 0.08}s` }"
                      >
                        <div
                          class="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white"
                          :style="{ backgroundColor: getColors(activeProgram.colorTheme).bg }"
                        >
                          <Check class="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong class="font-display text-sm text-on-surface block mb-1">{{ init.title }}</strong>
                          <span class="text-xs text-on-surface-variant font-body opacity-70 leading-relaxed">{{ init.desc }}</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <!-- Read more link -->
                  <NuxtLink
                    :to="`/programs/${activeProgram.slug}`"
                    class="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:scale-105 transition-all"
                    :style="{ backgroundColor: getColors(activeProgram.colorTheme).bg }"
                  >
                    Read more about this program
                    <ArrowRight class="w-4 h-4" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- ── CTA ───────────────────────────────────────────────── -->
    <section class="py-24 bg-surface-container-low relative overflow-hidden">
      <div class="absolute left-0 top-0 w-64 h-64 hex-mask bg-primary opacity-5 -ml-32 -mt-32 animate-pulse"></div>
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-on-surface mb-6 tracking-tight">
          Join the RuralNexus Network
        </h2>
        <p class="text-lg text-on-surface-variant font-body mb-12 max-w-2xl mx-auto opacity-80 leading-relaxed">
          Our programs scale through collaborative intelligence. We are seeking academic partners, field organizations, and technology hub collaborators.
        </p>
        <div class="flex flex-wrap justify-center gap-6">
          <NuxtLink to="/contact" class="px-10 py-5 bg-primary text-white rounded-[22px] font-bold hover:shadow-2xl hover:shadow-primary/30 transition-all">
            Research Partnership
          </NuxtLink>
          <NuxtLink to="/contact" class="px-10 py-5 bg-surface-container-highest text-on-surface rounded-[22px] font-bold hover:bg-surface-container-high transition-all">
            Regional Collaboration
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ── Hex shape ─────────────────────────────────────────────── */
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

/* ── Desktop honeycomb grid ────────────────────────────────── */
.hex-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hex-row {
  display: flex;
  gap: 20px;
  position: relative;
}

.hex-row + .hex-row {
  margin-top: -52px; /* vertical interlock ≈ hex-height / 4 */
}

.hex-row-offset {
  margin-left: 158px; /* hex-width/2 + gap/2 = 133 + 10 = 143, +15 visual breathing room */
}

/* ── Individual hex cell ───────────────────────────────────── */
.hex-cell {
  position: relative;
  width: 265px;
  height: 230px; /* 265 × 0.866 */
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background-color: var(--bg);
  cursor: pointer;
  outline: none;
  border: none;
  padding: 0;

  /* entrance: invisible, scaled down */
  opacity: 0;
  transform: scale(0.55) translateY(40px);
  transition:
    opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 0.25s ease;
}

/* entrance triggered by IntersectionObserver */
.hex-cell.hex-visible {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition-delay: var(--delay, 0s);
  animation: hex-float 4s ease-in-out infinite alternate;
  animation-delay: var(--float-delay, 0s);
}

/* hover state (but not while animating entrance) */
.hex-cell.hex-visible:hover {
  filter: brightness(1.18) drop-shadow(0 0 28px var(--glow));
  animation-play-state: paused;
  transform: scale(1.09) translateY(-6px) !important;
  z-index: 10;
}

/* selected state */
.hex-cell.hex-selected {
  filter: brightness(1.12) drop-shadow(0 0 32px var(--glow));
  animation-play-state: paused;
  transform: scale(1.06) translateY(-4px) !important;
  z-index: 10;
}

/* spinning ring on selected */
.hex-ring {
  position: absolute;
  inset: -6px;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background: conic-gradient(
    var(--ring) 0deg,
    transparent 120deg,
    var(--ring) 240deg,
    transparent 360deg
  );
  animation: ring-spin 2.4s linear infinite;
  pointer-events: none;
  z-index: -1;
}

/* hex inner content */
.hex-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 32px;
}

.hex-code-label {
  font-family: var(--font-display, serif);
  font-weight: 700;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  line-height: 1;
}

.hex-title-label {
  font-family: var(--font-display, serif);
  font-weight: 700;
  font-size: 0.78rem;
  color: #ffffff;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.3;
}

/* shimmer overlay */
.hex-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.18) 0%,
    transparent 50%,
    rgba(255,255,255,0.06) 100%
  );
  pointer-events: none;
  transition: opacity 0.3s;
}
.hex-cell:hover .hex-shimmer { opacity: 0; }

/* ── Keyframes ──────────────────────────────────────────────── */
@keyframes hex-float {
  0%   { transform: scale(1) translateY(0px); }
  100% { transform: scale(1) translateY(-10px); }
}

@keyframes ring-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes slow-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes pulse-ring {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
  50%       { opacity: 0.1; transform: translate(-50%, -50%) scale(1.05); }
}

.animate-slow-spin        { animation: slow-spin 60s linear infinite; }
.animate-slow-spin-reverse { animation: slow-spin 80s linear infinite reverse; }
.animate-pulse-ring        { animation: pulse-ring 6s ease-in-out infinite; }

/* ── Detail panel ───────────────────────────────────────────── */
.detail-panel {
  position: relative;
  margin-top: 40px;
  background: white;
  border-radius: 40px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06);
  overflow: hidden;
}

.detail-accent {
  height: 5px;
  width: 100%;
}

.detail-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f2f4f2;
  color: #42493e;
  transition: background 0.2s, transform 0.2s;
  z-index: 10;
  border: none;
  cursor: pointer;
}
.detail-close:hover {
  background: #e1e3e1;
  transform: rotate(90deg);
}

/* Panel transition */
.panel-enter-active { animation: panel-in 0.42s cubic-bezier(0.34, 1.3, 0.64, 1) forwards; }
.panel-leave-active { animation: panel-in 0.25s cubic-bezier(0.4, 0, 1, 1) reverse forwards; }

@keyframes panel-in {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Initiative items stagger */
.initiative-item {
  animation: init-in 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) both;
  animation-delay: var(--init-delay, 0s);
}
@keyframes init-in {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Mobile cards ───────────────────────────────────────────── */
.mobile-card {
  padding: 20px;
  background: white;
  border-radius: 28px;
  border: 2px solid #e1e3e1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease,
    border-color 0.25s,
    box-shadow 0.25s;
  transition-delay: var(--delay, 0s);
  width: 100%;
  cursor: pointer;
}
.mobile-card.mobile-card-visible {
  opacity: 1;
  transform: translateY(0);
}
.mobile-card.mobile-card-selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--glow), 0 8px 24px rgba(0,0,0,0.08);
}
.mobile-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
</style>
