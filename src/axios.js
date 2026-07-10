import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import Swal from "sweetalert2";
import { SWAL_COLORS } from "@/lib/colors";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000, // 30 segundos de timeout
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Agrega el token a cada request si existe
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Maneja errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo de error 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "/login") {
        // Ya estamos en la página de login, no hacer nada
        return Promise.reject(error);
      }
      const auth = useAuthStore();
      auth.logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Manejo de errores de red (sin conexión a internet)
    if (!error.response) {
      // Error de red - sin respuesta del servidor
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        // Timeout
        Swal.fire({
          icon: "warning",
          title: "Tiempo de espera agotado",
          text: "La solicitud tardó demasiado tiempo. Por favor, verifica tu conexión e intenta nuevamente.",
          confirmButtonColor: SWAL_COLORS.info,
        });
      } else if (!navigator.onLine) {
        // Sin conexión a internet
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          text: "No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentar.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        // Otro error de red (servidor no disponible, DNS, etc.)
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      }
      return Promise.reject(error);
    }

    // Manejo de otros errores HTTP
    const status = error.response.status;

    if (status >= 500) {
      // Errores del servidor (500, 502, 503, etc.)
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "Ocurrió un error en el servidor. Por favor, intenta nuevamente más tarde.",
        confirmButtonColor: SWAL_COLORS.danger,
      });
    } else if (status === 402) {
      const currentPath = window.location.pathname;

      if (currentPath !== "/subscription") {
        Swal.fire({
          icon: "warning",
          title: "Suscripción requerida",
          text: error.response.data?.message ?? "Tu suscripción está vencida o inactiva. Renueva tu plan para continuar.",
          confirmButtonColor: SWAL_COLORS.warning,
        }).then(() => {
          window.location.href = "/subscription";
        });
      }
    } else if (status === 403) {
      // Prohibido
      Swal.fire({
        icon: "warning",
        title: "Acceso denegado",
        text: "No tienes permisos para realizar esta acción.",
        confirmButtonColor: SWAL_COLORS.warning,
      });
    } else if (status === 404) {
      // No encontrado
      Swal.fire({
        icon: "info",
        title: "No encontrado",
        text: "El recurso solicitado no fue encontrado.",
        confirmButtonColor: SWAL_COLORS.info,
      });
    }

    return Promise.reject(error);
  },
);

export default api;
