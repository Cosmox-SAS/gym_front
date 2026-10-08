<template>
  <div class="landing">
    <!-- Encabezado -->
    <header class="lp-nav">
      <div class="lp-wrap lp-nav-inner">
        <router-link to="/" class="lp-logo" aria-label="CosmoGym inicio">COSMO<span>GYM</span></router-link>
        <nav class="lp-nav-links" aria-label="Secciones">
          <a href="#demo">Cómo funciona</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#ingreso">Control de ingreso</a>
        </nav>
        <router-link v-if="isAuthenticated" to="/menu" class="lp-btn lp-btn-dark">Ir al panel</router-link>
        <router-link v-else to="/login" class="lp-btn lp-btn-dark">Iniciar sesión</router-link>
      </div>
    </header>

    <!-- Hero -->
    <section class="lp-wrap lp-hero">
      <p class="lp-eyebrow">Software para gimnasios</p>
      <h1>Sabe quién entrena, hasta cuándo y quién <em>debe</em>.</h1>
      <p class="lp-lede">
        CosmoGym controla las membresías, los ingresos y los cobros de tu gimnasio en un solo lugar.
        Mira cómo funciona en menos de dos minutos.
      </p>
      <div class="lp-states" aria-label="Estados de membresía">
        <span class="lp-pill is-ok">Activo</span>
        <span class="lp-pill is-soon">Vence pronto</span>
        <span class="lp-pill is-late">Vencido</span>
        <span class="lp-pill is-due">Por pagar</span>
      </div>
    </section>

    <!-- Demostración animada -->
    <section id="demo" ref="demoEl" class="lp-wrap lp-demo" aria-label="Demostración de la plataforma">
      <div class="lp-stage">
        <div class="lp-chrome" aria-hidden="true">
          <i /><i /><i />
          <span class="lp-url">cosmogym.tech/{{ currentUrl }}</span>
        </div>

        <div class="lp-screen" @click="togglePlay">
          <img
            v-for="name in imageNames"
            :key="name"
            :src="`/landing/${name}.jpg`"
            :alt="name === currentImg ? scenes[sceneIdx].title : ''"
            :class="{ 'is-on': name === currentImg }"
            decoding="async"
          >

          <!-- Recuadro que resalta lo importante de la pantalla -->
          <div
            v-if="box"
            class="lp-box"
            :style="{ left: box.x + '%', top: box.y + '%', width: box.w + '%', height: box.h + '%' }"
          >
            <span class="lp-box-label" :class="{ 'is-below': box.y < 14 }">{{ box.label }}</span>
          </div>

          <!-- Cursor animado -->
          <div
            class="lp-cursor"
            :class="{ 'is-hidden': !cursor.visible, 'is-pressing': cursor.pressing, 'is-fast': cursor.fast }"
            :style="{ left: cursor.x + '%', top: cursor.y + '%' }"
            aria-hidden="true"
          >
            <span v-if="cursor.ripple" :key="cursor.ripple" class="lp-ripple" />
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path d="M5 3l14 7.5-6.2 1.6L9.6 18.5z" fill="#0f172a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" />
            </svg>
          </div>

          <button v-if="!playing" class="lp-play-overlay" type="button" aria-label="Reproducir demostración">
            <Play class="w-7 h-7" aria-hidden="true" />
          </button>
        </div>

        <div class="lp-chapters" role="group" aria-label="Escenas de la demostración">
          <button
            v-for="(s, i) in scenes"
            :key="s.title"
            type="button"
            class="lp-seg"
            :class="{ 'is-done': i < sceneIdx, 'is-current': i === sceneIdx }"
            :aria-label="`${i + 1}. ${s.title}`"
            :aria-current="i === sceneIdx ? 'step' : undefined"
            @click="goTo(i)"
          >
            <b :style="i === sceneIdx ? { width: sceneProgress * 100 + '%' } : undefined" />
          </button>
        </div>
      </div>

      <div class="lp-caption" aria-live="polite">
        <div class="lp-caption-text">
          <p class="lp-caption-meta">
            <span>{{ scenes[sceneIdx].chapter }}</span>
            <span class="lp-count">{{ String(sceneIdx + 1).padStart(2, '0') }} / {{ scenes.length }}</span>
          </p>
          <h2>{{ scenes[sceneIdx].title }}</h2>
          <p class="lp-benefit">
            <BadgeCheck class="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{{ scenes[sceneIdx].benefit }}</span>
          </p>
        </div>
        <div class="lp-controls">
          <button type="button" class="lp-ctrl" aria-label="Escena anterior" @click="goTo(sceneIdx - 1)">
            <ChevronLeft class="w-5 h-5" aria-hidden="true" />
          </button>
          <button type="button" class="lp-ctrl lp-ctrl-play" :aria-pressed="playing" @click="togglePlay">
            <component :is="playing ? Pause : Play" class="w-4 h-4" aria-hidden="true" />
            {{ playing ? 'Pausar' : 'Reproducir' }}
          </button>
          <button type="button" class="lp-ctrl" aria-label="Escena siguiente" @click="goTo(sceneIdx + 1)">
            <ChevronRight class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p class="lp-note">Pantallas reales de la plataforma con datos de demostración. Los nombres y cifras son ficticios.</p>
    </section>

    <!-- Beneficios -->
    <section id="beneficios" class="lp-section">
      <div class="lp-wrap">
        <div class="lp-head">
          <p class="lp-eyebrow">Lo que ganas</p>
          <h2>Menos tiempo persiguiendo pagos, más tiempo para tus miembros</h2>
        </div>
        <div class="lp-benefits">
          <article v-for="b in benefits" :key="b.title" class="lp-benefit-card">
            <span class="lp-benefit-icon" :style="{ color: b.color }">
              <component :is="b.icon" class="w-5 h-5" aria-hidden="true" />
            </span>
            <h3>{{ b.title }}</h3>
            <p>{{ b.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Ciclo de una membresía -->
    <section class="lp-section">
      <div class="lp-wrap">
        <div class="lp-head">
          <p class="lp-eyebrow">Plazos de pago</p>
          <h2>El sistema sigue cada membresía por ti</h2>
          <p>Todos los días revisa las fechas y cambia el estado de cada miembro. Nadie tiene que acordarse.</p>
        </div>
        <div class="lp-cycle-scroll">
          <ol class="lp-cycle">
            <li v-for="c in cycle" :key="c.what" :style="{ '--c': c.color }">
              <span class="lp-cycle-dot" />
              <span class="lp-cycle-day">{{ c.day }}</span>
              <strong>{{ c.what }}</strong>
              <span class="lp-cycle-how">{{ c.how }}</span>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- Control de ingreso -->
    <section id="ingreso" class="lp-section">
      <div class="lp-wrap">
        <div class="lp-head">
          <p class="lp-eyebrow">Control de ingreso</p>
          <h2>Entra quien está al día, con cédula o con huella</h2>
          <p>Una pantalla en la recepción verifica la membresía en segundos y registra cada ingreso con fecha y hora.</p>
        </div>
        <div class="lp-access">
          <article class="lp-access-card">
            <div class="lp-access-art">
              <img src="/landing/k1-ok.jpg" alt="Kiosco de ingreso mostrando acceso permitido" loading="lazy">
            </div>
            <div class="lp-access-body">
              <h3><IdCard class="w-5 h-5" aria-hidden="true" /> Con número de cédula</h3>
              <p>El miembro digita su cédula. El sistema lo saluda por su nombre, le dice cuántos días de plan le quedan y registra el ingreso. Funciona en cualquier computador o tablet.</p>
            </div>
          </article>
          <article class="lp-access-card">
            <div class="lp-access-art lp-access-art-icon" aria-hidden="true">
              <Fingerprint class="lp-fp" />
            </div>
            <div class="lp-access-body">
              <h3><Fingerprint class="w-5 h-5" aria-hidden="true" /> Con huella dactilar</h3>
              <p>Con un lector biométrico, el miembro pone el dedo y entra. No necesita recordar nada y nadie puede prestar su acceso a otra persona.</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Cierre -->
    <section class="lp-section">
      <div class="lp-wrap">
        <div class="lp-cta">
          <h2>Pon tu gimnasio en orden desde esta semana</h2>
          <p>Funciona desde el navegador, sin instalar nada. Configuras tus planes, cargas tus miembros y empiezas a cobrar a tiempo.</p>
          <div class="lp-cta-actions">
            <router-link to="/register" class="lp-btn lp-btn-brand">Crear cuenta</router-link>
            <router-link :to="isAuthenticated ? '/menu' : '/login'" class="lp-btn lp-btn-ghost">
              {{ isAuthenticated ? 'Ir al panel' : 'Ya tengo cuenta' }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <footer class="lp-wrap lp-foot">CosmoGym · Cosmox S.A.S.</footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  BadgeCheck, BellRing, ChevronLeft, ChevronRight, ClipboardList, DoorOpen,
  Fingerprint, HandCoins, IdCard, Pause, Play, Timer, Wallet,
} from 'lucide-vue-next'

// ---------------------------------------------------------------------------
// Escenas de la demostración. Las coordenadas (x, y) están en % de la pantalla
// y salen de la posición real de cada botón en las capturas de /public/landing.
// ---------------------------------------------------------------------------
type Box = { x: number; y: number; w: number; h: number; label: string }
type Step =
  | { img: string; url?: string }
  | { move: [number, number] }
  | { click: true }
  | { type: [number, number][] }
  | { wait: number }
  | { box: Box | null }
  | { cursor: boolean }

interface Scene {
  chapter: string
  title: string
  benefit: string
  steps: Step[]
}

const KEYS: Record<string, [number, number]> = {
  '0': [73.68, 70], '1': [65.39, 48.67], '2': [73.68, 48.67], '3': [81.97, 48.67],
  '4': [65.39, 55.78], '5': [73.68, 55.78], '6': [81.97, 55.78],
  '7': [65.39, 62.89], '8': [73.68, 62.89], '9': [81.97, 62.89],
}
const INGRESAR: [number, number] = [73.68, 77.22]
const digits = (cedula: string) => cedula.split('').map((d) => KEYS[d])

const kioskScene = (cedula: string, name: string, title: string, benefit: string, box: Box): Scene => ({
  chapter: 'Control de ingreso',
  title,
  benefit,
  steps: [
    { box: null },
    { img: 'k0-vacio', url: 'kiosko-cedula' },
    { cursor: true },
    { move: [70, 40] },
    { wait: 500 },
    { type: digits(cedula) },
    { img: `${name}-digitado` },
    { wait: 400 },
    { move: INGRESAR },
    { click: true },
    { img: name },
    { cursor: false },
    { box },
    { wait: 3800 },
  ],
})

const scenes: Scene[] = [
  {
    chapter: 'Recepción',
    title: 'Todo tu gimnasio en una pantalla',
    benefit: 'Apenas abres el sistema sabes cuántos miembros están activos, vencidos, por pagar y por vencer.',
    steps: [
      { box: null },
      { img: '01-panel', url: 'menu' },
      { cursor: false },
      { wait: 700 },
      { box: { x: 20.6, y: 24.2, w: 76.8, h: 20.6, label: 'Estado de tus miembros hoy' } },
      { wait: 3200 },
      { box: null },
      { cursor: true },
      { move: [8.99, 22.89] },
      { click: true },
      { img: '02-clientes', url: 'members' },
      { wait: 900 },
    ],
  },
  {
    chapter: 'Recepción',
    title: 'Cuánto le queda a cada miembro',
    benefit: 'Ves el plan, la fecha de inicio, la de fin y los días de entrenamiento que le quedan a cada persona.',
    steps: [
      { box: null },
      { img: '02-clientes', url: 'members' },
      { cursor: true },
      { move: [41.67, 33.69] },
      { click: true },
      { img: '03-tarjeta' },
      { move: [52, 52] },
      { box: { x: 20.8, y: 58.6, w: 24, h: 19.8, label: 'Días restantes' } },
      { wait: 3400 },
    ],
  },
  {
    chapter: 'Cobros',
    title: 'A quién cobrarle, en un clic',
    benefit: 'Un filtro te muestra solo a quienes deben. No tienes que revisar cuadernos ni hojas de cálculo.',
    steps: [
      { box: null },
      { img: '03-tarjeta', url: 'members' },
      { cursor: true },
      { move: [34.13, 15.33] },
      { click: true },
      { img: '04-porpagar' },
      { wait: 2400 },
    ],
  },
  {
    chapter: 'Cobros',
    title: 'Cobras en segundos',
    benefit: 'El saldo pendiente aparece solo. Eliges efectivo, transferencia, Nequi, Daviplata o tarjeta y confirmas. También recibes abonos.',
    steps: [
      { box: null },
      { img: '04-porpagar', url: 'members' },
      { cursor: true },
      { move: [67.87, 36.35] },
      { click: true },
      { img: '05-porpagar-abierta' },
      { wait: 700 },
      { move: [58.71, 94.53] },
      { click: true },
      { img: '06-cobro' },
      { move: [70, 62] },
      { box: { x: 35.8, y: 40.6, w: 28.6, h: 10.2, label: 'Saldo pendiente' } },
      { wait: 3400 },
    ],
  },
  kioskScene(
    '712037872', 'k1-ok',
    'El miembro entra con su cédula',
    'Lo saluda por su nombre y le dice cuántos días le quedan. Él también lleva la cuenta de su plan.',
    { x: 63.6, y: 42.8, w: 20.2, h: 11.2, label: 'Días que le quedan' },
  ),
  kioskScene(
    '985928846', 'k2-aviso',
    'Aviso antes de vencer',
    'Si su plan vence mañana, se lo recuerda al entrar. Además le llega un recordatorio por WhatsApp y correo.',
    { x: 63.6, y: 42.8, w: 20.2, h: 11.2, label: 'Le queda 1 día' },
  ),
  kioskScene(
    '438536114', 'k3-vencida',
    'Si no ha pagado, no entra',
    'El kiosco no da acceso a quien tiene la membresía vencida y lo envía a recepción a renovar.',
    { x: 63.6, y: 42.8, w: 20.2, h: 11.2, label: 'Acceso bloqueado' },
  ),
  {
    chapter: 'Control de ingreso',
    title: 'Quién vino a entrenar y a qué hora',
    benefit: 'Cada ingreso queda registrado con fecha, hora, método y si fue permitido o denegado.',
    steps: [
      { box: null },
      { cursor: false },
      { img: '13-ingresos', url: 'access-logs' },
      { wait: 700 },
      { box: { x: 77.6, y: 25.4, w: 15.4, h: 35, label: 'Fecha y hora' } },
      { wait: 3400 },
    ],
  },
  {
    chapter: 'Cobros',
    title: 'Te anticipas a los vencimientos',
    benefit: 'Ves quién vence en los próximos 3 días para cobrarle antes de que deje de venir.',
    steps: [
      { box: null },
      { img: '07-membresias', url: 'Membership' },
      { cursor: true },
      { move: [43.03, 17.67] },
      { click: true },
      { img: '08-vencen' },
      { move: [60, 70] },
      { box: { x: 22.4, y: 32.6, w: 73.2, h: 24.6, label: 'Vencen en 3 días o menos' } },
      { wait: 3000 },
    ],
  },
  {
    chapter: 'Administración',
    title: 'Cuánto recaudaste y por qué medio',
    benefit: 'Consultas los pagos de cualquier rango de fechas, con cliente, monto, medio de pago y hora.',
    steps: [
      { box: null },
      { img: '08-vencen', url: 'Membership' },
      { cursor: true },
      { move: [8.99, 28.44] },
      { click: true },
      { img: '09-pagos-rango', url: 'Payments' },
      { wait: 500 },
      { move: [52.63, 22.56] },
      { click: true },
      { img: '10-pagos' },
      { move: [75, 55] },
      { box: { x: 81.8, y: 30.6, w: 13, h: 6.2, label: 'Total recaudado' } },
      { wait: 3000 },
    ],
  },
  {
    chapter: 'Administración',
    title: 'Caja cuadrada todos los días',
    benefit: 'Apertura, ingresos, gastos y cierre del día, con el historial de cierres anteriores.',
    steps: [
      { box: null },
      { img: '10-pagos', url: 'Payments' },
      { cursor: true },
      { move: [8.99, 50.67] },
      { click: true },
      { img: '11-caja', url: 'CashBox' },
      { move: [55, 60] },
      { box: { x: 23.4, y: 20.8, w: 71.4, h: 9, label: 'Resumen del día' } },
      { wait: 3000 },
    ],
  },
  {
    chapter: 'Administración',
    title: 'Decisiones con números',
    benefit: 'Ingresos de la semana, distribución de clientes y productos más vendidos, sin armar reportes.',
    steps: [
      { box: null },
      { img: '11-caja', url: 'CashBox' },
      { cursor: true },
      { move: [8.99, 56.22] },
      { click: true },
      { img: '12-estadisticas', url: 'statistics' },
      { move: [60, 70] },
      { cursor: false },
      { wait: 3600 },
    ],
  },
]

const imageNames = Array.from(
  new Set(scenes.flatMap((s) => s.steps.flatMap((st) => ('img' in st ? [st.img] : [])))),
)

// ---------------------------------------------------------------------------
// Reproductor
// ---------------------------------------------------------------------------
const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const sceneIdx = ref(0)
const sceneProgress = ref(0)
const playing = ref(false)
const currentImg = ref(imageNames[0])
const currentUrl = ref('menu')
const box = ref<Box | null>(null)
const cursor = reactive({ x: 50, y: 60, visible: false, pressing: false, fast: false, ripple: 0 })

const MOVE_MS = 900
const FAST_MS = 200
let runId = 0

class Cancelled extends Error {}

// Espera que se detiene mientras la demo está en pausa y se cancela al cambiar de escena.
function wait(ms: number, id: number) {
  return new Promise<void>((resolve, reject) => {
    let left = ms
    let last = performance.now()
    const tick = (now: number) => {
      if (id !== runId) return reject(new Cancelled())
      if (playing.value) left -= now - last
      last = now
      if (left <= 0) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

const stepDuration = (st: Step) => {
  if ('move' in st) return MOVE_MS
  if ('click' in st) return 420
  if ('type' in st) return st.type.length * (FAST_MS + 140)
  if ('wait' in st) return st.wait
  if ('img' in st) return 350
  return 0
}

async function click(id: number) {
  cursor.pressing = true
  cursor.ripple++
  await wait(160, id)
  cursor.pressing = false
  await wait(260, id)
}

async function runStep(st: Step, id: number) {
  if ('img' in st) {
    currentImg.value = st.img
    if (st.url) currentUrl.value = st.url
    await wait(350, id)
  } else if ('move' in st) {
    cursor.fast = false
    cursor.x = st.move[0]
    cursor.y = st.move[1]
    await wait(MOVE_MS, id)
  } else if ('click' in st) {
    await click(id)
  } else if ('type' in st) {
    cursor.fast = true
    for (const [x, y] of st.type) {
      cursor.x = x
      cursor.y = y
      await wait(FAST_MS, id)
      cursor.pressing = true
      cursor.ripple++
      await wait(90, id)
      cursor.pressing = false
      await wait(50, id)
    }
    cursor.fast = false
  } else if ('wait' in st) {
    await wait(st.wait, id)
  } else if ('box' in st) {
    box.value = st.box
  } else if ('cursor' in st) {
    cursor.visible = st.cursor
  }
}

// Muestra el estado final de una escena sin animación (movimiento reducido o al saltar).
function showFinal(i: number) {
  const steps = scenes[i].steps
  for (const st of steps) {
    if ('img' in st) {
      currentImg.value = st.img
      if (st.url) currentUrl.value = st.url
    }
    if ('box' in st) box.value = st.box
  }
  cursor.visible = false
  sceneProgress.value = 1
}

async function playFrom(i: number) {
  const id = ++runId
  try {
    for (let s = i; ; s = (s + 1) % scenes.length) {
      sceneIdx.value = s
      sceneProgress.value = 0
      const steps = scenes[s].steps
      const total = steps.reduce((acc, st) => acc + stepDuration(st), 0)
      let done = 0
      for (const st of steps) {
        await runStep(st, id)
        done += stepDuration(st)
        sceneProgress.value = Math.min(1, done / total)
      }
    }
  } catch (e) {
    if (!(e instanceof Cancelled)) throw e
  }
}

function goTo(i: number) {
  const n = (i + scenes.length) % scenes.length
  if (reduceMotion) {
    runId++
    sceneIdx.value = n
    showFinal(n)
    return
  }
  playing.value = true
  playFrom(n)
}

function togglePlay() {
  if (reduceMotion) return goTo(sceneIdx.value + 1)
  playing.value = !playing.value
}

// Arranca cuando la demo aparece en pantalla
const demoEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (reduceMotion) {
    showFinal(0)
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        observer?.disconnect()
        playing.value = true
        playFrom(0)
      }
    },
    { threshold: 0.35 },
  )
  if (demoEl.value) observer.observe(demoEl.value)
})

onBeforeUnmount(() => {
  runId++
  observer?.disconnect()
})

const isAuthenticated = computed(() => !!localStorage.getItem('token'))

// ---------------------------------------------------------------------------
// Contenido
// ---------------------------------------------------------------------------
const benefits = [
  { icon: HandCoins, color: '#d97706', title: 'Cobras a tiempo', text: 'Sabes quién debe, cuánto y desde cuándo. Recibes pagos completos o abonos y el saldo se actualiza solo.' },
  { icon: Timer, color: '#2563eb', title: 'Controlas el tiempo de cada plan', text: 'Planes por día, semana, quincena o mes, con fecha de fin calculada y días restantes a la vista.' },
  { icon: DoorOpen, color: '#059669', title: 'Solo entra quien está al día', text: 'El kiosco verifica la membresía en segundos y bloquea el acceso a quien no ha renovado.' },
  { icon: BellRing, color: '#7c3aed', title: 'Recordatorios automáticos', text: 'WhatsApp y correo 3 días antes del vencimiento y el mismo día, sin que tengas que escribir a nadie.' },
  { icon: Wallet, color: '#0d9488', title: 'Caja sin descuadres', text: 'Apertura, ingresos, gastos y cierre diario. Pagos por efectivo, transferencia, Nequi, Daviplata y tarjeta.' },
  { icon: ClipboardList, color: '#dc2626', title: 'La ficha de cada miembro', text: 'Contacto, estatura, peso, IMC, antecedentes médicos, fotos de progreso y cumpleaños.' },
]

const cycle = [
  { day: 'Día 1', what: 'Activa', how: 'Se asigna el plan y se registra el pago o el abono.', color: '#059669' },
  { day: 'Mientras entrena', what: 'Al día', how: 'Cada ingreso le muestra los días que le quedan.', color: '#059669' },
  { day: '3 días antes', what: 'Vence pronto', how: 'Recordatorio por WhatsApp y correo. Aparece en tu lista de cobro.', color: '#2563eb' },
  { day: 'Día de corte', what: 'Vencida', how: 'El kiosco no da acceso. El saldo queda cargado.', color: '#dc2626' },
  { day: '+3 días', what: 'Por pagar', how: 'Pasa a la lista de pendientes de cobro.', color: '#d97706' },
  { day: '+30 días', what: 'Cerrada', how: 'La membresía se cancela y tu lista queda limpia.', color: '#64748b' },
]
</script>

<style scoped>
.landing {
  --lp-ink: var(--color-text);
  --lp-soft: var(--color-text-muted);
  --lp-line: var(--color-border-strong);
  --lp-brand: #dc2626;
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--lp-ink);
  overflow-x: hidden;
}
.lp-wrap { width: 100%; max-width: 1160px; margin: 0 auto; padding-inline: 20px; }

.lp-eyebrow {
  font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--color-text-subtle);
}

/* Encabezado */
.lp-nav {
  position: sticky; top: 0; z-index: 30;
  background: color-mix(in srgb, var(--color-bg) 85%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
}
.lp-nav-inner { display: flex; align-items: center; gap: 24px; height: 64px; }
.lp-logo { font-weight: 900; font-size: 1.35rem; letter-spacing: -0.02em; color: var(--lp-ink); text-decoration: none; }
.lp-logo span { color: var(--lp-brand); }
.lp-nav-links { display: flex; gap: 22px; margin-left: auto; font-size: 0.92rem; font-weight: 600; }
.lp-nav-links a { color: var(--lp-soft); text-decoration: none; }
.lp-nav-links a:hover { color: var(--lp-ink); }

.lp-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: 999px; padding: 10px 20px; font-weight: 700; font-size: 0.95rem;
  text-decoration: none; white-space: nowrap; transition: transform 150ms ease, opacity 150ms ease;
}
.lp-btn:hover { transform: translateY(-1px); }
.lp-btn-dark { background: var(--lp-ink); color: var(--color-bg); }
.lp-btn-brand { background: var(--lp-brand); color: #fff; padding: 14px 26px; }
.lp-btn-ghost { border: 1px solid rgba(255, 255, 255, 0.35); color: #fff; padding: 13px 24px; }

/* Hero */
.lp-hero { padding-block: 64px 36px; display: grid; gap: 20px; }
.lp-hero h1 {
  font-size: clamp(2.3rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.02;
  letter-spacing: -0.035em; max-width: 15ch; text-wrap: balance;
}
.lp-hero h1 em { font-style: normal; color: var(--lp-brand); }
.lp-lede { font-size: 1.2rem; line-height: 1.6; color: var(--lp-soft); max-width: 58ch; }
.lp-states { display: flex; flex-wrap: wrap; gap: 8px; }
.lp-pill {
  display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 999px;
  font-size: 0.85rem; font-weight: 700;
}
.lp-pill::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.lp-pill.is-ok { color: #059669; background: rgba(5, 150, 105, 0.12); }
.lp-pill.is-soon { color: #2563eb; background: rgba(37, 99, 235, 0.12); }
.lp-pill.is-late { color: #dc2626; background: rgba(220, 38, 38, 0.12); }
.lp-pill.is-due { color: #d97706; background: rgba(217, 119, 6, 0.14); }

/* Demo */
.lp-demo { padding-bottom: 80px; scroll-margin-top: 80px; }
.lp-stage {
  background: #0b1220; border-radius: 18px; padding: 10px 10px 12px;
  box-shadow: 0 40px 80px -40px rgba(2, 6, 23, 0.6);
}
.lp-chrome { display: flex; align-items: center; gap: 7px; padding: 4px 8px 12px; }
.lp-chrome i { width: 10px; height: 10px; border-radius: 50%; background: #334155; display: block; }
.lp-url {
  margin-left: 10px; flex: 1; min-width: 0; font: 500 0.75rem ui-monospace, Menlo, monospace; color: #94a3b8;
  background: #162033; border-radius: 6px; padding: 4px 10px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lp-screen {
  position: relative; aspect-ratio: 16 / 10; max-width: 100%; border-radius: 8px; overflow: hidden;
  background: #162033; cursor: pointer;
}
.lp-screen img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top center;
  opacity: 0; transition: opacity 350ms ease;
}
.lp-screen img.is-on { opacity: 1; }

.lp-box {
  position: absolute; border: 3px solid #f43f5e; border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(2, 6, 23, 0.38);
  animation: lp-box-in 380ms ease both; pointer-events: none;
}
.lp-box-label {
  position: absolute; left: -3px; bottom: calc(100% + 8px);
  background: #f43f5e; color: #fff; font-weight: 800; font-size: clamp(0.62rem, 1.3vw, 0.85rem);
  padding: 4px 10px; border-radius: 6px; white-space: nowrap;
}
.lp-box-label.is-below { bottom: auto; top: calc(100% + 8px); }
@keyframes lp-box-in { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }

.lp-cursor {
  position: absolute; z-index: 5; width: 0; height: 0; pointer-events: none;
  transition: left 900ms cubic-bezier(0.45, 0, 0.2, 1), top 900ms cubic-bezier(0.45, 0, 0.2, 1), opacity 250ms;
}
.lp-cursor.is-fast { transition-duration: 200ms, 200ms, 250ms; }
.lp-cursor.is-hidden { opacity: 0; }
.lp-cursor svg {
  position: absolute; left: -5px; top: -3px; filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.35));
  transition: transform 120ms ease; transform-origin: 5px 3px;
}
.lp-cursor.is-pressing svg { transform: scale(0.82); }
.lp-ripple {
  position: absolute; left: -18px; top: -18px; width: 36px; height: 36px; border-radius: 50%;
  background: rgba(244, 63, 94, 0.45); animation: lp-ripple 520ms ease-out forwards;
}
@keyframes lp-ripple { from { transform: scale(0.2); opacity: 1; } to { transform: scale(1.6); opacity: 0; } }

.lp-play-overlay {
  position: absolute; inset: 0; margin: auto; width: 72px; height: 72px; border-radius: 50%;
  display: grid; place-items: center; background: rgba(15, 23, 42, 0.78); color: #fff; border: 0;
  pointer-events: none;
}

.lp-chapters { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 5px; padding: 12px 4px 0; }
.lp-seg {
  height: 14px; padding: 5px 0; background: transparent; border: 0; cursor: pointer; position: relative;
}
.lp-seg::before { content: ''; position: absolute; inset: 5px 0; border-radius: 3px; background: #26324a; }
.lp-seg b { position: absolute; left: 0; top: 5px; bottom: 5px; width: 0; border-radius: 3px; background: #f43f5e; }
.lp-seg.is-done b { width: 100%; background: #64748b; }

.lp-caption {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px; align-items: start; padding: 22px 4px 0;
}
.lp-caption-meta { display: flex; gap: 12px; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-text-subtle); }
.lp-count { font-variant-numeric: tabular-nums; letter-spacing: 0.04em; }
.lp-caption h2 { font-size: clamp(1.4rem, 2.6vw, 1.9rem); font-weight: 850; letter-spacing: -0.02em; margin-top: 4px; }
.lp-benefit {
  display: flex; gap: 10px; margin-top: 8px; color: var(--lp-soft); font-size: 1.05rem; line-height: 1.55;
  max-width: 64ch; min-height: 3.2em;
}
.lp-benefit svg { color: #059669; margin-top: 3px; }
.lp-controls { display: flex; gap: 8px; }
.lp-ctrl {
  width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center;
  border: 1px solid var(--lp-line); background: var(--color-surface); color: var(--lp-ink); cursor: pointer;
}
.lp-ctrl-play { width: auto; padding: 0 18px; border-radius: 999px; display: inline-flex; gap: 8px; font-weight: 700; font-size: 0.9rem; }
.lp-note { margin-top: 14px; font-size: 0.82rem; color: var(--color-text-subtle); }

/* Secciones */
.lp-section { padding-block: 72px; border-top: 1px solid var(--color-border); scroll-margin-top: 64px; }
.lp-head { display: grid; gap: 10px; max-width: 68ch; margin-bottom: 36px; }
.lp-head h2 { font-size: clamp(1.7rem, 3.6vw, 2.6rem); font-weight: 900; line-height: 1.08; letter-spacing: -0.025em; text-wrap: balance; }
.lp-head p:not(.lp-eyebrow) { color: var(--lp-soft); font-size: 1.05rem; }

.lp-benefits { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
.lp-benefit-card {
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 24px;
  display: grid; gap: 10px; align-content: start; min-width: 0;
}
.lp-benefit-icon {
  width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center;
  background: var(--color-surface-muted);
}
.lp-benefit-card h3 { font-size: 1.12rem; font-weight: 800; }
.lp-benefit-card p { color: var(--lp-soft); line-height: 1.55; }

.lp-cycle-scroll { overflow-x: auto; padding-bottom: 8px; }
.lp-cycle {
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(6, minmax(140px, 1fr));
  min-width: 860px; position: relative;
}
.lp-cycle::before {
  content: ''; position: absolute; left: 10px; right: 10px; top: 9px; height: 4px; border-radius: 4px;
  background: linear-gradient(90deg, #059669 0 33.3%, #2563eb 33.3% 50%, #dc2626 50% 66.6%, #d97706 66.6% 83.3%, #64748b 83.3%);
}
.lp-cycle li { position: relative; display: grid; gap: 4px; padding-right: 16px; align-content: start; }
.lp-cycle-dot {
  width: 22px; height: 22px; border-radius: 50%; background: var(--color-bg); border: 4px solid var(--c);
  position: relative; z-index: 1; margin-bottom: 10px;
}
.lp-cycle-day { font: 700 0.78rem ui-monospace, Menlo, monospace; color: var(--c); }
.lp-cycle strong { font-size: 1.02rem; }
.lp-cycle-how { font-size: 0.92rem; color: var(--lp-soft); line-height: 1.45; }

.lp-access { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.lp-access-card {
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column; min-width: 0;
}
.lp-access-art { aspect-ratio: 16 / 9; max-width: 100%; background: #0b1220; overflow: hidden; display: grid; place-items: center; }
.lp-access-art img { width: 100%; height: 100%; object-fit: cover; object-position: right 25%; }
.lp-fp { width: 34%; height: auto; color: #67e8f9; stroke-width: 1.2; }
.lp-access-body { padding: 24px; display: grid; gap: 8px; }
.lp-access-body h3 { display: flex; align-items: center; gap: 8px; font-size: 1.2rem; font-weight: 800; }
.lp-access-body p { color: var(--lp-soft); line-height: 1.55; }

.lp-cta {
  background: #0b1220; color: #f8fafc; border-radius: 20px; padding: clamp(28px, 5vw, 56px);
  display: grid; gap: 16px;
}
.lp-cta h2 { font-size: clamp(1.8rem, 4vw, 2.9rem); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; max-width: 18ch; text-wrap: balance; }
.lp-cta p { color: #cbd5e1; max-width: 58ch; line-height: 1.6; }
.lp-cta-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
.lp-foot { padding-block: 28px 40px; color: var(--color-text-subtle); font-size: 0.85rem; }

button:focus-visible, a:focus-visible { outline: 3px solid #f43f5e; outline-offset: 2px; }

@media (max-width: 760px) {
  .lp-nav-links { display: none; }
  .lp-nav-inner { justify-content: space-between; }
  .lp-caption { grid-template-columns: minmax(0, 1fr); }
  .lp-url { display: none; }
  .lp-hero { padding-block: 40px 28px; }
  .lp-cursor svg { width: 18px; height: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-screen img, .lp-cursor, .lp-btn { transition: none; }
  .lp-box { animation: none; }
}
</style>
