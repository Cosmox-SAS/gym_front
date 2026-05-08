<template>
  <div class="page-layout">
    <BaseCard title="Planes de Membresía" subtitle="Gestiona los planes disponibles" class="space-y-6">
      <template #actions>
        <router-link to="/Menu" class="btn btn-secondary flex-1 sm:flex-none inline-flex items-center justify-center gap-2">
          <Home class="w-4 h-4" aria-hidden="true" />
          <span>Inicio</span>
        </router-link>
        <BaseButton variant="success" class="flex-1 sm:flex-none" @click="openModal = true">
          <Plus class="w-4 h-4" aria-hidden="true" />
          Nuevo plan
        </BaseButton>
      </template>

      <div class="table-wrap">
        <table class="min-w-full text-left text-sm">
          <thead class="table-head">
            <tr>
              <th>Tipo</th>
              <th>Frecuencia</th>
              <th>Precio</th>
              <th class="!text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in planesPaginados" :key="plan.id" class="table-row">
              <td class="font-medium">{{ plan.membership_type.name }}</td>
              <td>
                <BaseBadge color="blue">{{ traducirFrecuencia(plan.frequency) }}</BaseBadge>
              </td>
              <td class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ${{ Number(plan.price).toLocaleString() }}
              </td>
              <td>
                <div class="flex justify-center gap-2">
                  <BaseButton variant="indigo" size="sm" @click="editarPlan(plan)">
                    <Pencil class="w-3.5 h-3.5" aria-hidden="true" />
                    Editar
                  </BaseButton>
                  <BaseButton variant="danger" size="sm" @click="eliminarPlan(plan.id)">
                    <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
                    Eliminar
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="totalPlanesPages > 1"
        class="flex items-center justify-between text-sm text-muted"
      >
        <span>Página {{ currentPagePlanes }} de {{ totalPlanesPages }}</span>
        <div class="flex gap-1">
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="currentPagePlanes === 1"
            @click="currentPagePlanes--"
          >
            <ChevronLeft class="w-4 h-4" aria-hidden="true" />
            Anterior
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="currentPagePlanes === totalPlanesPages"
            @click="currentPagePlanes++"
          >
            Siguiente
            <ChevronRight class="w-4 h-4" aria-hidden="true" />
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseModal v-model="openModal" title="Crear Nuevo Plan" size="md">
      <form id="create-plan-form" class="space-y-4" @submit.prevent="crearPlan">
        <BaseSelect
          v-model="nuevoPlan.membership_type_id"
          label="Tipo de Membresía"
          placeholder="Seleccione un tipo"
          :options="tipos.map((t) => ({ value: t.id, label: t.name }))"
          required
        />

        <BaseSelect
          v-model="nuevoPlan.frequency"
          label="Frecuencia"
          placeholder="Seleccione frecuencia"
          :options="FREQUENCY_OPTIONS"
          required
        />

        <BaseInput
          v-model="nuevoPlan.price"
          label="Precio"
          type="number"
          min="0"
          step="0.01"
          required
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="openModal = false">
          <X class="w-4 h-4" aria-hidden="true" />
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" type="submit" form="create-plan-form">
          <Check class="w-4 h-4" aria-hidden="true" />
          Guardar
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="editModal" title="Editar Plan" size="md" @close="cerrarModalEdicion">
      <form id="edit-plan-form" class="space-y-4" @submit.prevent="actualizarPlan">
        <BaseSelect
          v-model="planEditando.membership_type_id"
          label="Tipo de Membresía"
          placeholder="Seleccione un tipo"
          :options="tipos.map((t) => ({ value: t.id, label: t.name }))"
          required
        />

        <BaseSelect
          v-model="planEditando.frequency"
          label="Frecuencia"
          placeholder="Seleccione frecuencia"
          :options="FREQUENCY_OPTIONS"
          required
        />

        <BaseInput
          v-model="planEditando.price"
          label="Precio"
          type="number"
          min="0"
          step="0.01"
          required
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="cerrarModalEdicion">
          <X class="w-4 h-4" aria-hidden="true" />
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" type="submit" form="edit-plan-form">
          <Check class="w-4 h-4" aria-hidden="true" />
          Actualizar
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/axios";
import Swal from "sweetalert2";
import { BaseButton, BaseInput, BaseSelect, BaseCard, BaseBadge, BaseModal } from "@/components/ui";
import { SWAL_COLORS } from "@/lib/colors";
import {
  Home,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-vue-next";

// Opciones compartidas para los selects de frecuencia.
const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
];

const planes = ref([]);
const currentPagePlanes = ref(1);
const PER_PAGE = 10;
const totalPlanesPages = computed(() => Math.ceil(planes.value.length / PER_PAGE));
const planesPaginados = computed(() => {
  const start = (currentPagePlanes.value - 1) * PER_PAGE;
  return planes.value.slice(start, start + PER_PAGE);
});
const tipos = ref([]);
const openModal = ref(false);
const editModal = ref(false);
const loading = ref(true);

const nuevoPlan = ref({ membership_type_id: "", frequency: "", price: "" });
const planEditando = ref({ id: null, membership_type_id: "", frequency: "", price: "" });

const traducirFrecuencia = (freq) => {
  const mapa = { daily: "Diario", weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual" };
  return mapa[freq] || freq;
};

const cargarPlanes = async () => {
  const { data } = await api.get("/membershipPlan");
  planes.value = data;
};
const cargarTipos = async () => {
  const { data } = await api.get("/membershipType");
  tipos.value = data;
};

const crearPlan = async () => {
  try {
    await api.post("/membershipPlan", {
      membership_type_id: nuevoPlan.value.membership_type_id,
      frequency: nuevoPlan.value.frequency,
      price: parseFloat(nuevoPlan.value.price),
    });
    openModal.value = false;
    nuevoPlan.value = { membership_type_id: "", frequency: "", price: "" };
    await cargarPlanes();
  } catch (error) {
    console.error("Error:", error);
  }
};

const editarPlan = (plan) => {
  planEditando.value = {
    id: plan.id,
    membership_type_id: plan.membership_type_id,
    frequency: plan.frequency,
    price: plan.price,
  };
  editModal.value = true;
};

const actualizarPlan = async () => {
  try {
    await api.put(`/membershipPlan/${planEditando.value.id}`, {
      membership_type_id: planEditando.value.membership_type_id,
      frequency: planEditando.value.frequency,
      price: parseFloat(planEditando.value.price),
    });
    editModal.value = false;
    planEditando.value = { id: null, membership_type_id: "", frequency: "", price: "" };
    Swal.fire({
      icon: "success",
      title: "Actualizado",
      text: "Plan actualizado correctamente",
      timer: 1500,
      showConfirmButton: false,
    });
    await cargarPlanes();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al actualizar el plan.",
    });
  }
};

const eliminarPlan = (id) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: SWAL_COLORS.info,
    cancelButtonColor: SWAL_COLORS.danger,
    confirmButtonText: "Sí, eliminarlo",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      api
        .delete(`/membershipPlan/${id}`)
        .then(() => {
          planes.value = planes.value.filter((plan) => plan.id !== id);
          Swal.fire({
            title: "¡Eliminado!",
            text: "El plan ha sido eliminado.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        })
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al eliminar el plan.",
          });
        });
    }
  });
};

const cerrarModalEdicion = () => {
  editModal.value = false;
  planEditando.value = { id: null, membership_type_id: "", frequency: "", price: "" };
};

onMounted(async () => {
  try {
    await Promise.all([cargarPlanes(), cargarTipos()]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
});
</script>
