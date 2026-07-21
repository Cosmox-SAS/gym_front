<template>
  <main class="id-kiosk min-h-screen overflow-hidden text-default">
    <section class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-6 px-5 py-7 lg:grid lg:grid-cols-[1fr_390px] lg:px-10">
      <div class="w-full text-center lg:text-left">
        <div class="mb-6 flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between lg:max-w-2xl">
          <div class="flex-1">
            <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-default-soft bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-default shadow-lg backdrop-blur">
              <ShieldCheck class="h-4 w-4" aria-hidden="true" />
              Control de acceso por cedula
            </div>

            <h1 class="max-w-2xl text-4xl font-black leading-tight tracking-tight text-default sm:text-5xl lg:text-6xl">
              Digita tu numero de cedula para ingresar
            </h1>
          </div>

          <div class="client-photo-slot">
            <div class="client-photo-inner">
              <span v-if="member" class="text-3xl font-black">{{ memberInitials }}</span>
              <UserRound v-else class="h-10 w-10" aria-hidden="true" />
            </div>
            <p class="mt-2 text-xs font-bold uppercase tracking-widest text-subtle">
              {{ photoPlaceholderLabel }}
            </p>
          </div>
        </div>

        <p class="mt-5 max-w-xl text-base leading-7 text-subtle sm:text-lg">
          El sistema verifica tu membresia y registra el ingreso automaticamente.
        </p>

        <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <div class="rounded-2xl border border-emerald-400/20 bg-[var(--color-surface)] p-4 text-left shadow-card">
            <p class="text-sm font-bold text-emerald-300">Acceso permitido</p>
            <p class="mt-1 text-sm text-subtle">Membresia activa y al dia.</p>
          </div>
          <div class="rounded-2xl border border-amber-400/20 bg-[var(--color-surface)] p-4 text-left shadow-card">
            <p class="text-sm font-bold text-amber-300">Acceso denegado</p>
            <p class="mt-1 text-sm text-subtle">Membresia vencida o cliente no encontrado.</p>
          </div>
        </div>
      </div>

      <div class="w-full max-w-[390px] rounded-[2rem] border border-default-soft bg-[var(--color-surface)] p-4 shadow-2xl backdrop-blur-xl sm:p-5">
        <div class="mb-4 rounded-3xl border border-default-soft bg-[var(--color-surface-soft)] p-4 text-center">
          <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" :class="statusIconClass">
            <component :is="statusIcon" class="h-7 w-7" aria-hidden="true" />
          </div>

          <p class="text-sm font-bold uppercase tracking-[0.28em]" :class="statusLabelClass">
            {{ statusLabel }}
          </p>

          <div class="mt-3 min-h-[52px] rounded-2xl border border-default-soft bg-[var(--color-bg)] px-4 py-2.5">
            <p class="font-mono text-2xl font-black tracking-[0.18em] text-default">
              {{ maskedIdentification || "--------" }}
            </p>
          </div>

          <p class="mt-3 min-h-[48px] text-base font-semibold leading-6" :class="messageClass">
            {{ displayMessage }}
          </p>

          <div v-if="member" class="mt-3 rounded-2xl border border-default-soft bg-[var(--color-surface)] p-4">
            <p class="text-xs font-bold uppercase tracking-widest text-subtle">Cliente identificado</p>
            <p class="mt-1 text-xl font-black text-default">{{ member.name }}</p>
            <p class="mt-1 text-sm text-subtle">C.C {{ member.identification }}</p>
            <p class="mt-3 rounded-2xl px-4 py-3 text-sm font-bold leading-5" :class="memberMessageClass">
              {{ memberResultMessage }}
            </p>
            <p v-if="state === 'success'" class="mt-2 text-xs font-semibold text-emerald-300">
              Ingreso registrado: {{ accessTime }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2.5">
          <button
            v-for="number in keypadNumbers"
            :key="number"
            type="button"
            class="keypad-button"
            :disabled="submitting"
            @click="appendDigit(number)"
          >
            {{ number }}
          </button>

          <button type="button" class="keypad-action" :disabled="submitting" @click="clearIdentification">
            Limpiar
          </button>
          <button type="button" class="keypad-button" :disabled="submitting" @click="appendDigit('0')">
            0
          </button>
          <button type="button" class="keypad-action" :disabled="submitting" @click="removeDigit">
            <Delete class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-base font-black text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          :disabled="!canSubmit || submitting"
          @click="submitIdentification"
        >
          <Loader2 v-if="submitting" class="h-5 w-5 animate-spin" aria-hidden="true" />
          <DoorOpen v-else class="h-5 w-5" aria-hidden="true" />
          {{ submitting ? "Verificando..." : "Ingresar" }}
        </button>

        <p class="mt-4 text-center text-xs text-subtle">
          Tambien puedes usar el teclado fisico y presionar Enter.
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { formatAppDateTime } from "@/lib/dates";
import {
  AlertTriangle,
  CheckCircle2,
  Delete,
  DoorOpen,
  IdCard,
  Loader2,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-vue-next";

type AccessState = "idle" | "submitting" | "success" | "expired" | "not_found" | "error";

type AccessMember = {
  id: number;
  name: string;
  identification?: string;
};

type AccessSummary = {
  has_membership: boolean;
  status: string | null;
  end_date: string | null;
  days_remaining: number | null;
  days_overdue: number | null;
  message: string;
};

const route = useRoute();

const identification = ref("");
const state = ref<AccessState>("idle");
const member = ref<AccessMember | null>(null);
const accessSummary = ref<AccessSummary | null>(null);
const serverMessage = ref("");
const accessTime = ref("");
const resetTimer = ref<ReturnType<typeof setTimeout> | null>(null);

const keypadNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const MAX_IDENTIFICATION_LENGTH = 12;
const RESET_DELAY = 7000;

function getStoredGymId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") ?? "null");
    return Number(user?.gimnasio_id ?? user?.gimnasio?.id) || null;
  } catch {
    return null;
  }
}

const gimnasioId = computed(() => {
  const paramId = Array.isArray(route.params.gimnasioId)
    ? route.params.gimnasioId[0]
    : route.params.gimnasioId;

  return Number(route.query.gym) || Number(paramId) || getStoredGymId();
});

const submitting = computed(() => state.value === "submitting");
const canSubmit = computed(() => identification.value.length >= 4);
const maskedIdentification = computed(() => identification.value);

const memberFirstName = computed(() => {
  const first = member.value?.name?.trim().split(/\s+/)[0];
  return first || "cliente";
});

const memberInitials = computed(() => {
  const words = member.value?.name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "CG";
});

const photoPlaceholderLabel = computed(() => {
  return member.value ? "Foto del cliente" : "Espacio para foto";
});

const remainingDaysText = computed(() => {
  const days = accessSummary.value?.days_remaining;

  if (days === 0) return "tu membresia vence hoy";
  if (days === 1) return "te queda 1 dia de membresia";
  if (typeof days === "number") return `te quedan ${days} dias de membresia`;

  return "tu membresia esta activa";
});

const overdueDaysText = computed(() => {
  const days = accessSummary.value?.days_overdue;

  if (days === 0) return "tu membresia vencio hoy";
  if (days === 1) return "tu membresia vencio hace 1 dia";
  if (typeof days === "number") return `tu membresia vencio hace ${days} dias`;

  return "tu membresia no esta activa";
});

const personalizedSuccessMessage = computed(() => {
  return `Hola ${memberFirstName.value}, bienvenido. ${remainingDaysText.value}; sigue entrenando al maximo.`;
});

const personalizedExpiredMessage = computed(() => {
  return `Hola ${memberFirstName.value}, ${overdueDaysText.value}. Acercate a recepcion para renovarla.`;
});

const memberResultMessage = computed(() => {
  if (state.value === "success") return personalizedSuccessMessage.value;
  if (state.value === "expired") return personalizedExpiredMessage.value;
  return accessSummary.value?.message || "";
});

const memberMessageClass = computed(() => ({
  "bg-emerald-400/15 text-emerald-200 border border-emerald-400/20": state.value === "success",
  "bg-amber-400/15 text-amber-200 border border-amber-400/20": state.value === "expired",
  "bg-[var(--color-surface-soft)] text-default border border-default-soft": state.value !== "success" && state.value !== "expired",
}));

const statusLabel = computed(() => {
  if (state.value === "success") return "Permitido";
  if (state.value === "expired") return "Membresia vencida";
  if (state.value === "not_found") return "No encontrado";
  if (state.value === "error") return "Error";
  if (state.value === "submitting") return "Verificando";
  return "Listo";
});

const displayMessage = computed(() => {
  if (state.value === "success") return "Acceso permitido.";
  if (state.value === "expired") return "Membresia no activa.";
  if (state.value === "not_found") return "No encontramos esa cedula en este gimnasio.";
  if (state.value === "error") return serverMessage.value || "No se pudo verificar el acceso.";
  if (state.value === "submitting") return "Estamos verificando tu informacion...";
  return "Digita tu cedula y presiona Ingresar.";
});

const statusIcon = computed(() => {
  if (state.value === "success") return CheckCircle2;
  if (state.value === "expired") return AlertTriangle;
  if (state.value === "not_found" || state.value === "error") return XCircle;
  if (state.value === "submitting") return Loader2;
  return IdCard;
});

const statusIconClass = computed(() => ({
  "bg-cyan-400/15 text-cyan-200": state.value === "idle" || state.value === "submitting",
  "bg-emerald-400/15 text-emerald-200": state.value === "success",
  "bg-amber-400/15 text-amber-200": state.value === "expired",
  "bg-red-400/15 text-red-200": state.value === "not_found" || state.value === "error",
  "animate-pulse": state.value === "submitting",
}));

const statusLabelClass = computed(() => ({
  "text-cyan-200": state.value === "idle" || state.value === "submitting",
  "text-emerald-200": state.value === "success",
  "text-amber-200": state.value === "expired",
  "text-red-200": state.value === "not_found" || state.value === "error",
}));

const messageClass = computed(() => ({
  "text-subtle": state.value === "idle" || state.value === "submitting",
  "text-emerald-200": state.value === "success",
  "text-amber-200": state.value === "expired",
  "text-red-200": state.value === "not_found" || state.value === "error",
}));

function speak(message: string) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "es-CO";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function buildSuccessSpeech() {
  return personalizedSuccessMessage.value;
}

function buildExpiredSpeech() {
  return personalizedExpiredMessage.value;
}

function clearResetTimer() {
  if (!resetTimer.value) return;
  clearTimeout(resetTimer.value);
  resetTimer.value = null;
}

function scheduleReset() {
  clearResetTimer();
  resetTimer.value = setTimeout(() => {
    state.value = "idle";
    member.value = null;
    accessSummary.value = null;
    serverMessage.value = "";
    identification.value = "";
  }, RESET_DELAY);
}

function appendDigit(digit: string) {
  if (submitting.value || identification.value.length >= MAX_IDENTIFICATION_LENGTH) return;
  clearResetTimer();
  if (state.value !== "idle") {
    state.value = "idle";
    member.value = null;
    accessSummary.value = null;
    serverMessage.value = "";
  }
  identification.value += digit;
}

function removeDigit() {
  if (submitting.value) return;
  clearResetTimer();
  identification.value = identification.value.slice(0, -1);
}

function clearIdentification() {
  if (submitting.value) return;
  clearResetTimer();
  state.value = "idle";
  member.value = null;
  accessSummary.value = null;
  serverMessage.value = "";
  identification.value = "";
}

async function submitIdentification() {
  if (!canSubmit.value || submitting.value) return;

  clearResetTimer();
  state.value = "submitting";
  member.value = null;
  accessSummary.value = null;
  serverMessage.value = "";

  const apiUrl = ((import.meta.env.VITE_API_URL as string | undefined) || "http://127.0.0.1:8000/api").replace(/\/$/, "");
  const payload: Record<string, string | number> = {
    identification: identification.value,
  };

  if (gimnasioId.value) {
    payload.gimnasio_id = gimnasioId.value;
  }

  try {
    const response = await fetch(`${apiUrl}/access/identification`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    if (response.ok && data.success) {
      state.value = "success";
      member.value = data.member;
      accessSummary.value = data.access_summary ?? null;
      accessTime.value = formatAppDateTime(new Date());
      speak(buildSuccessSpeech());
      scheduleReset();
      return;
    }

    if (response.status === 403) {
      state.value = "expired";
      member.value = data.member ?? null;
      accessSummary.value = data.access_summary ?? null;
      speak(buildExpiredSpeech());
      scheduleReset();
      return;
    }

    if (response.status === 404) {
      state.value = "not_found";
      speak("Cliente no encontrado");
      scheduleReset();
      return;
    }

    state.value = "error";
    serverMessage.value = data.message || data.error || "Respuesta no valida del servidor.";
    speak("No se pudo verificar el acceso");
    scheduleReset();
  } catch (error: any) {
    state.value = "error";
    serverMessage.value = error?.message || "Error de conexion con el servidor.";
    speak("Error de conexion");
    scheduleReset();
  }
}

function handleKeyboard(event: KeyboardEvent) {
  if (/^\d$/.test(event.key)) {
    appendDigit(event.key);
    return;
  }

  if (event.key === "Backspace") {
    removeDigit();
    return;
  }

  if (event.key === "Enter") {
    submitIdentification();
    return;
  }

  if (event.key === "Escape") {
    clearIdentification();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyboard);
});

onBeforeUnmount(() => {
  clearResetTimer();
  window.removeEventListener("keydown", handleKeyboard);
  window.speechSynthesis?.cancel();
});
</script>

<style scoped>
.id-kiosk {
  background:
    radial-gradient(circle at 15% 15%, rgba(34, 211, 238, 0.16), transparent 28rem),
    radial-gradient(circle at 82% 18%, rgba(16, 185, 129, 0.12), transparent 24rem),
    var(--color-bg-gradient);
}

.id-kiosk::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.85), transparent);
}

.client-photo-slot {
  width: 132px;
  flex: 0 0 auto;
  border-radius: 1.5rem;
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface);
  padding: 0.75rem;
  text-align: center;
  box-shadow: var(--shadow-card, 0 12px 30px rgba(15, 23, 42, 0.16));
}

.client-photo-inner {
  display: flex;
  height: 104px;
  width: 104px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px dashed var(--color-border);
  background:
    radial-gradient(circle at 35% 25%, rgba(34, 211, 238, 0.18), transparent 3.5rem),
    var(--color-surface-soft);
  color: var(--color-text-subtle);
}

.keypad-button,
.keypad-action {
  min-height: 54px;
  border-radius: 1rem;
  border: 1px solid var(--color-border-soft);
  background: var(--color-surface-soft);
  color: var(--color-text);
  font-weight: 900;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}

.keypad-button {
  font-size: 1.45rem;
}

.keypad-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-subtle);
  font-size: 0.78rem;
}

.keypad-button:hover:not(:disabled),
.keypad-action:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.45);
  background: var(--color-surface-muted);
}

.keypad-button:active:not(:disabled),
.keypad-action:active:not(:disabled) {
  transform: translateY(1px);
}

.keypad-button:disabled,
.keypad-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
