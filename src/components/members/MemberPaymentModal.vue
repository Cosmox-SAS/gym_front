<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center z-50 p-4"
    :style="{ background: 'var(--modal-backdrop)' }"
  >
    <div
      class="w-full max-w-md p-6 rounded-lg shadow-2xl border-t-4 border-green-500"
      :style="{ background: 'var(--modal-panel-bg)', borderLeft: '1px solid var(--modal-panel-border)', borderRight: '1px solid var(--modal-panel-border)', borderBottom: '1px solid var(--modal-panel-border)' }"
    >
      <h2 id="member-payment-modal-title" class="text-xl font-bold mb-2 text-default flex items-center gap-2">
        <CreditCard class="w-5 h-5 text-emerald-600" aria-hidden="true" />
        Registrar Pago
      </h2>
      <p class="text-sm text-muted mb-4 inline-flex items-center gap-1.5">
        <User class="w-4 h-4" aria-hidden="true" />
        Cliente: <strong>{{ member?.name }}</strong>
      </p>

      <div v-if="loadingBalance" class="text-center py-4 inline-flex items-center justify-center gap-2 w-full">
        <Loader2 class="w-4 h-4 animate-spin" aria-hidden="true" />
        Buscando deuda...
      </div>

      <form v-else @submit.prevent="pagar">
        <div class="mb-4 bg-[var(--color-surface-soft)] p-3 rounded border border-default-soft">
          <p class="text-sm text-muted inline-flex items-center gap-1.5">
            <Wallet class="w-4 h-4" aria-hidden="true" />
            Monto a pagar:
          </p>
          <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {{ formatCurrency(amount) }}
          </p>
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium inline-flex items-center gap-1.5">
            <Banknote class="w-4 h-4 text-muted" aria-hidden="true" />
            Método de Pago
          </label>
          <BaseSelect
            v-model="paymentMethodId"
            placeholder="Seleccione..."
            required
            :options="paymentMethodOptions"
          />
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="btn btn-secondary inline-flex items-center gap-2"
          >
            <X class="w-4 h-4" aria-hidden="true" />
            Cancelar
          </button>
          <button
            type="submit"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow-lg flex items-center gap-2"
            :disabled="processing"
          >
            <Loader2 v-if="processing" class="w-4 h-4 animate-spin" aria-hidden="true" />
            <Check v-else class="w-4 h-4" aria-hidden="true" />
            {{ processing ? 'Procesando...' : 'Confirmar Pago' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

// eslint-disable-next-line vue/block-lang
<script setup>
import { ref, watch, onMounted, computed } from "vue";
import api from "@/axios";
import Swal from "sweetalert2";
import { CreditCard, User, Wallet, Banknote, X, Check, Loader2 } from "lucide-vue-next";
import { BaseSelect } from "@/components/ui";

const props = defineProps({
  show: Boolean,
  member: Object,
});

const emit = defineEmits(["close", "paid"]);

const paymentMethods = ref([]);
const amount = ref(0);
const paymentMethodId = ref("");
const loadingBalance = ref(false);
const processing = ref(false);

const paymentMethodOptions = computed(() =>
  paymentMethods.value.map((m) => ({ value: m.id, label: m.name }))
);

// Cargar métodos de pago una sola vez
onMounted(async () => {
  try {
    const { data } = await api.get("/payment_methods");
    paymentMethods.value = data;
  } catch (e) {
    console.error(e);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Error cargando métodos de pago",
      showConfirmButton: false,
      timer: 3000,
    });
  }
});

// Cuando se abre el modal, buscar la deuda
watch(
  () => props.show,
  async (val) => {
    if (val && props.member) {
      loadingBalance.value = true;
      amount.value = 0;
      paymentMethodId.value = "";
      try {
        const { data } = await api.get(`/memberships/by-member/${props.member.id}`);
        amount.value = data.outstanding_balance;

        if (amount.value <= 0) {
          Swal.fire("Todo al día", "Este cliente no tiene deuda.", "info");
          emit("close");
        }
      } catch (error) {
        // Manejo de errores de red
        if (!error.response) {
          if (!navigator.onLine) {
            Swal.fire({
              icon: "error",
              title: "Sin conexión a internet",
              text: "No se pudo verificar el saldo. Verifica tu conexión.",
              confirmButtonColor: "#d33",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error de conexión",
              text: "No se pudo conectar con el servidor para verificar el saldo.",
              confirmButtonColor: "#d33",
            });
          }
        } else if (error.response.status === 404) {
          Swal.fire("Sin membresía", "Este cliente no tiene una membresía registrada.", "warning");
        } else {
          Swal.fire("Error", "No se pudo calcular la deuda.", "error");
        }
        emit("close");
      } finally {
        loadingBalance.value = false;
      }
    }
  },
);

const pagar = async () => {
  processing.value = true;
  try {
    await api.post("/payments", {
      member_id: props.member.id,
      amount: amount.value,
      payment_method_id: paymentMethodId.value,
    });

    Swal.fire({
      title: "¡Pago Exitoso!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
    emit("paid");
    emit("close");
  } catch (error) {
    // Manejo de errores de red
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        Swal.fire({
          icon: "warning",
          title: "Tiempo de espera agotado",
          html: `<p>El pago tardó demasiado tiempo en procesarse.</p>
                 <p class="text-sm mt-2"><strong>IMPORTANTE:</strong> Verifica si el pago se registró antes de intentar nuevamente.</p>`,
          confirmButtonColor: "#3085d6",
        });
      } else if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          html: `<p>No se pudo procesar el pago porque no hay conexión a internet.</p>
                 <p class="text-sm mt-2">Por favor, verifica tu conexión y vuelve a intentar.</p>`,
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          html: `<p>No se pudo conectar con el servidor para procesar el pago.</p>
                 <p class="text-sm mt-2">Verifica tu conexión e intenta nuevamente.</p>`,
          confirmButtonColor: "#d33",
        });
      }
    } else {
      // Errores HTTP con respuesta
      const status = error.response.status;

      if (status === 404) {
        Swal.fire({
          icon: "error",
          title: "Membresía no encontrada",
          text: "No se encontró la membresía asociada a este cliente.",
          confirmButtonColor: "#d33",
        });
      } else if (status === 422) {
        Swal.fire({
          icon: "warning",
          title: "Datos inválidos",
          text: error.response.data?.message || "Los datos del pago no son válidos.",
          confirmButtonColor: "#f39c12",
        });
      } else if (status >= 500) {
        Swal.fire({
          icon: "error",
          title: "Error del servidor",
          html: `<p>Ocurrió un error en el servidor al procesar el pago.</p>
                 <p class="text-sm mt-2"><strong>IMPORTANTE:</strong> Verifica si el pago se registró antes de intentar nuevamente.</p>`,
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al procesar pago",
          text: error.response?.data?.message || "No se pudo registrar el pago.",
          confirmButtonColor: "#d33",
        });
      }
    }
  } finally {
    processing.value = false;
  }
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);
};
</script>
