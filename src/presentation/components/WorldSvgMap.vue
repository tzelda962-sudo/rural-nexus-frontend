<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'

const props = defineProps<{ countries: InterventionCountry[] }>()

const svgContainer = ref<HTMLDivElement>()
const svgElement = ref<SVGSVGElement>()
const highlightedCountries = ref<Set<string>>(new Set())
const hoveredCountry = ref<string | null>(null)
const hoveredContinent = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isZoomed = ref(false)
const currentViewBox = ref('0 0 1008 650')
const tooltip = ref<{ visible: boolean; x: number; y: number; title: string; content: string }>({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  content: '',
})

const highlightColor = '#22c55e'
const highlightHover = '#16a34a'
const baseColor = '#CBD5E1'
const baseHoverColor = '#1E293B'
const continentColor = '#94a3b8'
const continentHoverColor = '#64748b'

// Continent groupings
const continents: Record<string, { name: string; countries: string[]; viewBox: string }> = {
  Africa: {
    name: 'Africa',
    countries: ['DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','CI','DJ','EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','EH','ZM','ZW'],
    viewBox: '330 340 250 250',
  },
  Europe: {
    name: 'Europe',
    countries: ['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','TR','UA','GB','VA'],
    viewBox: '400 250 300 150',
  },
  Asia: {
    name: 'Asia',
    countries: ['AF','AM','AZ','BH','BD','BT','BN','KH','CN','GE','IN','ID','IR','IQ','IL','JP','JO','KZ','KW','KG','LA','LB','MY','MV','MN','MM','NP','KP','OM','PK','PS','PH','QA','SA','SG','KR','XK','LK','SY','TW','TJ','TH','TL','TR','TM','AE','UZ','VN','YE'],
    viewBox: '500 280 400 250',
  },
  'North America': {
    name: 'North America',
    countries: ['CA','MX','US','GL','BM','BS','CU','DO','HT','JM','KY','PR','SX','TC','VI'],
    viewBox: '100 200 200 200',
  },
  'South America': {
    name: 'South America',
    countries: ['AR','BO','BR','CL','CO','EC','GY','PY','PE','SR','UY','VE'],
    viewBox: '280 400 150 200',
  },
  Oceania: {
    name: 'Oceania',
    countries: ['AU','FJ','KI','MH','FM','NR','NC','NZ','PG','WS','SB','TO','TV','VU'],
    viewBox: '700 450 200 150',
  },
  Antarctica: {
    name: 'Antarctica',
    countries: ['AQ'],
    viewBox: '0 600 1008 50',
  },
}

const countryToContinent = ref<Record<string, string>>({})

function buildContinentMap() {
  countryToContinent.value = {}
  Object.entries(continents).forEach(([continent, data]) => {
    data.countries.forEach((country) => {
      countryToContinent.value[country] = continent
    })
  })
}

function updateHighlightedCountries() {
  highlightedCountries.value.clear()
  props.countries.forEach((country) => {
    const code = country.isoCode?.toUpperCase?.()
    if (code) {
      highlightedCountries.value.add(code)
    }
  })
  applyStyles()
}

function applyStyles() {
  if (!svgElement.value) return

  const paths = svgElement.value.querySelectorAll('path[id]')
  
  paths.forEach((path: SVGPathElement) => {
    const countryId = path.getAttribute('id')
    if (!countryId) return

    const continent = countryToContinent.value[countryId]
    const isHighlighted = highlightedCountries.value.has(countryId)
    const isHovered = hoveredCountry.value === countryId
    const isContinentHovered = hoveredContinent.value && continents[hoveredContinent.value].countries.includes(countryId)

    if (isHovered) {
      path.style.fill = highlightColor
    } else if (isContinentHovered) {
      path.style.fill = continentHoverColor
    } else if (isHighlighted) {
      path.style.fill = highlightColor
    } else {
      path.style.fill = baseColor
    }

    path.style.cursor = 'pointer'
    path.style.transition = 'fill 0.2s ease'
  })
}

function showCountryInfo(countryId: string, event: MouseEvent) {
  const country = props.countries.find((c) => c.isoCode?.toUpperCase() === countryId)
  if (country) {
    tooltip.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      title: country.name,
      content: country.programs || 'Active operations',
    }
  } else {
    tooltip.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      title: countryId,
      content: 'No intervention data',
    }
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

function handleMouseEnter(event: MouseEvent) {
  const path = event.target as SVGPathElement
  const countryId = path.getAttribute('id')
  if (countryId && !hoveredContinent.value) {
    hoveredCountry.value = countryId
    applyStyles()
  }
}

function handleMouseLeave() {
  hoveredCountry.value = null
  applyStyles()
}

function handleClick(event: MouseEvent) {
  const path = event.target as SVGPathElement
  const countryId = path.getAttribute('id')
  if (countryId) {
    showCountryInfo(countryId, event)
  }
}

function attachEventListeners() {
  if (!svgElement.value) return

  const paths = svgElement.value.querySelectorAll('path[id]')
  
  paths.forEach((path) => {
    path.addEventListener('mouseenter', handleMouseEnter)
    path.addEventListener('mouseleave', handleMouseLeave)
    path.addEventListener('click', handleClick)
  })
}

function zoomToContinent(continentName: string) {
  if (!svgElement.value) return
  const continent = continents[continentName]
  if (!continent) return

  currentViewBox.value = continent.viewBox
  svgElement.value.setAttribute('viewBox', continent.viewBox)
  isZoomed.value = true
  hoveredContinent.value = continentName
}

function zoomOut() {
  if (!svgElement.value) return
  currentViewBox.value = '0 0 1008 650'
  svgElement.value.setAttribute('viewBox', '0 0 1008 650')
  isZoomed.value = false
  hoveredContinent.value = null
}

async function loadSvg() {
  if (typeof window === 'undefined' || !svgContainer.value) return

  try {
    const response = await fetch('/world-map.svg')
    if (!response.ok) throw new Error(`Failed to fetch SVG: ${response.status}`)
    
    const svgText = await response.text()
    console.log('SVG text length:', svgText.length)
    
    if (!svgText || svgText.trim().length === 0) {
      throw new Error('SVG file is empty')
    }

    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
    
    if (svgDoc.documentElement.nodeName === 'parsererror') {
      throw new Error('Failed to parse SVG')
    }
    
    const svg = svgDoc.documentElement as SVGSVGElement
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', 'auto')
    svg.setAttribute('style', 'display: block; width: 100%; height: auto; max-width: 100%; pointer-events: auto;')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    
    svgContainer.value.innerHTML = ''
    svgContainer.value.appendChild(svg)
    svgElement.value = svg
    
    buildContinentMap()
    updateHighlightedCountries()
    attachEventListeners()
    
    error.value = null
    isLoading.value = false
    console.log('SVG map loaded successfully with', Object.keys(countryToContinent.value).length, 'countries')
  } catch (err) {
    const errorMsg = (err as Error)?.message || 'Failed to load map'
    error.value = errorMsg
    isLoading.value = false
    console.error('Error loading SVG:', err)
  }
}

function handleContinentHover(continentName: string) {
  if (isZoomed.value) return
  hoveredContinent.value = continentName
  hoveredCountry.value = null
  applyStyles()
}

function handleContinentLeave() {
  if (isZoomed.value) return
  hoveredContinent.value = null
  applyStyles()
}

onMounted(() => {
  setTimeout(() => loadSvg(), 0)
})

watch(
  () => props.countries,
  () => {
    updateHighlightedCountries()
  },
  { deep: true },
)
</script>

<template>
  <div class="relative w-full select-none">
    <div class="overflow-hidden rounded-[28px] bg-surface-container p-4 shadow-sm relative">
      <div v-if="error" class="min-h-[420px] flex items-center justify-center text-center text-sm text-destructive">
        {{ error }}
      </div>
      <div 
        v-else
        ref="svgContainer"
        class="w-full bg-surface-container relative"
        style="min-height: 420px; pointer-events: auto;"
        @mouseleave="hideTooltip"
      />
      <div v-if="isLoading" class="absolute inset-0 min-h-[420px] flex items-center justify-center text-center text-sm text-on-surface-variant bg-surface-container">
        Loading map...
      </div>

      <!-- Zoom out button -->
      <button
        v-if="isZoomed"
        @click="zoomOut"
        class="absolute top-4 right-4 px-3 py-1 bg-primary text-on-primary text-sm rounded hover:opacity-90 z-20 pointer-events-auto"
      >
        ← Zoom Out
      </button>

      <!-- Continent buttons (only show when not zoomed) -->
      <div v-if="!isZoomed && !isLoading" class="absolute top-4 right-4 flex gap-2 flex-wrap justify-end z-20 max-w-xs pointer-events-auto">
        <button
          v-for="(continent, name) in continents"
          :key="name"
          @mouseenter="handleContinentHover(name)"
          @mouseleave="handleContinentLeave"
          @click="zoomToContinent(name)"
          class="px-2 py-1 text-xs bg-surface-container-high hover:bg-primary text-on-surface-variant hover:text-on-primary rounded transition-colors pointer-events-auto"
        >
          {{ name }}
        </button>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="fixed bg-surface-container-high text-on-surface rounded shadow-lg p-3 text-sm z-20 pointer-events-none max-w-xs border border-outline"
      :style="{
        left: tooltip.x + 10 + 'px',
        top: tooltip.y + 10 + 'px',
      }"
    >
      <div class="font-semibold text-primary">{{ tooltip.title }}</div>
      <div class="text-on-surface-variant mt-1 whitespace-pre-wrap text-xs">{{ tooltip.content }}</div>
    </div>

    <div class="mt-4 flex items-center gap-6 text-sm font-body text-on-surface-variant">
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-sm bg-leaf inline-block"></span>
        <span>Highlighted intervention countries</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-sm bg-surface-container-high inline-block"></span>
        <span>Global regions</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(svg) {
  user-select: none;
  display: block;
  width: 100%;
  height: auto;
  transition: all 0.3s ease;
  pointer-events: auto;
}

:deep(path) {
  cursor: pointer;
  transition: fill 0.2s ease;
  pointer-events: auto;
}
</style>
