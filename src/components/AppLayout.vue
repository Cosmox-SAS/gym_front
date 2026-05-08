<template>
  <div class="layout-root">

    <!-- Overlay móvil -->
    <Transition name="sb-fade">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />
    </Transition>

    <!-- ══════════════════ SIDEBAR ══════════════════ -->
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">

      <div class="sidebar-logo">
        <span class="sidebar-logo-text font-black">COSMO<span class="text-red-500">GYM</span></span>
        <button class="lg:hidden sidebar-close-btn" @click="sidebarOpen = false" aria-label="Cerrar menú">
          <X class="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :id="navTargetId(item.to)"
          :to="item.to"
          class="sidebar-item"
          :class="{ 'sidebar-item--active': isActive(item.to) }"
          :style="{ '--accent': item.color }"
          @click="sidebarOpen = false; adminOpen = false"
        >
          <div class="sidebar-icon-wrap" aria-hidden="true">
            <component :is="item.icon" class="w-4 h-4" />
          </div>
          <span class="sidebar-item-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-admin">
        <Transition name="sb-slide">
          <div v-if="adminOpen" class="admin-dropdown">
            <!-- Toggle tema (sol/luna) -->
            <button
              class="sidebar-item theme-toggle-item w-full text-left"
              :style="{ '--accent': isDark ? '#fbbf24' : '#6366f1' }"
              @click="toggleTheme"
              :aria-label="isDark ? 'Activar modo claro' : 'Activar modo oscuro'"
            >
              <div class="sidebar-icon-wrap theme-icon-wrap" :class="{ 'is-dark': isDark }">
                <component :is="isDark ? Sun : Moon" class="w-5 h-5" aria-hidden="true" />
              </div>
              <span class="sidebar-item-label">
                {{ isDark ? 'Modo claro' : 'Modo oscuro' }}
              </span>
              <span class="theme-switch" :class="{ 'on': isDark }" aria-hidden="true">
                <span class="theme-switch-knob" />
              </span>
            </button>

            <router-link
              id="admin-settings-item"
              to="/configuracion"
              class="sidebar-item"
              :style="{ '--accent': '#94a3b8' }"
              @click="sidebarOpen = false; adminOpen = false"
            >
              <div class="sidebar-icon-wrap" aria-hidden="true">
                <Settings class="w-4 h-4" />
              </div>
              <span class="sidebar-item-label">Ajustes</span>
            </router-link>

            <button
              id="admin-logout-item"
              class="sidebar-item sidebar-item--danger w-full text-left"
              @click="confirmLogout"
            >
              <div class="sidebar-icon-wrap" aria-hidden="true">
                <LogOut class="w-4 h-4" />
              </div>
              <span class="sidebar-item-label text-red-400">Salir</span>
            </button>
          </div>
        </Transition>

        <button class="admin-btn" @click="adminOpen = !adminOpen">
          <div class="admin-avatar">{{ userInitial }}</div>
          <div class="admin-info">
            <p class="admin-role">Administrador</p>
            <p class="admin-name">{{ userName }}</p>
          </div>
          <ChevronDown class="admin-chevron" :class="{ 'rotate-180': adminOpen }" aria-hidden="true" />
        </button>
      </div>
    </aside>

    <!-- ══════════════════ MAIN ══════════════════ -->
    <div class="layout-main">

      <!-- ── Topbar (solo móvil) ── -->
      <div class="app-topbar lg:hidden">
        <!-- Hamburger solo en móvil -->
        <button class="lg:hidden topbar-ham" @click="sidebarOpen = true" aria-label="Abrir menú">
          <Menu class="w-5 h-5" aria-hidden="true" />
        </button>

        <!-- Logo solo en móvil -->
        <span class="lg:hidden topbar-logo">COSMO<span class="text-red-500">GYM</span></span>

        <!-- Spacer -->
        <div class="flex-1" />
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useTheme } from '@/composables/useTheme'
import Swal from 'sweetalert2'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  CreditCard,
  Boxes,
  ClipboardList,
  BadgeDollarSign,
  Package,
  BarChart3,
  DoorOpen,
  Store,
  CalendarCheck2,
  Sun,
  Moon,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-vue-next'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const { isDark, toggleTheme } = useTheme()

const sidebarOpen = ref(false)
const adminOpen   = ref(false)

const user        = auth.user
const userName    = computed(() => user?.name || 'Usuario')
const userInitial = computed(() => (user?.name || 'A').charAt(0).toUpperCase())

const navTargetId = (to: string) =>
  `sb-item-${to.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

const isActive = (to: string) =>
  route.path.toLowerCase() === to.toLowerCase()

const navItems = [
  { to: '/menu',            label: 'Dashboard',      color: '#6366f1', icon: LayoutDashboard },
  { to: '/pos',             label: 'Punto de Venta', color: '#a78bfa', icon: ShoppingCart },
  { to: '/members',         label: 'Clientes',       color: '#34d399', icon: Users },
  { to: '/Payments',        label: 'Pagos',          color: '#fbbf24', icon: CreditCard },
  { to: '/Products',        label: 'Inventario',     color: '#60a5fa', icon: Boxes },
  { to: '/membershipPlans', label: 'Planes',         color: '#c084fc', icon: ClipboardList },
  { to: '/Membership',      label: 'Membresías',     color: '#38bdf8', icon: CalendarCheck2 },
  { to: '/CashBox',         label: 'Caja',           color: '#2dd4bf', icon: BadgeDollarSign },
  { to: '/statistics',      label: 'Estadísticas',   color: '#fb923c', icon: BarChart3 },
  { to: '/access-logs',     label: 'Ingresos',       color: '#818cf8', icon: DoorOpen },
  { to: '/kiosko',          label: 'Kiosco',         color: '#4ade80', icon: Store },
  { to: '/subscription',    label: 'Suscripción',    color: '#34d399', icon: Package },
]

const confirmLogout = async () => {
  adminOpen.value   = false
  sidebarOpen.value = false
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Deseas salir del sistema?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#374151',
    heightAuto: false,
  })
  if (result.isConfirmed) {
    auth.logout()
    router.push('/')
  }
}
</script>
