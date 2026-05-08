<template>
  <div
    class="page-layout"
  >
    <div class="page-card">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 class="page-title">Membresías</h1>
          <p class="page-subtitle">{{ tituloFiltro }}</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <router-link to="/Menu" class="btn btn-secondary flex-1 sm:flex-none inline-flex items-center justify-center gap-2">
            <Home class="w-4 h-4" aria-hidden="true" />
            <span>Inicio</span>
          </router-link>
          <button @click="showModal = true" class="btn btn-success flex-1 sm:flex-none inline-flex items-center justify-center gap-2">
            <Plus class="w-4 h-4" aria-hidden="true" />
            <span>Asignar membresía</span>
          </button>
        </div>
      </div>

      <div class="flex overflow-x-auto pb-2 gap-2 mb-4 scrollbar-hide">
        <button
          @click="filtrarMembresias('')"
          class="btn btn-sm whitespace-nowrap"
          :class="statusFilter === '' ? 'btn-primary' : 'btn-secondary'"
        >
          Todos
        </button>
        <button
          @click="filtrarMembresias('active')"
          class="btn btn-sm whitespace-nowrap"
          :class="statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'"
        >
          Activas
        </button>
        <button
          @click="filtrarMembresias('inactive_unpaid')"
          class="btn btn-sm whitespace-nowrap"
          :class="statusFilter === 'inactive_unpaid' ? 'btn-primary' : 'btn-secondary'"
        >
          Por Pagar
        </button>
        <button
          @click="filtrarMembresias('expiring_soon')"
          class="btn btn-sm whitespace-nowrap"
          :class="statusFilter === 'expiring_soon' ? 'btn-primary' : 'btn-secondary'"
        >
          Vencen Pronto
        </button>
      </div>

      <div class="mb-4 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
        <input
          v-model="busquedaMembresia"
          type="text"
          placeholder="Buscar miembro..."
          class="field-input pl-10"
        />
      </div>

      <div class="overflow-x-auto rounded-lg border border-default-soft shadow-sm">
        <div v-if="loading" class="text-center py-10 text-subtle">Cargando...</div>

        <table v-else class="w-full text-sm min-w-[800px]">
          <thead class="bg-[var(--color-surface-soft)] text-muted">
            <tr>
              <th class="py-3 px-4 text-left">Cliente</th>
              <th class="py-3 px-4 text-left">Plan</th>
              <th class="py-3 px-4 text-left">Vigencia</th>
              <th class="py-3 px-4 text-center">Estado</th>
              <th class="py-3 px-4 text-right">Saldo</th>
              <th class="py-3 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y border-default-soft bg-[var(--color-surface)]">
            <tr v-if="membresias.length === 0">
              <td colspan="6" class="py-10 text-center text-subtle">
                No se encontraron resultados.
              </td>
            </tr>
            <tr v-for="m in membresias" :key="m.id" class="hover:bg-[var(--color-surface-soft)] transition">
              <td class="py-3 px-4 font-bold text-default">{{ m.member?.name }}</td>

              <td class="py-3 px-4">
                {{ m.plan?.membership_type?.name }}
                <span class="text-xs text-muted bg-[var(--color-overlay)] px-1 rounded ml-1">
                  {{ traducirFrecuencia(m.plan?.frequency) }}
                </span>
              </td>

              <td class="py-3 px-4 text-xs text-muted">
                {{ formatDate(m.start_date) }} → {{ formatDate(m.end_date) }}
              </td>

              <td class="py-3 px-4 text-center">
                <span
                  class="badge px-2 py-1 rounded-full text-xs font-bold"
                  :class="{
                    'badge-green':  m.status === 'active',
                    'badge-red':    m.status === 'expired',
                    'badge-yellow': m.status === 'inactive_unpaid',
                    'badge-gray':   m.status === 'cancelled' || m.status === 'inactive',
                  }"
                >
                  {{ traducirEstado(m.status) }}
                </span>
              </td>
              <td class="py-3 px-4 text-right font-mono font-bold">
                {{ formatCurrency(m.outstanding_balance) }}
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex gap-2 justify-center">
                  <!-- Solo mostrar Renovar si está Vencida -->
                  <button
                    v-if="m.status === 'expired'"
                    @click="abrirRenovacion(m)"
                    class="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white shadow-sm flex items-center gap-1"
                    title="Renovar Membresía"
                  >
                    <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
                    Renovar
                  </button>

                  <!-- Mostrar Editar solo si NO está vencida (activa, pendiente, etc.) -->
                  <button
                    v-else
                    class="btn btn-sm bg-[var(--color-overlay)] text-muted hover:bg-[var(--color-overlay-strong)] hover:text-default border border-default-soft flex items-center gap-1"
                    @click="abrirEditarModal(m)"
                    title="Editar / Corregir"
                  >
                    <Pencil class="w-3.5 h-3.5" aria-hidden="true" />
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="lastPage > 1" class="flex items-center justify-between mt-4 text-sm text-muted">
        <span>Página {{ currentPage }} de {{ lastPage }} ({{ totalItems }} registros)</span>
        <div class="flex gap-1">
          <button
            @click="cambiarPagina(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border border-default-soft bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <ChevronLeft class="w-4 h-4" aria-hidden="true" />
            <span>Anterior</span>
          </button>
          <button
            v-for="page in paginasVisibles"
            :key="page"
            @click="cambiarPagina(page)"
            class="px-3 py-1 rounded border"
            :class="page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-default-soft bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)]'"
          >
            {{ page }}
          </button>
          <button
            @click="cambiarPagina(currentPage + 1)"
            :disabled="currentPage === lastPage"
            class="px-3 py-1 rounded border border-default-soft bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <span>Siguiente</span>
            <ChevronRight class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        v-if="showEditModal"
        class="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        :style="{ background: 'var(--modal-backdrop)' }"
      >
        <div class="w-full max-w-sm p-6 rounded-xl shadow-2xl" :style="{ background: 'var(--modal-panel-bg)', border: '1px solid var(--modal-panel-border)' }">
          <h2 id="membership-edit-modal-title" class="font-bold text-lg mb-4 border-b border-default-soft pb-2 flex items-center gap-2 text-default">
            <Pencil class="w-5 h-5" aria-hidden="true" />
            Editar Membresía
          </h2>
          <form @submit.prevent="guardarCambios" class="space-y-3">
            <div>
              <label class="text-xs font-bold uppercase text-subtle">Plan</label>
              <BaseSelect
                v-model="editarMembresia.plan.id"
                :options="planEditOptions"
                placeholder="Seleccione un plan"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold uppercase text-subtle">Inicio</label>
                <input
                  v-model="editarMembresia.start_date"
                  type="date"
                  class="field-input"
                />
              </div>
              <div>
                <label class="text-xs font-bold uppercase text-subtle">Fin</label>
                <input
                  v-model="editarMembresia.end_date"
                  type="date"
                  class="field-input"
                />
              </div>
            </div>

            <div>
              <label class="text-xs font-bold uppercase text-subtle">Estado</label>
              <BaseSelect
                v-model="editarMembresia.status"
                :options="estadoMembresiaOptions"
              />
            </div>

            <div class="flex justify-end gap-2 mt-4 pt-2 border-t">
              <button type="button" @click="cerrarEditarModal" class="btn btn-secondary inline-flex items-center gap-2">
                <X class="w-4 h-4" aria-hidden="true" />
                <span>Cancelar</span>
              </button>
              <button type="submit" class="btn btn-primary inline-flex items-center gap-2">
                <Check class="w-4 h-4" aria-hidden="true" />
                <span>Guardar</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        :style="{ background: 'var(--modal-backdrop)' }"
      >
        <div class="w-full max-w-md p-6 rounded-xl shadow-2xl" :style="{ background: 'var(--modal-panel-bg)', border: '1px solid var(--modal-panel-border)' }">
          <h2 id="membership-assign-modal-title" class="font-bold text-lg mb-4 border-b border-default-soft pb-2 flex items-center gap-2 text-default">
            <CalendarCheck2 class="w-5 h-5" aria-hidden="true" />
            {{ form.member_id ? "Asignar membresía a " + busqueda : "Asignar Nueva" }}
          </h2>
          <form @submit.prevent="asignarMembresia" class="space-y-4">
            <!-- Solo mostrar búsqueda si NO hay member_id pre-seleccionado -->
            <div v-if="!form.member_id">
              <label class="text-xs font-bold uppercase text-subtle">Buscar Cliente</label>
              <input
                v-model="busqueda"
                type="text"
                placeholder="Nombre..."
                class="field-input"
              />
              <ul
                v-if="miembrosFiltrados.length"
                class="border border-default-soft rounded-lg mt-1 max-h-32 overflow-y-auto bg-[var(--color-surface)] absolute w-64 z-10 shadow-lg"
              >
                <li
                  v-for="m in miembrosFiltrados"
                  :key="m.id"
                  @click="seleccionarMiembro(m)"
                  class="p-2 hover:bg-[var(--color-surface-soft)] cursor-pointer text-sm border-b border-default-soft"
                >
                  {{ m.name }}
                </li>
              </ul>
            </div>

            <div>
              <label class="text-xs font-bold uppercase text-subtle">Plan</label>
              <BaseSelect
                v-model="form.plan_id"
                :options="planAsignarOptions"
                placeholder="Seleccione..."
                required
              />
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="cerrarModal" class="btn btn-secondary inline-flex items-center gap-2">
                <X class="w-4 h-4" aria-hidden="true" />
                <span>Cancelar</span>
              </button>
              <button type="submit" class="btn btn-success inline-flex items-center gap-2">
                <Check class="w-4 h-4" aria-hidden="true" />
                <span>Asignar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";

import { useRoute } from "vue-router";
import api from "@/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import Swal from "sweetalert2";
import {
  Home,
  Plus,
  Search,
  Pencil,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarCheck2,
  X,
  Check,
} from "lucide-vue-next";
import { BaseSelect } from "@/components/ui";

const route = useRoute();

// Estado
const membresias = ref([]);
const miembros = ref([]);
const planes = ref([]);
const showModal = ref(false);
const showEditModal = ref(false);
const editarMembresia = ref({});
const busquedaMembresia = ref("");
const loading = ref(true);
const statusFilter = ref("");
const tituloFiltro = ref("Activas y Vencidas");
const form = ref({ member_id: "", plan_id: "", end_date: "", status: "inactive_unpaid" });
const busqueda = ref("");
const miembroSeleccionado = ref(false);

// Paginación
const currentPage = ref(1);
const lastPage = ref(1);
const totalItems = ref(0);

const paginasVisibles = computed(() => {
  const delta = 2;
  const pages = [];
  for (let i = Math.max(1, currentPage.value - delta); i <= Math.min(lastPage.value, currentPage.value + delta); i++) {
    pages.push(i);
  }
  return pages;
});

// Búsqueda en modal de asignar (solo local)
const miembrosFiltrados = computed(() => {
  const term = busqueda.value.toLowerCase();
  return term
    ? miembros.value.filter(
        (m) => m.name.toLowerCase().includes(term) || (m.email || "").toLowerCase().includes(term),
      )
    : [];
});

// Watcher para búsqueda server-side con debounce
let searchTimeout = null;
watch(busquedaMembresia, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    cargarMembresias();
  }, 350);
});

// Cargas de Datos
const cargarMembresias = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (statusFilter.value) params.append("status", statusFilter.value);
    if (busquedaMembresia.value) params.append("search", busquedaMembresia.value);
    params.append("page", currentPage.value);
    const { data } = await api.get(`/memberships?${params.toString()}`);
    membresias.value = data.data;
    currentPage.value = data.current_page;
    lastPage.value = data.last_page;
    totalItems.value = data.total;
  } catch (error) {
    console.error(error);
    membresias.value = [];
  } finally {
    loading.value = false;
  }
};

const cambiarPagina = (page) => {
  if (page < 1 || page > lastPage.value) return;
  currentPage.value = page;
  cargarMembresias();
};

const cargarMiembros = async () => {
  const { data } = await api.get("/members");
  miembros.value = data;
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
  }
};

// Acciones Filtro
const filtrarMembresias = (status) => {
  statusFilter.value = status;
  currentPage.value = 1;
  if (status === "active") tituloFiltro.value = "Solo Activas";
  else if (status === "inactive_unpaid") tituloFiltro.value = "Por Pagar";
  else if (status === "expiring_soon") tituloFiltro.value = "Vencen Pronto";
  else tituloFiltro.value = "Todas";
  cargarMembresias();
};

// Acciones Modales
const seleccionarMiembro = (miembro) => {
  form.value.member_id = miembro.id;
  busqueda.value = miembro.name;
  // Ocultar resultados al seleccionar
  miembroSeleccionado.value = true;
};
const cerrarModal = () => {
  showModal.value = false;
  busqueda.value = "";
  form.value = { member_id: "", plan_id: "", status: "inactive_unpaid" }; // Cambiado de "active" a "inactive_unpaid"
  miembroSeleccionado.value = false;
};

const asignarMembresia = async () => {
  try {
    // ELIMINADO: Ya no validamos aquí, dejamos que el Backend decida.
    // El backend ya tiene logic para devolver error si hay activa/pending
    // y para borrar si hay expired.

    await api.post("/memberships", {
      member_id: form.value.member_id,
      plan_id: form.value.plan_id,
    });
    cerrarModal();
    filtrarMembresias("inactive_unpaid");
    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: "Membresía asignada correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.error || "Error al asignar membresía";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });
  }
};

const abrirRenovacion = (m) => {
  // Usamos la misma lógica que "seleccionarMiembro" pero pre-llenamos desde la fila
  if (m.member) {
    seleccionarMiembro(m.member);
    showModal.value = true;
    miembroSeleccionado.value = true;
  }
};

const abrirEditarModal = (m) => {
  editarMembresia.value = {
    ...m,
    start_date: dayjs(m.start_date).format("YYYY-MM-DD"),
    end_date: dayjs(m.end_date).format("YYYY-MM-DD"),
    plan: { id: m.plan?.id },
  };
  showEditModal.value = true;
};

const cerrarEditarModal = () => {
  showEditModal.value = false;
  editarMembresia.value = {};
};

const guardarCambios = async () => {
  try {
    await api.put(`/memberships/${editarMembresia.value.id}`, {
      plan_id: editarMembresia.value.plan?.id,
      start_date: editarMembresia.value.start_date,
      end_date: editarMembresia.value.end_date,
      status: editarMembresia.value.status,
    });
    showEditModal.value = false;
    await cargarMembresias();
    Swal.fire({
      icon: "success",
      title: "Actualizado",
      text: "La membresía ha sido actualizada correctamente.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al guardar los cambios.",
    });
  }
};

// Utilidades
const formatDate = (d) => dayjs(d).format("DD/MM/YY");
const formatCurrency = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);

const traducirFrecuencia = (f) => {
  const map = { daily: "Diaria", weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual" };
  return map[f] || f;
};

const planEditOptions = computed(() =>
  planes.value.map((p) => ({
    value: p.id,
    label: `${p.membership_type?.name || "Plan"} (${traducirFrecuencia(p.frequency)})`,
  }))
);

const planAsignarOptions = computed(() =>
  planes.value.map((p) => ({
    value: p.id,
    label: `${p.membership_type?.name || "Plan"} - ${traducirFrecuencia(p.frequency)} - $${parseInt(p.price).toLocaleString()}`,
  }))
);

const estadoMembresiaOptions = [
  { value: "active", label: "Activa" },
  { value: "expired", label: "Vencida" },
  { value: "inactive_unpaid", label: "Por Pagar" },
  { value: "cancelled", label: "Cancelada" },
];

const traducirEstado = (s) => {
  const map = {
    active: "Activa",
    expired: "Vencida",
    inactive_unpaid: "Por Pagar",
    cancelled: "Cancelada",
    inactive: "Inactiva",
  };
  return map[s] || s;
};

// On Mounted
onMounted(() => {
  if (route.query.filter) filtrarMembresias(route.query.filter);
  else cargarMembresias();
  cargarMiembros();
  cargarPlanes();
});
</script>
