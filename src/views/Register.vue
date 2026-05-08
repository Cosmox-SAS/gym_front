<template>
  <div class="login-bg">

    <!-- Overlay gradiente luna -->
    <div class="login-overlay" />

    <!-- Tarjeta central flotante -->
    <div class="login-card" style="max-width: 460px; padding: 2.25rem 2.5rem;">

      <!-- Logo -->
      <div class="login-logo">COSMO<span>GYM</span></div>

      <!-- Badge -->
      <div class="login-badge">
        <span class="login-badge-dot" />
        Únete hoy
      </div>

      <h2 class="login-title">Crea tu cuenta</h2>
      <p class="login-subtitle">Registra tu gimnasio y empieza a gestionar</p>

      <form @submit.prevent="register" class="space-y-3.5">

        <div class="auth-field">
          <label class="login-label">Nombre completo</label>
          <div class="auth-input-wrap relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
            <input v-model="form.name" type="text" class="login-input pl-10" placeholder="Tu nombre completo" required />
          </div>
        </div>

        <div class="auth-field">
          <label class="login-label">Correo electrónico</label>
          <div class="auth-input-wrap relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
            <input v-model="form.email" type="email" class="login-input pl-10" placeholder="tu@correo.com" required />
          </div>
        </div>

        <div class="auth-field">
          <label class="login-label">Nombre del Gimnasio</label>
          <div class="auth-input-wrap relative">
            <Dumbbell class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
            <input v-model="form.gym_name" type="text" class="login-input pl-10" placeholder="Nombre de tu gimnasio" required />
          </div>
        </div>

        <div class="auth-field">
          <label class="login-label">Contraseña</label>
          <div class="auth-input-wrap relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="login-input pl-10 pr-11" placeholder="••••••••" required />
            <button type="button" class="login-eye-btn" @click="showPassword = !showPassword" tabindex="-1" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div class="auth-field">
          <label class="login-label">Confirmar contraseña</label>
          <div class="auth-input-wrap relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
            <input v-model="form.password_confirmation" :type="showPassword ? 'text' : 'password'" class="login-input pl-10" placeholder="••••••••" required />
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" :disabled="loading" class="auth-submit-btn inline-flex items-center justify-center gap-2">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" aria-hidden="true" />
            <UserPlus v-else class="w-4 h-4" aria-hidden="true" />
            <span>{{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}</span>
          </button>
        </div>
      </form>

      <p class="login-footer-text">
        ¿Ya tienes cuenta?
        <router-link to="/" class="login-footer-link">Inicia sesión</router-link>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

import { useRouter } from 'vue-router'
import api from '@/axios'
import { useAuthStore } from '@/stores/useAuthStore'
import Swal from 'sweetalert2'
import { User, Mail, Lock, Dumbbell, Eye, EyeOff, Loader2, UserPlus } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  gym_name: '',
})

const register = async () => {
  loading.value = true
  try {
    const response = await api.post('/register', form)
    auth.setToken(response.data.access_token)
    await Swal.fire({
      title: '¡Registro exitoso!',
      text: 'Tu cuenta ha sido creada correctamente.',
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#dc2626',
    })
    router.push({ name: 'Login' })
  } catch (error: any) {
    Swal.fire({
      title: 'Error en el registro',
      text: error?.response?.data?.message || 'Ocurrió un error desconocido.',
      icon: 'error',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#dc2626',
    })
  } finally {
    loading.value = false
  }
}
</script>
