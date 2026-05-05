
<template>
  <div class="border border-default-soft rounded-xl p-5 bg-[var(--color-surface-soft)]">
    <h3 class="text-base font-semibold text-default mb-3">
      Huella Dactilar
    </h3>

    <!-- Estado actual -->
    <div class="flex items-center gap-3 mb-4">
      <span
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
        :class="captured || hasFingerprint ? 'bg-green-100 text-green-700' : 'bg-[var(--color-overlay-strong)] text-muted'"
      >
        <span class="w-2 h-2 rounded-full" :class="captured || hasFingerprint ? 'bg-green-500' : 'bg-gray-400'"></span>
        {{ captured ? 'Huella capturada (se guardará al registrar)' : hasFingerprint ? 'Huella registrada' : 'Sin huella' }}
      </span>
    </div>

    <!-- Botón enrolar -->
    <div class="flex justify-center">
      <button
        type="button"
        @click="startEnroll"
        :disabled="busy"
        class="btn btn-primary btn-sm min-w-[180px]"
      >
        <svg v-if="busy" class="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        {{ busy ? 'Leyendo huella...' : (captured || hasFingerprint ? 'Reemplazar huella' : 'Capturar huella') }}
      </button>
    </div>

    <!-- Mensaje de estado -->
    <p v-if="statusMsg" class="mt-3 text-sm text-center text-muted">{{ statusMsg }}</p>

    <!-- Resultado -->
    <div v-if="result" class="mt-3 p-3 rounded-lg text-sm text-center font-medium"
      :class="result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
      {{ result.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFingerprint } from '@/composables/useFingerprint'
import { useAuthStore } from '@/stores/useAuthStore'

const props = defineProps<{
  memberId?: number | null
  hasFingerprint?: boolean
}>()

const emit = defineEmits<{
  enrolled: []
  captured: [template: string]
}>()

const auth = useAuthStore()
const { busy, statusMsg, enroll } = useFingerprint()

const result   = ref<{ success: boolean; message: string } | null>(null)
const captured = ref(false)

async function startEnroll() {
  result.value = null

  try {
    if (props.memberId) {
      // Modo edición: guardar directamente en la API tras 4 muestras
      const ev = await enroll(props.memberId, import.meta.env.VITE_API_URL, auth.token as string)
      if (ev.event === 'enrolled') {
        result.value = { success: ev.success, message: ev.message }
        if (ev.success) emit('enrolled')
      }
    } else {
      // Modo creación: acumular 4 muestras y emitir template (se guardará al registrar)
      const ev = await enroll(null, '', '')
      if (ev.event === 'captured') {
        if (ev.success && (ev as any).template) {
          captured.value = true
          result.value   = { success: true, message: 'Huella capturada. Se guardará al registrar.' }
          emit('captured', ev.template!)
        } else {
          result.value = { success: false, message: (ev as any).message ?? 'Error al capturar.' }
        }
      }
    }
  } catch (err: any) {
    result.value = { success: false, message: err.message }
  }
}
</script>
