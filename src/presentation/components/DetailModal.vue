<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(defineProps<{ open: boolean; variant?: 'default' | 'primary' }>(), {
  variant: 'default',
})
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
            class="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[28px] shadow-2xl p-8"
            :class="variant === 'primary' ? 'bg-primary text-white' : 'bg-surface'"
          >
            <button
              type="button"
              class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              :class="variant === 'primary'
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'"
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
