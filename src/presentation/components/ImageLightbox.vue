<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ open: boolean; src: string; alt?: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <button
          type="button"
          class="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
        <img
          :src="src"
          :alt="alt"
          class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          @click.stop
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-fade-enter-active,
.lightbox-fade-leave-active { transition: opacity 0.2s ease; }
.lightbox-fade-enter-from,
.lightbox-fade-leave-to { opacity: 0; }
</style>
