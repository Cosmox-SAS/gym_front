<template>
  <div class="page-layout">
    <div class="max-w-6xl mx-auto">
      <router-link
        to="/members"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-default transition mb-5"
      >
        <ArrowLeft class="w-4 h-4" aria-hidden="true" />
        Volver a clientes
      </router-link>

      <div v-if="loading" class="py-20 text-center">
        <div class="inline-flex items-center gap-3 text-muted">
          <Loader2 class="w-5 h-5 animate-spin" aria-hidden="true" />
          Cargando detalle...
        </div>
      </div>

      <div v-else-if="!member" class="py-20 text-center text-danger-600 font-semibold">
        Cliente no encontrado.
      </div>

      <template v-else>
        <!-- Hero card -->
        <div class="rounded-2xl overflow-hidden shadow-xl bg-[var(--color-surface)] border border-default-soft mb-6">
          <div class="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700 px-6 sm:px-10 pt-8 pb-20">
            <div class="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
              <div class="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
              <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/30 rounded-full blur-3xl" />
            </div>
            <div class="relative flex items-start justify-between gap-4">
              <div class="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-widest">
                <FileText class="w-4 h-4" aria-hidden="true" />
                Ficha del cliente
              </div>
              <div class="flex gap-2">
                <router-link :to="{ name: 'MemberEdit', params: { id: member.id } }" class="btn-ghost-white">
                  <Pencil class="w-4 h-4" aria-hidden="true" />
                  Editar
                </router-link>
                <a v-if="member.phone" :href="`https://wa.me/${formatearTelefono(member.phone)}`" target="_blank" class="btn-ghost-white">
                  <MessageCircle class="w-4 h-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div class="relative px-6 sm:px-10 pb-6 -mt-14">
            <div class="flex flex-col sm:flex-row sm:items-end gap-4">
              <div class="w-24 h-24 rounded-2xl bg-[var(--color-surface)] p-1 shadow-lg shrink-0">
                <div class="w-full h-full rounded-xl flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-primary-500 to-indigo-600">
                  {{ (member.name || "?").charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="flex-1 min-w-0 pb-1">
                <h1 class="text-2xl sm:text-3xl font-bold text-default tracking-tight truncate">{{ member.name }}</h1>
                <div class="flex flex-wrap items-center gap-3 mt-2">
                  <BaseBadge v-if="member.memberships?.length" :color="statusColor(member.memberships[0].status)">
                    {{ traducirEstado(member.memberships[0].status) }}
                  </BaseBadge>
                  <BaseBadge v-else color="gray">Sin plan</BaseBadge>

                  <span v-if="member.identification" class="meta-chip">
                    <IdCard class="w-4 h-4" aria-hidden="true" />
                    {{ member.identification }}
                  </span>
                  <span v-if="member.phone" class="meta-chip">
                    <Phone class="w-4 h-4" aria-hidden="true" />
                    {{ member.phone }}
                  </span>
                  <span v-if="member.email" class="meta-chip">
                    <Mail class="w-4 h-4" aria-hidden="true" />
                    {{ member.email }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats strip -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div class="stat-card">
            <div class="stat-icon bg-primary-100 text-primary-700">
              <Cake class="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p class="stat-label">Edad</p>
              <p class="stat-value">{{ edad !== "—" ? `${edad} años` : "—" }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-success-100 text-success-700">
              <Ruler class="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p class="stat-label">Estatura</p>
              <p class="stat-value">{{ formatEstatura(member.estatura) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-success-100 text-success-700">
              <Weight class="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p class="stat-label">Peso</p>
              <p class="stat-value">{{ member.peso ? `${member.peso} kg` : "—" }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" :class="imcIconCls">
              <Activity class="w-5 h-5" aria-hidden="true" />
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
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="detail-card">
              <div class="section-header">
                <span class="section-bar bg-primary-600" />
                <h2 class="section-title text-primary-700">Información Personal</h2>
              </div>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt class="info-label">Nombre</dt>
                  <dd class="info-val">{{ member.name }}</dd>
                </div>
                <div>
                  <dt class="info-label">Cédula / ID</dt>
                  <dd class="info-val">{{ member.identification || "—" }}</dd>
                </div>
                <div>
                  <dt class="info-label">Email</dt>
                  <dd class="info-val">{{ member.email || "—" }}</dd>
                </div>
                <div>
                  <dt class="info-label">Teléfono</dt>
                  <dd class="info-val">{{ member.phone || "—" }}</dd>
                </div>
                <div>
                  <dt class="info-label">Fecha de nacimiento</dt>
                  <dd class="info-val">{{ member.birth_date || "—" }}</dd>
                </div>
                <div>
                  <dt class="info-label">Sexo</dt>
                  <dd class="info-val capitalize">{{ member.sexo || "—" }}</dd>
                </div>
              </dl>
            </div>

            <div class="detail-card">
              <div class="section-header">
                <span class="section-bar bg-danger-500" />
                <h2 class="section-title text-danger-600">Antecedentes Médicos</h2>
              </div>
              <div
                v-if="member.medical_history"
                class="bg-[var(--color-surface-soft)] border border-default-soft rounded-xl p-4 text-sm text-default whitespace-pre-wrap leading-relaxed"
              >
                {{ member.medical_history }}
              </div>
              <p v-else class="text-sm italic text-subtle">
                No hay antecedentes médicos registrados.
              </p>
            </div>
          </div>

          <div class="space-y-6">
            <div v-if="member.memberships?.length" class="detail-card">
              <div class="section-header">
                <span class="section-bar bg-primary-600" />
                <h2 class="section-title text-primary-700">Membresía</h2>
              </div>
              <div class="bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 rounded-xl p-4 mb-4">
                <p class="text-[10px] font-semibold uppercase tracking-widest text-primary-700/70 mb-1">
                  Plan Actual
                </p>
                <p class="text-lg font-bold text-default capitalize">
                  {{ traducirFrecuencia(member.memberships[0].plan?.frequency) }}
                </p>
                <p class="text-2xl font-black text-primary-700 mt-1">
                  {{ formatPrice(member.memberships[0].plan?.price) }}
                </p>
              </div>

              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between">
                  <span class="info-label">Estado</span>
                  <BaseBadge :color="statusColor(member.memberships[0].status)">
                    {{ traducirEstado(member.memberships[0].status) }}
                  </BaseBadge>
                </div>
                <div class="flex items-center justify-between">
                  <span class="info-label">Inicio</span>
                  <span class="info-val">{{ member.memberships[0].start_date }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="info-label">Fin</span>
                  <span class="info-val">{{ member.memberships[0].end_date }}</span>
                </div>
                <div v-if="diasRestantes !== null" class="flex items-center justify-between">
                  <span class="info-label">Días restantes</span>
                  <span class="font-bold text-sm" :class="diasRestantesCls">
                    {{ diasRestantes < 0 ? `Vencida hace ${Math.abs(diasRestantes)}d` : `${diasRestantes} días` }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="detail-card text-center">
              <div class="w-12 h-12 rounded-full bg-[var(--color-overlay)] flex items-center justify-center mx-auto mb-3">
                
              </div>
              <p class="text-sm text-muted">Sin membresía asignada</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import {
  Activity,
  ArrowLeft,
  Cake,
  FileText,
  IdCard,
  Loader2,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Ruler,
  Weight,
} from 'lucide-vue-next'
import { BaseBadge } from "@/components/ui";

const route = useRoute();
const member = ref(null);
const loading = ref(true);

onMounted(async () => {
  const memberId = route.params.id;
  try {
    const response = await api.get(`/members/${memberId}`);
    member.value = response.data;
  } catch (error) {
    console.error("Error al obtener el detalle del miembro:", error);
    Swal.fire("Error", "No se pudo cargar el detalle del miembro.", "error");
  } finally {
    loading.value = false;
  }
});

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

const diasRestantesCls = computed(() => {
  if (diasRestantes.value === null) return "";
  if (diasRestantes.value < 0) return "text-danger-600";
  if (diasRestantes.value <= 7) return "text-amber-600";
  return "text-success-700";
});

const imcIconCls = computed(() => {
  const cls = clasificacionIMC.value;
  if (cls === "Normal") return "bg-success-100 text-success-700";
  if (cls === "Bajo peso" || cls === "Sobrepeso") return "bg-amber-100 text-amber-700";
  if (cls.startsWith("Obesidad")) return "bg-danger-100 text-danger-600";
  return "bg-[var(--color-overlay)] text-muted";
});

const imcTextCls = computed(() => {
  const cls = clasificacionIMC.value;
  if (cls === "Normal") return "text-success-700";
  if (cls === "Bajo peso" || cls === "Sobrepeso") return "text-amber-700";
  if (cls.startsWith("Obesidad")) return "text-danger-600";
  return "text-muted";
});

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
    active: "green",
    expired: "red",
    inactive_unpaid: "yellow",
    cancelled: "gray",
    inactive: "gray",
    pending: "yellow",
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
  const map = {
    daily: "Diaria",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
    quarterly: "Trimestral",
    yearly: "Anual",
  };
  return map[f] || f || "—";
}

function traducirEstado(estado) {
  const map = {
    active: "Activa",
    inactive: "Inactiva",
    cancelled: "Cancelada",
    expired: "Expirada",
    inactive_unpaid: "Sin pago",
    pending: "Pendiente",
  };
  return map[estado] || estado;
}
</script>

<style scoped>
.btn-ghost-white {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.15s;
}
.btn-ghost-white:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.35);
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.section-bar { display: block; width: 4px; height: 1.25rem; border-radius: 9999px; }
.section-title { font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

.stat-card {
  display: flex; align-items: center; gap: 0.875rem;
  padding: 1rem 1.125rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.875rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: transform 0.15s, box-shadow 0.15s;
}
.stat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.stat-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-label { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-subtle); }
.stat-value { font-size: 1.125rem; font-weight: 800; color: var(--color-text); line-height: 1.2; }

.detail-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem; padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.info-label {
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-subtle);
  margin-bottom: 0.25rem;
}
.info-val { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
</style>
