<template>
  <Transition name="modal-fade">
    <div v-if="show" class="detail-overlay" @click.self="close">
      <div class="detail-panel">
        <!-- Hero card -->
        <div class="relative">
          <div class="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700 px-6 sm:px-10 pt-7 pb-20">
            <div class="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
              <div class="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
              <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/30 rounded-full blur-3xl" />
            </div>

            <div class="relative flex items-start justify-between gap-3">
              <div class="flex items-center gap-2 text-white/70 text-[11px] font-semibold uppercase tracking-widest">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ficha del cliente
              </div>
              <div class="flex items-center gap-2">
                <router-link
                  v-if="member"
                  :to="{ name: 'MemberEdit', params: { id: member.id } }"
                  class="btn-ghost-white"
                  @click="close"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </router-link>
                <a v-if="member?.phone" :href="`https://wa.me/${formatearTelefono(member.phone)}`" target="_blank" class="btn-ghost-white">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.52 3.48A11.8 11.8 0 0012.04 0C5.52 0 .17 5.35.14 11.87a11.82 11.82 0 001.58 5.94L0 24l6.35-1.67a11.83 11.83 0 005.68 1.45h.01c6.52 0 11.87-5.35 11.9-11.87a11.78 11.78 0 00-3.42-8.43z" />
                  </svg>
                  WhatsApp
                </a>
                <button type="button" class="btn-icon-white" aria-label="Cerrar" @click="close">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Avatar overlap -->
          <div class="relative px-6 sm:px-10 -mt-14 pb-5">
            <div class="flex flex-col sm:flex-row sm:items-end gap-4">
              <div class="w-20 h-20 rounded-2xl bg-[var(--color-surface)] p-1 shadow-lg shrink-0">
                <div class="w-full h-full rounded-xl flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br from-primary-500 to-indigo-600">
                  {{ (member?.name || "?").charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="flex-1 min-w-0 pb-1">
                <h1 class="text-xl sm:text-2xl font-bold text-default tracking-tight truncate">
                  {{ member?.name || "—" }}
                </h1>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-10 divide-chips">
                  <BaseBadge v-if="member?.memberships?.length" :color="statusColor(member.memberships[0].status)">
                    {{ traducirEstado(member.memberships[0].status) }}
                  </BaseBadge>
                  <BaseBadge v-else-if="member" color="gray">Sin plan</BaseBadge>

                  <span v-if="member?.identification" class="meta-chip">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0" />
                    </svg>
                    {{ member.identification }}
                  </span>
                  <span v-if="member?.phone" class="meta-chip">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {{ member.phone }}
                  </span>
                  <span v-if="member?.email" class="meta-chip">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ member.email }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Body scrollable -->
        <div class="detail-body">
          <div v-if="loading" class="py-16 text-center">
            <div class="inline-flex items-center gap-3 text-muted">
              <svg class="w-5 h-5 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Cargando detalle...
            </div>
          </div>

          <div v-else-if="!member" class="py-16 text-center text-danger-600 font-semibold">
            Cliente no encontrado.
          </div>

          <template v-else>
            <!-- Stats strip -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div class="stat-card">
                <div class="stat-icon stat-icon-primary">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">Edad</p>
                  <p class="stat-value">{{ edad !== "—" ? `${edad} años` : "—" }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon stat-icon-success">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h8M4 14h8M4 18h16" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">Estatura</p>
                  <p class="stat-value">{{ formatEstatura(member.estatura) }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon stat-icon-success">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 3v3M18 3v3M3 9h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">Peso</p>
                  <p class="stat-value">{{ member.peso ? `${member.peso} kg` : "—" }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" :class="imcIconCls">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">IMC</p>
                  <p class="stat-value">{{ imc }}</p>
                  <p v-if="imc !== '—'" class="text-[10px] font-semibold uppercase tracking-wider mt-0.5" :class="imcTextCls">
                    {{ clasificacionIMC }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Dos columnas -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div class="lg:col-span-2 space-y-5">
                <div class="detail-card">
                  <div class="section-header">
                    <span class="section-bar bg-primary-600" />
                    <h2 class="section-title" style="color: var(--color-text-muted);">Información Personal</h2>
                  </div>
                  <dl class="info-grid">
                    <div class="info-item">
                      <dt class="info-label">Nombre</dt>
                      <dd class="info-val">{{ member.name }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Cédula / ID</dt>
                      <dd class="info-val">{{ member.identification || "—" }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Email</dt>
                      <dd class="info-val break-all">{{ member.email || "—" }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Teléfono</dt>
                      <dd class="info-val">{{ member.phone || "—" }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Fecha de nacimiento</dt>
                      <dd class="info-val">{{ member.birth_date || "—" }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Sexo</dt>
                      <dd class="info-val capitalize">{{ member.sexo || "—" }}</dd>
                    </div>
                  </dl>

                  <!-- ===== Tarjeta de membresía (horizontal) ===== -->
                  <div class="mt-6 pt-5 border-t border-default-soft">
                    <div class="section-header">
                      <span class="section-bar bg-indigo-500" />
                      <h2 class="section-title" style="color: var(--color-text-muted);">Membresía</h2>
                    </div>

                    <div v-if="member.memberships?.length" class="membership-row">
                      <div class="membership-cell membership-cell--plan">
                        <p class="info-label !mb-1">Plan Actual</p>
                        <p class="text-base font-bold capitalize" style="color: var(--color-text);">
                          {{ traducirFrecuencia(member.memberships[0].plan?.frequency) }}
                        </p>
                        <p class="text-lg font-black mt-0.5" style="color: #60a5fa;">
                          {{ formatPrice(member.memberships[0].plan?.price) }}
                        </p>
                      </div>
                      <div class="membership-cell">
                        <p class="info-label !mb-1">Estado</p>
                        <BaseBadge :color="statusColor(member.memberships[0].status)">
                          {{ traducirEstado(member.memberships[0].status) }}
                        </BaseBadge>
                      </div>
                      <div class="membership-cell">
                        <p class="info-label !mb-1">Inicio</p>
                        <p class="info-val">{{ member.memberships[0].start_date }}</p>
                      </div>
                      <div class="membership-cell">
                        <p class="info-label !mb-1">Fin</p>
                        <p class="info-val">{{ member.memberships[0].end_date }}</p>
                      </div>
                      <div v-if="diasRestantes !== null" class="membership-cell">
                        <p class="info-label !mb-1">Días restantes</p>
                        <p class="font-bold text-sm" :class="diasRestantesCls">
                          {{ diasRestantes < 0 ? `Vencida hace ${Math.abs(diasRestantes)}d` : `${diasRestantes} días` }}
                        </p>
                      </div>
                    </div>

                    <div v-else class="flex items-center gap-3 bg-[var(--color-surface-soft)] border border-default-soft rounded-xl p-4">
                      <div class="w-10 h-10 rounded-full bg-[var(--color-overlay)] flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5 text-subtle" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <p class="text-sm text-muted">Sin membresía asignada</p>
                    </div>
                  </div>
                </div>

                <div class="detail-card">
                  <div class="section-header">
                    <span class="section-bar bg-amber-500" />
                    <h2 class="section-title" style="color: var(--color-text-muted);">Objetivos / Observaciones</h2>
                  </div>
                  <div
                    v-if="member.medical_history"
                    class="bg-[var(--color-surface-soft)] border border-default-soft rounded-xl p-4 text-sm text-default whitespace-pre-wrap leading-relaxed"
                  >
                    {{ member.medical_history }}
                  </div>
                  <p v-else class="text-sm italic text-subtle">
                    Sin objetivos / observaciones registrados.
                  </p>
                </div>

              </div>

              <!-- ===== Fotos Iniciales (frente, perfil, espalda) ===== -->
              <div class="space-y-5">
                <div class="detail-card">
                  <div class="section-header">
                    <span class="section-bar bg-success-600" />
                    <h2 class="section-title" style="color: var(--color-text-muted);">Fotos Iniciales</h2>
                  </div>

                  <div class="space-y-3">
                    <div
                      v-for="(label, i) in initialPhotoLabels"
                      :key="i"
                      class="progress-photo-slot"
                    >
                      <img
                        v-if="initialPhotos[i]?.photo"
                        :src="initialPhotos[i].photo"
                        :alt="`Foto inicial ${label}`"
                        class="progress-photo-img"
                      />
                      <div v-else class="progress-photo-empty">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-[11px] font-bold uppercase tracking-wider mt-1.5">{{ label }}</span>
                        <span class="text-[10px] text-subtle mt-0.5">Sin foto</span>
                      </div>
                      <span class="progress-photo-tag">{{ label }}</span>
                      <span v-if="initialPhotos[i]?.taken_at" class="progress-photo-date">
                        {{ formatDate(initialPhotos[i].taken_at) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { BaseBadge } from "@/components/ui";

const props = defineProps({
  show: Boolean,
  memberId: { type: [Number, String], default: null },
});

const emit = defineEmits(["close"]);

const member = ref(null);
const loading = ref(false);

watch(
  () => [props.show, props.memberId],
  async ([show, id]) => {
    if (!show || !id) return;
    loading.value = true;
    member.value = null;
    try {
      const { data } = await api.get(`/members/${id}`);
      member.value = data;
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar el detalle del cliente.", "error");
      emit("close");
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);

function close() {
  emit("close");
}

// ===== Computeds =====
const edad = computed(() => {
  if (!member.value?.birth_date) return "—";
  return dayjs().diff(dayjs(member.value.birth_date), "year");
});

const imc = computed(() => {
  const p = member.value?.peso;
  const e = member.value?.estatura;
  if (!p || !e) return "—";
  const pesoKg = parseFloat(p);
  let alturaMetros = parseFloat(e);
  if (alturaMetros > 3) alturaMetros /= 100;
  return (pesoKg / (alturaMetros * alturaMetros)).toFixed(2);
});

const clasificacionIMC = computed(() => clasificarIMC(imc.value));

const diasRestantes = computed(() => {
  const end = member.value?.memberships?.[0]?.end_date;
  if (!end) return null;
  return dayjs(end).diff(dayjs(), "day");
});

const initialPhotoLabels = ["Frente", "Perfil", "Espalda"];

function normalizePhotoEntry(value) {
  if (!value) return null;
  if (typeof value === "string") return { photo: value, taken_at: null };
  if (typeof value === "object" && value.photo) {
    return { photo: value.photo, taken_at: value.taken_at || null };
  }
  return null;
}

const initialPhotos = computed(() => {
  const raw = member.value?.initial_photos;
  if (!Array.isArray(raw)) return [null, null, null];
  return [normalizePhotoEntry(raw[0]), normalizePhotoEntry(raw[1]), normalizePhotoEntry(raw[2])];
});

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

const diasRestantesCls = computed(() => {
  if (diasRestantes.value === null) return "";
  if (diasRestantes.value < 0) return "text-danger-600";
  if (diasRestantes.value <= 7) return "text-amber-600";
  return "text-success-700";
});

const imcIconCls = computed(() => {
  const cls = clasificacionIMC.value;
  if (cls === "Normal") return "stat-icon-success";
  if (cls === "Bajo peso" || cls === "Sobrepeso") return "stat-icon-warning";
  if (cls.startsWith("Obesidad")) return "stat-icon-danger";
  return "stat-icon-neutral";
});

const imcTextCls = computed(() => {
  const cls = clasificacionIMC.value;
  if (cls === "Normal") return "imc-text-success";
  if (cls === "Bajo peso" || cls === "Sobrepeso") return "imc-text-warning";
  if (cls.startsWith("Obesidad")) return "imc-text-danger";
  return "text-muted";
});

// ===== Helpers =====
function formatEstatura(estatura) {
  if (!estatura) return "—";
  const metros = estatura > 3 ? (estatura / 100).toFixed(2) : estatura;
  return `${metros} m`;
}

function formatPrice(price) {
  if (price == null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatearTelefono(numero) {
  if (!numero) return "";
  let limpio = numero.toString().replace(/\D/g, "");
  if (!limpio.startsWith("57")) limpio = "57" + limpio;
  return limpio;
}

function statusColor(status) {
  const map = {
    active: "green", expired: "red", inactive_unpaid: "yellow",
    cancelled: "gray", inactive: "gray", pending: "yellow",
  };
  return map[status] || "gray";
}

function clasificarIMC(v) {
  if (!v || v === "—" || isNaN(v)) return "—";
  const n = parseFloat(v);
  if (n < 18.5) return "Bajo peso";
  if (n < 25) return "Normal";
  if (n < 30) return "Sobrepeso";
  if (n < 35) return "Obesidad grado I";
  if (n < 40) return "Obesidad grado II";
  return "Obesidad grado III";
}

function traducirFrecuencia(f) {
  const map = { daily: "Diaria", weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual", quarterly: "Trimestral", yearly: "Anual" };
  return map[f] || f || "—";
}

function traducirEstado(estado) {
  const map = { active: "Activa", inactive: "Inactiva", cancelled: "Cancelada", expired: "Expirada", inactive_unpaid: "Sin pago", pending: "Pendiente" };
  return map[estado] || estado;
}
</script>

<style scoped>
.detail-overlay {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  background: var(--modal-backdrop);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  overflow-y: auto;
}

.detail-panel {
  position: relative;
  width: 100%;
  max-width: 90em;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  background: var(--modal-panel-bg);
  border: 1px solid var(--modal-panel-border);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3), 0 10px 20px -5px rgba(0,0,0,0.1);
  overflow: hidden;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.75rem;
}
@media (min-width: 640px) { .detail-body { padding: 0 2.5rem 2rem; } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-active .detail-panel, .modal-fade-leave-active .detail-panel { transition: transform 0.25s ease, opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .detail-panel, .modal-fade-leave-to .detail-panel { transform: translateY(8px) scale(0.98); opacity: 0; }

.btn-ghost-white {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.5rem 0.875rem; border-radius: 0.5rem;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
  color: white; font-size: 0.75rem; font-weight: 700;
  border: 1px solid rgba(255,255,255,0.2); transition: all 0.15s;
}
.btn-ghost-white:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.35); }

.btn-icon-white {
  width: 2.25rem; height: 2.25rem; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.1); color: white;
  border: 1px solid rgba(255,255,255,0.15); transition: all 0.15s; cursor: pointer;
}
.btn-icon-white:hover { background: rgba(255,255,255,0.2); }

.meta-chip {
  display: inline-flex; align-items: center; gap: 0.25rem;
  font-size: 0.75rem; color: var(--color-text-muted);
}

.section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.section-bar { display: block; width: 4px; height: 1.25rem; border-radius: 9999px; }
.section-title { font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

.stat-card {
  display: flex; align-items: center; gap: 0.875rem;
  padding: 1rem 1.125rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.875rem; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.stat-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon-primary { background: rgba(99, 102, 241, 0.12); color: #6366f1; }
.stat-icon-success { background: rgba(16, 185, 129, 0.12); color: #10b981; }
:global(.dark) .stat-icon-primary { background: rgba(99, 102, 241, 0.18); color: #a5b4fc; }
:global(.dark) .stat-icon-success { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; }

.stat-label { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-subtle); }
.stat-value { font-size: 1.125rem; font-weight: 800; color: var(--color-text); line-height: 1.2; }

.detail-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem; padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
:global(.dark) .detail-card {
  background: var(--color-surface-muted);
  border-color: rgba(255, 255, 255, 0.10);
}
:global(.dark) .stat-card {
  background: var(--color-surface-muted);
  border-color: rgba(255, 255, 255, 0.10);
}

.membership-plan-card {
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.15);
}
:global(.dark) .membership-plan-card {
  background: rgba(99, 102, 241, 0.10);
  border-color: rgba(99, 102, 241, 0.25);
}

/* ===== Fila horizontal de membresía ===== */
.membership-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1rem;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 0.75rem;
  padding: 1rem 1.125rem;
}
@media (min-width: 640px) {
  .membership-row { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
:global(.dark) .membership-row {
  background: rgba(99, 102, 241, 0.10);
  border-color: rgba(99, 102, 241, 0.25);
}

.membership-cell {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
}
.membership-cell--plan {
  grid-column: span 2 / span 2;
}
@media (min-width: 640px) {
  .membership-cell--plan { grid-column: span 1 / span 1; }
}

/* ===== Fotos de progreso ===== */
.progress-photo-slot {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--color-surface-soft);
  border: 1px dashed var(--color-border-strong);
}
:global(.dark) .progress-photo-slot {
  background: var(--color-overlay);
  border-color: rgba(255, 255, 255, 0.15);
}

.progress-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.progress-photo-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-subtle);
}

.progress-photo-tag {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: white;
  background: rgba(0, 0, 0, 0.55);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}

.progress-photo-date {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  text-align: center;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.2rem 0.4rem;
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}

.info-label {
  display: block; font-size: 0.625rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--color-text-subtle); margin-bottom: 0.25rem;
}
.info-val { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }

/* Grid con líneas divisoras */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 640px) {
  .info-grid { grid-template-columns: 1fr 1fr; column-gap: 1.5rem; }
}

.info-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}
.info-item:first-child { padding-top: 0.25rem; }

/* En desktop (2 cols): última fila completa sin borde */
@media (min-width: 640px) {
  .info-item:nth-last-child(1),
  .info-item:nth-last-child(2) { border-bottom: none; padding-bottom: 0.25rem; }
}
/* En móvil (1 col): sólo el último sin borde */
@media (max-width: 639px) {
  .info-item:last-child { border-bottom: none; padding-bottom: 0.25rem; }
}

/* Separadores entre chips del hero */
.divide-chips > * + *::before {
  content: "";
  display: inline-block;
  width: 1px;
  height: 0.75rem;
  background: var(--color-border);
  margin-right: 0.75rem;
  vertical-align: middle;
}

/* Additional stat-icon variants */
.stat-icon-warning { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.stat-icon-danger { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
.stat-icon-neutral { background: var(--color-overlay); color: var(--color-text-muted); }
:global(.dark) .stat-icon-warning { background: rgba(245, 158, 11, 0.18); color: #fbbf24; }
:global(.dark) .stat-icon-danger { background: rgba(239, 68, 68, 0.18); color: #fca5a5; }

/* IMC text colors */
.imc-text-success { color: #10b981; }
.imc-text-warning { color: #f59e0b; }
.imc-text-danger { color: #ef4444; }
:global(.dark) .imc-text-success { color: #6ee7b7; }
:global(.dark) .imc-text-warning { color: #fbbf24; }
:global(.dark) .imc-text-danger { color: #fca5a5; }
</style>
