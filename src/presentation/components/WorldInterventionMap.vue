<script setup lang="ts">
import type { InterventionCountry } from '@infrastructure/repositories/HttpPartnersRepository'
import WorldSvgMap from './WorldSvgMap.vue'

defineProps<{ countries: InterventionCountry[] }>()
</script>

<template>
  <WorldSvgMap :countries="countries" />
</template>
