<template>
  <div class="page-layout">
    <div class="max-w-7xl mx-auto space-y-6">
      <header class="page-header">
        <div>
          <h1 class="page-title">Inventario</h1>
          <p class="page-subtitle">Gestión de productos y stock</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <router-link to="/Menu" class="btn btn-dark flex-1 sm:flex-none inline-flex items-center justify-center gap-2">
            <Home class="w-4 h-4" aria-hidden="true" />
            <span>Inicio</span>
          </router-link>
          <BaseButton variant="success" class="flex-1 sm:flex-none" @click="abrirModalRegistro">
            <Plus class="w-4 h-4" aria-hidden="true" />
            Agregar producto
          </BaseButton>
          <router-link to="/inventory-log" class="btn btn-secondary flex-1 sm:flex-none inline-flex items-center justify-center gap-2">
            <ClipboardList class="w-4 h-4" aria-hidden="true" />
            <span>Movimientos</span>
          </router-link>
        </div>
      </header>

      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none z-10" aria-hidden="true" />
        <BaseInput v-model="busqueda" placeholder="Buscar producto..." class="pl-10" />
      </div>

      <div v-if="loading" class="text-subtle text-center py-10">Cargando...</div>

      <template v-else>
        <div
          v-if="productosFiltrados.length === 0"
          class="text-subtle text-center py-10"
        >
          No encontrado.
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6"
        >
          <article
            v-for="producto in productosPaginados"
            :key="producto.id"
            class="bg-[var(--color-surface)] text-default rounded-2xl shadow-card overflow-hidden flex flex-col justify-between border border-default-soft"
          >
            <div class="p-4">
              <div class="flex justify-between items-start gap-2">
                <h2 class="text-lg font-semibold leading-tight">{{ producto.name }}</h2>
                <BaseBadge color="gray">Stock: {{ producto.stock }}</BaseBadge>
              </div>
              <p
                v-if="producto.description"
                class="text-sm text-muted mt-1 line-clamp-2"
              >
                {{ producto.description }}
              </p>
              <p class="text-xl font-semibold text-blue-600 dark:text-blue-400 mt-2">
                ${{ producto.price }}
              </p>
            </div>

            <div class="flex p-2 border-t border-default-soft bg-[var(--color-surface-soft)] gap-2">
              <BaseButton
                variant="indigo"
                size="sm"
                class="flex-1 justify-center"
                @click="editarProducto(producto)"
              >
                <Pencil class="w-3.5 h-3.5" aria-hidden="true" />
                Editar
              </BaseButton>
              <BaseButton
                variant="danger"
                size="sm"
                class="flex-1 justify-center"
                @click="eliminarProducto(producto.id)"
              >
                <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
                Eliminar
              </BaseButton>
            </div>
          </article>
        </div>

        <div
          v-if="totalProductos > 1"
          class="flex items-center justify-between text-sm text-muted"
        >
          <span>Página {{ currentPageProductos }} de {{ totalProductos }}</span>
          <div class="flex gap-1">
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="currentPageProductos === 1"
              @click="currentPageProductos--"
            >
              <ChevronLeft class="w-4 h-4" aria-hidden="true" />
              Anterior
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="currentPageProductos === totalProductos"
              @click="currentPageProductos++"
            >
              Siguiente
              <ChevronRight class="w-4 h-4" aria-hidden="true" />
            </BaseButton>
          </div>
        </div>
      </template>
    </div>

    <BaseModal
      v-model="modalRegistro"
      :title="editando ? 'Editar Producto' : 'Nuevo Producto'"
      size="md"
    >
      <form id="product-form" class="space-y-3" @submit.prevent="guardarProducto">
        <BaseInput
          v-model="productoForm.name"
          label="Nombre"
          placeholder="Nombre"
          required
        />

        <div class="flex flex-col gap-1.5">
          <label class="field-label">Descripción</label>
          <textarea
            v-model="productoForm.description"
            rows="2"
            placeholder="Descripción"
            class="field-input"
          />
        </div>

        <div class="flex gap-3">
          <BaseInput
            v-model.number="productoForm.price"
            label="Precio"
            type="number"
            min="0"
            required
            class="flex-1"
          />
          <BaseInput
            v-model.number="productoForm.stock"
            label="Stock"
            type="number"
            min="0"
            required
            class="flex-1"
          />
        </div>
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="cerrarModalRegistro">
          <X class="w-4 h-4" aria-hidden="true" />
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" type="submit" form="product-form">
          <Check class="w-4 h-4" aria-hidden="true" />
          Guardar
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import api from "@/axios";
import Swal from "sweetalert2";
import { BaseButton, BaseInput, BaseBadge, BaseModal } from "@/components/ui";
import { SWAL_COLORS } from "@/lib/colors";
import {
  Home,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  X,
  Check,
} from "lucide-vue-next";
const productos = ref([]);
const currentPageProductos = ref(1);
const PER_PAGE = 10;
const loading = ref(true);
const busqueda = ref("");
const modalRegistro = ref(false);
const editando = ref(false);
const productoForm = ref({ id: null, name: "", description: "", price: 0, stock: 0 });
const abrirModalRegistro = () => {
  productoForm.value = { id: null, name: "", description: "", price: 0, stock: 0 };
  editando.value = false;
  modalRegistro.value = true;
};
const cerrarModalRegistro = () => (modalRegistro.value = false);
const cargarProductos = async () => {
  try {
    const { data } = await api.get("/supplementProduct");
    productos.value = data;
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar los productos.", "error");
  } finally {
    loading.value = false;
  }
};
const guardarProducto = async () => {
  try {
    const payload = { ...productoForm.value };
    if (editando.value && productoForm.value.id)
      await api.put(`/supplementProduct/${productoForm.value.id}`, payload);
    else await api.post("/supplementProduct", payload);
    cerrarModalRegistro();
    cerrarModalRegistro();
    cargarProductos();
    Swal.fire({
      icon: "success",
      title: "Guardado",
      text: "El producto ha sido guardado correctamente.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "Hubo un error al guardar el producto.", "error");
  }
};
const editarProducto = (producto) => {
  productoForm.value = { ...producto };
  editando.value = true;
  modalRegistro.value = true;
};
const eliminarProducto = async (id) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "El producto será eliminado permanentemente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: SWAL_COLORS.info,
    cancelButtonColor: SWAL_COLORS.danger,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/supplementProduct/${id}`);
        await cargarProductos();
        Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      }
    }
  });
};
const productosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  return productos.value.filter((p) => (p.name || "").toLowerCase().includes(q));
});
const totalProductos = computed(() => Math.ceil(productosFiltrados.value.length / PER_PAGE));
const productosPaginados = computed(() => {
  const start = (currentPageProductos.value - 1) * PER_PAGE;
  return productosFiltrados.value.slice(start, start + PER_PAGE);
});
watch(busqueda, () => { currentPageProductos.value = 1; });
onMounted(() => cargarProductos());
</script>

