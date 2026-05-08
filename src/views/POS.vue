<template>
  <div class="pos-root">

    <!-- ═══ HEADER ═══ -->
    <header class="pos-header">
      <h1 class="text-lg md:text-xl font-bold inline-flex items-center gap-2">
        <ShoppingCart class="w-5 h-5" aria-hidden="true" />
        Punto de Venta
      </h1>
      <div class="flex gap-2">
        <router-link to="/Products" class="btn btn-indigo px-3 py-2 text-xs sm:text-sm inline-flex items-center gap-2">
          <Boxes class="w-4 h-4" aria-hidden="true" />
          Inventario
        </router-link>
        <router-link to="/Menu" class="btn btn-dark px-3 py-2 text-xs sm:text-sm inline-flex items-center gap-2">
          <Home class="w-4 h-4" aria-hidden="true" />
          Salir
        </router-link>
      </div>
    </header>

    <!-- ═══ BODY ═══ -->
    <div class="pos-body">

      <!-- ── Productos (izquierda) ── -->
      <div class="pos-products-col">

        <!-- Barra de filtros -->
        <div class="pos-filters">
          <div class="flex-1">
            <BaseSelect
              v-model="selectedMemberId"
              :options="memberOptions"
              placeholder="Seleccionar Cliente"
              searchable
              empty-text="No se encontraron clientes"
            />
          </div>
          <div class="flex-1 relative search-input-wrap">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 dark:text-gray-500">
              <Search class="w-4 h-4" aria-hidden="true" />
            </div>
            <input v-model="search" type="text" placeholder="Buscar producto por nombre..." class="field-input text-sm pos-search-input">
          </div>
        </div>

        <!-- Grid de productos -->
        <div class="flex-1 overflow-y-auto pb-20 lg:pb-0 pr-1">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              @click="addToCart(product)"
              class="pos-product-card"
            >
              <span
                class="badge absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-bold"
                :class="product.stock < 5 ? 'badge-red' : 'badge-green'"
              >
                {{ product.stock }}
              </span>
              <div>
                <h3 class="font-bold text-sm leading-tight line-clamp-2" style="color: var(--color-text);">{{ product.name }}</h3>
                <p class="text-lg font-bold mt-1 pos-price">${{ formatCurrency(product.price) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Ticket (derecha) ── -->
      <div class="pos-ticket">

        <!-- Ticket header -->
        <div class="pos-ticket-header">
          <h3 class="font-bold flex items-center gap-2" style="color: var(--color-text);">
            <Receipt class="w-4 h-4" aria-hidden="true" />
            Ticket
            <span class="badge badge-blue text-xs px-2 py-0.5 rounded-full">{{ cart.length }} items</span>
          </h3>
          <button @click="cart = []" v-if="cart.length > 0" class="text-xs text-red-400 hover:text-red-300 hover:underline cursor-pointer inline-flex items-center gap-1">
            <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
            Vaciar
          </button>
        </div>

        <!-- Ticket items -->
        <div class="pos-ticket-items">
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center opacity-40">
            <ShoppingCart class="w-8 h-8" aria-hidden="true" />
            <p class="text-sm" style="color: var(--color-text-subtle);">Carrito vacío</p>
          </div>

          <div v-for="(item, index) in cart" :key="index" class="pos-cart-item">
            <div class="flex-1 min-w-0">
              <p class="font-bold truncate" style="color: var(--color-text);">{{ item.name }}</p>
              <div class="text-xs" style="color: var(--color-text-muted);">
                {{ item.quantity }} x ${{ formatCurrency(item.price) }}
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-bold" style="color: var(--color-text-soft);">${{ formatCurrency(item.price * item.quantity) }}</span>
              <button @click="removeFromCart(index)" class="pos-remove-btn" aria-label="Quitar del carrito">
                <X class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <!-- Ticket footer -->
        <div class="pos-ticket-footer">
          <div class="flex justify-between items-center mb-3">
            <span style="color: var(--color-text-muted);" class="font-medium">Total a Pagar</span>
            <span class="text-2xl font-black" style="color: var(--color-text);">${{ formatCurrency(totalCart) }}</span>
          </div>

          <button
            @click="procesarVenta"
            :disabled="cart.length === 0 || !selectedMemberId"
            class="pos-cobrar-btn inline-flex items-center justify-center gap-2"
          >
            <template v-if="!selectedMemberId">
              <UserCircle class="w-5 h-5" aria-hidden="true" />
              Selecciona Cliente
            </template>
            <template v-else>
              <CreditCard class="w-5 h-5" aria-hidden="true" />
              COBRAR
            </template>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import api from '@/axios'
import { Search, ShoppingCart, X, Boxes, Home, Receipt, Trash2, UserCircle, CreditCard } from 'lucide-vue-next'
import { BaseSelect } from '@/components/ui'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'

const products = ref([])
const members = ref([])
const cart = ref([])
const search = ref('')
const selectedMemberId = ref('')

const memberOptions = computed(() =>
  members.value.map((m) => ({ value: m.id, label: m.name }))
)

const fetchData = async () => {
  try {
    const [resProd, resMemb] = await Promise.all([
      api.get('/supplementProduct'),
      api.get('/members')
    ])
    products.value = resProd.data
    members.value = resMemb.data
  } catch (e) {
    console.error(e)
    Swal.fire('Error de conexión', 'Revisa tu internet o el servidor', 'error')
  }
}

const filteredProducts = computed(() => {
  return products.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase()) && p.stock > 0
  )
})

const addToCart = (product) => {
  const existing = cart.value.find(item => item.id === product.id)

  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity++
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      })
      Toast.fire({ icon: 'warning', title: '¡Stock máximo!' })
    }
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock
    })
  }
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
}

const totalCart = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val)

const procesarVenta = async () => {
  try {
    await api.post('/supplement-sales/bulk', {
      member_id: selectedMemberId.value || null,
      cart: cart.value,
      payment_method_id: 1,
      payment_method_name: 'Efectivo',
      paid_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })

    Swal.fire({
      title: '¡Venta Exitosa!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    })

    cart.value = []
    selectedMemberId.value = ''
    fetchData()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo procesar', 'error')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════
   POS – Layout principal
   ═══════════════════════════════════════════ */
.pos-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg);
  color: var(--color-text);
}

.pos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
  flex-shrink: 0;
}
:global(.dark) .pos-header {
  background: var(--color-surface-muted);
  border-bottom-color: rgba(255, 255, 255, 0.10);
}

.pos-body {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}
@media (min-width: 640px) { .pos-body { padding: 1rem; } }
@media (min-width: 1024px) { .pos-body { flex-direction: row; } }

/* ═══════════════════════════════════════════
   Columna de productos
   ═══════════════════════════════════════════ */
.pos-products-col {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 50%;
}
@media (min-width: 1024px) {
  .pos-products-col { width: 66.66%; height: 100%; }
}

.pos-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  flex-shrink: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}
@media (min-width: 640px) { .pos-filters { flex-direction: row; } }
:global(.dark) .pos-filters {
  background: var(--color-surface-muted);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* ═══════════════════════════════════════════
   Estilos Premium para los Inputs de Filtro
   ═══════════════════════════════════════════ */
.search-input-wrap .pos-search-input {
  padding-left: 2.75rem;
  height: 3rem;
  font-weight: 500;
  border-radius: 0.75rem;
  border: 1.5px solid var(--color-border-strong);
  transition: all 0.3s ease;
  font-size: 0.95rem;
}
.search-input-wrap .pos-search-input:hover {
  border-color: var(--color-text-subtle);
}
.search-input-wrap .pos-search-input:focus {
  border-color: var(--color-text-soft);
  box-shadow: 0 0 0 4px var(--color-overlay-strong);
}

/* ═══════════════════════════════════════════
   Tarjeta de producto
   ═══════════════════════════════════════════ */
.pos-product-card {
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
  transition: all 0.15s ease;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
:global(.dark) .pos-product-card {
  background: var(--color-surface-muted);
  border-color: rgba(255, 255, 255, 0.12);
}
.pos-product-card:hover {
  border-color: rgba(96, 165, 250, 0.5);
  transform: translateY(-1px);
}
:global(.dark) .pos-product-card:hover {
  background: var(--color-surface-soft);
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
.pos-product-card:active {
  border-color: #3b82f6;
  transform: scale(0.97);
}

.pos-price {
  color: #3b82f6;
}
:global(.dark) .pos-price {
  color: #60a5fa;
}

/* ═══════════════════════════════════════════
   Panel del Ticket
   ═══════════════════════════════════════════ */
.pos-ticket {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 50%;
  z-index: 20;
  border-radius: 0.75rem 0.75rem 0 0;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.1);
}
@media (min-width: 1024px) {
  .pos-ticket {
    width: 33.33%;
    height: 100%;
    border-radius: 0.75rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  }
}
:global(.dark) .pos-ticket {
  background: var(--color-surface-muted);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
}

.pos-ticket-header {
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-soft);
}
:global(.dark) .pos-ticket-header {
  background: rgba(255, 255, 255, 0.04);
  border-bottom-color: rgba(255, 255, 255, 0.10);
}

.pos-ticket-items {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pos-cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
}
:global(.dark) .pos-cart-item {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.10);
}

.pos-remove-btn {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.pos-remove-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}
.pos-remove-btn:active { transform: scale(0.9); }

.pos-ticket-footer {
  padding: 0.75rem;
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-soft);
}
:global(.dark) .pos-ticket-footer {
  background: rgba(255, 255, 255, 0.04);
  border-top-color: rgba(255, 255, 255, 0.10);
}

.pos-cobrar-btn {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  background: #2563eb;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
}
.pos-cobrar-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
}
.pos-cobrar-btn:active:not(:disabled) { transform: scale(0.97); }
.pos-cobrar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-overlay-strong);
  color: var(--color-text-subtle);
  box-shadow: none;
}
</style>
