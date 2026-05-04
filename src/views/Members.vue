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
          <router-link to="/Menu" class="btn btn-dark flex-1 sm:flex-none">Inicio</router-link>
          <button @click="showRegisterModal = true" class="btn btn-success flex-1 sm:flex-none">Nuevo cliente</button>
        </div>
      </div>

      <div class="mb-6">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          class="field-input"
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
                <p class="text-sm text-muted mt-0.5 truncate">{{ member.phone || "Sin teléfono" }}</p>
                <p class="text-xs text-subtle mt-0.5">{{ member.birth_date || "Sin fecha de nacimiento" }}</p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2 shrink-0">
              <BaseBadge :color="statusColor(memberStatus(member))">
                {{ member.memberships?.length ? traducirEstado(memberStatus(member)) : "Sin plan" }}
              </BaseBadge>
              <button
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
          </div>

          <div
            v-if="detallesAbiertos.includes(member.id)"
            class="member-card-detail"
          >
            <div class="member-detail-photo-shell">
              <img
                v-if="getPrimaryPhoto(member)"
                :src="getPrimaryPhoto(member)"
                :alt="`Foto inicial de ${member.name}`"
                class="member-detail-photo"
              />
              <div v-else class="member-detail-photo-empty">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Sin foto inicial</span>
              </div>
            </div>

            <div class="member-info-list">
              <div class="member-info-row">
                <span class="member-info-label">Cédula / ID</span>
                <span class="member-info-value">{{ member.identification || "—" }}</span>
              </div>
              <div class="member-info-row">
                <span class="member-info-label">Email</span>
                <span class="member-info-value">{{ member.email || "—" }}</span>
              </div>
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
              <div class="member-info-row">
                <span class="member-info-label">Estado</span>
                <BaseBadge :color="statusColor(memberStatus(member))">
                  {{ member.memberships?.length ? traducirEstado(memberStatus(member)) : "Sin plan" }}
                </BaseBadge>
              </div>
            </div>

            <div class="member-notes">
              {{ member.medical_history || "Sin antecedentes médicos" }}
            </div>

            <div class="pt-3 flex flex-wrap items-center gap-1.5">
              <button
                class="action-btn action-primary"
                @click="abrirDetalle(member)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Detalle
              </button>

              <a
                v-if="member.phone"
                :href="`https://wa.me/${formatearTelefono(member.phone)}`"
                target="_blank"
                class="action-btn action-success"
              >
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
                WhatsApp
              </a>

              <router-link
                :to="{ name: 'MemberEdit', params: { id: member.id } }"
                class="action-btn action-neutral"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </router-link>

              <button
                class="action-btn"
                :class="member.memberships?.[0]?.status === 'expired' ? 'action-warning' : 'action-indigo'"
                @click="abrirAsignar(member)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {{ member.memberships?.[0]?.status === "expired" ? "Renovar" : "Membresía" }}
              </button>

              <button class="action-btn action-success" @click="abrirPagar(member)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
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
            class="px-3 py-1 rounded border border-default-soft bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed">
            Anterior
          </button>
          <button @click="currentPageMiembros++" :disabled="currentPageMiembros === totalMiembrosPages"
            class="px-3 py-1 rounded border border-default-soft bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed">
            Siguiente
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
import Sidebar from "@/views/Sidebar.vue";
import Swal from "sweetalert2";

// Importar Componentes Hijos
import MemberRegisterModal from "@/components/members/MemberRegisterModal.vue";
import MemberAssignModal from "@/components/members/MemberAssignModal.vue";
import MemberPaymentModal from "@/components/members/MemberPaymentModal.vue";
import MemberDetailModal from "@/components/members/MemberDetailModal.vue";
import { BaseBadge } from "@/components/ui";

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

function memberStatus(member) {
  return member?.memberships?.[0]?.status || "inactive";
}

function statusColor(status) {
  const map = {
    active: "green",
    expired: "red",
    pending: "yellow",
    inactive_unpaid: "yellow",
    cancelled: "gray",
    inactive: "gray",
  };
  return map[status] || "gray";
}

// ... código existente ...

const traducirEstado = (estado) => {
  const diccionario = {
    active: "Activa",
    expired: "Vencida",
    pending: "Pendiente",
    inactive_unpaid: "Sin pago",
    inactive: "Inactiva",
    cancelled: "Cancelada",
  };
  // Si no encuentra la traducción, devuelve el estado original
  return diccionario[estado] || estado;
};
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

.member-detail-photo-shell {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--color-surface);
  margin-bottom: 0.75rem;
}

.member-detail-photo {
  width: 100%;
  height: 9rem;
  object-fit: cover;
  display: block;
}

.member-detail-photo-empty {
  height: 9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--color-text-subtle);
}

.member-info-list {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
}

.member-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid var(--color-border);
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
