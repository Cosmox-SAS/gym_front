<template>
  <div class="page-layout config-page">
    <div class="max-w-7xl mx-auto">
      <div class="config-hero animate-fade-in-up">
        <div>
          <div class="flex items-center gap-2 mb-3">
            <span class="config-status-dot" />
            <span class="section-label">Centro de configuracion</span>
          </div>
          <h1 class="config-title">Configuracion</h1>
          <p class="config-subtitle">
            Ajusta la experiencia de bienvenida, el enlace comunitario y el registro publico del gimnasio.
          </p>
        </div>

        <router-link to="/Menu" class="btn btn-dark inline-flex items-center justify-center gap-2">
          <Home class="w-4 h-4" aria-hidden="true" />
          <span>Inicio</span>
        </router-link>
      </div>

      <div v-if="loading" class="config-loading animate-fade-in-up">
        <Loader2 class="w-5 h-5 animate-spin" aria-hidden="true" />
        <span>Cargando configuracion...</span>
      </div>

      <form v-else @submit.prevent="guardarConfiguracion" class="config-grid animate-fade-in-up">
        <section class="config-panel config-panel-main">
          <div class="config-section-head">
            <div class="config-section-icon config-section-icon-primary">
              <Mail class="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2>Bienvenida a clientes</h2>
              <p>Contenido que se enviara automaticamente por correo a los nuevos registros.</p>
            </div>
          </div>

          <div class="config-fields">
            <label class="config-field">
              <span class="config-label">
                <Clock class="w-4 h-4" aria-hidden="true" />
                Horarios de atencion
              </span>
              <textarea
                v-model="form.horarios"
                rows="4"
                class="field-input config-textarea"
                placeholder="Ej: Lunes a Viernes: 6:00 AM - 10:00 PM&#10;Sabados: 8:00 AM - 4:00 PM"
              />
              <span class="config-help">Aparecera en el correo de bienvenida y ayuda a orientar a nuevos clientes.</span>
            </label>

            <label class="config-field">
              <span class="config-label">
                <FileText class="w-4 h-4" aria-hidden="true" />
                Normas y politicas
              </span>
              <textarea
                v-model="form.politicas"
                rows="7"
                class="field-input config-textarea"
                placeholder="Ej: 1. Uso obligatorio de toalla.&#10;2. Ordenar las pesas al terminar.&#10;3. No ingresar alimentos."
              />
              <span class="config-help">Usa lineas cortas para que el mensaje sea facil de leer desde el celular.</span>
            </label>

            <label class="config-field">
              <span class="config-label config-label-success">
                <MessageCircle class="w-4 h-4" aria-hidden="true" />
                Grupo de WhatsApp
              </span>
              <input
                v-model="form.url_grupo_whatsapp"
                type="url"
                class="field-input config-input"
                placeholder="https://chat.whatsapp.com/ExampleCode..."
              />
              <span class="config-help">
                Si lo dejas vacio, el boton de WhatsApp no aparecera en el correo.
              </span>
            </label>
          </div>

          <div class="config-actions">
            <button
              type="submit"
              class="btn btn-primary config-save-btn"
              :disabled="guardando"
            >
              <Loader2 v-if="guardando" class="w-5 h-5 animate-spin" aria-hidden="true" />
              <Save v-else class="w-5 h-5" aria-hidden="true" />
              <span>{{ guardando ? "Guardando..." : "Guardar cambios" }}</span>
            </button>
          </div>
        </section>

        <aside class="config-side">
          <section class="config-panel qr-panel">
            <div class="config-section-head">
              <div class="config-section-icon config-section-icon-success">
                <QrCode class="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2>Registro publico</h2>
                <p>QR para que tus clientes se registren desde recepcion.</p>
              </div>
            </div>

            <div v-if="qrImageUrl" class="qr-card">
              <div class="qr-frame">
                <img :src="qrImageUrl" alt="Codigo QR de Registro" class="qr-image" />
              </div>

              <div class="qr-actions">
                <button
                  type="button"
                  @click="descargarImagen"
                  class="btn btn-dark qr-action-btn"
                >
                  <Download class="w-4 h-4" aria-hidden="true" />
                  Descargar
                </button>
                <button
                  type="button"
                  @click="imprimirQR"
                  class="btn btn-primary qr-action-btn"
                >
                  <Printer class="w-4 h-4" aria-hidden="true" />
                  Imprimir
                </button>
              </div>

              <a
                :href="registrationUrl"
                target="_blank"
                class="qr-link"
              >
                <ExternalLink class="w-3.5 h-3.5" aria-hidden="true" />
                Probar enlace de registro
              </a>
            </div>

            <div v-else class="qr-empty">
              <QrCode class="w-8 h-8" aria-hidden="true" />
              <span>QR no disponible</span>
            </div>
          </section>

          <section class="config-panel config-note">
            <div class="config-note-icon">
              <Settings class="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3>Recomendacion</h3>
              <p>
                Manten horarios y normas actualizados antes de compartir el QR en recepcion o redes.
              </p>
            </div>
          </section>
        </aside>
      </form>
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

onMounted(async () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const gimnasioId = user.gimnasio_id;

      if (gimnasioId) {
        const baseUrl = window.location.origin;
        registrationUrl.value = `${baseUrl}/public-register/${gimnasioId}`;
        qrImageUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl.value)}&margin=10`;
      }
    }

    const { data } = await api.get("/gimnasio/config");

    form.value.horarios = data.horarios || "";
    form.value.politicas = data.politicas || "";
    form.value.url_grupo_whatsapp = data.url_grupo_whatsapp || "";
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo cargar la informacion del gimnasio", "error");
  } finally {
    loading.value = false;
  }
});

const guardarConfiguracion = async () => {
  guardando.value = true;
  try {
    await api.put("/gimnasio/config", form.value);

    Swal.fire({
      title: "Guardado",
      text: "La configuracion de bienvenida ha sido actualizada.",
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
    window.open(qrImageUrl.value, "_blank");
  }
};

const imprimirQR = () => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return alert("Por favor, permite ventanas emergentes.");

  const htmlContent = `
    <html>
      <head>
        <title>Codigo QR de Registro</title>
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
          <h1>Registrate aqui</h1>
          <p>Escanea este codigo para crear tu cuenta en el gimnasio.</p>
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
.config-page {
  color: var(--color-text);
}

.config-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.config-status-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #34d399;
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.85);
  flex-shrink: 0;
}

.config-title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: 0;
  color: var(--dash-title, var(--color-text));
}

.config-subtitle {
  max-width: 42rem;
  margin-top: 0.65rem;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.config-loading {
  min-height: 16rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 700;
}

.config-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 24rem);
  gap: 1rem;
  align-items: start;
}

.config-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.config-panel-main {
  padding: 1.35rem;
}

.config-side {
  display: grid;
  gap: 1rem;
}

.config-section-head {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.config-section-head h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 850;
  color: var(--color-text);
}

.config-section-head p {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--color-text-muted);
}

.config-section-icon,
.config-note-icon {
  width: 2.45rem;
  height: 2.45rem;
  border-radius: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.config-section-icon-primary {
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.12);
}

.config-section-icon-success,
.config-note-icon {
  color: #059669;
  background: rgba(16, 185, 129, 0.12);
}

.config-fields {
  display: grid;
  gap: 1rem;
  margin-top: 1.1rem;
}

.config-field {
  display: grid;
  gap: 0.45rem;
}

.config-label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.config-label-success {
  color: #059669;
}

.config-textarea {
  min-height: 7.5rem;
  resize: vertical;
  padding: 0.85rem;
  line-height: 1.55;
}

.config-input {
  min-height: 2.85rem;
  font-weight: 650;
}

.config-help {
  color: var(--color-text-subtle);
  font-size: 0.76rem;
  line-height: 1.35;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--color-border);
}

.config-save-btn {
  min-height: 2.9rem;
  padding-inline: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.qr-panel {
  padding: 1.1rem;
}

.qr-card {
  margin-top: 1rem;
  display: grid;
  gap: 0.9rem;
}

.qr-frame {
  display: grid;
  place-items: center;
  padding: 1rem;
  border-radius: 0.9rem;
  border: 1px dashed var(--color-border-strong);
  background: var(--color-surface-soft);
}

.qr-image {
  width: min(100%, 13.5rem);
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 0.5rem;
  background: white;
  padding: 0.4rem;
}

.qr-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.qr-action-btn {
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-size: 0.8rem;
}

.qr-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: #2563eb;
  font-size: 0.82rem;
  font-weight: 750;
}

.qr-empty {
  min-height: 13rem;
  display: grid;
  place-items: center;
  gap: 0.5rem;
  color: var(--color-text-subtle);
  border: 1px dashed var(--color-border-strong);
  border-radius: 0.9rem;
  margin-top: 1rem;
}

.config-note {
  padding: 1rem;
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.config-note h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 850;
}

.config-note p {
  margin: 0.25rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.45s ease-out;
}

:global(.dark) .config-panel {
  background: var(--color-surface-muted);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
}

:global(.dark) .qr-frame {
  background: var(--color-overlay);
  border-color: rgba(255, 255, 255, 0.16);
}

@media (max-width: 1023px) {
  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-side {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .config-hero {
    flex-direction: column;
  }

  .config-panel-main,
  .qr-panel,
  .config-note {
    padding: 1rem;
  }

  .config-actions,
  .config-save-btn {
    width: 100%;
  }

  .config-actions {
    justify-content: stretch;
  }

  .qr-actions {
    grid-template-columns: 1fr;
  }
}
</style>
