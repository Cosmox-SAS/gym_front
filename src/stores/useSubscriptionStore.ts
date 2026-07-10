import { defineStore } from 'pinia'
import api from '@/axios'

type Subscription = Record<string, any> | null

let pendingLoad: Promise<Subscription> | null = null

function isSubscriptionActive(subscription: Subscription) {
  if (!subscription) return false

  const status = String(subscription.status ?? '').trim().toLowerCase()
  if (['inactive', 'expired', 'canceled', 'cancelled', 'vencida'].includes(status)) return false

  if (subscription.is_active === false) return false
  if (subscription.active === false) return false

  if (subscription.expired_at) {
    const expiresAt = new Date(subscription.expired_at).getTime()
    if (!Number.isNaN(expiresAt) && expiresAt < Date.now()) return false
  }

  return true
}

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscription: null as Subscription,
    loaded: false,
    loading: false,
  }),
  getters: {
    hasActiveSubscription: (state) => isSubscriptionActive(state.subscription),
  },
  actions: {
    async loadSubscription(force = false) {
      if (!force && pendingLoad) return pendingLoad

      this.loading = true
      pendingLoad = api.get('/subscription')
        .then(({ data }) => {
          this.subscription = data.subscription ?? null
          return this.subscription
        })
        .catch(() => {
          this.subscription = null
          return null
        })
        .finally(() => {
          this.loaded = true
          this.loading = false
          pendingLoad = null
        })

      return pendingLoad
    },
  },
})
