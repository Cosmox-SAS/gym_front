<template>
  <!-- Overlay oscuro con backdrop blur (simula modal sobre la app) -->
  <div class="register-overlay">
    <!-- Panel principal -->
    <div class="register-panel">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-default-soft">
        <div class="flex items-center gap-4">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style="background: rgba(99,102,241,0.12); color: #818cf8;"
          >
            <UserPlus class="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-default tracking-tight leading-tight">
              Registrar Nuevo Cliente
            </h1>
            <p class="text-xs text-subtle mt-0.5">
              Complete los detalles para dar de alta un nuevo miembro.
            </p>
          </div>
        </div>
        <router-link
          :to="{ name: 'Members' }"
          class="p-2 hover:bg-[var(--color-overlay)] rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X class="w-5 h-5 text-muted" aria-hidden="true" />
        </router-link>
      </div>

      <!-- Body scrollable -->
      <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-7 no-scrollbar">
        <form class="space-y-8" @submit.prevent="registerMember">
          <!-- ===== Información personal ===== -->
          <section>
            <div class="section-header">
              <span class="section-bar bg-indigo-400" />
              <h2 class="section-title text-indigo-300">Información Personal</h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div class="dark-field">
                <label class="dark-label">Nombre Completo</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="dark-input"
                  :class="{ 'input-error': errors.name }"
                  placeholder="Ej. Juan Pérez"
                  required
                />
                <p v-if="errors.name" class="dark-error">{{ errors.name }}</p>
              </div>

              <div class="dark-field">
                <label class="dark-label">Cédula / ID</label>
                <input
                  v-model="form.identification"
                  type="text"
                  class="dark-input"
                  :class="{ 'input-error': errors.identification }"
                  placeholder="12345678-9"
                />
                <p v-if="errors.identification" class="dark-error">
                  {{ errors.identification }}
                </p>
              </div>

              <div class="dark-field">
                <label class="dark-label">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="dark-input"
                  :class="{ 'input-error': errors.email }"
                  placeholder="juan@ejemplo.com"
                  required
                />
                <p v-if="errors.email" class="dark-error">{{ errors.email }}</p>
              </div>

              <div class="dark-field">
                <label class="dark-label">Teléfono</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="dark-input"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div class="dark-field">
                <label class="dark-label">Fecha de Nacimiento</label>
                <input
                  v-model="form.birth_date"
                  type="date"
                  class="dark-input dark-input-date"
                />
              </div>

              <div class="dark-field">
                <label class="dark-label">Sexo</label>
                <div class="flex gap-2">
                  <button
                    v-for="opt in sexoOptions"
                    :key="opt.value"
                    type="button"
                    :class="[
                      'flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all border',
                      form.sexo === opt.value
                        ? 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)]'
                        : 'bg-[var(--color-overlay)] text-subtle border-default-soft hover:bg-[var(--color-overlay-strong)] hover:text-default',
                    ]"
                    @click="form.sexo = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ===== Biometría ===== -->
          <section class="p-5 sm:p-6 bg-[var(--color-overlay)] rounded-xl border border-default-soft">
            <div class="section-header">
              <span class="section-bar bg-emerald-400" />
              <h2 class="section-title text-emerald-300">Biometría</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="metric-card">
                <div class="flex-1 min-w-0">
                  <label class="dark-label-tiny">Estatura (cm)</label>
                  <input
                    v-model.number="form.estatura"
                    type="number"
                    step="1"
                    placeholder="175"
                    class="metric-input"
                  />
                </div>
              </div>

              <div class="metric-card">
                <div class="flex-1 min-w-0">
                  <label class="dark-label-tiny">Peso (kg)</label>
                  <input
                    v-model.number="form.peso"
                    type="number"
                    step="0.1"
                    placeholder="70.5"
                    class="metric-input"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- ===== Antecedentes médicos ===== -->
          <section>
            <div class="section-header">
              <span class="section-bar bg-rose-400" />
              <h2 class="section-title text-rose-300">Antecedentes Médicos</h2>
            </div>
            <textarea
              v-model="form.medical_history"
              rows="3"
              class="dark-input resize-none"
              placeholder="Detalle alergias, lesiones previas o condiciones crónicas relevantes..."
            />
          </section>

          <!-- ===== Plan inicial ===== -->
          <section v-if="planes.length" class="pt-6 border-t border-default-soft">
            <label class="dark-label block mb-4">Asignar Plan Inicial (Opcional)</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label
                v-for="(plan, idx) in planes"
                :key="plan.id"
                :for="`plan-${plan.id}`"
                :class="[
                  'block p-4 rounded-xl border-2 cursor-pointer transition-all',
                  selectedPlanId === plan.id
                    ? 'border-indigo-400 bg-indigo-400/10'
                    : 'border-default-soft bg-[var(--color-overlay)] hover:border-default',
                ]"
              >
                <input
                  :id="`plan-${plan.id}`"
                  v-model="selectedPlanId"
                  :value="plan.id"
                  type="radio"
                  name="plan"
                  class="sr-only"
                />
                <div class="flex justify-between items-start mb-2">
                  <span class="text-sm font-bold text-default capitalize">
                    {{ translateFrequency(plan.frequency) || plan.name }}
                  </span>
                  <span
                    v-if="idx === 1"
                    class="text-[9px] bg-indigo-400 text-slate-900 px-2 py-0.5 rounded-full font-black uppercase tracking-wider"
                  >
                    Popular
                  </span>
                  <div
                    v-else
                    :class="[
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                      selectedPlanId === plan.id
                        ? 'border-indigo-400 bg-indigo-400'
                        : 'border-white/20',
                    ]"
                  >
                    <div
                      v-if="selectedPlanId === plan.id"
                      class="w-1.5 h-1.5 bg-slate-900 rounded-full"
                    />
                  </div>
                </div>
                <p class="text-xl font-black text-default">
                  {{ formatPrice(plan.price) }}
                  <span class="text-xs font-medium text-subtle">
                    /{{ translateFrequency(plan.frequency)?.toLowerCase() || "mes" }}
                  </span>
                </p>
              </label>
            </div>
          </section>

          <!-- ===== Huella dactilar ===== -->
          <section class="pt-6 border-t border-default-soft">
            <div class="section-header">
              <span class="section-bar bg-indigo-400" />
              <h2 class="section-title text-indigo-300">Huella Dactilar</h2>
              <span class="ml-auto dark-label-tiny">Opcional</span>
            </div>
            <div class="rounded-xl border-2 border-dashed border-default-soft bg-[var(--color-overlay)] p-4">
              <FingerprintEnroll
                :member-id="null"
                :has-fingerprint="false"
                @captured="(t) => (capturedTemplate = t)"
              />
              <p
                v-if="capturedTemplate"
                class="mt-3 text-xs font-semibold text-emerald-400"
              >
                Huella capturada — se guardará al registrar
              </p>
            </div>
          </section>

          <!-- ===== Error global ===== -->
          <div
            v-if="errorMessage"
            class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30"
          >
            <p class="text-sm font-medium text-rose-300">{{ errorMessage }}</p>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div
        class="px-6 sm:px-8 py-5 border-t border-default-soft bg-[var(--color-overlay)] flex items-center justify-end gap-4"
      >
        <router-link
          :to="{ name: 'Members' }"
          class="px-5 py-2.5 text-sm font-bold text-subtle hover:text-default transition-colors inline-flex items-center gap-2"
        >
          <X class="w-4 h-4" aria-hidden="true" />
          Cancelar
        </router-link>
        <button
          type="button"
          :disabled="saving"
          class="register-submit-btn"
          @click="registerMember"
        >
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" aria-hidden="true" />
          <Save v-else class="w-4 h-4" aria-hidden="true" />
          <span>{{ saving ? "Guardando..." : "Guardar Cliente" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/axios";
import { X, UserPlus, Save, Loader2 } from 'lucide-vue-next'
import Swal from "sweetalert2";
import dayjs from "dayjs";
import FingerprintEnroll from "@/components/FingerprintEnroll.vue";
import { SWAL_COLORS } from "@/lib/colors";

const router = useRouter();

const sexoOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
];

const form = ref({
  name: "",
  identification: "",
  email: "",
  phone: "",
  birth_date: "",
  sexo: "",
  peso: null,
  estatura: null,
  medical_history: "",
});

const errors = ref({});
const planes = ref([]);
const selectedPlanId = ref(null);
const saving = ref(false);
const errorMessage = ref("");
const capturedTemplate = ref("");

function translateFrequency(freq) {
  const map = {
    daily: "Diario",
    weekly: "Semanal",
    monthly: "Mensual",
    quarterly: "Trimestral",
    biannual: "Semestral",
    yearly: "Anual",
    annual: "Anual",
  };
  return map[freq] || "";
}

function formatPrice(price) {
  if (price == null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

function calcEndDate(freq) {
  const today = dayjs();
  const units = {
    daily: ["day", 1],
    weekly: ["week", 1],
    monthly: ["month", 1],
    quarterly: ["month", 3],
    biannual: ["month", 6],
    yearly: ["year", 1],
    annual: ["year", 1],
  };
  const [unit, n] = units[freq] || ["month", 1];
  return today.add(n, unit).format("YYYY-MM-DD");
}

onMounted(async () => {
  try {
    const { data } = await api.get("/membershipPlan");
    planes.value = Array.isArray(data) ? data : data.data || [];
  } catch (err) {
    console.error("Error al cargar planes", err);
  }
});

function resetErrors() {
  errors.value = {};
  errorMessage.value = "";
}

const registerMember = async () => {
  if (saving.value) return;
  resetErrors();
  saving.value = true;

  try {
    const payload = { ...form.value };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "" || payload[k] === null) delete payload[k];
    });

    const res = await api.post("/members", payload);
    const member = res.data;

    if (selectedPlanId.value) {
      const plan = planes.value.find((p) => p.id === selectedPlanId.value);
      await api.post("/memberships", {
        member_id: member.id,
        plan_id: selectedPlanId.value,
        start_date: dayjs().format("YYYY-MM-DD"),
        end_date: calcEndDate(plan?.frequency),
        status: "active",
      });
    }

    if (capturedTemplate.value) {
      await api.post(`/members/${member.id}/fingerprint`, {
        fingerprint_data: capturedTemplate.value,
      });
    }

    await Swal.fire({
      icon: "success",
      title: "¡Cliente registrado!",
      text: "El cliente fue dado de alta correctamente.",
      confirmButtonColor: SWAL_COLORS.primary,
      timer: 2200,
      showConfirmButton: false,
    });

    router.push({ name: "Members" });
  } catch (error) {
    if (error.response?.status === 422) {
      const backendErrors = error.response.data.errors || {};
      const mapped = {};
      for (const [field, msgs] of Object.entries(backendErrors)) {
        mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs;
      }
      errors.value = mapped;
      errorMessage.value = "Verifica los datos resaltados e intenta nuevamente.";
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        "Error inesperado al registrar el cliente.";
    }
    console.error(error);
  } finally {
    saving.value = false;
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
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--modal-panel-border);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  animation: panel-in 0.25s ease-out;
}

@keyframes panel-in {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
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

/* ===== Campos oscuros ===== */
.dark-field { display: flex; flex-direction: column; gap: 0.4rem; }

.dark-label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text-subtle);
  padding-left: 0.25rem;
}

.dark-label-tiny {
  display: block;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text-subtle);
}

.dark-input {
  width: 100%;
  padding: 0.75rem 0.875rem;
  border-radius: 0.5rem;
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  color: var(--field-text);
  font-size: 0.875rem;
  outline: none;
  transition: all 0.15s;
}
.dark-input::placeholder { color: var(--field-placeholder); }
.dark-input:hover { border-color: var(--field-border-hover); }
.dark-input:focus {
  border-color: var(--field-border-focus);
  box-shadow: 0 0 0 3px var(--field-ring);
}
.dark-input.input-error {
  border-color: rgb(244 63 94);
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
}
.dark-input-date::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }

.dark-error {
  font-size: 0.6875rem;
  color: rgb(252 165 165);
  padding-left: 0.25rem;
}

/* ===== Metric card (biometría) ===== */
.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: 0.75rem;
}

.metric-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-input {
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
  margin-top: 0.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--field-text);
  outline: none;
}
.metric-input::placeholder { color: var(--field-placeholder); }

/* ===== Botón submit con gradiente ===== */
.register-submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.75rem;
  border-radius: 0.625rem;
  background: linear-gradient(135deg, rgb(167 165 255), rgb(100 94 251));
  color: rgb(28 0 160);
  font-size: 0.875rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  box-shadow: 0 10px 25px -10px rgba(167, 165, 255, 0.6);
  transition: all 0.15s;
  cursor: pointer;
}
.register-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 15px 30px -10px rgba(167, 165, 255, 0.75);
}
.register-submit-btn:active:not(:disabled) { transform: scale(0.97); }
.register-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ===== Scrollbar oculto pero funcional ===== */
.no-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
.no-scrollbar::-webkit-scrollbar { width: 6px; }
.no-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
.no-scrollbar::-webkit-scrollbar-track { background: transparent; }
</style>
