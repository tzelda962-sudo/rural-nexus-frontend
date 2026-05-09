<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'

const props = defineProps<{ countries: InterventionCountry[] }>()

const svgContainer = ref<HTMLDivElement>()
const svgElement = ref<SVGSVGElement>()
const highlightedCountries = ref<Set<string>>(new Set())
const hoveredCountry = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const highlightColor = '#22c55e'
const highlightHover = '#16a34a'
const baseColor = '#CBD5E1'
const baseHoverColor = '#1E293B'

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
    if (!countryId || countryId.length !== 2) return

    const isHighlighted = highlightedCountries.value.has(countryId)
    const isHovered = hoveredCountry.value === countryId

    if (isHighlighted) {
      path.setAttribute('data-highlighted', 'true')
      path.style.fill = isHovered ? highlightHover : highlightColor
    } else {
      path.setAttribute('data-highlighted', 'false')
      path.style.fill = isHovered ? baseHoverColor : baseColor
    }

    path.style.cursor = 'pointer'
    path.style.transition = 'fill 0.2s ease'
  })
}

function handleMouseEnter(event: MouseEvent) {
  const path = event.target as SVGPathElement
  const countryId = path.getAttribute('id')
  if (countryId) {
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
    console.log('Clicked country:', countryId)
  }
}

function attachEventListeners() {
  if (!svgElement.value) return

  const paths = svgElement.value.querySelectorAll('path[id]')
  console.log('Found', paths.length, 'country paths')
  
  paths.forEach((path) => {
    path.addEventListener('mouseenter', handleMouseEnter)
    path.addEventListener('mouseleave', handleMouseLeave)
    path.addEventListener('click', handleClick)
  })
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
      const parserError = svgDoc.documentElement.textContent
      throw new Error(`SVG parse error: ${parserError}`)
    }
    
    const svg = svgDoc.documentElement as SVGSVGElement
    
    // Set explicit dimensions and styles
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', 'auto')
    svg.setAttribute('style', 'display: block; width: 100%; height: auto; max-width: 100%;')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    
    console.log('SVG dimensions:', svg.getAttribute('viewBox'))
    
    svgContainer.value.innerHTML = ''
    svgContainer.value.appendChild(svg)
    svgElement.value = svg
    
    updateHighlightedCountries()
    attachEventListeners()
    
    error.value = null
    isLoading.value = false
    console.log('SVG map loaded successfully')
  } catch (err) {
    const errorMsg = (err as Error)?.message || 'Failed to load map'
    error.value = errorMsg
    isLoading.value = false
    console.error('Error loading SVG:', err)
  }
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
    <div class="overflow-hidden rounded-[28px] bg-surface-container p-4 shadow-sm">
      <div v-if="error" class="min-h-[420px] flex items-center justify-center text-center text-sm text-destructive">
        {{ error }}
      </div>
      <div 
        v-else
        ref="svgContainer"
        class="w-full bg-surface-container"
        style="min-height: 420px;"
      />
      <div v-if="isLoading" class="min-h-[420px] flex items-center justify-center text-center text-sm text-on-surface-variant">
        Loading map...
      </div>
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
}

:deep(path) {
  cursor: pointer;
  transition: fill 0.2s ease;
}
</style>
