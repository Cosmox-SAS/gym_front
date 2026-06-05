import './assets/main.css'
import 'animate.css'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })


import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
