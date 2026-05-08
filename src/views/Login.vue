<template>
  <div class="login-bg">

    <!-- Overlay gradiente luna -->
    <div class="login-overlay" />

    <!-- Tarjeta central flotante -->
    <div class="login-card">

      <!-- Logo -->
      <div class="login-logo">COSMO<span>GYM</span></div>

      <!-- Badge -->
      <div class="login-badge">
        <span class="login-badge-dot" />
        Sistema de Gestión
      </div>

      <h2 class="login-title">Bienvenido de nuevo</h2>
      <p class="login-subtitle">Ingresa tus credenciales para continuar</p>

      <form @submit.prevent="handleLogin" class="space-y-4">

        <div class="auth-field">
          <label class="login-label">Correo electrónico</label>
          <div class="auth-input-wrap relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
            <input v-model="email" type="email" class="login-input pl-10" placeholder="tu@correo.com" required />
          </div>
        </div>

        <div class="auth-field">
          <label class="login-label">Contraseña</label>
          <div class="auth-input-wrap relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
            <input v-model="password" :type="showPassword ? 'text' : 'password'" class="login-input pl-10 pr-11" placeholder="••••••••" required />
            <button type="button" class="login-eye-btn" @click="showPassword = !showPassword" tabindex="-1" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" :disabled="loading" class="auth-submit-btn inline-flex items-center justify-center gap-2">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" aria-hidden="true" />
            <LogIn v-else class="w-4 h-4" aria-hidden="true" />
            <span>{{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}</span>
          </button>
        </div>
      </form>

      <p class="login-footer-text">
        ¿No tienes cuenta?
        <router-link to="/register" class="login-footer-link">Regístrate aquí</router-link>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import api from '@/axios'
import Swal from 'sweetalert2'
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()

const handleLogin = async () => {
  loading.value = true
  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value,
    })
    const { access_token, user } = response.data
    auth.setToken(access_token)
    auth.setUser(user)
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    router.push('/Menu')
  } catch {
    password.value = ''
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'El correo o la contraseña son incorrectos.',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: '#dc2626',
      heightAuto: false,
    })
  } finally {
    loading.value = false
  }
}
</script>
