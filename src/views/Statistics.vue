<template>
  <div class="page-layout">
    <div class="max-w-7xl mx-auto space-y-6">
      <BaseCard title="Estadísticas" subtitle="Reportes y análisis del gimnasio">
        <template #actions>
          <router-link to="/Menu" class="btn btn-dark inline-flex items-center justify-center gap-2">
            <Home class="w-4 h-4" aria-hidden="true" />
            <span>Inicio</span>
          </router-link>
        </template>

        <p v-if="loading" class="text-center py-16 text-xl text-subtle animate-pulse flex items-center justify-center gap-2">
          <Loader2 class="w-6 h-6 animate-spin" aria-hidden="true" />
          Cargando análisis de datos...
        </p>
      </BaseCard>

      <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BaseCard
          v-for="chart in chartCards"
          :key="chart.key"
        >
          <template #header>
            <h2 class="page-title flex items-center gap-2">
              <component :is="chart.icon" class="w-5 h-5" aria-hidden="true" />
              <span>{{ chart.title }}</span>
            </h2>
          </template>
          <div
            class="flex-1 relative min-h-[300px]"
            :class="chart.center && 'flex justify-center'"
          >
            <component
              :is="chart.component"
              v-if="chart.data.value"
              :data="chart.data.value"
              :options="chart.options"
            />
            <p v-else class="text-muted text-center mt-10">{{ chart.emptyText }}</p>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";

// --- CHART.JS IMPORTS ---
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "vue-chartjs";
import { CHART_COLORS } from "@/lib/colors";
import { BaseCard } from "@/components/ui";
import {
  Home,
  Loader2,
  TrendingUp,
  PieChart,
  ShoppingBag,
  Trophy,
} from "lucide-vue-next";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const loading = ref(true);
const incomeData = ref(null);
const pieData = ref(null);
const productSalesData = ref(null);
const topProductsData = ref(null);

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
const barHorizontalOptions = {
  ...barOptions,
  indexAxis: "y",
};

// Configuración declarativa de las 4 gráficas del dashboard.
const chartCards = [
  {
    key: "income",
    title: "Ingresos (Últimos 7 días)",
    icon: TrendingUp,
    component: Bar,
    data: incomeData,
    options: barOptions,
    emptyText: "No hay datos recientes.",
  },
  {
    key: "pie",
    title: "Distribución de Clientes",
    icon: PieChart,
    component: Doughnut,
    data: pieData,
    options: pieOptions,
    emptyText: "No hay datos de membresías.",
    center: true,
  },
  {
    key: "productSales",
    title: "Ventas Productos (Últimos 7 días)",
    icon: ShoppingBag,
    component: Bar,
    data: productSalesData,
    options: barOptions,
    emptyText: "No hay ventas recientes.",
  },
  {
    key: "topProducts",
    title: "Top Productos Más Vendidos",
    icon: Trophy,
    component: Bar,
    data: topProductsData,
    options: barHorizontalOptions,
    emptyText: "No hay datos de productos.",
  },
];

onMounted(async () => {
  try {
    // 1. Cargar Estadísticas de Membresías (Para la Dona)
    const { data: statsData } = await api.get("/memberships/stats");

    pieData.value = {
      labels: ["Activos", "Vencidos", "Por Pagar"],
      datasets: [
        {
          backgroundColor: [CHART_COLORS.active, CHART_COLORS.expired, CHART_COLORS.pending],
          data: [statsData.active, statsData.expired, statsData.inactive_unpaid],
        },
      ],
    };

    // 2. Cargar Historial de Pagos (Para las Barras)
    const end = dayjs().format("YYYY-MM-DD");
    const start = dayjs().subtract(6, "days").format("YYYY-MM-DD");
    const { data: historyData } = await api.get(
      `/payments/history?start_date=${start}&end_date=${end}`,
    );

    procesarDatosIngresos(historyData.historial, start);
  } catch (error) {
    console.error("Error cargando estadísticas principales:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar las estadísticas de ingresos/membresías.",
    });
  }

  // 3. Cargar Ventas de Productos (Independiente)
  try {
    const end = dayjs().format("YYYY-MM-DD");
    const start = dayjs().subtract(6, "days").format("YYYY-MM-DD");
    const { data: salesResponse } = await api.get("/supplementSale");
    procesarVentasProductos(salesResponse.data, start);
  } catch (error) {
    console.error("Error cargando ventas de productos:", error);
    // No bloqueamos la UI, solo mostramos error en consola o un toast sutil
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "No se pudieron cargar las ventas de productos",
      showConfirmButton: false,
      timer: 3000,
    });
  } finally {
    loading.value = false;
  }
});

const procesarDatosIngresos = (historial, startDate) => {
  const ingresosPorFecha = {};

  historial.forEach((p) => {
    const fechaLocal = dayjs(p.paid_at).format("YYYY-MM-DD");
    if (!ingresosPorFecha[fechaLocal]) ingresosPorFecha[fechaLocal] = 0;
    ingresosPorFecha[fechaLocal] += Number(p.amount);
  });

  const dias = [];
  const montos = [];

  for (let i = 0; i < 7; i++) {
    const fechaObj = dayjs(startDate).add(i, "day");
    const fechaKey = fechaObj.format("YYYY-MM-DD");
    const label = fechaObj
      .toDate()
      .toLocaleDateString("es-CO", { weekday: "short", day: "numeric" });

    dias.push(label);
    montos.push(ingresosPorFecha[fechaKey] || 0);
  }

  incomeData.value = {
    labels: dias,
    datasets: [
      { label: "Ingresos ($)", backgroundColor: CHART_COLORS.income, borderRadius: 5, data: montos },
    ],
  };
};

const procesarVentasProductos = (sales, startDate) => {
  // 1. Gráfica de Ventas Diarias (Últimos 7 días)
  const ventasPorFecha = {};
  // 2. Top Productos (Global o en rango, usaremos Global para este ejemplo o rango si prefieres)
  const productosVendidos = {};

  const startObj = dayjs(startDate);

  sales.forEach((sale) => {
    const saleDate = dayjs(sale.created_at);

    // Solo contar si está en el rango de los últimos 7 días para la gráfica de tiempo
    if (saleDate.isAfter(startObj.subtract(1, "day"))) {
      // Restamos 1 para asegurar incluir el día inicial
      const fechaLocal = saleDate.format("YYYY-MM-DD");
      if (!ventasPorFecha[fechaLocal]) ventasPorFecha[fechaLocal] = 0;
      ventasPorFecha[fechaLocal] += Number(sale.total);
    }

    // Contar productos para el Top (podemos hacerlo histórico o semanal, haré histórico para mas data)
    const productName = sale.product?.name || "Desconocido";
    if (!productosVendidos[productName]) productosVendidos[productName] = 0;
    productosVendidos[productName] += Number(sale.quantity);
  });

  // --- PREPARAR DATOS VENTAS DIARIAS ---
  const dias = [];
  const montos = [];

  for (let i = 0; i < 7; i++) {
    const fechaObj = dayjs(startDate).add(i, "day");
    const fechaKey = fechaObj.format("YYYY-MM-DD");
    const label = fechaObj
      .toDate()
      .toLocaleDateString("es-CO", { weekday: "short", day: "numeric" });

    dias.push(label);
    montos.push(ventasPorFecha[fechaKey] || 0);
  }

  productSalesData.value = {
    labels: dias,
    datasets: [
      { label: "Ventas Productos ($)", backgroundColor: CHART_COLORS.productSales, borderRadius: 5, data: montos },
    ],
  };

  // --- PREPARAR DATOS TOP PRODUCTOS ---
  // Ordenar y tomar los top 5
  const topOrdenados = Object.entries(productosVendidos)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  topProductsData.value = {
    labels: topOrdenados.map(([name]) => name),
    datasets: [
      {
        label: "Unidades Vendidas",
        backgroundColor: CHART_COLORS.palette,
        data: topOrdenados.map(([, cant]) => cant),
      },
    ],
  };
};
</script>
