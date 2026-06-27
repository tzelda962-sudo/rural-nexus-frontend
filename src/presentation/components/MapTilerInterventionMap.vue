<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from '#imports'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'
import { X, MapPin } from 'lucide-vue-next'
import { GERMANY_CENTROID, countryCentroid } from '../utils/countryCentroids'

const props = defineProps<{ countries: InterventionCountry[] }>()

const config = useRuntimeConfig()
const apiKey = config.public.maptilerApiKey as string

const mapContainer = ref<HTMLDivElement | null>(null)
const mapLoaded = ref(false)
const selectedCountry = ref<InterventionCountry | null>(null)

let map: any = null

const COUNTRIES_SOURCE_ID = 'maptiler-countries'
const HIGHLIGHT_LAYER_ID = 'intervention-countries-fill'

onMounted(async () => {
  if (!apiKey || !mapContainer.value) return

  const maptilersdk = await import('@maptiler/sdk')
  await import('@maptiler/sdk/style.css')

  maptilersdk.config.apiKey = apiKey

  map = new maptilersdk.Map({
    container: mapContainer.value,
    style: maptilersdk.MapStyle.DATAVIZ,
    center: [15, 10],
    zoom: 1.5,
    navigationControl: true,
  })

  map.on('load', () => {
    const isoCodes = props.countries.map((c) => c.isoCode?.toUpperCase()).filter(Boolean)

    map.addSource(COUNTRIES_SOURCE_ID, {
      type: 'vector',
      url: `https://api.maptiler.com/tiles/countries/tiles.json?key=${apiKey}`,
    })

    map.addLayer({
      id: HIGHLIGHT_LAYER_ID,
      type: 'fill',
      source: COUNTRIES_SOURCE_ID,
      'source-layer': 'administrative',
      filter: ['all', ['==', ['get', 'level'], 0], ['in', ['get', 'iso_a2'], ['literal', isoCodes]]],
      paint: {
        'fill-color': '#4ade80',
        'fill-opacity': 0.55,
      },
    })

    map.addLayer({
      id: `${HIGHLIGHT_LAYER_ID}-outline`,
      type: 'line',
      source: COUNTRIES_SOURCE_ID,
      'source-layer': 'administrative',
      filter: ['all', ['==', ['get', 'level'], 0], ['in', ['get', 'iso_a2'], ['literal', isoCodes]]],
      paint: {
        'line-color': '#16a34a',
        'line-width': 1.2,
      },
    })

    const linkFeatures = props.countries
      .map((c) => ({ country: c, dest: countryCentroid(c.isoCode) }))
      .filter((c) => c.dest)
      .map(({ country, dest }) => ({
        type: 'Feature' as const,
        properties: { name: country.name },
        geometry: { type: 'LineString' as const, coordinates: [GERMANY_CENTROID, dest as [number, number]] },
      }))

    map.addSource('germany-links', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: linkFeatures },
    })

    map.addLayer({
      id: 'germany-links-line',
      type: 'line',
      source: 'germany-links',
      paint: {
        'line-color': '#4ade80',
        'line-width': 2,
        'line-opacity': 1,
        'line-dasharray': [2, 2],
      },
    })

    map.addSource('germany-hub', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: { name: 'Germany' }, geometry: { type: 'Point', coordinates: GERMANY_CENTROID } }],
      },
    })

    map.addLayer({
      id: 'germany-hub-point',
      type: 'circle',
      source: 'germany-hub',
      paint: {
        'circle-radius': 8,
        'circle-color': '#4ade80',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    map.on('click', HIGHLIGHT_LAYER_ID, (e: any) => {
      const iso = e.features?.[0]?.properties?.iso_a2
      const entry = props.countries.find((c) => c.isoCode?.toUpperCase() === iso) ?? null
      selectedCountry.value = entry
    })

    map.on('mouseenter', HIGHLIGHT_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', HIGHLIGHT_LAYER_ID, () => {
      map.getCanvas().style.cursor = ''
    })

    mapLoaded.value = true
  })
})

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <div class="relative w-full select-none">
    <div class="relative rounded-[28px] overflow-hidden bg-[#F8FAFC] shadow-lg" style="height: 60vh; min-height: 420px;">
      <div v-if="!apiKey" class="absolute inset-0 flex items-center justify-center bg-surface-container/80 z-20 text-center px-6">
        <p class="text-sm text-on-surface-variant font-body">
          Set <code class="font-mono text-xs">NUXT_PUBLIC_MAPTILER_API_KEY</code> in <code class="font-mono text-xs">.env</code> to enable this map.
        </p>
      </div>

      <div ref="mapContainer" class="w-full h-full" />

      <div v-if="apiKey && !mapLoaded" class="absolute inset-0 flex items-center justify-center bg-surface-container/80 z-20">
        <div class="flex flex-col items-center gap-3 text-on-surface-variant">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm font-medium">Loading map…</span>
        </div>
      </div>

      <!-- Country info panel -->
      <Transition name="panel-slide">
        <div
          v-if="selectedCountry"
          class="absolute bottom-4 right-4 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 z-10"
        >
          <button
            class="absolute top-3 right-3 w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            @click="selectedCountry = null"
          >
            <X class="w-3.5 h-3.5" />
          </button>
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-xl bg-leaf/15 flex items-center justify-center">
              <MapPin class="w-4 h-4 text-leaf" />
            </div>
            <div>
              <p class="font-display font-bold text-base leading-tight">{{ selectedCountry.name }}</p>
              <p class="text-[10px] font-bold uppercase tracking-widest text-leaf mt-0.5">Active Intervention</p>
            </div>
          </div>
          <p v-if="selectedCountry.programs" class="text-sm text-on-surface-variant font-body leading-relaxed">
            {{ selectedCountry.programs }}
          </p>
          <p v-else class="text-sm text-on-surface-variant opacity-60 italic">
            Active operations in this country.
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.panel-slide-enter-active { animation: panel-in 0.3s cubic-bezier(0.34, 1.4, 0.64, 1) forwards; }
.panel-slide-leave-active { animation: panel-in 0.2s ease reverse forwards; }
@keyframes panel-in {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
