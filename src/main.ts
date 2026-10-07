import './assets/main.css'
import 'animate.css'
import { registerSW } from 'virtual:pwa-register'

const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
const canUsePwa = window.isSecureContext || isLocalhost

if (canUsePwa) {
  registerSW({ immediate: true })
} else if (import.meta.env.PROD) {
  console.warn('CosmoGym PWA requiere HTTPS para poder instalarse.')
}


import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
