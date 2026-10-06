<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <span class="text-xs font-bold uppercase tracking-wider text-subtle">Recordatorios</span>
      <BaseBadge :color="member.allow_whatsapp_notifications ? 'green' : 'gray'" dot>
        {{ member.allow_whatsapp_notifications ? "Activados" : "Desactivados" }}
      </BaseBadge>
    </div>

    <p v-if="member.allow_whatsapp_notifications && member.whatsapp_opt_in_at" class="text-xs text-muted">
      Autorizado el {{ formatAppDate(member.whatsapp_opt_in_at) }}
    </p>

    <p
      v-if="member.allow_whatsapp_notifications && !phoneOk"
      class="flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-2.5"
    >
      <AlertTriangle class="w-4 h-4 shrink-0" aria-hidden="true" />
      El teléfono no es un celular colombiano válido; los recordatorios no se enviarán hasta corregirlo.
    </p>

    <div>
      <p class="text-xs font-bold uppercase tracking-wider text-subtle mb-2">Últimos envíos</p>

      <div v-if="loading" class="flex items-center gap-2 text-xs text-muted">
        <Loader2 class="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        Cargando...
      </div>
      <p v-else-if="loadError" class="text-xs text-danger-600">{{ loadError }}</p>
      <p v-else-if="!notifications.length" class="text-xs italic text-subtle">
        Aún no se le ha enviado ningún recordatorio.
      </p>

      <ul v-else class="space-y-2">
        <li
          v-for="n in notifications"
          :key="n.id"
          class="flex items-start justify-between gap-3 rounded-lg border border-default-soft bg-[var(--color-surface-soft)] px-3 py-2"
        >
          <div class="min-w-0">
            <p class="text-xs font-semibold text-default">
              {{ typeLabel(n.type) }}
              <span v-if="n.membership?.end_date" class="font-normal text-muted">
                · vence {{ formatAppDate(n.membership.end_date) }}
              </span>
            </p>
            <p class="text-[11px] text-subtle mt-0.5">{{ formatAppDateTime(n.sent_at || n.updated_at) }}</p>
          </div>
          <BaseBadge :color="statusColor(n.status)" :title="n.status === 'failed' ? n.error_message || '' : ''">
            {{ statusLabel(n.status) }}
          </BaseBadge>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import api from "@/axios";
import { AlertTriangle, Loader2 } from "lucide-vue-next";
import { BaseBadge } from "@/components/ui";
import { formatAppDate, formatAppDateTime } from "@/lib/dates";
import { isValidWhatsAppPhone } from "@/lib/whatsapp";

const props = defineProps({
  member: { type: Object, required: true },
});

const notifications = ref([]);
const loading = ref(false);
const loadError = ref("");

const phoneOk = computed(() => isValidWhatsAppPhone(props.member.phone));

async function cargarHistorial(id) {
  if (!id) return;
  loading.value = true;
  loadError.value = "";
  try {
    const { data } = await api.get(`/members/${id}/whatsapp-notifications`);
    notifications.value = data;
  } catch (e) {
    console.error(e);
    loadError.value = "No se pudo cargar el historial de recordatorios.";
  } finally {
    loading.value = false;
  }
}

watch(() => props.member?.id, cargarHistorial, { immediate: true });

function typeLabel(type) {
  return {
    membership_expiring_soon: "Aviso 3 días antes",
    membership_expires_today: "Aviso día del vencimiento",
  }[type] || type;
}

function statusLabel(status) {
  return { sent: "Enviado", failed: "Falló", pending: "Pendiente" }[status] || status;
}

function statusColor(status) {
  return { sent: "green", failed: "red", pending: "yellow" }[status] || "gray";
}
</script>
