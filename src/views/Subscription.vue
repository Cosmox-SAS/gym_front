<template>
  <div class="page-layout">
    <div class="max-w-3xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-default tracking-tight">Suscripción</h1>
          <p class="text-sm text-subtle mt-0.5">Gestiona tu plan y funcionalidades</p>
        </div>
        <router-link to="/Menu" class="btn btn-dark inline-flex items-center justify-center gap-2">
          <Home class="w-4 h-4" aria-hidden="true" />
          <span>Inicio</span>
        </router-link>
      </div>

      <div v-if="loading" class="text-center py-16">
        <p class="text-blue-600 font-bold animate-pulse flex items-center justify-center gap-2">
          <Loader2 class="w-5 h-5 animate-spin" aria-hidden="true" />
          Cargando suscripción...
        </p>
      </div>

      <div v-else class="space-y-6">

        <!-- Sin suscripción -->
        <div v-if="!subscription" class="bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl p-6 text-center">
          <AlertCircle class="w-10 h-10 mx-auto mb-2 text-amber-600" aria-hidden="true" />
          <p class="text-amber-700 font-semibold text-lg mb-1">No tienes una suscripción activa</p>
          <p class="text-amber-600 text-sm">Elige un plan para comenzar.</p>
        </div>

        <!-- Suscripción activa -->
        <div v-else class="bg-[var(--color-surface)] rounded-2xl shadow-xl p-6 border border-default-soft">
          <div class="flex items-start justify-between mb-4">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-subtle">Plan actual</span>
              <h2 class="text-3xl font-black text-default capitalize mt-1">{{ subscription.plan?.name }}</h2>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              :class="statusBadge"
            >{{ statusLabel }}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
            <div class="bg-[var(--color-surface-soft)] rounded-xl p-4 border border-default-soft">
              <p class="text-xs text-subtle font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                <Calendar class="w-3 h-3" aria-hidden="true" />
                Inicio
              </p>
              <p class="text-sm font-bold text-default">{{ formatDate(subscription.started_at) }}</p>
            </div>
            <div class="bg-[var(--color-surface-soft)] rounded-xl p-4 border border-default-soft">
              <p class="text-xs text-subtle font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                <CalendarX class="w-3 h-3" aria-hidden="true" />
                Vence
              </p>
              <p class="text-sm font-bold text-default">{{ formatDate(subscription.expired_at) }}</p>
            </div>
            <div class="bg-[var(--color-surface-soft)] rounded-xl p-4 border border-default-soft">
              <p class="text-xs text-subtle font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                <Clock class="w-3 h-3" aria-hidden="true" />
                Días restantes
              </p>
              <p class="text-sm font-bold" :class="daysLeft <= 5 ? 'text-red-600' : 'text-emerald-600'">
                {{ daysLeft >= 0 ? daysLeft : 0 }} días
              </p>
            </div>
          </div>

          <!-- Features -->
          <div class="border-t pt-4">
            <p class="text-xs font-bold uppercase tracking-widest text-subtle mb-3">Funcionalidades incluidas</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="feature in subscription.plan?.features"
                :key="feature.id"
                class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold inline-flex items-center gap-1"
              >
                <Check class="w-3 h-3" aria-hidden="true" />
                {{ featureLabel(feature) }}
              </span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
            <button
              @click="showPlans = true"
              :disabled="isPlanActivationBlocked"
              class="btn btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw class="w-4 h-4" aria-hidden="true" />
              <span>{{ isPlanActivationBlocked ? 'Planes bloqueados' : 'Cambiar plan' }}</span>
            </button>
            <button
              v-if="!subscription.canceled_at"
              @click="confirmCancel"
              class="btn flex-1 border border-red-300 text-red-600 hover:bg-red-50 bg-[var(--color-surface)] inline-flex items-center justify-center gap-2"
            >
              <X class="w-4 h-4" aria-hidden="true" />
              <span>Cancelar suscripción</span>
            </button>
            <div v-else class="flex-1 text-center text-sm text-subtle self-center">
              Cancelada — acceso hasta vencimiento
            </div>
          </div>
        </div>

        <!-- Planes disponibles -->
        <div v-if="plansVisible">
          <div v-if="isSubscriptionExpired" class="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p class="font-bold mb-2">Tu suscripción está vencida. Debes realizar el pago para reactivar el acceso.</p>
            <p class="mb-3">Escanea este QR y comunícate con soporte para validar el pago.</p>
            <img
              :src="paymentQr"
              alt="QR de pago"
              class="mx-auto w-full max-w-[220px] rounded-xl border border-red-100 shadow-lg"
            />
          </div>

          <div v-else-if="isPlanActivationBlocked" class="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Tu suscripción no está activa. No puedes activar ningún plan.
          </div>

          <h3 class="text-lg font-bold text-default mb-4">
            {{ subscription && !isSubscriptionInactive ? 'Cambiar a otro plan' : 'Elige un plan' }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="bg-[var(--color-surface)] rounded-2xl shadow border-2 p-5 flex flex-col gap-4 transition"
              :class="isCurrentPlan(plan) || isPlanActivationBlocked
                ? 'border-slate-300 opacity-60 cursor-not-allowed bg-slate-50'
                : 'border-transparent hover:border-blue-300 cursor-pointer'"
              :aria-disabled="isCurrentPlan(plan) || isPlanActivationBlocked"
              @click="handlePlanCardClick(plan)"
            >
              <div>
                <p class="text-xs font-bold uppercase tracking-widest text-subtle mb-1">Plan</p>
                <h4 class="text-xl font-black text-default capitalize">{{ plan.name }}</h4>
                <p class="text-2xl font-black text-blue-600 mt-1">
                  {{ formatPrice(plan.price) }}
                  <span class="text-xs font-semibold text-subtle">/ {{ plan.periodicity_type === 'year' ? 'año' : 'mes' }}</span>
                </p>
              </div>

              <ul class="space-y-1.5 flex-1">
                <li
                  v-for="feature in plan.features"
                  :key="feature.id"
                  class="text-xs text-muted flex items-start gap-1.5"
                >
                  <Check class="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                  <span>{{ featureLabel(feature) }}</span>
                </li>
              </ul>

              <button
                v-if="!isCurrentPlan(plan)"
                @click.stop="selectPlan(plan)"
                :disabled="saving || isPlanActivationBlocked"
                class="btn btn-primary text-sm py-2 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Package class="w-4 h-4" aria-hidden="true" />
                <span>{{ planButtonLabel }}</span>
              </button>
              <div v-else class="text-center text-xs font-bold text-slate-500 py-2 flex items-center justify-center gap-1">
                <CheckCircle2 class="w-4 h-4" aria-hidden="true" />
                {{ isSubscriptionInactive ? 'Plan anterior no disponible' : 'Plan actual' }}
              </div>
            </div>
          </div>

          <button v-if="showPlans && !isSubscriptionInactive" @click="showPlans = false" class="mt-4 text-sm text-slate-400 hover:text-slate-600">
            Cancelar
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/axios'
import { useSubscriptionStore } from '@/stores/useSubscriptionStore'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import { SWAL_COLORS } from '@/lib/colors'
import { expiredSubscriptionModalClass, expiredSubscriptionModalWidth, expiredSubscriptionPaymentHtml } from '@/lib/subscriptionPaymentModal'
import paymentQr from '@/assets/images/QR_pagos.jpeg'
import {
  Home,
  Loader2,
  AlertCircle,
  Calendar,
  CalendarX,
  Clock,
  Check,
  CheckCircle2,
  RefreshCw,
  X,
  Package,
} from 'lucide-vue-next'

const loading  = ref(true)
const saving   = ref(false)
const showPlans = ref(false)
const paymentModalOpen = ref(false)

const subscription = ref<any>(null)
const plans        = ref<any[]>([])
const subscriptionStore = useSubscriptionStore()

const featureNames: Record<string, string> = {
  'members':           'Miembros',
  'fingerprint-access':'Acceso biométrico',
  'supplement-pos':    'Módulo POS',
  'email-alerts':      'Alertas por correo',
}

function featureLabel(feature: any) {
  const base = featureNames[feature.name] ?? feature.name
  if (feature.pivot?.charges && Number(feature.pivot.charges) < 999000) {
    return `${base} (hasta ${feature.pivot.charges})`
  }
  return base
}

function formatDate(date: string | null) {
  return date ? dayjs(date).format('DD/MM/YYYY') : '—'
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price)
}

const daysLeft = computed(() => {
  if (
    subscription.value?.days_left !== null &&
    subscription.value?.days_left !== undefined &&
    subscription.value?.days_left !== ''
  ) {
    const value = Number(subscription.value.days_left)
    if (Number.isFinite(value)) return Math.ceil(value)
  }

  if (!subscription.value?.expired_at) return 0
  return Math.ceil(dayjs(subscription.value.expired_at).diff(dayjs(), 'day', true))
})

const statusBadge = computed(() => {
  if (!subscription.value) return ''
  if (subscription.value.canceled_at || isSubscriptionInactive.value) return 'bg-red-100 text-red-700'
  if (daysLeft.value <= 5) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
})

const statusLabel = computed(() => {
  if (!subscription.value) return ''
  if (subscription.value.canceled_at) return 'Cancelada'
  if (isSubscriptionInactive.value) return 'Vencida'
  if (daysLeft.value <= 5) return 'Por vencer'
  return 'Activa'
})

const isSubscriptionInactive = computed(() => {
  if (!subscription.value) return false
  const status = String(subscription.value.status ?? '').trim().toLowerCase()
  return Boolean(subscription.value.canceled_at)
    || subscription.value.is_active === false
    || subscription.value.active === false
    || daysLeft.value < 0
    || ['expired', 'canceled', 'cancelled', 'inactive', 'vencida'].includes(status)
})

const isSubscriptionExpired = computed(() => {
  if (!subscription.value) return false
  const status = String(subscription.value.status ?? '').trim().toLowerCase()
  if (status === 'expired' || status === 'vencida') return true
  if (!subscription.value.expired_at) return false
  return dayjs(subscription.value.expired_at).isBefore(dayjs())
})

const plansVisible = computed(() => !subscription.value || showPlans.value || isSubscriptionInactive.value)

const isPlanActivationBlocked = computed(() => Boolean(subscription.value && isSubscriptionInactive.value))

const planButtonLabel = computed(() => {
  if (isPlanActivationBlocked.value) return 'No disponible'
  return subscription.value ? 'Cambiar a este' : 'Activar este plan'
})

function isCurrentPlan(plan: any) {
  return subscription.value?.plan?.id === plan.id
}

function handlePlanCardClick(plan: any) {
  if (isCurrentPlan(plan) || saving.value || isPlanActivationBlocked.value) return
  selectPlan(plan)
}

async function showExpiredSubscriptionPaymentModal() {
  if (!isSubscriptionExpired.value || paymentModalOpen.value) return

  paymentModalOpen.value = true
  await Swal.fire({
    icon: 'warning',
    title: 'Suscripción vencida',
    html: expiredSubscriptionPaymentHtml(),
    confirmButtonText: 'Entendido',
    heightAuto: false,
    width: expiredSubscriptionModalWidth,
    customClass: {
      popup: expiredSubscriptionModalClass,
    },
  })
  paymentModalOpen.value = false
}

async function load() {
  const [subRes, plansRes] = await Promise.all([
    api.get('/subscription').catch(() => ({ data: { subscription: null } })),
    api.get('/subscription-plans'),
  ])
  subscription.value = subRes.data.subscription
  subscriptionStore.subscription = subscription.value
  subscriptionStore.loaded = true
  plans.value        = plansRes.data
}

async function selectPlan(plan: any) {
  if (isPlanActivationBlocked.value) {
    Swal.fire('Suscripción vencida', 'No puedes activar ningún plan.', 'warning')
    return
  }

  saving.value = true
  try {
    if (subscription.value) {
      await api.put('/subscription/switch', { plan_id: plan.id })
    } else {
      await api.post('/subscription', { plan_id: plan.id })
    }
    await load()
    showPlans.value = false
    Swal.fire({ icon: 'success', title: '¡Listo!', text: `Plan ${plan.name} activado.`, timer: 2000, showConfirmButton: false })
  } catch (e: any) {
    Swal.fire('Error', e.response?.data?.error ?? 'No se pudo cambiar el plan.', 'error')
  } finally {
    saving.value = false
  }
}

async function confirmCancel() {
  const result = await Swal.fire({
    title: '¿Cancelar suscripción?',
    text: 'Seguirás teniendo acceso hasta que venza el plan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: SWAL_COLORS.danger,
    cancelButtonText: 'No',
    confirmButtonText: 'Sí, cancelar',
  })
  if (!result.isConfirmed) return

  try {
    await api.delete('/subscription')
    await load()
    Swal.fire({ icon: 'info', title: 'Cancelada', text: 'Tu acceso se mantiene hasta el vencimiento.', timer: 2500, showConfirmButton: false })
  } catch (e: any) {
    Swal.fire('Error', e.response?.data?.error ?? 'No se pudo cancelar.', 'error')
  }
}

onMounted(async () => {
  try {
    await load()
    await showExpiredSubscriptionPaymentModal()
  } finally {
    loading.value = false
  }
})
</script>
