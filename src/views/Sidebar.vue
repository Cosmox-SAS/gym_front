
<!-- src/components/Sidebar.vue -->
<template>
  <div>
    <!-- Botón hamburguesa -->
    <button @click="toggle" class="fixed top-4 left-4 z-50 text-white bg-blue-600 px-3 py-2 rounded shadow-lg inline-flex items-center gap-2">
      <Menu class="w-4 h-4" aria-hidden="true" />
      Menú
    </button>

    <!-- Sidebar -->
    <div
      class="fixed top-0 left-0 h-full bg-[var(--color-surface)] shadow-lg w-64 z-40 transform transition-transform duration-300 border-r border-default-soft"
      :class="{ '-translate-x-full': !open }"
    >
      <div class="p-6 border-b border-default-soft text-lg font-bold text-blue-700 ml-16 inline-flex items-center gap-2">
        <Dumbbell class="w-5 h-5" aria-hidden="true" />
        CosmoGym
      </div>

      <nav class="flex flex-col p-4 space-y-2 text-default">
        <router-link @click="toggle" to="/Menu" class="hover:text-blue-600 inline-flex items-center gap-2">
          <Home class="w-4 h-4" aria-hidden="true" />
          Inicio
        </router-link>
        <router-link @click="toggle" to="/members" class="hover:text-blue-600 inline-flex items-center gap-2">
          <Users class="w-4 h-4" aria-hidden="true" />
          Clientes
        </router-link>
        <router-link @click="toggle" to="/Membership" class="hover:text-blue-600 inline-flex items-center gap-2">
          <CalendarCheck2 class="w-4 h-4" aria-hidden="true" />
          Membresías
        </router-link>
        <router-link @click="toggle" to="/payments" class="hover:text-blue-600 inline-flex items-center gap-2">
          <CreditCard class="w-4 h-4" aria-hidden="true" />
          Pagos
        </router-link>
        <router-link @click="toggle" to="/membershipPlans" class="hover:text-blue-600 inline-flex items-center gap-2">
          <ClipboardList class="w-4 h-4" aria-hidden="true" />
          Planes
        </router-link>
        <router-link @click="toggle" to="/configuracion" class="hover:text-blue-600 inline-flex items-center gap-2">
          <Settings class="w-4 h-4" aria-hidden="true" />
          Configuración
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Menu,
  Dumbbell,
  Home,
  Users,
  CalendarCheck2,
  CreditCard,
  ClipboardList,
  Settings,
} from 'lucide-vue-next'

const open = ref(false)
const toggle = () => {
  open.value = !open.value
}
</script>

<style scoped>
/* Evita que el sidebar esté encima del contenido cuando está oculto */
.translate-x-full {
  transform: translateX(-100%);
}
</style>
