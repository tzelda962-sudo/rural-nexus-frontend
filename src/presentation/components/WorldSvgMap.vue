<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'

const props = defineProps<{ countries: InterventionCountry[] }>()

const svgContainer = ref<HTMLDivElement>()
const highlightedCountries = ref<Set<string>>(new Set())
const hoveredCountry = ref<string | null>(null)

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
  if (!svgContainer.value) return

  const svg = svgContainer.value.querySelector('svg')
  if (!svg) return

  // Get all path elements
  const paths = svg.querySelectorAll('path[id]')
  
  paths.forEach((path: SVGPathElement) => {
    const countryId = path.getAttribute('id')
    if (!countryId) return

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
    // Emit event for click on country
    // You can extend this for more interactivity
    console.log('Clicked country:', countryId)
  }
}

function attachEventListeners() {
  if (!svgContainer.value) return

  const svg = svgContainer.value.querySelector('svg')
  if (!svg) return

  const paths = svg.querySelectorAll('path[id]')
  
  paths.forEach((path) => {
    path.addEventListener('mouseenter', handleMouseEnter)
    path.addEventListener('mouseleave', handleMouseLeave)
    path.addEventListener('click', handleClick)
  })
}

function loadSvg() {
  if (typeof window === 'undefined' || !svgContainer.value) return

  // Load the SVG file
  fetch('/world-map.svg')
    .then((response) => response.text())
    .then((svgText) => {
      if (svgContainer.value) {
        svgContainer.value.innerHTML = svgText
        // Make SVG responsive
        const svg = svgContainer.value.querySelector('svg')
        if (svg) {
          svg.style.width = '100%'
          svg.style.height = 'auto'
          svg.style.maxWidth = '100%'
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        }
        updateHighlightedCountries()
        attachEventListeners()
      }
    })
    .catch((error) => {
      console.error('Error loading SVG:', error)
    })
}

onMounted(() => {
  loadSvg()
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
      <div 
        ref="svgContainer"
        class="min-h-[420px] flex items-center justify-center"
      >
        <!-- SVG will be loaded here -->
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
}

:deep(path) {
  cursor: pointer;
  transition: fill 0.2s ease;
}

:deep(path:hover) {
  filter: brightness(0.9);
}
</style>
