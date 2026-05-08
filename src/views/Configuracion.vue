<template>
  <div class="page-layout">
    <div class="max-w-3xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div class="flex items-center gap-3">
          <Settings class="w-8 h-8 text-default" aria-hidden="true" />
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-default tracking-tight">Configuración</h1>
            <p class="text-sm text-subtle mt-0.5">Personalización del gimnasio</p>
          </div>
        </div>
        <router-link to="/Menu" class="btn btn-dark inline-flex items-center justify-center gap-2">
          <Home class="w-4 h-4" aria-hidden="true" />
          <span>Inicio</span>
        </router-link>
      </div>

      <div class="bg-[var(--color-surface)] rounded-2xl shadow-xl p-6 sm:p-8 text-default animate-fade-in-up border border-default-soft">
        <div class="border-b border-default-soft pb-4 mb-6">
          <h2 class="text-xl font-bold flex items-center gap-2" style="color: var(--color-text);">
            <Mail class="w-5 h-5" aria-hidden="true" />
            Personalización de Bienvenida
          </h2>
          <p class="text-sm text-muted">
            Esta información se enviará automáticamente por correo a los nuevos clientes.
          </p>
        </div>

        <div v-if="loading" class="text-center py-10">
          <p class="text-blue-600 font-bold animate-pulse flex items-center justify-center gap-2">
            <Loader2 class="w-5 h-5 animate-spin" aria-hidden="true" />
            Cargando configuración...
          </p>
        </div>

        <form v-else @submit.prevent="guardarConfiguracion" class="space-y-6">
          <div>
            <label class="block text-sm font-bold text-muted mb-2 uppercase tracking-wide flex items-center gap-2">
              <Clock class="w-4 h-4" aria-hidden="true" />
              Horarios de Atención
            </label>
            <div class="relative">
              <textarea
                v-model="form.horarios"
                rows="3"
                class="field-input rounded-xl p-3"
                placeholder="Ej: Lunes a Viernes: 6:00 AM - 10:00 PM&#10;Sábados: 8:00 AM - 4:00 PM"
              ></textarea>

            </div>
            <p class="text-xs text-muted mt-1">Aparecerá en el correo de bienvenida.</p>
          </div>

          <div>
            <label class="block text-sm font-bold text-muted mb-2 uppercase tracking-wide flex items-center gap-2">
              <FileText class="w-4 h-4" aria-hidden="true" />
              Normas y Políticas
            </label>
            <div class="relative">
              <textarea
                v-model="form.politicas"
                rows="5"
                class="field-input rounded-xl p-3"
                placeholder="Ej: 1. Uso obligatorio de toalla.&#10;2. Ordenar las pesas al terminar.&#10;3. No ingresar alimentos."
              ></textarea>

            </div>
          </div>

          <div>
            <label
              class="block text-sm font-bold mb-2 uppercase tracking-wide flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
            >
              <MessageCircle class="w-4 h-4" aria-hidden="true" />
              Enlace Grupo WhatsApp
            </label>
            <input
              v-model="form.url_grupo_whatsapp"
              type="url"
              class="field-input font-medium"
              placeholder="https://chat.whatsapp.com/ExampleCode..."
            />
            <p class="text-xs text-muted mt-1">
              Pega aquí el "Enlace de invitación" de tu grupo. Si lo dejas vacío, no aparecerá el
              botón en el correo.
            </p>
          </div>

          <!-- SECCIÓN CÓDIGO QR -->
          <div class="border-t pt-6" v-if="qrImageUrl">
            <h3 class="text-lg font-bold text-default mb-2 flex items-center gap-2">
              <QrCode class="w-5 h-5" aria-hidden="true" />
              Código QR de Registro
            </h3>
            <p class="text-sm text-muted mb-4">
              Imprime este código y colócalo en la recepción. Los clientes podrán escanearlo para
              registrarse ellos mismos.
            </p>

            <div
              class="flex flex-col sm:flex-row items-center gap-6 bg-[var(--color-surface-soft)] p-4 rounded-xl border border-dashed border-default-soft"
            >
              <div class="bg-[var(--color-surface)] p-2 rounded shadow-sm border border-default-soft">
                <img
                  :src="qrImageUrl"
                  alt="Código QR de Registro"
                  class="w-40 h-40 object-contain"
                />
              </div>

              <div class="flex flex-col gap-3 w-full sm:w-auto">
                <button
                  @click="descargarImagen"
                  class="btn btn-dark flex items-center justify-center gap-2 text-sm"
                >
                  <Download class="w-4 h-4" aria-hidden="true" />
                  Descargar Imagen
                </button>
                <button
                  @click="imprimirQR"
                  class="btn btn-primary flex items-center justify-center gap-2 text-sm"
                >
                  <Printer class="w-4 h-4" aria-hidden="true" />
                  Imprimir / Guardar PDF
                </button>
                <a
                  :href="registrationUrl"
                  target="_blank"
                  class="text-blue-600 underline text-sm text-center mt-2 inline-flex items-center justify-center gap-1"
                >
                  <ExternalLink class="w-3 h-3" aria-hidden="true" />
                  Probar enlace de registro
                </a>
              </div>
            </div>
          </div>

          <div class="pt-6 border-t flex justify-end">
            <button
              type="submit"
              class="btn btn-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2"
              :disabled="guardando"
            >
              <Loader2 v-if="guardando" class="w-5 h-5 animate-spin" aria-hidden="true" />
              <Save v-else class="w-5 h-5" aria-hidden="true" />
              <span>{{ guardando ? "Guardando..." : "Guardar Cambios" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import api from "@/axios";
import Swal from "sweetalert2";
import {
  Settings,
  Home,
  Mail,
  Clock,
  FileText,
  MessageCircle,
  QrCode,
  Download,
  Printer,
  ExternalLink,
  Save,
  Loader2,
} from "lucide-vue-next";

const loading = ref(true);
const guardando = ref(false);

const form = ref({
  horarios: "",
  politicas: "",
  url_grupo_whatsapp: "",
});

const qrImageUrl = ref("");
const registrationUrl = ref("");

// Cargar la configuración actual al entrar
onMounted(async () => {
  try {
    // 1. Obtener ID del gimnasio del usuario logueado
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const gimnasioId = user.gimnasio_id;

      if (gimnasioId) {
        const baseUrl = window.location.origin;
        registrationUrl.value = `${baseUrl}/public-register/${gimnasioId}`;
        // Generar QR usando API confiable
        qrImageUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl.value)}&margin=10`;
      }
    }
    // Usamos el endpoint que ya tienes en GimnasioController@show
    const { data } = await api.get("/gimnasio/config");

    // Rellenamos el formulario con lo que venga de la BD
    form.value.horarios = data.horarios || "";
    form.value.politicas = data.politicas || "";
    form.value.url_grupo_whatsapp = data.url_grupo_whatsapp || "";
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo cargar la información del gimnasio", "error");
  } finally {
    loading.value = false;
  }
});

// Guardar cambios
const guardarConfiguracion = async () => {
  guardando.value = true;
  try {
    // Enviamos al endpoint que creaste en el paso anterior (Backend)
    const { data } = await api.put("/gimnasio/config", form.value);

    Swal.fire({
      title: "¡Guardado!",
      text: "La configuración de bienvenida ha sido actualizada.",
      icon: "success",
      confirmButtonColor: "#2563EB",
    });
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Hubo un problema al guardar los cambios.", "error");
  } finally {
    guardando.value = false;
  }
};
// Descargar imagen forzando descarga
const descargarImagen = async () => {
  if (!qrImageUrl.value) return;
  try {
    const response = await fetch(qrImageUrl.value);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-registro-gimnasio.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar imagen:", error);
    // Fallback
    window.open(qrImageUrl.value, "_blank");
  }
};

// Imprimir QR (que permite guardar como PDF)
const imprimirQR = () => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return alert("Por favor, permite ventanas emergentes.");

  const htmlContent = `
    <html>
      <head>
        <title>Código QR de Registro</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 50px; }
          .container { border: 2px dashed #333; display: inline-block; padding: 40px; border-radius: 20px; }
          h1 { color: #2563EB; margin-bottom: 10px; }
          p { color: #666; font-size: 18px; margin-bottom: 30px; }
          img { width: 300px; height: 300px; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>¡Regístrate Aquí!</h1>
          <p>Escanea este código para crear tu cuenta en el gimnasio.</p>
          <img src="${qrImageUrl.value}" />
          <div class="footer">CosmoGym - Registro de Clientes</div>
        </div>
        <script>
          window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); } };
        <\/script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
</script>

<style scoped>
/* Animación suave de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}
</style>
