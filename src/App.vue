<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

const route = useRoute()

const noLayoutRoutes = ['Login', 'register', 'PublicRegister', 'FingerprintKiosk', 'IdentificationKiosk']
const showLayout = computed(() =>
  !!route.name && !noLayoutRoutes.includes(route.name as string)
)
</script>

<template>
  <AppLayout v-if="showLayout">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>
