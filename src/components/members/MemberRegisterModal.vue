<template>
  <Transition name="modal-fade">
    <div v-if="show" class="register-overlay" @click.self="$emit('close')">
      <div class="register-panel">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-default-soft">
          <div class="flex items-center gap-4">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style="background: rgba(99,102,241,0.12); color: #818cf8;"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-default tracking-tight leading-tight">
                Registrar Nuevo Cliente
              </h1>
              <p class="text-xs text-muted mt-0.5">
                Complete los detalles para dar de alta un nuevo miembro.
              </p>
            </div>
          </div>
          <button
            type="button"
            class="p-2 hover:bg-[var(--color-overlay)] rounded-full transition-colors"
            aria-label="Cerrar"
            @click="$emit('close')"
          >
            <svg class="w-5 h-5 text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body scrollable -->
        <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-7">
          <form id="register-form" class="space-y-8" @submit.prevent="registrar">
            <!-- ===== Información personal ===== -->
            <div>
              <div class="section-header" style="margin-bottom: 0.5rem;">
                <span class="section-bar bg-primary-600" />
                <h2 class="section-title" style="color: var(--color-text-muted);">Información Personal</h2>
              </div>
              <section class="p-5 sm:p-6 bg-[var(--color-surface-soft)] rounded-xl border border-default-soft">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <BaseInput
                  v-model="form.name"
                  label="Nombre Completo"
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  required
                />
                <BaseInput
                  v-model="form.identification"
                  label="Cédula / ID"
                  type="text"
                  placeholder="12345678"
                  required
                />
                <BaseInput
                  v-model="form.email"
                  label="Email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                />
                <BaseInput
                  v-model="form.phone"
                  label="Teléfono"
                  type="tel"
                  placeholder="+57 300 123 4567"
                />
                <BaseInput
                  v-model="form.birth_date"
                  label="Fecha de Nacimiento"
                  type="date"
                />
                <BaseSelect
                  v-model="form.sexo"
                  label="Sexo"
                  :options="sexoOptions"
                />
              </div>
              </section>
            </div>

            <!-- ===== Biometría ===== -->
            <div>
              <div class="section-header" style="margin-bottom: 0.5rem;">
                <span class="section-bar bg-success-600" />
                <h2 class="section-title" style="color: var(--color-text-muted);">Biometría</h2>
              </div>
              <section class="p-5 sm:p-6 bg-[var(--color-surface-soft)] rounded-xl border border-default-soft">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <BaseInput
                    v-model.number="form.estatura"
                    label="Estatura"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1.70"
                  >
                    <template #suffix>
                      <span class="text-xs font-semibold text-success-700">m</span>
                    </template>
                  </BaseInput>

                  <BaseInput
                    v-model.number="form.peso"
                    label="Peso"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="70.5"
                  >
                    <template #suffix>
                      <span class="text-xs font-semibold text-success-700">kg</span>
                    </template>
                  </BaseInput>
                </div>
              </section>
            </div>

            <!-- ===== Objetivos / Observaciones ===== -->
            <section>
              <div class="section-header">
                <span class="section-bar bg-amber-500" />
                <h2 class="section-title" style="color: var(--color-text-muted);">Objetivos / Observaciones</h2>
                <span class="ml-auto optional-tag">Opcional</span>
              </div>
              <textarea
                v-model="form.medical_history"
                rows="3"
                class="field-input resize-none"
                placeholder="Ej. perder peso, ganar masa muscular, condiciones a tener en cuenta..."
              />
            </section>

            <!-- ===== Plan inicial ===== -->
            <section v-if="planes && planes.length" class="pt-6 border-t border-default-soft">
              <BaseSelect
                v-model="form.plan_id"
                label="Asignar Plan Inicial"
                hint="Se creará la membresía pendiente de pago."
                :options="planOptions"
              />
            </section>

            <!-- ===== Huella dactilar ===== -->
            <section class="pt-6 border-t border-default-soft">
              <div class="section-header">
                <span class="section-bar bg-primary-600" />
                <h2 class="section-title" style="color: var(--color-text-muted);">Huella Dactilar</h2>
                <span class="ml-auto optional-tag">Opcional</span>
              </div>
              <div class="rounded-xl border-2 border-dashed border-default-soft bg-[var(--color-surface-soft)] p-4">
                <FingerprintEnroll
                  :member-id="null"
                  :has-fingerprint="false"
                  @captured="(t) => (capturedTemplate = t)"
                />
                <p
                  v-if="capturedTemplate"
                  class="mt-3 flex items-center gap-1.5 text-xs font-semibold text-success-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Huella capturada — se guardará al registrar
                </p>
              </div>
            </section>

            <!-- ===== Fotos Iniciales (frente, perfil, espalda) ===== -->
            <section class="pt-6 border-t border-default-soft">
              <div class="section-header">
                <span class="section-bar bg-success-600" />
                <h2 class="section-title" style="color: var(--color-text-muted);">Fotos Iniciales</h2>
                <span class="ml-auto optional-tag">Opcional</span>
              </div>
              <div class="rounded-xl border-2 border-dashed border-default-soft bg-[var(--color-surface-soft)] p-4">
                <ProgressPhotoCapture
                  v-model="initialPhotos"
                  :labels="['Frente', 'Perfil', 'Espalda']"
                />
                <p class="mt-3 text-xs text-muted">
                  Solo PNG/JPG/JPEG hasta 3MB.
                </p>
              </div>
            </section>

          </form>
        </div>

        <!-- Footer -->
        <div
          class="px-6 sm:px-8 py-5 border-t border-default-soft bg-[var(--color-surface-soft)] flex items-center justify-end gap-3"
        >
          <BaseButton variant="secondary" @click="$emit('close')">
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            form="register-form"
            variant="primary"
            size="lg"
            :loading="loading"
            :disabled="loading"
          >
            Guardar Cliente
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import api from "@/axios";
import Swal from "sweetalert2";
import FingerprintEnroll from "@/components/FingerprintEnroll.vue";
import ProgressPhotoCapture from "@/components/members/ProgressPhotoCapture.vue";
import { BaseInput, BaseSelect, BaseButton } from "@/components/ui";
import { SWAL_COLORS } from "@/lib/colors";

const props = defineProps({
  show: Boolean,
  planes: Array,
});

const emit = defineEmits(["close", "saved"]);

const loading = ref(false);
const capturedTemplate = ref("");
const initialPhotos = ref([null, null, null]);

const sexoOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "no binario", label: "No binario" },
  { value: "otro", label: "Otro" },
];

const planOptions = computed(() => [
  { value: "", label: "— Solo registrar cliente —" },
  ...(props.planes || []).map((p) => ({ value: p.id, label: p.name })),
]);

const form = reactive({
  name: "",
  identification: "",
  email: "",
  phone: "",
  birth_date: "",
  medical_history: "",
  sexo: "masculino",
  peso: null,
  estatura: null,
  plan_id: "",
});

function resetForm() {
  Object.assign(form, {
    name: "",
    identification: "",
    email: "",
    phone: "",
    birth_date: "",
    medical_history: "",
    sexo: "masculino",
    peso: null,
    estatura: null,
    plan_id: "",
  });
  capturedTemplate.value = "";
  initialPhotos.value = [null, null, null];
}

const registrar = async () => {
  loading.value = true;
  try {
    const payload = {
      ...form,
      initial_photos: initialPhotos.value,
    };
    const { data: nuevoCliente } = await api.post("/members", payload);

    if (capturedTemplate.value) {
      await api.post(`/members/${nuevoCliente.id}/fingerprint`, {
        fingerprint_data: capturedTemplate.value,
      });
    }

    emit("saved", { client: nuevoCliente, hasPlan: !!form.plan_id });
    resetForm();
  } catch (e) {
    console.error(e);
    if (e.response?.status === 422) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Verifica si la identificación o email ya existen.",
        confirmButtonColor: SWAL_COLORS.danger,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar el cliente.",
        confirmButtonColor: SWAL_COLORS.danger,
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ===== Overlay ===== */
.register-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--modal-backdrop);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  overflow-y: auto;
}

/* ===== Panel ===== */
.register-panel {
  position: relative;
  width: 100%;
  max-width: 64rem;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  background: var(--modal-panel-bg);
  border: 1px solid var(--modal-panel-border);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 10px 20px -5px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* ===== Transición ===== */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-active .register-panel,
.modal-fade-leave-active .register-panel {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .register-panel,
.modal-fade-leave-to .register-panel {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
}

/* ===== Section header ===== */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.section-bar {
  display: block;
  width: 4px;
  height: 1.25rem;
  border-radius: 9999px;
}
.section-title {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.optional-tag {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text-subtle);
}

</style>
