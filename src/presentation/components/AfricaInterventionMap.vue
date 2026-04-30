<script setup lang="ts">
import { ref, computed } from 'vue'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'

const props = defineProps<{
  countries: InterventionCountry[]
}>()

const activeCountry = ref<InterventionCountry | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })

const interventionSet = computed(() =>
  new Set(props.countries.map((c) => c.isoCode.toUpperCase())),
)

function getCountryData(iso: string): InterventionCountry | undefined {
  return props.countries.find((c) => c.isoCode.toUpperCase() === iso.toUpperCase())
}

function onEnter(event: MouseEvent, iso: string) {
  const data = getCountryData(iso)
  if (!data) return
  activeCountry.value = data
  tooltipPos.value = { x: event.offsetX + 12, y: event.offsetY - 10 }
}

function onMove(event: MouseEvent) {
  tooltipPos.value = { x: event.offsetX + 12, y: event.offsetY - 10 }
}

function onLeave() {
  activeCountry.value = null
}

function fill(iso: string) {
  return interventionSet.value.has(iso.toUpperCase())
    ? 'var(--color-leaf, #4CAF50)'
    : '#d1d5db'
}

function stroke(iso: string) {
  return interventionSet.value.has(iso.toUpperCase()) ? '#ffffff' : '#ffffff'
}
</script>

<template>
  <div class="relative w-full select-none">
    <!-- Tooltip -->
    <Transition name="fade">
      <div
        v-if="activeCountry"
        class="pointer-events-none absolute z-20 rounded-2xl bg-on-surface px-5 py-3 shadow-xl text-surface text-sm max-w-[200px]"
        :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
      >
        <p class="font-bold text-base mb-1">{{ activeCountry.name }}</p>
        <p v-if="activeCountry.programs" class="text-xs opacity-80 leading-snug">
          {{ activeCountry.programs }}
        </p>
      </div>
    </Transition>

    <!-- Africa SVG — simplified country paths (Natural Earth / public domain) -->
    <svg
      viewBox="0 80 500 560"
      xmlns="http://www.w3.org/2000/svg"
      class="w-full h-auto"
      @mousemove="onMove"
    >
      <!-- Morocco -->
      <path data-iso="MA" :fill="fill('MA')" :stroke="stroke('MA')" stroke-width="0.8"
        d="M175,88 L215,88 L225,100 L220,118 L200,128 L178,122 L168,108 Z"
        @mouseenter="onEnter($event,'MA')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Algeria -->
      <path data-iso="DZ" :fill="fill('DZ')" :stroke="stroke('DZ')" stroke-width="0.8"
        d="M215,88 L278,88 L285,100 L280,140 L260,158 L235,160 L220,145 L220,118 L225,100 Z"
        @mouseenter="onEnter($event,'DZ')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Tunisia -->
      <path data-iso="TN" :fill="fill('TN')" :stroke="stroke('TN')" stroke-width="0.8"
        d="M242,88 L258,88 L262,100 L255,112 L242,108 Z"
        @mouseenter="onEnter($event,'TN')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Libya -->
      <path data-iso="LY" :fill="fill('LY')" :stroke="stroke('LY')" stroke-width="0.8"
        d="M258,88 L320,90 L325,115 L315,158 L285,160 L280,140 L285,100 Z"
        @mouseenter="onEnter($event,'LY')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Egypt -->
      <path data-iso="EG" :fill="fill('EG')" :stroke="stroke('EG')" stroke-width="0.8"
        d="M320,90 L368,90 L368,130 L340,155 L315,158 L325,115 Z"
        @mouseenter="onEnter($event,'EG')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Mauritania -->
      <path data-iso="MR" :fill="fill('MR')" :stroke="stroke('MR')" stroke-width="0.8"
        d="M150,120 L200,120 L220,145 L218,178 L195,190 L160,192 L140,170 L142,145 Z"
        @mouseenter="onEnter($event,'MR')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Mali -->
      <path data-iso="ML" :fill="fill('ML')" :stroke="stroke('ML')" stroke-width="0.8"
        d="M200,128 L235,130 L260,158 L255,200 L230,215 L195,210 L180,195 L185,165 Z"
        @mouseenter="onEnter($event,'ML')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Niger -->
      <path data-iso="NE" :fill="fill('NE')" :stroke="stroke('NE')" stroke-width="0.8"
        d="M260,158 L315,158 L325,180 L315,215 L280,220 L255,200 Z"
        @mouseenter="onEnter($event,'NE')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Chad -->
      <path data-iso="TD" :fill="fill('TD')" :stroke="stroke('TD')" stroke-width="0.8"
        d="M315,158 L368,155 L370,200 L355,228 L325,230 L315,215 L325,180 Z"
        @mouseenter="onEnter($event,'TD')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Sudan -->
      <path data-iso="SD" :fill="fill('SD')" :stroke="stroke('SD')" stroke-width="0.8"
        d="M368,130 L410,135 L415,195 L390,230 L355,228 L370,200 L368,155 Z"
        @mouseenter="onEnter($event,'SD')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Ethiopia -->
      <path data-iso="ET" :fill="fill('ET')" :stroke="stroke('ET')" stroke-width="0.8"
        d="M390,230 L430,220 L445,250 L430,270 L400,275 L375,260 L375,245 Z"
        @mouseenter="onEnter($event,'ET')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Senegal -->
      <path data-iso="SN" :fill="fill('SN')" :stroke="stroke('SN')" stroke-width="0.8"
        d="M148,195 L172,192 L175,205 L165,215 L148,215 Z"
        @mouseenter="onEnter($event,'SN')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Burkina Faso -->
      <path data-iso="BF" :fill="fill('BF')" :stroke="stroke('BF')" stroke-width="0.8"
        d="M218,200 L250,198 L255,215 L240,228 L215,228 L208,215 Z"
        @mouseenter="onEnter($event,'BF')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Ghana -->
      <path data-iso="GH" :fill="fill('GH')" :stroke="stroke('GH')" stroke-width="0.8"
        d="M215,228 L240,228 L242,250 L228,262 L212,255 L208,240 Z"
        @mouseenter="onEnter($event,'GH')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Nigeria -->
      <path data-iso="NG" :fill="fill('NG')" :stroke="stroke('NG')" stroke-width="0.8"
        d="M255,215 L300,215 L308,250 L292,270 L265,268 L248,255 L242,235 Z"
        @mouseenter="onEnter($event,'NG')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Cameroon -->
      <path data-iso="CM" :fill="fill('CM')" :stroke="stroke('CM')" stroke-width="0.8"
        d="M300,215 L328,218 L332,248 L318,268 L292,270 L308,250 Z"
        @mouseenter="onEnter($event,'CM')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Central African Republic -->
      <path data-iso="CF" :fill="fill('CF')" :stroke="stroke('CF')" stroke-width="0.8"
        d="M328,218 L368,220 L372,250 L345,265 L318,268 L332,248 Z"
        @mouseenter="onEnter($event,'CF')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Uganda -->
      <path data-iso="UG" :fill="fill('UG')" :stroke="stroke('UG')" stroke-width="0.8"
        d="M375,260 L398,258 L400,280 L382,290 L368,282 Z"
        @mouseenter="onEnter($event,'UG')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Kenya -->
      <path data-iso="KE" :fill="fill('KE')" :stroke="stroke('KE')" stroke-width="0.8"
        d="M398,258 L432,265 L435,295 L415,310 L395,300 L382,290 L400,280 Z"
        @mouseenter="onEnter($event,'KE')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Rwanda -->
      <path data-iso="RW" :fill="fill('RW')" :stroke="stroke('RW')" stroke-width="0.8"
        d="M374,283 L386,280 L388,292 L375,295 Z"
        @mouseenter="onEnter($event,'RW')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Burundi -->
      <path data-iso="BI" :fill="fill('BI')" :stroke="stroke('BI')" stroke-width="0.8"
        d="M373,295 L386,292 L388,305 L374,308 Z"
        @mouseenter="onEnter($event,'BI')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Tanzania -->
      <path data-iso="TZ" :fill="fill('TZ')" :stroke="stroke('TZ')" stroke-width="0.8"
        d="M382,295 L418,295 L422,335 L400,348 L375,335 L368,315 Z"
        @mouseenter="onEnter($event,'TZ')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Mozambique -->
      <path data-iso="MZ" :fill="fill('MZ')" :stroke="stroke('MZ')" stroke-width="0.8"
        d="M388,350 L418,338 L422,390 L408,420 L385,430 L372,400 L378,368 Z"
        @mouseenter="onEnter($event,'MZ')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- South Africa -->
      <path data-iso="ZA" :fill="fill('ZA')" :stroke="stroke('ZA')" stroke-width="0.8"
        d="M330,430 L385,430 L390,470 L358,490 L322,475 L308,452 Z"
        @mouseenter="onEnter($event,'ZA')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- DRC -->
      <path data-iso="CD" :fill="fill('CD')" :stroke="stroke('CD')" stroke-width="0.8"
        d="M330,268 L372,268 L380,310 L375,348 L345,355 L318,340 L310,310 L318,280 Z"
        @mouseenter="onEnter($event,'CD')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Angola -->
      <path data-iso="AO" :fill="fill('AO')" :stroke="stroke('AO')" stroke-width="0.8"
        d="M305,345 L345,355 L348,400 L320,418 L295,405 L285,378 Z"
        @mouseenter="onEnter($event,'AO')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Zambia -->
      <path data-iso="ZM" :fill="fill('ZM')" :stroke="stroke('ZM')" stroke-width="0.8"
        d="M348,355 L378,350 L385,385 L365,400 L345,395 L340,375 Z"
        @mouseenter="onEnter($event,'ZM')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Zimbabwe -->
      <path data-iso="ZW" :fill="fill('ZW')" :stroke="stroke('ZW')" stroke-width="0.8"
        d="M358,398 L382,390 L388,415 L368,425 L350,418 Z"
        @mouseenter="onEnter($event,'ZW')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Somalia -->
      <path data-iso="SO" :fill="fill('SO')" :stroke="stroke('SO')" stroke-width="0.8"
        d="M432,265 L455,250 L465,290 L445,320 L420,312 L415,285 Z"
        @mouseenter="onEnter($event,'SO')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Côte d'Ivoire -->
      <path data-iso="CI" :fill="fill('CI')" :stroke="stroke('CI')" stroke-width="0.8"
        d="M185,225 L212,225 L215,248 L198,258 L180,248 L178,232 Z"
        @mouseenter="onEnter($event,'CI')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
      <!-- Guinea -->
      <path data-iso="GN" :fill="fill('GN')" :stroke="stroke('GN')" stroke-width="0.8"
        d="M155,212 L185,210 L190,228 L175,238 L155,232 Z"
        @mouseenter="onEnter($event,'GN')" @mouseleave="onLeave" class="cursor-pointer transition-opacity hover:opacity-80" />
    </svg>

    <!-- Legend -->
    <div class="mt-4 flex items-center gap-6 text-sm font-body text-on-surface-variant">
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-sm bg-leaf inline-block"></span>
        <span>Country of Intervention ({{ countries.length }})</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-sm bg-surface-container-high inline-block"></span>
        <span>Other</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
