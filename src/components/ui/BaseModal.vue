<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { X } from 'lucide-vue-next'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: Size
    closeOnBackdrop?: boolean
    closeOnEsc?: boolean
    hideClose?: boolean
  }>(),
  {
    size: 'sm',
    closeOnBackdrop: true,
    closeOnEsc: true,
    hideClose: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const sizeMap: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onBackdropClick = () => {
  if (props.closeOnBackdrop) close()
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue && props.closeOnEsc) close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('overflow-hidden')
})

watch(
  () => props.modelValue,
  (open) => {
    document.body.classList.toggle('overflow-hidden', open)
  },
  { immediate: true }
)
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      @click.self="onBackdropClick"
    >
      <div
        :class="[
          'w-full surface rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up',
          sizeMap[size],
        ]"
      >
        <header
          v-if="title || $slots.header || !hideClose"
          class="flex items-center justify-between gap-4 px-6 pt-5 pb-3 border-b border-default-soft"
        >
          <div class="min-w-0 flex-1">
            <slot name="header">
              <h3 v-if="title" class="text-lg font-bold text-default truncate">
                {{ title }}
              </h3>
            </slot>
          </div>
          <button
            v-if="!hideClose"
            type="button"
            class="shrink-0 text-subtle hover:text-default transition-colors"
            aria-label="Cerrar"
            @click="close"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        <div class="px-6 py-5">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="flex flex-wrap justify-end gap-2 px-6 pb-5 pt-2 border-t border-default-soft"
        >
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
