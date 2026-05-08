<template>
  <div class="page-layout">
    <div class="max-w-7xl mx-auto space-y-6">
      <header class="page-header">
        <div>
          <h1 class="page-title">Movimientos de Inventario</h1>
          <p class="page-subtitle">Historial de ventas y compras</p>
        </div>
        <router-link to="/Products" class="btn btn-dark inline-flex items-center justify-center gap-2">
          <Boxes class="w-4 h-4" aria-hidden="true" />
          <span>Inventario</span>
        </router-link>
      </header>

      <div
        class="bg-[var(--color-surface)] p-1 rounded-xl inline-flex shadow-lg border border-default-soft"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'ventas'"
          class="px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base inline-flex items-center gap-2"
          :class="
            tab === 'ventas'
              ? 'bg-blue-600 text-white shadow'
              : 'text-subtle hover:text-default'
          "
          @click="tab = 'ventas'"
        >
          <ShoppingCart class="w-4 h-4" aria-hidden="true" />
          Reporte de Ventas
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'compras'"
          class="px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base inline-flex items-center gap-2"
          :class="
            tab === 'compras'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-subtle hover:text-default'
          "
          @click="tab = 'compras'"
        >
          <Truck class="w-4 h-4" aria-hidden="true" />
          Compras a Proveedores
        </button>
      </div>

      <section
        v-if="tab === 'ventas'"
        class="bg-[var(--color-surface)] rounded-2xl shadow-card p-4 sm:p-6 text-default animate-fade-in space-y-4"
      >
        <div class="flex justify-between items-center gap-3 flex-wrap">
          <h2 class="text-xl font-semibold flex items-center gap-2" style="color: var(--color-text);">
            <Receipt class="w-5 h-5" aria-hidden="true" />
            Historial de Ventas
          </h2>
          <div
            class="text-sm px-3 py-1 rounded-lg border inline-flex items-center gap-1"
            style="color: var(--color-text-muted); background: var(--color-surface-soft); border-color: var(--color-border);"
          >
            <DollarSign class="w-3 h-3" aria-hidden="true" />
            Total Vendido:
            <span class="font-semibold text-emerald-500">
              {{ formatCurrency(totalVentas) }}
            </span>
          </div>
        </div>

        <div class="table-wrap">
          <table class="w-full text-sm text-left">
            <thead class="table-head">
              <tr>
                <th class="p-3">Fecha</th>
                <th class="p-3">Producto</th>
                <th class="p-3 text-center">Cant.</th>
                <th class="p-3 text-right">Precio Unit.</th>
                <th class="p-3 text-right">Total</th>
                <th class="p-3">Cliente</th>
              </tr>
            </thead>
            <tbody class="divide-y border-default-soft">
              <tr v-if="ventas.length === 0">
                <td colspan="6" class="p-8 text-center text-subtle italic">
                  No hay ventas registradas aún.
                </td>
              </tr>
              <tr v-for="v in ventasPaginadas" :key="v.id" class="hover:bg-[var(--color-surface-soft)]">
                <td class="p-3 text-muted">{{ formatDate(v.created_at) }}</td>
                <td class="p-3 font-medium">
                  {{ v.product?.name || "Producto eliminado" }}
                </td>
                <td class="p-3 text-center bg-[var(--color-surface-soft)] rounded font-mono">
                  {{ v.quantity }}
                </td>
                <td class="p-3 text-right">
                  {{ formatCurrency(v.total / v.quantity) }}
                </td>
                <td class="p-3 text-right font-semibold text-emerald-600">
                  {{ formatCurrency(v.total) }}
                </td>
                <td class="p-3 text-xs">{{ v.member?.name || "Público General" }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="totalPagesVentas > 1"
          class="flex items-center justify-between pt-3 border-t border-default-soft text-sm text-muted"
        >
          <span>Página {{ currentPageVentas }} de {{ totalPagesVentas }}</span>
          <div class="flex gap-1">
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="currentPageVentas === 1"
              @click="currentPageVentas--"
            >
              <ChevronLeft class="w-4 h-4" aria-hidden="true" />
              Anterior
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="currentPageVentas === totalPagesVentas"
              @click="currentPageVentas++"
            >
              Siguiente
              <ChevronRight class="w-4 h-4" aria-hidden="true" />
            </BaseButton>
          </div>
        </div>
      </section>

      <section
        v-if="tab === 'compras'"
        class="bg-[var(--color-surface)] rounded-2xl shadow-card p-4 sm:p-6 text-default animate-fade-in space-y-4"
      >
        <div class="flex justify-between items-center gap-3 flex-wrap">
          <h2 class="text-xl font-semibold flex items-center gap-2" style="color: var(--color-text);">
            <Truck class="w-5 h-5" aria-hidden="true" />
            Historial de Compras
          </h2>
          <BaseButton variant="success" size="sm" @click="abrirModalCompra">
            <Plus class="w-4 h-4" aria-hidden="true" />
            Registrar Nueva Compra
          </BaseButton>
        </div>

        <div class="table-wrap">
          <table class="w-full text-sm text-left">
            <thead class="table-head">
              <tr>
                <th class="p-3">Fecha</th>
                <th class="p-3">Producto</th>
                <th class="p-3 text-center">Cant. Comprada</th>
                <th class="p-3 text-right">Costo Total</th>
                <th class="p-3">Proveedor / Notas</th>
              </tr>
            </thead>
            <tbody class="divide-y border-default-soft">
              <tr v-if="compras.length === 0">
                <td colspan="5" class="p-8 text-center text-subtle italic">
                  No has registrado compras de reabastecimiento.
                </td>
              </tr>
              <tr v-for="c in comprasPaginadas" :key="c.id" class="hover:bg-[var(--color-surface-soft)]">
                <td class="p-3 text-muted">{{ formatDate(c.purchase_date) }}</td>
                <td class="p-3 font-medium">{{ c.product?.name }}</td>
                <td class="p-3 text-center font-semibold text-emerald-700">
                  +{{ c.quantity }}
                </td>
                <td class="p-3 text-right text-muted">
                  {{ formatCurrency(c.total_cost) }}
                </td>
                <td class="p-3 text-xs text-muted">{{ c.supplier || "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="totalPagesCompras > 1"
          class="flex items-center justify-between pt-3 border-t border-default-soft text-sm text-muted"
        >
          <span>Página {{ currentPageCompras }} de {{ totalPagesCompras }}</span>
          <div class="flex gap-1">
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="currentPageCompras === 1"
              @click="currentPageCompras--"
            >
              <ChevronLeft class="w-4 h-4" aria-hidden="true" />
              Anterior
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="currentPageCompras === totalPagesCompras"
              @click="currentPageCompras++"
            >
              Siguiente
              <ChevronRight class="w-4 h-4" aria-hidden="true" />
            </BaseButton>
          </div>
        </div>
      </section>
    </div>

    <BaseModal v-model="showModal" title="Reabastecer Inventario" size="md">
      <form id="purchase-form" class="space-y-4" @submit.prevent="registrarCompra">
        <BaseSelect
          v-model="form.product_id"
          label="Producto"
          placeholder="Seleccione..."
          :options="productos.map((p) => ({ value: p.id, label: `${p.name} (Stock actual: ${p.stock})` }))"
          required
        />

        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model.number="form.quantity"
            label="Cantidad"
            type="number"
            min="1"
            required
            placeholder="0"
          />
          <BaseInput
            v-model.number="form.total_cost"
            label="Costo Total ($)"
            type="number"
            min="0"
            required
            placeholder="$"
          />
        </div>

        <BaseInput
          v-model.number="form.new_price"
          label="Nuevo Precio de Venta (Opcional)"
          type="number"
          min="0"
          placeholder="Dejar vacío para mantener el actual"
          hint="Si ingresa un valor, se actualizará el precio de venta del producto."
        />

        <BaseInput
          v-model="form.supplier"
          label="Proveedor (Opcional)"
          placeholder="Ej: Distribuidora XYZ"
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">
          <X class="w-4 h-4" aria-hidden="true" />
          Cancelar
        </BaseButton>
        <BaseButton variant="success" type="submit" form="purchase-form">
          <Check class="w-4 h-4" aria-hidden="true" />
          Registrar Entrada
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { BaseButton, BaseInput, BaseSelect, BaseModal } from "@/components/ui";
import {
  Boxes,
  ShoppingCart,
  Truck,
  Receipt,
  DollarSign,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-vue-next";

const tab = ref("ventas");
const ventas = ref([]);
const compras = ref([]);
const PER_PAGE = 10;
const currentPageVentas = ref(1);
const currentPageCompras = ref(1);
const totalPagesVentas = computed(() => Math.ceil(ventas.value.length / PER_PAGE));
const totalPagesCompras = computed(() => Math.ceil(compras.value.length / PER_PAGE));
const ventasPaginadas = computed(() => {
  const start = (currentPageVentas.value - 1) * PER_PAGE;
  return ventas.value.slice(start, start + PER_PAGE);
});
const comprasPaginadas = computed(() => {
  const start = (currentPageCompras.value - 1) * PER_PAGE;
  return compras.value.slice(start, start + PER_PAGE);
});
const productos = ref([]);
const showModal = ref(false);

const form = ref({
  product_id: "",
  quantity: "",
  total_cost: "",
  supplier: "",
  new_price: "", // Added new_price
});

onMounted(() => {
  cargarVentas();
  cargarCompras();
  cargarProductos();
});

// CARGAS DE DATOS
const cargarVentas = async () => {
  try {
    const { data } = await api.get("/supplementSale");
    ventas.value = data.data; // La API devuelve { data: [...] }
  } catch (e) {
    console.error(e);
  }
};

const cargarCompras = async () => {
  try {
    const { data } = await api.get("/product-purchases"); // Ahora sí existe
    compras.value = data;
  } catch (e) {
    console.error(e);
  }
};

const cargarProductos = async () => {
  const { data } = await api.get("/supplementProduct");
  productos.value = data;
};

// ACCIONES
const abrirModalCompra = () => {
  form.value = { product_id: "", quantity: "", total_cost: "", supplier: "", new_price: "" };
  showModal.value = true;
};

const registrarCompra = async () => {
  try {
    await api.post("/product-purchases", form.value); // Endpoint de guardado
    Swal.fire({
      icon: "success",
      title: "Compra Registrada",
      text: "El stock ha sido actualizado correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });
    showModal.value = false;
    cargarCompras();
    cargarProductos(); // Para actualizar stocks en el select
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al registrar la compra.",
    });
    console.error(error);
  }
};

// UTILIDADES
const totalVentas = computed(() => ventas.value.reduce((sum, v) => sum + Number(v.total), 0));
const formatCurrency = (val) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);
const formatDate = (d) => dayjs(d).format("DD/MM/YYYY hh:mm A");
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
