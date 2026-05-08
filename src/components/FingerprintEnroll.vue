
<template>
  <div class="border border-default-soft rounded-xl p-5 bg-[var(--color-surface-soft)]">
    <h3 class="text-base font-semibold text-default mb-3 flex items-center gap-2">
      <Fingerprint class="w-4 h-4" aria-hidden="true" />
      Huella Dactilar
    </h3>

    <!-- Estado actual -->
    <div class="flex items-center gap-3 mb-4">
      <span
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
        :class="captured || hasFingerprint ? 'bg-green-100 text-green-700' : 'bg-[var(--color-overlay-strong)] text-muted'"
      >
        <component :is="captured || hasFingerprint ? Check : Circle" class="w-3 h-3" aria-hidden="true" />
        {{ captured ? 'Huella capturada (se guardará al registrar)' : hasFingerprint ? 'Huella registrada' : 'Sin huella' }}
      </span>
    </div>

    <!-- Botón enrolar -->
    <button
      type="button"
      @click="startEnroll"
      :disabled="busy"
      class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      :class="busy
        ? 'bg-[var(--color-overlay-strong)] text-subtle cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700 text-white'"
    >
      <Loader2 v-if="busy" class="w-4 h-4 animate-spin" aria-hidden="true" />
      <Fingerprint v-else class="w-4 h-4" aria-hidden="true" />
      <span>{{ busy ? 'Leyendo huella...' : (captured || hasFingerprint ? 'Reemplazar huella' : 'Capturar huella') }}</span>
    </button>

    <!-- Mensaje de estado -->
    <p v-if="statusMsg" class="mt-3 text-sm text-center text-muted">{{ statusMsg }}</p>

    <!-- Resultado -->
    <div v-if="result" class="mt-3 p-3 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2"
      :class="result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
      <component :is="result.success ? CheckCircle2 : XCircle" class="w-4 h-4" aria-hidden="true" />
      {{ result.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFingerprint } from '@/composables/useFingerprint'
import { useAuthStore } from '@/stores/useAuthStore'
import { Fingerprint, Check, Circle, CheckCircle2, XCircle, Loader2 } from 'lucide-vue-next'

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
