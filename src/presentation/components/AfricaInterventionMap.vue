<script setup lang="ts">
import { computed } from 'vue'
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'

const props = defineProps<{
  countries: InterventionCountry[]
}>()

const africaMapUrl = new URL('../assets/africa.svg', import.meta.url).href
const interventionCount = computed(() => props.countries.length)
</script>

<template>
  <div class="relative w-full select-none">
    <div class="overflow-hidden rounded-[28px] bg-surface-container p-4 shadow-sm">
      <img :src="africaMapUrl" alt="Africa map" class="w-full h-auto block" />
    </div>

    <div class="mt-4 flex items-center gap-6 text-sm font-body text-on-surface-variant">
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-sm bg-leaf inline-block"></span>
        <span>Country of Intervention ({{ interventionCount }})</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-sm bg-surface-container-high inline-block"></span>
        <span>Other</span>
      </div>
    </div>
  </div>
</template>
