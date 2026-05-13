<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'
import { ArrowLeft, MapPin, X } from 'lucide-vue-next'

const props = defineProps<{ countries: InterventionCountry[] }>()

// ── Colors ──────────────────────────────────────────────────────────────────
const C = {
  worldBase:          '#D1D9E0',
  continentHover:     '#94A3B8',
  outOfFocus:         '#EEF1F4',
  inContinent:        '#B8C4CE',
  intervention:       '#4ade80',
  interventionHover:  '#16a34a',
  noInterHover:       '#7B8FA1',
  stroke:             '#FFFFFF',
  strokeW:            '0.4',
} as const

// ── Continent data ───────────────────────────────────────────────────────────
const CONTINENTS: Record<string, { name: string; countries: string[] }> = {
  Africa:          { name: 'Africa',        countries: ['DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','CI','DJ','EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','EH','ZM','ZW'] },
  Europe:          { name: 'Europe',        countries: ['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','TR','UA','GB','VA'] },
  Asia:            { name: 'Asia',          countries: ['AF','AM','AZ','BH','BD','BT','BN','KH','CN','GE','IN','ID','IR','IQ','IL','JP','JO','KZ','KW','KG','LA','LB','MY','MV','MN','MM','NP','KP','OM','PK','PS','PH','QA','SA','SG','KR','XK','LK','SY','TW','TJ','TH','TL','TM','AE','UZ','VN','YE'] },
  'North America': { name: 'North America', countries: ['CA','MX','US','GL','BM','BS','CU','DO','HT','JM','KY','PR','SX','TC','VI'] },
  'South America': { name: 'South America', countries: ['AR','BO','BR','CL','CO','EC','GY','PY','PE','SR','UY','VE'] },
  Oceania:         { name: 'Oceania',       countries: ['AU','FJ','KI','MH','FM','NR','NC','NZ','PG','WS','SB','TO','TV','VU'] },
}

const countryToContinent: Record<string, string> = {}
Object.entries(CONTINENTS).forEach(([cont, data]) =>
  data.countries.forEach(c => { countryToContinent[c] = cont }),
)

// ── State ────────────────────────────────────────────────────────────────────
const mapRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const mode = ref<'world' | 'continent'>('world')
const activeContinent = ref<string | null>(null)
const hoveredContinent = ref<string | null>(null)
const hoveredCountry = ref<string | null>(null)
const selectedCountry = ref<InterventionCountry | null>(null)
const tooltip = ref({ visible: false, x: 0, y: 0, text: '', sub: '' })

const interventionSet = computed(() => {
  const s = new Set<string>()
  props.countries.forEach(c => { if (c.isoCode) s.add(c.isoCode.toUpperCase()) })
  return s
})

// ── SVG internals ────────────────────────────────────────────────────────────
let svgEl: SVGSVGElement | null = null
let origViewBox = '0 0 1000 507'
const continentVBCache: Record<string, string> = {}
let rafId: number | null = null

function getSvg() { return mapRef.value?.querySelector<SVGSVGElement>('svg') ?? null }

// ── Load & setup ─────────────────────────────────────────────────────────────
async function loadMap() {
  try {
    const res = await fetch('/world-map.svg')
    if (!res.ok) throw new Error(`SVG load failed (${res.status})`)
    const raw = await res.text()

    if (!mapRef.value) return

    // Strip XML declaration and inject
    mapRef.value.innerHTML = raw.replace(/<\?xml[^>]*\?>/gi, '').trim()
    await nextTick()

    svgEl = getSvg()
    if (!svgEl) throw new Error('SVG element not found')

    // Fit container
    svgEl.setAttribute('width', '100%')
    svgEl.setAttribute('height', '100%')
    svgEl.style.display = 'block'

    // Store original viewBox
    origViewBox = svgEl.getAttribute('viewBox') ?? '0 0 1000 507'

    // Clear any default black fills baked into the SVG
    svgEl.querySelectorAll<SVGElement>('path,polygon,rect,circle').forEach(el => {
      el.removeAttribute('fill')
      el.removeAttribute('stroke')
      el.removeAttribute('class')
      el.style.cssText = ''
    })

    // Compute continent bounding boxes after a paint frame
    await new Promise<void>(r => requestAnimationFrame(() => { computeVBs(); r() }))

    applyStyles()
    attachListeners()
    isLoading.value = false
  } catch (e) {
    loadError.value = (e as Error).message || 'Failed to load map'
    isLoading.value = false
  }
}

function computeVBs() {
  if (!svgEl) return
  Object.entries(CONTINENTS).forEach(([name, data]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    let hits = 0
    data.countries.forEach(code => {
      const el = svgEl!.getElementById(code) as SVGGraphicsElement | null
      if (!el) return
      try {
        const b = el.getBBox()
        if (b.width < 1 && b.height < 1) return
        if (b.x < minX) minX = b.x
        if (b.y < minY) minY = b.y
        if (b.x + b.width > maxX) maxX = b.x + b.width
        if (b.y + b.height > maxY) maxY = b.y + b.height
        hits++
      } catch { /* getBBox unavailable */ }
    })
    if (hits === 0 || minX === Infinity) return
    const px = (maxX - minX) * 0.1
    const py = (maxY - minY) * 0.1
    continentVBCache[name] = `${minX - px} ${minY - py} ${maxX - minX + px * 2} ${maxY - minY + py * 2}`
  })
}

// ── Styling ──────────────────────────────────────────────────────────────────
function applyStyles() {
  if (!svgEl) return

  if (mode.value === 'world') {
    const hSet = hoveredContinent.value
      ? new Set(CONTINENTS[hoveredContinent.value]?.countries ?? [])
      : null

    svgEl.querySelectorAll<SVGPathElement>('path[id]').forEach(p => {
      p.style.fill = hSet?.has(p.id) ? C.continentHover : C.worldBase
      p.style.stroke = C.stroke
      p.style.strokeWidth = C.strokeW
      p.style.cursor = 'pointer'
      p.style.transition = 'fill 0.2s ease'
    })
  } else {
    const active = new Set(CONTINENTS[activeContinent.value ?? '']?.countries ?? [])
    const selId = selectedCountry.value?.isoCode?.toUpperCase()

    svgEl.querySelectorAll<SVGPathElement>('path[id]').forEach(p => {
      const id = p.id
      if (!active.has(id)) {
        p.style.fill = C.outOfFocus
        p.style.cursor = 'default'
      } else {
        const isInt = interventionSet.value.has(id)
        const isHov = hoveredCountry.value === id
        const isSel = selId === id
        if (isSel || isHov) {
          p.style.fill = isInt ? C.interventionHover : C.noInterHover
        } else if (isInt) {
          p.style.fill = C.intervention
        } else {
          p.style.fill = C.inContinent
        }
        p.style.cursor = 'pointer'
      }
      p.style.stroke = C.stroke
      p.style.strokeWidth = C.strokeW
      p.style.transition = 'fill 0.2s ease'
    })
  }
}

// ── Event handlers ───────────────────────────────────────────────────────────
function idFromEvent(e: Event): string | null {
  let el = e.target as Element | null
  while (el && el !== svgEl) {
    if (el.id) return el.id
    el = el.parentElement
  }
  return null
}

function attachListeners() {
  svgEl?.addEventListener('mousemove', onMove)
  svgEl?.addEventListener('mouseleave', onLeave)
  svgEl?.addEventListener('click', onClick)
}

function onMove(e: MouseEvent) {
  const id = idFromEvent(e)

  if (mode.value === 'world') {
    const cont = id ? (countryToContinent[id] ?? null) : null
    if (cont !== hoveredContinent.value) { hoveredContinent.value = cont; applyStyles() }
    tooltip.value = cont
      ? { visible: true, x: e.clientX, y: e.clientY, text: cont, sub: 'Click to explore' }
      : { ...tooltip.value, visible: false }
  } else {
    const inActive = id ? countryToContinent[id] === activeContinent.value : false
    const nh = inActive ? id : null
    if (nh !== hoveredCountry.value) { hoveredCountry.value = nh; applyStyles() }
    if (id && inActive) {
      const entry = props.countries.find(c => c.isoCode?.toUpperCase() === id)
      tooltip.value = {
        visible: true, x: e.clientX, y: e.clientY,
        text: entry?.name ?? id,
        sub: entry ? 'Click for details' : 'No intervention data',
      }
    } else {
      tooltip.value.visible = false
    }
  }
}

function onLeave() {
  hoveredContinent.value = null
  hoveredCountry.value = null
  tooltip.value.visible = false
  applyStyles()
}

function onClick(e: MouseEvent) {
  const id = idFromEvent(e)
  if (!id) return

  if (mode.value === 'world') {
    const cont = countryToContinent[id]
    if (cont) enterContinent(cont)
  } else {
    if (countryToContinent[id] !== activeContinent.value) return
    const entry = props.countries.find(c => c.isoCode?.toUpperCase() === id) ?? null
    if (!entry) return // only clickable for intervention countries
    selectedCountry.value = selectedCountry.value?.isoCode?.toUpperCase() === id ? null : entry
    applyStyles()
  }
}

// ── ViewBox zoom animation ───────────────────────────────────────────────────
function animVB(target: string, ms = 720) {
  if (!svgEl) return
  const a = (svgEl.getAttribute('viewBox') ?? origViewBox).split(' ').map(Number)
  const b = target.split(' ').map(Number)
  if (a.length < 4 || b.length < 4) return
  const ax = a[0]!, ay = a[1]!, aw = a[2]!, ah = a[3]!
  const bx = b[0]!, by = b[1]!, bw = b[2]!, bh = b[3]!
  const t0 = performance.now()
  if (rafId !== null) cancelAnimationFrame(rafId)
  function ease(t: number) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2 }
  function frame(now: number) {
    const t = Math.min((now - t0) / ms, 1)
    const e = ease(t)
    svgEl!.setAttribute('viewBox', `${ax+(bx-ax)*e} ${ay+(by-ay)*e} ${aw+(bw-aw)*e} ${ah+(bh-ah)*e}`)
    rafId = t < 1 ? requestAnimationFrame(frame) : null
  }
  rafId = requestAnimationFrame(frame)
}

function enterContinent(name: string) {
  const vb = continentVBCache[name]
  if (!vb) return
  activeContinent.value = name
  mode.value = 'continent'
  selectedCountry.value = null
  hoveredContinent.value = null
  tooltip.value.visible = false
  animVB(vb)
  setTimeout(applyStyles, 40)
}

function backToWorld() {
  mode.value = 'world'
  activeContinent.value = null
  selectedCountry.value = null
  hoveredCountry.value = null
  tooltip.value.visible = false
  animVB(origViewBox)
  setTimeout(applyStyles, 40)
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => { if (import.meta.client) loadMap() })
onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  svgEl?.removeEventListener('mousemove', onMove)
  svgEl?.removeEventListener('mouseleave', onLeave)
  svgEl?.removeEventListener('click', onClick)
})
watch(() => props.countries, applyStyles, { deep: true })
</script>

<template>
  <div class="relative w-full select-none">

    <!-- ── Map container ─────────────────────────────────────── -->
    <div class="relative rounded-[28px] overflow-hidden bg-[#F8FAFC] shadow-lg" style="height: 60vh; min-height: 420px;">

      <!-- SVG injection target -->
      <div ref="mapRef" class="w-full h-full" />

      <!-- Loading / error overlays -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-surface-container/80 z-20">
        <div class="flex flex-col items-center gap-3 text-on-surface-variant">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm font-medium">Loading map…</span>
        </div>
      </div>
      <div v-if="loadError" class="absolute inset-0 flex items-center justify-center text-sm text-red-500 p-8 text-center">
        {{ loadError }}
      </div>

      <!-- ── Controls (top-left) ───────────────────────────── -->
      <div class="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Transition name="fade">
          <button
            v-if="mode === 'continent'"
            @click="backToWorld"
            class="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md text-sm font-bold text-on-surface hover:bg-white transition-all"
          >
            <ArrowLeft class="w-4 h-4" />
            World view
          </button>
        </Transition>
      </div>

      <!-- ── Mode badge (top-right) ────────────────────────── -->
      <div class="absolute top-4 right-4 z-10">
        <div class="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-[11px] font-bold uppercase tracking-widest text-on-surface-variant shadow-sm">
          <template v-if="mode === 'world'">Hover a continent · Click to zoom</template>
          <template v-else>{{ activeContinent }} · Click a country</template>
        </div>
      </div>

      <!-- ── Country info panel ────────────────────────────── -->
      <Transition name="panel-slide">
        <div
          v-if="selectedCountry"
          class="absolute bottom-4 right-4 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 z-10"
        >
          <button
            class="absolute top-3 right-3 w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            @click="selectedCountry = null; applyStyles()"
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

    <!-- ── Tooltip (fixed, follows mouse) ───────────────────── -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        class="fixed z-[9999] pointer-events-none"
        :style="{ left: tooltip.x + 14 + 'px', top: tooltip.y + 14 + 'px' }"
      >
        <div class="bg-on-surface/90 text-surface backdrop-blur-sm rounded-xl px-3 py-2 shadow-xl text-sm">
          <p class="font-bold leading-none">{{ tooltip.text }}</p>
          <p v-if="tooltip.sub" class="text-white/60 text-[11px] mt-1">{{ tooltip.sub }}</p>
        </div>
      </div>
    </Teleport>

    <!-- ── Legend ──────────────────────────────────────────── -->
    <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-body text-on-surface-variant">
      <div class="flex items-center gap-2">
        <span class="w-4 h-3 rounded inline-block" style="background:#4ade80"></span>
        <span>Intervention countries</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-3 rounded inline-block" style="background:#B8C4CE"></span>
        <span>Other countries in region</span>
      </div>
      <div class="flex items-center gap-2 text-xs opacity-60">
        <span>In world view: click any continent to zoom in</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tooltip fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(-6px); }

/* Country info panel slide */
.panel-slide-enter-active { animation: panel-in 0.3s cubic-bezier(0.34,1.4,0.64,1) forwards; }
.panel-slide-leave-active { animation: panel-in 0.2s ease reverse forwards; }
@keyframes panel-in {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Ensure SVG fills its host div */
:deep(svg) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
