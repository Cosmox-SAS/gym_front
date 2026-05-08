<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 p-4" :style="{ background: 'var(--modal-backdrop)' }">
    <div class="w-full max-w-md p-6 rounded-lg shadow-lg" :style="{ background: 'var(--modal-panel-bg)', border: '1px solid var(--modal-panel-border)' }">
      <h2 class="text-xl font-bold mb-4 inline-flex items-center gap-2">
        <ClipboardList class="w-5 h-5 text-primary-600" aria-hidden="true" />
        Asignar membresía a {{ member?.name }}
      </h2>

      <form @submit.prevent="asignar">
        <label class="block mb-1 text-sm inline-flex items-center gap-1.5">
          <Tag class="w-4 h-4 text-muted" aria-hidden="true" />
          Plan
        </label>
        <BaseSelect
          v-model="planId"
          placeholder="Seleccione un plan"
          required
          :options="planOptions"
        />

        <div class="flex justify-end gap-3 mt-4">
          <button type="button" @click="$emit('close')" class="btn btn-secondary inline-flex items-center gap-2">
            <X class="w-4 h-4" aria-hidden="true" />
            Cancelar
          </button>
          <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded inline-flex items-center gap-2" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" aria-hidden="true" />
            <Check v-else class="w-4 h-4" aria-hidden="true" />
            {{ loading ? 'Asignando...' : 'Asignar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/axios'
import Swal from 'sweetalert2'
import { ClipboardList, Tag, X, Check, Loader2 } from 'lucide-vue-next'
import { BaseSelect } from '@/components/ui'

const props = defineProps({
  show: Boolean,
  member: Object,
  planes: Array
})

const emit = defineEmits(['close', 'assigned'])
const planId = ref("")
const loading = ref(false)

const planOptions = computed(() =>
  (props.planes || []).map((p) => ({ value: p.id, label: p.name }))
)

const asignar = async () => {
  if (!planId.value) return
  loading.value = true

  try {
    await api.post("/memberships", {
      member_id: props.member.id,
      plan_id: planId.value,
    })

    emit('assigned', props.member) // Notificamos éxito
    planId.value = "" // Reset
  } catch (error) {
    console.error(error)
    Swal.fire('Error', error.response?.data?.error || "Error al asignar.", 'error')
  } finally {
    loading.value = false
  }
}
</script>
