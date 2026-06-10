<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'
import { MapPin, X, Plus, Minus, Maximize2 } from 'lucide-vue-next'

const props = defineProps<{ countries: InterventionCountry[] }>()

// ── Colors ──────────────────────────────────────────────────────────────────
const C = {
  worldBase:          '#EEF1F4',
  intervention:       '#4ade80',
  interventionHover:  '#16a34a',
  stroke:             '#FFFFFF',
  strokeW:            '0.4',
} as const

// ── State ────────────────────────────────────────────────────────────────────
const mapRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
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

function getSvg() { return mapRef.value?.querySelector<SVGSVGElement>('svg') ?? null }

// ── Zoom & pan ───────────────────────────────────────────────────────────────
let origViewBox = '0 0 1000 507'
const ZOOM_MIN = 1
const ZOOM_MAX = 8
const zoom = ref(1)
let panX = 0
let panY = 0
let isPanning = false
let didPan = false
let panStart = { x: 0, y: 0 }
let panOrigin = { x: 0, y: 0 }

function parseVB(vb: string) {
  const [x, y, w, h] = vb.split(' ').map(Number)
  return { x: x ?? 0, y: y ?? 0, w: w ?? 1000, h: h ?? 507 }
}

function applyViewBox() {
  if (!svgEl) return
  const orig = parseVB(origViewBox)
  const w = orig.w / zoom.value
  const h = orig.h / zoom.value
  // Clamp pan so the viewBox stays within the original map bounds
  const maxX = orig.x + orig.w - w
  const maxY = orig.y + orig.h - h
  panX = Math.min(Math.max(panX, orig.x), Math.max(maxX, orig.x))
  panY = Math.min(Math.max(panY, orig.y), Math.max(maxY, orig.y))
  svgEl.setAttribute('viewBox', `${panX} ${panY} ${w} ${h}`)
}

function zoomBy(factor: number, center?: { x: number; y: number }) {
  if (!svgEl) return
  const orig = parseVB(origViewBox)
  const current = parseVB(svgEl.getAttribute('viewBox') ?? origViewBox)
  const newZoom = Math.min(Math.max(zoom.value * factor, ZOOM_MIN), ZOOM_MAX)
  if (newZoom === zoom.value) return

  // Keep the point under `center` (or the viewBox center) stationary while zooming
  const cx = center ? current.x + (center.x / svgEl.clientWidth) * current.w : current.x + current.w / 2
  const cy = center ? current.y + (center.y / svgEl.clientHeight) * current.h : current.y + current.h / 2

  const newW = orig.w / newZoom
  const newH = orig.h / newZoom
  panX = cx - (center ? (center.x / svgEl.clientWidth) * newW : newW / 2)
  panY = cy - (center ? (center.y / svgEl.clientHeight) * newH : newH / 2)
  zoom.value = newZoom
  applyViewBox()
  updateCursor()
}

function resetZoom() {
  zoom.value = 1
  panX = parseVB(origViewBox).x
  panY = parseVB(origViewBox).y
  applyViewBox()
  updateCursor()
}

function updateCursor() {
  if (!svgEl) return
  svgEl.style.cursor = zoom.value > ZOOM_MIN ? 'grab' : ''
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const rect = svgEl!.getBoundingClientRect()
  const center = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2, center)
}

let pointerDown = false
let activePointerId: number | null = null

function onPointerDown(e: PointerEvent) {
  if (zoom.value <= ZOOM_MIN) return
  pointerDown = true
  isPanning = false
  didPan = false
  panStart = { x: e.clientX, y: e.clientY }
  panOrigin = { x: panX, y: panY }
  activePointerId = e.pointerId
}

function onPointerMove(e: PointerEvent) {
  if (!pointerDown || !svgEl) return

  if (!isPanning) {
    if (Math.abs(e.clientX - panStart.x) <= 3 && Math.abs(e.clientY - panStart.y) <= 3) return
    // Drag exceeded the click threshold — start panning and capture the pointer
    isPanning = true
    didPan = true
    if (activePointerId !== null) svgEl.setPointerCapture(activePointerId)
    svgEl.style.cursor = 'grabbing'
    tooltip.value.visible = false
  }

  const current = parseVB(svgEl.getAttribute('viewBox') ?? origViewBox)
  const rect = svgEl.getBoundingClientRect()
  const dx = (e.clientX - panStart.x) / rect.width * current.w
  const dy = (e.clientY - panStart.y) / rect.height * current.h
  panX = panOrigin.x - dx
  panY = panOrigin.y - dy
  applyViewBox()
}

function onPointerUp(e: PointerEvent) {
  if (!pointerDown) return
  pointerDown = false
  if (isPanning) {
    isPanning = false
    if (activePointerId !== null) svgEl?.releasePointerCapture(activePointerId)
    if (svgEl) svgEl.style.cursor = zoom.value > ZOOM_MIN ? 'grab' : ''
  }
  activePointerId = null
}

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

    // Clear any default black fills baked into the SVG
    svgEl.querySelectorAll<SVGElement>('path,polygon,rect,circle').forEach(el => {
      el.removeAttribute('fill')
      el.removeAttribute('stroke')
      el.removeAttribute('class')
      el.style.cssText = ''
    })

    origViewBox = svgEl.getAttribute('viewBox') ?? origViewBox
    const orig = parseVB(origViewBox)
    panX = orig.x
    panY = orig.y

    applyStyles()
    attachListeners()
    isLoading.value = false
  } catch (e) {
    loadError.value = (e as Error).message || 'Failed to load map'
    isLoading.value = false
  }
}

// ── Styling ──────────────────────────────────────────────────────────────────
function applyStyles() {
  if (!svgEl) return

  const selId = selectedCountry.value?.isoCode?.toUpperCase()

  svgEl.querySelectorAll<SVGPathElement>('path[id]').forEach(p => {
    const id = p.id
    const isInt = interventionSet.value.has(id)
    const isHov = hoveredCountry.value === id
    const isSel = selId === id

    if (isInt) {
      p.style.fill = (isSel || isHov) ? C.interventionHover : C.intervention
      p.style.cursor = 'pointer'
    } else {
      p.style.fill = C.worldBase
      p.style.cursor = 'default'
    }
    p.style.stroke = C.stroke
    p.style.strokeWidth = C.strokeW
    p.style.transition = 'fill 0.2s ease'
  })
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
  svgEl?.addEventListener('wheel', onWheel, { passive: false })
  svgEl?.addEventListener('pointerdown', onPointerDown)
  svgEl?.addEventListener('pointermove', onPointerMove)
  svgEl?.addEventListener('pointerup', onPointerUp)
  svgEl?.addEventListener('pointerleave', onPointerUp)
}

function onMove(e: MouseEvent) {
  if (isPanning) { tooltip.value.visible = false; return }
  const id = idFromEvent(e)
  const isInt = id ? interventionSet.value.has(id) : false
  const nh = isInt ? id : null

  if (nh !== hoveredCountry.value) { hoveredCountry.value = nh; applyStyles() }

  if (id && isInt) {
    const entry = props.countries.find(c => c.isoCode?.toUpperCase() === id)
    tooltip.value = {
      visible: true, x: e.clientX, y: e.clientY,
      text: entry?.name ?? id,
      sub: 'Click for details',
    }
  } else {
    tooltip.value.visible = false
  }
}

function onLeave() {
  hoveredCountry.value = null
  tooltip.value.visible = false
  applyStyles()
}

function onClick(e: MouseEvent) {
  if (didPan) { didPan = false; return }
  const id = idFromEvent(e)
  if (!id) return
  if (!interventionSet.value.has(id)) return

  const entry = props.countries.find(c => c.isoCode?.toUpperCase() === id) ?? null
  if (!entry) return
  selectedCountry.value = selectedCountry.value?.isoCode?.toUpperCase() === id ? null : entry
  applyStyles()
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => { if (import.meta.client) loadMap() })
onUnmounted(() => {
  svgEl?.removeEventListener('mousemove', onMove)
  svgEl?.removeEventListener('mouseleave', onLeave)
  svgEl?.removeEventListener('click', onClick)
  svgEl?.removeEventListener('wheel', onWheel)
  svgEl?.removeEventListener('pointerdown', onPointerDown)
  svgEl?.removeEventListener('pointermove', onPointerMove)
  svgEl?.removeEventListener('pointerup', onPointerUp)
  svgEl?.removeEventListener('pointerleave', onPointerUp)
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

      <!-- ── Mode badge (top-right) ────────────────────────── -->
      <div class="absolute top-4 right-4 z-10">
        <div class="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-[11px] font-bold uppercase tracking-widest text-on-surface-variant shadow-sm">
          Click a highlighted country
        </div>
      </div>

      <!-- ── Zoom controls (bottom-left) ───────────────────── -->
      <div class="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          class="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl shadow-md text-on-surface hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="zoom >= 8"
          @click="zoomBy(1.4)"
          title="Zoom in"
        >
          <Plus class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl shadow-md text-on-surface hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="zoom <= 1"
          @click="zoomBy(1 / 1.4)"
          title="Zoom out"
        >
          <Minus class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl shadow-md text-on-surface hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="zoom <= 1"
          @click="resetZoom"
          title="Reset view"
        >
          <Maximize2 class="w-4 h-4" />
        </button>
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
        <span class="w-4 h-3 rounded inline-block" style="background:#EEF1F4"></span>
        <span>Other countries</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
