<template>
  <div class="page-layout">
    <div class="max-w-7xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-default tracking-tight">Clientes</h1>
          <p class="text-sm text-subtle mt-0.5">Gestión de clientes y membresías</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <router-link to="/Menu" class="btn btn-dark flex-1 sm:flex-none inline-flex items-center justify-center gap-2">
            <Home class="w-4 h-4" aria-hidden="true" />
            <span>Inicio</span>
          </router-link>
          <button @click="showRegisterModal = true" class="btn btn-success flex-1 sm:flex-none inline-flex items-center justify-center gap-2">
            <UserPlus class="w-4 h-4" aria-hidden="true" />
            <span>Nuevo cliente</span>
          </button>
        </div>
      </div>

      <div class="mb-6 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          class="field-input pl-10"
        />
      </div>

    <div v-if="loading" class="text-subtle text-center mt-10">Cargando Clientes...</div>

    <div v-else>
      <div v-if="members.length === 0" class="text-subtle text-center mt-10">
        No hay Clientes registrados.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="member in miembrosPaginados"
          :key="member.id"
          class="member-card"
          :class="[
            'shadow-card transition-all duration-200 hover:shadow-lg',
            member.is_expired ? 'ring-2 ring-red-400/40' : 'ring-1 ring-[var(--color-border-soft)]',
          ]"
        >
          <!-- Barra de estado superior -->
          <div
            v-if="member.memberships?.[0]?.status === 'expired'"
            class="w-full text-center text-xs font-bold py-1 bg-red-400 text-white tracking-wide"
          >
            Membresía Vencida
          </div>
          <div
            v-else-if="member.memberships?.[0]?.status === 'inactive_unpaid'"
            class="w-full text-center text-xs font-bold py-1 bg-yellow-400 text-white tracking-wide"
          >
            Pendiente de Pago
          </div>

          <div class="member-card-head">
            <div class="member-hero">
              <div class="member-avatar-wrap">
                <img
                  v-if="getPrimaryPhoto(member)"
                  :src="getPrimaryPhoto(member)"
                  :alt="`Foto de ${member.name}`"
                  class="member-avatar"
                />
                <div v-else class="member-avatar member-avatar-fallback">
                  {{ (member.name || "?").charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="min-w-0">
                <h2 class="text-base font-bold text-default truncate">{{ member.name }}</h2>
                <p class="text-sm text-muted mt-0.5 truncate">{{ member.email || "Sin correo electrónico" }}</p>
                <p class="text-xs text-subtle mt-0.5">{{ member.identification ? `C.C ${member.identification}` : "C.C —" }}</p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2 shrink-0">
              <button
                v-if="false"
                @click="toggleDetalle(member.id)"
                class="text-xs font-bold px-3 py-1 rounded-full border transition-all h-8 flex items-center select-none"
                :class="
                  detallesAbiertos.includes(member.id)
                    ? 'detail-toggle-active'
                    : 'bg-[var(--color-overlay)] text-muted border-default-soft'
                "
              >
                {{ detallesAbiertos.includes(member.id) ? "Ocultar" : "Ver más" }}
              </button>
            </div>
            <button
              @click="toggleDetalle(member.id)"
              class="text-xs font-bold px-3 py-1 rounded-full border transition-all h-8 inline-flex items-center gap-1 select-none"
              :class="
                detallesAbiertos.includes(member.id)
                  ? 'detail-toggle-active'
                  : 'bg-[var(--color-overlay)] text-muted border-default-soft'
              "
            >
              <component :is="detallesAbiertos.includes(member.id) ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" aria-hidden="true" />
              <span>{{ detallesAbiertos.includes(member.id) ? "Ocultar" : "Ver más" }}</span>
            </button>
          </div>

          <div
            v-if="detallesAbiertos.includes(member.id)"
            class="member-card-detail"
          >
            <div class="member-info-list">
              <div class="member-info-row">
                <span class="member-info-label">Peso</span>
                <span class="member-info-value">{{ member.peso ?? "—" }} kg</span>
              </div>
              <div class="member-info-row">
                <span class="member-info-label">Altura</span>
                <span class="member-info-value">{{ formatEstatura(member.estatura) }}</span>
              </div>
              <div class="member-info-row">
                <span class="member-info-label">Sexo</span>
                <span class="member-info-value capitalize">{{ member.sexo || "—" }}</span>
              </div>
            </div>

            <div class="member-membership-block">
              <div class="flex items-center gap-2 mb-2.5">
                <span class="w-1 h-3.5 rounded-full bg-primary-600"></span>
                <span class="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Membresía</span>
              </div>

              <div v-if="member.memberships?.length" class="member-membership-card">
                <div class="member-membership-divider flex justify-between items-start mb-3 pb-3 border-b">
                  <div class="min-w-0 pr-2">
                    <span class="member-info-label">Plan actual</span>
                    <div class="flex flex-wrap items-center gap-1.5 mt-1">
                      <strong class="text-[13px] font-black text-default truncate">{{ membershipPlanType(member) }}</strong>
                      <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400 shrink-0">{{ traducirFrecuencia(member.memberships[0].plan?.frequency) }}</span>
                    </div>
                    <div class="text-primary-600 dark:text-primary-400 font-black text-[13px] mt-0.5">{{ formatPrice(member.memberships[0].plan?.price) }}</div>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="member-info-label mb-1">Estado</span>
                    <span class="member-membership-status" :class="`membership-status-${membershipStatusColor(member.memberships[0].status)}`">
                      {{ traducirEstado(member.memberships[0].status) }}
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <span class="member-info-label">Inicio</span>
                    <span class="text-[12px] font-semibold text-default block mt-0.5">{{ member.memberships[0].start_date || "—" }}</span>
                  </div>
                  <div>
                    <span class="member-info-label">Fin</span>
                    <span class="text-[12px] font-semibold text-default block mt-0.5">{{ member.memberships[0].end_date || "—" }}</span>
                  </div>
                  <div>
                    <span class="member-info-label">Restantes</span>
                    <strong class="text-[12px] block mt-0.5" :class="membershipDaysClass(member)">
                      {{ membershipDaysText(member) }}
                    </strong>
                  </div>
                </div>
              </div>

              <div v-else class="member-membership-empty">
                Sin membresía asignada
              </div>
            </div>

            <div class="member-notes">
              {{ member.medical_history || "Objetivos / Observaciones" }}
            </div>

            <div class="pt-3 flex flex-wrap items-center gap-1.5">
              <button
                class="action-btn action-primary"
                @click="abrirDetalle(member)"
              >
                <Eye class="w-3.5 h-3.5" aria-hidden="true" />
                Detalle
              </button>

              <a
                v-if="member.phone"
                :href="`https://wa.me/${formatearTelefono(member.phone)}`"
                target="_blank"
                class="action-btn action-success"
              >
                <MessageCircle class="w-3.5 h-3.5" aria-hidden="true" />
                WhatsApp
              </a>

              <router-link
                :to="{ name: 'MemberEdit', params: { id: member.id } }"
                class="action-btn action-neutral"
              >
                <Pencil class="w-3.5 h-3.5" aria-hidden="true" />
                Editar
              </router-link>

              <button
                class="action-btn"
                :class="member.memberships?.[0]?.status === 'expired' ? 'action-warning' : 'action-indigo'"
                @click="abrirAsignar(member)"
              >
                <component :is="member.memberships?.[0]?.status === 'expired' ? RefreshCw : CalendarCheck2" class="w-3.5 h-3.5" aria-hidden="true" />
                {{ member.memberships?.[0]?.status === "expired" ? "Renovar" : "Membresía" }}
              </button>

              <button class="action-btn action-success" @click="abrirPagar(member)">
                <DollarSign class="w-3.5 h-3.5" aria-hidden="true" />
                Pagar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalMiembrosPages > 1" class="flex items-center justify-between mt-6 text-sm text-muted">
        <span>Página {{ currentPageMiembros }} de {{ totalMiembrosPages }} ({{ miembrosFiltrados.length }} clientes)</span>
        <div class="flex gap-1">
          <button @click="currentPageMiembros--" :disabled="currentPageMiembros === 1"
            class="px-3 py-1 rounded border border-default-soft bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1">
            <ChevronLeft class="w-4 h-4" aria-hidden="true" />
            <span>Anterior</span>
          </button>
          <button @click="currentPageMiembros++" :disabled="currentPageMiembros === totalMiembrosPages"
            class="px-3 py-1 rounded border border-default-soft bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1">
            <span>Siguiente</span>
            <ChevronRight class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    </div><!-- /max-w-7xl -->

    <MemberRegisterModal
      :show="showRegisterModal"
      :planes="planes"
      @close="showRegisterModal = false"
      @saved="handleMemberSaved"
    />

    <MemberAssignModal
      :show="showAssignModal"
      :member="selectedMember"
      :planes="planes"
      @close="showAssignModal = false"
      @assigned="handleMemberAssigned"
    />

    <MemberPaymentModal
      :show="showPaymentModal"
      :member="selectedMember"
      @close="showPaymentModal = false"
      @paid="cargarMiembros"
    />

    <MemberDetailModal
      :show="showDetailModal"
      :member-id="selectedDetailId"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

import api from "@/axios";
import dayjs from "dayjs";
import Sidebar from "@/views/Sidebar.vue";
import Swal from "sweetalert2";
import {
  Home,
  UserPlus,
  Search,
  Eye,
  Pencil,
  MessageCircle,
  CalendarCheck2,
  RefreshCw,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-vue-next";

// Importar Componentes Hijos
import MemberRegisterModal from "@/components/members/MemberRegisterModal.vue";
import MemberAssignModal from "@/components/members/MemberAssignModal.vue";
import MemberPaymentModal from "@/components/members/MemberPaymentModal.vue";
import MemberDetailModal from "@/components/members/MemberDetailModal.vue";

// Estado Global
const members = ref([]);
const planes = ref([]);
const loading = ref(true);
const busqueda = ref("");
const detallesAbiertos = ref([]);
const selectedMember = ref(null);

// Estado de Modales
const showRegisterModal = ref(false);
const showAssignModal = ref(false);
const showPaymentModal = ref(false);
const showDetailModal = ref(false);
const selectedDetailId = ref(null);

onMounted(() => {
  cargarMiembros();
  cargarPlanes();
});

const cargarMiembros = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("/members");
    members.value = data;
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar los clientes.", "error");
  } finally {
    loading.value = false;
  }
};

const cargarPlanes = async () => {
  try {
    const { data } = await api.get("/membershipPlan");

    // Mapa de traducción
    const traduccion = {
      daily: "Diario",
      weekly: "Semanal",
      biweekly: "Quincenal",
      monthly: "Mensual",
    };

    planes.value = data.map((plan) => ({
      ...plan,
      // Creamos el nombre compuesto EN ESPAÑOL
      name: `${plan.membership_type?.name || "Plan"} - ${traduccion[plan.frequency] || plan.frequency} ($${parseInt(plan.price).toLocaleString()})`,
    }));
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar los planes.", "error");
  }
};

// --- Manejadores de Eventos ---
const handleMemberSaved = async ({ client, hasPlan }) => {
  showRegisterModal.value = false;
  await cargarMiembros();
  if (hasPlan) {
    Swal.fire({
      title: "Cliente Creado",
      text: "¿Deseas registrar el pago ahora?",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Sí, Pagar",
      cancelButtonText: "Luego",
    }).then((result) => {
      if (result.isConfirmed) {
        selectedMember.value = client;
        showPaymentModal.value = true;
      }
    });
  } else {
    Swal.fire("Éxito", "Cliente registrado correctamente", "success");
  }
};

const handleMemberAssigned = async (member) => {
  showAssignModal.value = false;
  await cargarMiembros(); // Recargar para actualizar el estado del cliente
  Swal.fire({
    title: "Membresía Asignada",
    text: "¿Deseas registrar el pago ahora?",
    icon: "success",
    showCancelButton: true,
    confirmButtonText: "Sí, Pagar",
    cancelButtonText: "Luego",
  }).then((result) => {
    if (result.isConfirmed) {
      selectedMember.value = member;
      showPaymentModal.value = true;
    }
  });
};

// --- Utilidades ---
// Corregido con if/else para evitar el error de ESLint
const toggleDetalle = (id) => {
  if (detallesAbiertos.value.includes(id)) {
    detallesAbiertos.value = detallesAbiertos.value.filter((i) => i !== id);
  } else {
    detallesAbiertos.value.push(id);
  }
};

const abrirAsignar = (member) => {
  selectedMember.value = member;
  showAssignModal.value = true;
};

const abrirDetalle = (member) => {
  selectedDetailId.value = member.id;
  showDetailModal.value = true;
};

const abrirPagar = (member) => {
  selectedMember.value = member;
  showPaymentModal.value = true;
};

const miembrosFiltrados = computed(() => {
  const term = busqueda.value.toLowerCase();
  return members.value.filter(
    (m) => m.name.toLowerCase().includes(term) || (m.phone || "").includes(term),
  );
});
const currentPageMiembros = ref(1);
const PER_PAGE = 10;
const totalMiembrosPages = computed(() => Math.ceil(miembrosFiltrados.value.length / PER_PAGE));
const miembrosPaginados = computed(() => {
  const start = (currentPageMiembros.value - 1) * PER_PAGE;
  return miembrosFiltrados.value.slice(start, start + PER_PAGE);
});
watch(busqueda, () => { currentPageMiembros.value = 1; });

function formatearTelefono(numero) {
  if (!numero) return "";
  let limpio = numero.toString().replace(/\D/g, "");
  if (!limpio.startsWith("57")) limpio = "57" + limpio;
  return limpio;
}

function normalizePhotoEntry(value) {
  if (!value) return null;
  if (typeof value === "string") return { photo: value, taken_at: null };
  if (typeof value === "object" && value.photo) {
    return { photo: value.photo, taken_at: value.taken_at || null };
  }
  return null;
}

function getPrimaryPhoto(member) {
  const photos = Array.isArray(member?.initial_photos) ? member.initial_photos : [];
  const first = photos.map(normalizePhotoEntry).find((entry) => !!entry?.photo);
  return first?.photo || "";
}

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

function traducirFrecuencia(frequency) {
  const map = {
    daily: "Diaria",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
    quarterly: "Trimestral",
    yearly: "Anual",
  };
  return map[frequency] || frequency || "—";
}

function membershipPlanType(member) {
  const plan = member?.memberships?.[0]?.plan;
  return plan?.type?.name || plan?.membership_type?.name || plan?.membershipType?.name || "—";
}

function traducirEstado(status) {
  const map = {
    active: "Activa",
    expired: "Expirada",
    inactive_unpaid: "Sin pago",
    pending: "Pendiente",
    inactive: "Inactiva",
    cancelled: "Cancelada",
  };
  return map[status] || status || "—";
}

function membershipStatusColor(status) {
  const map = {
    active: "green",
    expired: "red",
    inactive_unpaid: "yellow",
    pending: "yellow",
    inactive: "gray",
    cancelled: "gray",
  };
  return map[status] || "gray";
}

function membershipDays(member) {
  const endDate = member?.memberships?.[0]?.end_date;
  if (!endDate) return null;
  return dayjs(endDate).diff(dayjs(), "day");
}

function membershipDaysText(member) {
  const days = membershipDays(member);
  if (days === null) return "—";
  if (days < 0) return `Vencida hace ${Math.abs(days)} días`;
  return `${days} días`;
}

function membershipDaysClass(member) {
  const days = membershipDays(member);
  if (days === null) return "";
  if (days < 0) return "membership-days-danger";
  if (days <= 7) return "membership-days-warning";
  return "membership-days-success";
}

</script>

<style scoped>
.member-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  background: var(--color-surface);
  color: var(--color-text);
}

.member-card-head {
  padding: 0.95rem 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.07) 0%, rgba(99, 102, 241, 0) 100%);
}

.member-hero {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.member-avatar-wrap {
  width: 3rem;
  height: 3rem;
  border-radius: 0.8rem;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
}

.member-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.member-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.12);
}

.member-card-detail {
  padding: 0.9rem 1rem 1rem;
  background: var(--color-surface-soft);
}

.member-info-list {
  border: 1px solid #cbd5e1; /* slate-300 */
  border-radius: 0.75rem;
  background: var(--color-surface);
}
:global(.dark) .member-info-list {
  border-color: #475569; /* slate-600 */
}

.member-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid #cbd5e1;
}
:global(.dark) .member-info-row {
  border-bottom-color: #475569;
}
.member-info-row:last-child {
  border-bottom: none;
}

.member-info-label {
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.member-info-value {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
  word-break: break-word;
}

.member-membership-block {
  margin-top: 0.75rem;
}

.member-membership-card {
  border: 1px solid #cbd5e1; /* slate-300 */
  border-radius: 0.75rem;
  padding: 0.85rem;
  background: var(--color-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}
:global(.dark) .member-membership-card {
  border-color: #475569; /* slate-600 */
}

.member-membership-divider {
  border-bottom-color: #cbd5e1;
}
:global(.dark) .member-membership-divider {
  border-bottom-color: #475569;
}

.member-membership-status {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 1.35rem;
  padding: 0.12rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 700;
}

.membership-status-green {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
}

.membership-status-red {
  background: rgba(239, 68, 68, 0.14);
  color: #dc2626;
}

.membership-status-yellow {
  background: rgba(245, 158, 11, 0.18);
  color: #b45309;
}

.membership-status-gray {
  background: var(--color-overlay);
  color: var(--color-text-muted);
}

.member-membership-days {
  display: block;
  font-size: 0.78rem;
}

.membership-days-danger {
  color: #dc2626;
}

.membership-days-warning {
  color: #d97706;
}

.membership-days-success {
  color: #15803d;
}

.member-membership-empty {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: var(--color-surface);
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.member-notes {
  margin-top: 0.65rem;
  border: 1px dashed var(--color-border-strong);
  border-radius: 0.65rem;
  padding: 0.55rem 0.65rem;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  line-height: 1.45;
  font-style: italic;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.65rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid transparent;
  transition: all 0.15s;
  cursor: pointer;
  flex-shrink: 0;
}

.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.action-primary {
  background: rgb(37 99 235); color: white;
}
.action-primary:hover { background: rgb(29 78 216); }
.action-success {
  background: rgb(22 163 74); color: white;
}
.action-success:hover { background: rgb(21 128 61); }

/* Claro */
.action-neutral {
  background: rgb(243 244 246); color: rgb(55 65 81);
  border-color: rgb(229 231 235);
}
.action-neutral:hover { background: rgb(229 231 235); }

.action-indigo {
  background: rgb(238 242 255); color: rgb(67 56 202);
  border-color: rgb(199 210 254);
}
.action-indigo:hover { background: rgb(224 231 255); }

.action-warning {
  background: rgb(255 237 213); color: rgb(154 52 18);
  border-color: rgb(254 215 170);
}
.action-warning:hover { background: rgb(254 215 170); }

/* Modo oscuro */
:global(.dark) .action-neutral {
  background: rgba(255,255,255,0.07);
  color: rgba(148,163,184,0.9);
  border-color: rgba(255,255,255,0.12);
}
:global(.dark) .action-neutral:hover {
  background: rgba(255,255,255,0.12);
  color: #f1f5f9;
}

:global(.dark) .action-indigo {
  background: rgba(99,102,241,0.15);
  color: #c7d2fe;
  border-color: rgba(99,102,241,0.35);
}
:global(.dark) .action-indigo:hover {
  background: rgba(99,102,241,0.25);
  border-color: rgba(99,102,241,0.5);
}

:global(.dark) .action-warning {
  background: rgba(249,115,22,0.15);
  color: #fdba74;
  border-color: rgba(249,115,22,0.35);
}
:global(.dark) .action-warning:hover {
  background: rgba(249,115,22,0.25);
  border-color: rgba(249,115,22,0.5);
}

.detail-toggle-active {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.25);
}
:global(.dark) .detail-toggle-active {
  background: rgba(96, 165, 250, 0.15);
  color: #93c5fd;
  border-color: rgba(96, 165, 250, 0.30);
}

:global(.dark) .member-card-head {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 100%);
}
:global(.dark) .member-avatar-fallback {
  color: #c7d2fe;
  background: rgba(99, 102, 241, 0.2);
}

</style>
