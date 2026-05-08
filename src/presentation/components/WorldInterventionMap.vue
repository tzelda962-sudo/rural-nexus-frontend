<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'

declare global {
  interface Window {
    simplemaps_worldmap_mapdata?: Record<string, any>
    simplemaps_worldmap?: { refresh?: () => void; loaded?: boolean }
  }
}

const props = defineProps<{ countries: InterventionCountry[] }>()

const mapId = 'ruralnexus-worldmap'
const mapMounted = ref(false)
const error = ref<string | null>(null)

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src=\"${src}\"]`)
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        resolve()
        return
      }

      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)))
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.defer = false
    script.addEventListener('load', () => {
      script.setAttribute('data-loaded', 'true')
      resolve()
    })
    script.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)))
    document.body.appendChild(script)
  })
}

function applyMapConfig() {
  if (typeof window === 'undefined' || !window.simplemaps_worldmap_mapdata) return

  const mapdata = window.simplemaps_worldmap_mapdata
  mapdata.main_settings = mapdata.main_settings || {}
  mapdata.main_settings.div = mapId
  mapdata.main_settings.width = 'responsive'
  mapdata.main_settings.background_transparent = 'yes'
  mapdata.main_settings.auto_load = 'yes'
  mapdata.main_settings.state_color = '#CBD5E1'
  mapdata.main_settings.state_hover_color = '#1E293B'
  mapdata.main_settings.state_description = 'RuralNexus operates here with community-led action research and strategic engagement.'
  mapdata.main_settings.all_states_zoomable = 'yes'
  mapdata.main_settings.zoom_out_incrementally = 'yes'
  mapdata.main_settings.zoom_percentage = 0.99
  mapdata.main_settings.url_new_tab = 'yes'

  const highlightColor = '#22c55e'
  const highlightHover = '#16a34a'

  const seenCountries = new Set<string>()
  props.countries.forEach((country) => {
    const code = country.isoCode?.toUpperCase?.()
    if (!code) return
    seenCountries.add(code)
    const state = mapdata.state_specific?.[code]
    if (!state) return

    state.color = highlightColor
    state.hover_color = highlightHover
    state.url = 'javascript:void(0)'
    const programText = country.programs ? country.programs.replace(/\n/g, '<br/>') : 'Active field operations and programme delivery.'
    state.description = `<strong>${country.name}</strong><br/>${programText}`
  })

  if (!mapdata.regions) {
    mapdata.regions = {
      Africa: {
        name: 'Africa',
        states: [
          'DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','CI','DJ','EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','EH','ZM','ZW',
        ],
        description: 'RuralNexus has active research and field collaborations throughout Africa.',
        color: '#15803d',
        hover_color: '#166534',
        url: 'javascript:void(0)',
      },
      Europe: {
        name: 'Europe',
        states: [
          'AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','TR','UA','GB','VA',
        ],
        description: 'Strong European academic and project partnerships sustain our global network.',
        color: '#0ea5e9',
        hover_color: '#0284c7',
        url: 'javascript:void(0)',
      },
      Asia: {
        name: 'Asia',
        states: [
          'AF','AM','AZ','BH','BD','BT','BN','KH','CN','GE','IN','ID','IR','IQ','IL','JP','JO','KZ','KW','KG','LA','LB','MY','MV','MN','MM','NP','KP','OM','PK','PS','PH','QA','SA','SG','KR','LK','SY','TW','TJ','TH','TL','TR','TM','AE','UZ','VN','YE',
        ],
        description: 'Asia connects our work with fast-moving innovation, governance, and rural resilience systems.',
        color: '#f97316',
        hover_color: '#ea580c',
        url: 'javascript:void(0)',
      },
      'North America': {
        name: 'North America',
        states: [
          'CA','MX','US','GL','BM','BS','CU','DO','HT','JM','KY','PR','SX','TC','VI',
        ],
        description: 'North America provides our research with strategic partnerships and funding visibility.',
        color: '#8b5cf6',
        hover_color: '#7c3aed',
        url: 'javascript:void(0)',
      },
      'South America': {
        name: 'South America',
        states: [
          'AR','BO','BR','CL','CO','EC','GY','PY','PE','SR','UY','VE',
        ],
        description: 'South America is part of our regional research and resilience portfolio.',
        color: '#ec4899',
        hover_color: '#db2777',
        url: 'javascript:void(0)',
      },
      Oceania: {
        name: 'Oceania',
        states: ['AU','FJ','KI','MH','FM','NR','NC','NZ','PG','WS','SB','TO','TV','VU'],
        description: 'Oceania is included to show RuralNexus’s capability for global collaboration beyond our core hubs.',
        color: '#14b8a6',
        hover_color: '#0f766e',
        url: 'javascript:void(0)',
      },
      Antarctica: {
        name: 'Antarctica',
        states: ['AQ'],
        description: 'Antarctica represents the global reach of our systems thinking and climate-aware strategy.',
        color: '#94a3b8',
        hover_color: '#64748b',
        url: 'javascript:void(0)',
      },
    }
  }
}

async function initMap() {
  if (typeof window === 'undefined') return
  if (mapMounted.value) return
  try {
    await loadScript('/worldmap/mapdata.js')
    applyMapConfig()
    await loadScript('/worldmap/worldmap.js')
    mapMounted.value = true
    window.simplemaps_worldmap?.refresh?.()
  } catch (err) {
    error.value = (err as Error)?.message || 'Unable to initialize the interactive map.'
  }
}

onMounted(initMap)

watch(
  () => props.countries,
  () => {
    if (typeof window === 'undefined') return
    applyMapConfig()
    window.simplemaps_worldmap?.refresh?.()
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
      <div v-else class="min-h-[420px]" :id="mapId"></div>
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
