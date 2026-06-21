<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <Transition name="modal-pop" appear>
          <div
            class="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-surface rounded-[28px] shadow-2xl p-8"
          >
            <button
              type="button"
              class="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              @click="emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.modal-pop-enter-active { animation: modal-in 0.25s cubic-bezier(0.34, 1.4, 0.64, 1) forwards; }
.modal-pop-leave-active { animation: modal-in 0.15s ease reverse forwards; }
@keyframes modal-in {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
