<template>
  <div class="page-layout">
    <BaseCard title="Caja Diaria" subtitle="Control de apertura y cierre" class="space-y-6">
      <template #actions>
        <router-link to="/Menu" class="btn btn-secondary flex-1 sm:flex-none inline-flex items-center justify-center gap-2">
          <Home class="w-4 h-4" aria-hidden="true" />
          <span>Inicio</span>
        </router-link>
        <BaseButton variant="danger-solid" class="flex-1 sm:flex-none" @click="abrirModalGasto">
          <ArrowDownToLine class="w-4 h-4" aria-hidden="true" />
          Registrar gasto
        </BaseButton>
        <BaseButton variant="dark" class="flex-1 sm:flex-none" @click="confirmarCierre">
          <Lock class="w-4 h-4" aria-hidden="true" />
          Cerrar caja
        </BaseButton>
      </template>

      <div v-if="loading" class="text-center py-10 text-muted">Cargando...</div>

      <div v-else class="space-y-6">
        <div
          v-if="todayCashbox"
          class="p-4 rounded-xl border shadow-sm"
          style="background: var(--color-surface-soft); border-color: var(--color-border);"
        >
          <h3 class="text-sm font-semibold mb-3 uppercase tracking-wide flex items-center gap-2" style="color: var(--color-text-muted);">
            <Calendar class="w-4 h-4" aria-hidden="true" />
            Resumen Hoy ({{ todayCashbox.date }})
          </h3>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div class="bg-[var(--color-surface)] p-3 rounded-lg shadow-sm border border-default-soft">
              <p class="text-muted text-xs flex items-center gap-1">
                <Wallet class="w-3 h-3" aria-hidden="true" />
                Apertura
              </p>
              <p class="text-lg font-semibold text-default">
                {{ formatCurrency(todayCashbox.opening_balance) }}
              </p>
            </div>
            <div class="bg-[var(--color-surface)] p-3 rounded-lg shadow-sm border border-default-soft">
              <p class="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                <ArrowUpFromLine class="w-3 h-3" aria-hidden="true" />
                Ingresos
              </p>
              <p class="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(todayCashbox.total_income) }}
              </p>
            </div>
            <div class="bg-[var(--color-surface)] p-3 rounded-lg shadow-sm border border-default-soft">
              <p class="text-red-500 dark:text-red-400 text-xs flex items-center gap-1">
                <ArrowDownToLine class="w-3 h-3" aria-hidden="true" />
                Gastos
              </p>
              <p class="text-lg font-semibold text-red-500 dark:text-red-400">
                {{ formatCurrency(todayCashbox.total_expense) }}
              </p>
            </div>
            <div class="bg-blue-600 p-3 rounded-lg shadow text-white">
              <p class="text-blue-100 text-xs flex items-center gap-1">
                <BadgeDollarSign class="w-3 h-3" aria-hidden="true" />
                Cierre
              </p>
              <p class="text-lg font-semibold">
                {{ formatCurrency(todayCashbox.closing_balance) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else
          class="p-6 rounded-xl border text-center"
          style="background: var(--color-surface-soft); border-color: var(--color-border);"
        >
          <p class="font-semibold mb-4" style="color: var(--color-text-muted);">Caja cerrada</p>
          <form
            class="flex gap-2 max-w-sm mx-auto items-end"
            @submit.prevent="abrirCaja"
          >
            <BaseInput
              v-model="nuevoSaldo"
              type="number"
              placeholder="Saldo inicial..."
              required
              class="flex-1"
            />
            <BaseButton variant="primary" type="submit">
              <Unlock class="w-4 h-4" aria-hidden="true" />
              Abrir
            </BaseButton>
          </form>
        </div>

        <div>
          <h3 class="font-semibold mb-3 text-default">Historial</h3>
          <div class="table-wrap">
            <table class="w-full text-sm min-w-[600px]">
              <thead class="table-head">
                <tr>
                  <th>Fecha</th>
                  <th class="!text-right">Apertura</th>
                  <th class="!text-right">Ingresos</th>
                  <th class="!text-right">Gastos</th>
                  <th class="!text-right">Cierre</th>
                </tr>
              </thead>
              <tbody class="bg-[var(--color-surface)]">
                <tr v-for="cb in cashboxes" :key="cb.id" class="table-row">
                  <td class="font-medium">{{ cb.date }}</td>
                  <td class="text-right">{{ formatCurrency(cb.opening_balance) }}</td>
                  <td class="text-right text-emerald-600">
                    {{ formatCurrency(cb.total_income) }}
                  </td>
                  <td class="text-right text-red-600">
                    {{ formatCurrency(cb.total_expense) }}
                  </td>
                  <td class="text-right font-semibold">
                    {{ formatCurrency(cb.closing_balance) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseModal v-model="showExpenseModal" title="Registrar Gasto" size="sm">
      <form id="expense-form" class="space-y-4" @submit.prevent="guardarGasto">
        <BaseInput
          v-model="expenseForm.concepto"
          label="Concepto"
          placeholder="Ej: Luz"
          required
        />
        <BaseInput
          v-model.number="expenseForm.monto"
          type="number"
          label="Monto"
          placeholder="0"
          required
        />
        <BaseInput
          v-model="expenseForm.fecha"
          type="date"
          label="Fecha"
          required
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="showExpenseModal = false">
          <X class="w-4 h-4" aria-hidden="true" />
          Cancelar
        </BaseButton>
        <BaseButton variant="danger-solid" type="submit" form="expense-form">
          <Check class="w-4 h-4" aria-hidden="true" />
          Guardar
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { BaseButton, BaseInput, BaseCard, BaseModal } from "@/components/ui";
import { SWAL_COLORS } from "@/lib/colors";
import {
  Home,
  Lock,
  Unlock,
  Calendar,
  Wallet,
  BadgeDollarSign,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
  Check,
} from "lucide-vue-next";
const router = useRouter();
const cashboxes = ref([]);
const todayCashbox = ref(null);
const loading = ref(true);
const nuevoSaldo = ref("");
const showExpenseModal = ref(false);
const expenseForm = reactive({ concepto: "", monto: "", fecha: dayjs().format("YYYY-MM-DD") });
const fetchCashboxes = async () => {
  try {
    const { data } = await api.get("/dailyCashbox");
    cashboxes.value = data;
    const hoy = dayjs().format("YYYY-MM-DD");
    todayCashbox.value = cashboxes.value.find((cb) => cb.date.substring(0, 10) === hoy);
  } catch (error) {
    console.error(error);

    // Manejo de errores de red
    if (!error.response) {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          text: "No se pudo cargar la información de caja. Verifica tu conexión.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor para cargar la caja.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      }
    }
  } finally {
    loading.value = false;
  }
};
const abrirCaja = async () => {
  try {
    const { data } = await api.post("/dailyCashbox", {
      date: dayjs().format("YYYY-MM-DD"),
      opening_balance: parseFloat(nuevoSaldo.value),
    });
    cashboxes.value.unshift(data);
    todayCashbox.value = data;
    nuevoSaldo.value = "";
    Swal.fire("Éxito", "Caja abierta", "success");
  } catch (error) {
    // Manejo de errores de red
    if (!error.response) {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          text: "No se pudo abrir la caja. Verifica tu conexión e intenta nuevamente.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor para abrir la caja.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      }
    } else if (error.response.status === 422) {
      Swal.fire("Aviso", "Ya existe caja hoy", "warning").then(() => fetchCashboxes());
    } else if (error.response.status >= 500) {
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "Ocurrió un error en el servidor. Intenta nuevamente más tarde.",
        confirmButtonColor: SWAL_COLORS.danger,
      });
    } else {
      Swal.fire("Error", "No se pudo abrir la caja", "error");
    }
  }
};
const abrirModalGasto = () => {
  expenseForm.concepto = "";
  expenseForm.monto = "";
  expenseForm.fecha = dayjs().format("YYYY-MM-DD");
  showExpenseModal.value = true;
};
const guardarGasto = async () => {
  try {
    await api.post("/gastos", {
      concepto: expenseForm.concepto,
      monto: expenseForm.monto,
      fecha: expenseForm.fecha,
    });
    showExpenseModal.value = false;
    await fetchCashboxes();
    Swal.fire("Listo", "Gasto registrado correctamente", "success");
  } catch (error) {
    if (!error.response) {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          text: "No se pudo registrar el gasto. Verifica tu conexión.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor para registrar el gasto.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      }
    } else {
      Swal.fire("Error", "No se pudo registrar el gasto", "error");
    }
  }
};
const confirmarCierre = () => {
  if (!todayCashbox.value) return;
  const { opening_balance, total_income, total_expense, closing_balance } = todayCashbox.value;
  Swal.fire({
    title: "Arqueo",
    html: `<div class='text-left text-sm font-mono'>Inicial: ${formatCurrency(opening_balance)}<br>+Ingresos: ${formatCurrency(total_income)}<br>-Gastos: ${formatCurrency(total_expense)}<hr><b>=Total: ${formatCurrency(closing_balance)}</b></div>`,
    showCancelButton: true,
    confirmButtonText: "Cerrar Turno",
  }).then((r) => {
    if (r.isConfirmed) router.push("/Menu");
  });
};
const formatCurrency = (val) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);
onMounted(() => fetchCashboxes());
</script>
