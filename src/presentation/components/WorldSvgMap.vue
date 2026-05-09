<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'

const props = defineProps<{ countries: InterventionCountry[] }>()

const mapContainer = ref<HTMLDivElement>()
const map = ref<L.Map>()
const svgOverlay = ref<L.SVGOverlay>()
const highlightedCountries = ref<Set<string>>(new Set())
const hoveredCountry = ref<string | null>(null)
const hoveredContinent = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
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

// Continent groupings
const continents: Record<string, { name: string; countries: string[]; lat: number; lng: number; zoom: number }> = {
  Africa: {
    name: 'Africa',
    countries: ['DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','CI','DJ','EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','EH','ZM','ZW'],
    lat: 0, lng: 20, zoom: 4,
  },
  Europe: {
    name: 'Europe',
    countries: ['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','TR','UA','GB','VA'],
    lat: 50, lng: 15, zoom: 4,
  },
  Asia: {
    name: 'Asia',
    countries: ['AF','AM','AZ','BH','BD','BT','BN','KH','CN','GE','IN','ID','IR','IQ','IL','JP','JO','KZ','KW','KG','LA','LB','MY','MV','MN','MM','NP','KP','OM','PK','PS','PH','QA','SA','SG','KR','XK','LK','SY','TW','TJ','TH','TL','TR','TM','AE','UZ','VN','YE'],
    lat: 30, lng: 100, zoom: 3,
  },
  'North America': {
    name: 'North America',
    countries: ['CA','MX','US','GL','BM','BS','CU','DO','HT','JM','KY','PR','SX','TC','VI'],
    lat: 35, lng: -95, zoom: 4,
  },
  'South America': {
    name: 'South America',
    countries: ['AR','BO','BR','CL','CO','EC','GY','PY','PE','SR','UY','VE'],
    lat: -12, lng: -60, zoom: 3,
  },
  Oceania: {
    name: 'Oceania',
    countries: ['AU','FJ','KI','MH','FM','NR','NC','NZ','PG','WS','SB','TO','TV','VU'],
    lat: -20, lng: 150, zoom: 3,
  },
  Antarctica: {
    name: 'Antarctica',
    countries: ['AQ'],
    lat: -85, lng: 0, zoom: 2,
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
  const svg = document.querySelector('svg')
  if (!svg) return

  const paths = svg.querySelectorAll('path[id]')
  
  paths.forEach((path: SVGPathElement) => {
    const countryId = path.getAttribute('id')
    if (!countryId) return

    const isHighlighted = highlightedCountries.value.has(countryId)
    const isHovered = hoveredCountry.value === countryId
    const isContinentHovered = hoveredContinent.value && continents[hoveredContinent.value].countries.includes(countryId)

    if (isHovered) {
      path.style.fill = highlightColor
    } else if (isContinentHovered) {
      path.style.fill = baseHoverColor
    } else if (isHighlighted) {
      path.style.fill = highlightColor
    } else {
      path.style.fill = baseColor
    }

    path.style.cursor = 'pointer'
    path.style.transition = 'fill 0.2s ease'
    path.style.pointerEvents = 'auto'
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

function attachEventListeners() {
  const svg = document.querySelector('svg')
  if (!svg) return

  const paths = svg.querySelectorAll('path[id]')
  
  paths.forEach((path) => {
    path.addEventListener('mouseenter', (e: Event) => {
      const pathEl = e.target as SVGPathElement
      const countryId = pathEl.getAttribute('id')
      if (countryId && !hoveredContinent.value) {
        hoveredCountry.value = countryId
        applyStyles()
      }
    })

    path.addEventListener('mouseleave', () => {
      hoveredCountry.value = null
      applyStyles()
    })

    path.addEventListener('click', (e: Event) => {
      const pathEl = e.target as SVGPathElement
      const countryId = pathEl.getAttribute('id')
      if (countryId) {
        showCountryInfo(countryId, e as MouseEvent)
      }
    })
  })
}

function zoomToContinent(continentName: string) {
  if (!map.value) return
  const continent = continents[continentName]
  if (!continent) return

  map.value.setView([continent.lat, continent.lng], continent.zoom)
  hoveredContinent.value = continentName
}

async function initMap() {
  if (typeof window === 'undefined' || !mapContainer.value) return

  try {
    // Initialize map
    map.value = L.map(mapContainer.value, {
      crs: L.CRS.Simple,
      zoom: 2,
      center: [0, 0],
      zoomControl: true,
      attributionControl: false,
      minZoom: 1,
      maxZoom: 6,
    })

    // Load SVG
    const response = await fetch('/world-map.svg')
    if (!response.ok) throw new Error(`Failed to fetch SVG: ${response.status}`)
    
    const svgText = await response.text()
    console.log('SVG loaded:', svgText.length, 'bytes')

    // Create SVG overlay
    const bounds = L.latLngBounds([[-90, -180], [90, 180]])
    const svgElement = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement as SVGElement
    
    svgOverlay.value = L.svgOverlay(svgElement, bounds).addTo(map.value)

    // Build continent map and attach listeners
    buildContinentMap()
    
    // Wait for SVG to be in DOM
    setTimeout(() => {
      updateHighlightedCountries()
      attachEventListeners()
      createContinentAreas()
    }, 100)

    error.value = null
    isLoading.value = false
    console.log('Map initialized successfully')
  } catch (err) {
    const errorMsg = (err as Error)?.message || 'Failed to load map'
    error.value = errorMsg
    isLoading.value = false
    console.error('Error initializing map:', err)
  }
}

function createContinentAreas() {
  const svg = document.querySelector('svg')
  if (!svg) return

  // Create continent hover areas
  Object.entries(continents).forEach(([continentName, data]) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-continent', continentName)

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', '0')
    rect.setAttribute('y', '0')
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', 'transparent')
    rect.style.pointerEvents = 'none'

    g.appendChild(rect)
    g.style.cursor = 'pointer'

    // Only track hover, don't block country events
    g.addEventListener('mouseenter', () => {
      hoveredContinent.value = continentName
      applyStyles()
    })

    g.addEventListener('mouseleave', () => {
      hoveredContinent.value = null
      applyStyles()
    })

    g.addEventListener('click', () => {
      zoomToContinent(continentName)
    })

    svg.appendChild(g)
  })
}

onMounted(() => {
  initMap()
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
    <div class="rounded-[28px] bg-surface-container shadow-sm overflow-hidden">
      <div v-if="error" class="h-[420px] flex items-center justify-center text-center text-sm text-destructive p-4">
        {{ error }}
      </div>
      <div 
        v-else
        ref="mapContainer"
        class="h-[420px] w-full"
      />
      <div v-if="isLoading" class="absolute inset-0 h-[420px] flex items-center justify-center text-center text-sm text-on-surface-variant bg-surface-container/80">
        Loading map...
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
      <div class="flex items-center gap-2">
        <span class="text-xs text-on-surface-variant">Hover continents to highlight • Click to zoom</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  font-family: inherit;
  background: white;
}

:deep(.leaflet-control-zoom) {
  border: 1px solid var(--color-outline, #ccc);
}

:deep(svg) {
  pointer-events: auto;
}

:deep(path) {
  cursor: pointer;
  transition: fill 0.2s ease;
}
</style>
