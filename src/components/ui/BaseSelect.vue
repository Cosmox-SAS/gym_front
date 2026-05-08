<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { ChevronDown, X } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

type Option = { value: string | number; label: string } | string | number

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    placeholder?: string
    id?: string
    required?: boolean
    disabled?: boolean
    error?: string
    hint?: string
    options?: Option[]
    searchable?: boolean
    emptyText?: string
  }>(),
  {
    modelValue: '',
    required: false,
    disabled: false,
    searchable: false,
    emptyText: 'Sin resultados',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const attrs = useAttrs()
const rootClass = computed(() => attrs.class as unknown)

const selectId = computed(
  () => props.id ?? `cosmo-select-${Math.random().toString(36).slice(2, 8)}`
)

const normalizedOptions = computed(() =>
  (props.options ?? []).map((opt) =>
    typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
  )
)

const open = ref(false)
const searchText = ref('')
const wrapRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() =>
  normalizedOptions.value.find((o) => String(o.value) === String(props.modelValue))
)

const selectedLabel = computed(() => selectedOption.value?.label ?? '')

const filteredOptions = computed(() => {
  if (!props.searchable || !searchText.value) return normalizedOptions.value
  const lower = searchText.value.toLowerCase()
  return normalizedOptions.value.filter((o) => o.label.toLowerCase().includes(lower))
})

watch(
  () => props.modelValue,
  () => {
    if (props.searchable) {
      searchText.value = selectedLabel.value
    }
  },
  { immediate: true }
)

const toggle = () => {
  if (props.disabled) return
  open.value = !open.value
}

const selectOption = (opt: { value: string | number; label: string }) => {
  emit('update:modelValue', opt.value)
  if (props.searchable) searchText.value = opt.label
  open.value = false
}

const clearSelection = () => {
  emit('update:modelValue', '')
  searchText.value = ''
  open.value = false
}

const onSearchInput = () => {
  open.value = true
  if (props.modelValue !== '' && props.modelValue !== null) {
    emit('update:modelValue', '')
  }
}

const onClickOutside = (e: MouseEvent) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) {
    open.value = false
    if (props.searchable) {
      searchText.value = selectedLabel.value
    }
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div :class="['flex flex-col gap-1.5', rootClass]">
    <label v-if="label" :for="selectId" class="field-label">
      {{ label }}
      <span v-if="required" class="text-red-500" aria-hidden="true">*</span>
    </label>

    <div ref="wrapRef" class="cosmo-select-wrap relative">
      <input
        v-if="searchable"
        :id="selectId"
        v-model="searchText"
        type="text"
        :placeholder="placeholder ?? 'Buscar...'"
        :disabled="disabled"
        autocomplete="off"
        :class="[
          'cosmo-select-input w-full',
          error && 'cosmo-select-input--error',
          disabled && 'cosmo-select-input--disabled',
        ]"
        @focus="open = true"
        @input="onSearchInput"
      />
      <button
        v-else
        :id="selectId"
        type="button"
        :disabled="disabled"
        :class="[
          'cosmo-select-input cosmo-select-button w-full text-left',
          error && 'cosmo-select-input--error',
          disabled && 'cosmo-select-input--disabled',
        ]"
        @click="toggle"
      >
        <span v-if="selectedLabel">{{ selectedLabel }}</span>
        <span v-else class="cosmo-select-placeholder">
          {{ placeholder ?? 'Seleccionar...' }}
        </span>
      </button>

      <button
        v-if="searchable && searchText && !disabled"
        type="button"
        class="cosmo-select-clear"
        title="Borrar selección"
        aria-label="Borrar selección"
        @click.stop="clearSelection"
      >
        <X class="w-4 h-4" aria-hidden="true" />
      </button>
      <ChevronDown
        v-else
        class="cosmo-select-chevron"
        :class="{ 'cosmo-select-chevron--open': open }"
        aria-hidden="true"
      />

      <ul v-if="open && !disabled" class="cosmo-select-list">
        <li v-if="filteredOptions.length === 0" class="cosmo-select-empty">
          {{ emptyText }}
        </li>
        <li
          v-for="opt in filteredOptions"
          :key="opt.value"
          :class="[
            'cosmo-select-item',
            String(opt.value) === String(modelValue) && 'cosmo-select-item--active',
          ]"
          @click="selectOption(opt)"
        >
          {{ opt.label }}
        </li>
      </ul>

      <select
        v-if="required"
        tabindex="-1"
        aria-hidden="true"
        class="cosmo-select-hidden"
        :value="modelValue ?? ''"
        :required="required"
        @focus="(e) => ((e.target as HTMLSelectElement).blur())"
      >
        <option value="" />
        <option
          v-for="opt in normalizedOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-subtle">{{ hint }}</p>
  </div>
</template>

<style scoped>
.cosmo-select-wrap {
  position: relative;
}

.cosmo-select-input {
  height: 3rem;
  font-weight: 600;
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.04);
  color: var(--color-text);
  border-radius: 0.75rem;
  transition: all 0.25s ease;
  font-size: 0.95rem;
  padding: 0 2.5rem 0 1rem;
  outline: none;
  display: block;
}
.cosmo-select-input::placeholder {
  color: var(--color-text);
  opacity: 0.7;
}
.cosmo-select-input:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.5);
}
.cosmo-select-input:focus {
  border-color: #3b82f6;
  background: var(--color-surface);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.cosmo-select-button {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.cosmo-select-placeholder {
  color: var(--color-text);
  opacity: 0.6;
  font-weight: 500;
}

.cosmo-select-input--error {
  border-color: rgba(244, 63, 94, 0.6) !important;
}
.cosmo-select-input--error:focus {
  border-color: #f43f5e !important;
  box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.15) !important;
}

.cosmo-select-input--disabled,
.cosmo-select-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

:global(.dark) .cosmo-select-input {
  background: rgba(96, 165, 250, 0.08);
  border-color: rgba(96, 165, 250, 0.25);
  color: #93c5fd;
}
:global(.dark) .cosmo-select-input::placeholder {
  color: rgba(147, 197, 253, 0.7);
}
:global(.dark) .cosmo-select-input:hover:not(:disabled) {
  background: rgba(96, 165, 250, 0.12);
  border-color: rgba(96, 165, 250, 0.4);
}
:global(.dark) .cosmo-select-input:focus {
  background: var(--color-surface);
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
}
:global(.dark) .cosmo-select-placeholder {
  color: rgba(147, 197, 253, 0.7);
  opacity: 1;
}

.cosmo-select-chevron {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(156, 163, 175, 0.9);
  pointer-events: none;
  transition: transform 0.2s ease;
}
.cosmo-select-chevron--open {
  transform: translateY(-50%) rotate(180deg);
}

.cosmo-select-clear {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(156, 163, 175, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: color 0.15s ease;
  background: transparent;
  border: none;
  padding: 0;
}
.cosmo-select-clear:hover {
  color: #ef4444;
}

.cosmo-select-list {
  position: absolute;
  z-index: 50;
  width: 100%;
  margin-top: 0.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 6px 10px -5px rgba(0, 0, 0, 0.08);
  max-height: 15rem;
  overflow-y: auto;
  list-style: none;
  padding: 0;
}
:global(.dark) .cosmo-select-list {
  background: #1f2937;
  border-color: rgba(255, 255, 255, 0.1);
}

.cosmo-select-empty {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.cosmo-select-item {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--color-text-soft);
  transition: background-color 0.15s ease, color 0.15s ease;
}
.cosmo-select-item:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
}
:global(.dark) .cosmo-select-item {
  color: #e5e7eb;
}
:global(.dark) .cosmo-select-item:hover {
  background: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
}

.cosmo-select-item--active {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
  font-weight: 600;
}
:global(.dark) .cosmo-select-item--active {
  background: rgba(59, 130, 246, 0.25);
  color: #93c5fd;
}

.cosmo-select-list::-webkit-scrollbar {
  width: 6px;
}
.cosmo-select-list::-webkit-scrollbar-track {
  background: transparent;
}
.cosmo-select-list::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.cosmo-select-hidden {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}
</style>
