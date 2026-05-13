<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          v-for="(label, i) in labels"
          :key="i"
          class="photo-slot"
        >
        <div class="photo-frame">
          <img
            v-if="photos[i]?.photo"
            :src="photos[i].photo"
            :alt="`Foto ${label}`"
            class="photo-img"
          />
          <div v-else class="photo-empty">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-[10px] text-subtle mt-1.5">Sin foto</span>
          </div>
          <span class="photo-tag">{{ label }}</span>
          <span v-if="photos[i]?.taken_at" class="photo-date">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatDate(photos[i].taken_at) }}
          </span>
          <button
            v-if="photos[i]?.photo"
            type="button"
            class="photo-remove"
            aria-label="Quitar foto"
            @click="removePhoto(i)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="photo-actions">
          <button
            type="button"
            class="photo-btn photo-btn-primary"
            :disabled="uploadingIndex === i"
            @click="openCamera(i)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Cámara
          </button>
          <button
            type="button"
            class="photo-btn photo-btn-secondary"
            :disabled="uploadingIndex === i"
            @click="triggerFileInput(i)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Subir
          </button>
          <input
            :ref="(el) => (fileInputs[i] = el)"
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            class="hidden"
            @change="onFileSelected($event, i)"
          />
        </div>
        <p v-if="uploadingIndex === i" class="photo-feedback photo-feedback-info">
          Preparando foto...
        </p>
        <p v-if="slotErrors[i]" class="photo-feedback photo-feedback-error">
          {{ slotErrors[i] }}
        </p>
        <p v-else-if="slotSuccess[i]" class="photo-feedback photo-feedback-success">
          {{ slotSuccess[i] }}
        </p>
      </div>
    </div>
    <p v-if="globalSuccessMessage" class="photo-global-success">
      {{ globalSuccessMessage }}
    </p>

    <!-- Camera modal overlay -->
    <Transition name="cam-fade">
      <div v-if="cameraOpen" class="cam-overlay" @click.self="closeCamera">
        <div class="cam-panel">
          <div class="cam-header">
            <h3 class="text-sm font-bold text-default">Tomar foto — {{ labels[cameraIndex] }}</h3>
            <button type="button" class="cam-close" aria-label="Cerrar" @click="closeCamera">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="cam-body">
            <div v-if="cameraError" class="cam-error">
              <svg class="w-8 h-8 mb-2 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-default text-center">{{ cameraError }}</p>
            </div>
            <video
              v-show="!cameraError"
              ref="videoEl"
              class="cam-video"
              autoplay
              playsinline
              muted
            />
          </div>
          <div class="cam-footer">
            <button type="button" class="photo-btn photo-btn-secondary" @click="closeCamera">
              Cancelar
            </button>
            <button
              type="button"
              class="photo-btn photo-btn-capture"
              :disabled="!!cameraError"
              @click="capturePhoto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capturar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from "vue";
import { formatAppDate } from "@/lib/dates";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [null, null, null],
  },
  labels: {
    type: Array,
    default: () => ["Inicial", "Progreso", "Actual"],
  },
  memberId: {
    type: [Number, String],
    default: null,
  },
  identification: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const labels = computed(() => props.labels);

// Normaliza: acepta strings (formato viejo), objetos { photo, taken_at } o null.
function normalizeEntry(value) {
  if (!value) return null;
  if (typeof value === "string") return { photo: value, taken_at: null };
  if (typeof value === "object" && (value.photo || value.path || value.file)) {
    return {
      photo: value.photo || "",
      path: value.path || "",
      taken_at: value.taken_at || null,
      file: value.file || null,
      pending: !!value.pending,
    };
  }
  return null;
}

const photos = computed(() => {
  const v = props.modelValue || [];
  return labels.value.map((_, i) => normalizeEntry(v[i]));
});

function setPhoto(index, data) {
  const next = [...photos.value];
  next[index] = data
    ? {
        photo: typeof data === "string" ? data : data.photo,
        path: typeof data === "string" ? "" : data.path || "",
        taken_at: typeof data === "string" ? new Date().toISOString() : data.taken_at,
        file: typeof data === "string" ? null : data.file || null,
        pending: typeof data === "string" ? false : !!data.pending,
      }
    : null;
  emit("update:modelValue", next);
}

function removePhoto(index) {
  const previous = photos.value[index];
  if (previous?.pending && previous.photo?.startsWith("blob:")) {
    URL.revokeObjectURL(previous.photo);
  }
  setPhoto(index, null);
}

function formatDate(iso) {
  return formatAppDate(iso, "");
}

// ===== File upload =====
const fileInputs = ref([]);
const slotErrors = ref(["", "", ""]);
const slotSuccess = ref(["", "", ""]);
const uploadingIndex = ref(null);
const globalSuccessMessage = ref("");

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"];
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg"];
const MAX_FILE_SIZE = 3 * 1024 * 1024;

function triggerFileInput(index) {
  clearMessages(index);
  const el = fileInputs.value[index];
  if (el) el.click();
}

async function onFileSelected(event, index) {
  const file = event.target.files?.[0];
  if (!file) return;
  clearMessages(index);
  const validationError = validateImageFile(file);
  if (validationError) {
    slotErrors.value[index] = validationError;
    event.target.value = "";
    return;
  }
  setPendingPhoto(index, file);
  event.target.value = "";
}

function validateImageFile(file) {
  const extension = (file.name.split(".").pop() || "").toLowerCase();
  const isMimeValid = ALLOWED_MIME_TYPES.includes((file.type || "").toLowerCase());
  const isExtensionValid = ALLOWED_EXTENSIONS.includes(extension);

  if (!isMimeValid || !isExtensionValid) {
    return "Formato no permitido. Usa PNG o JPG/JPEG.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "La imagen supera el limite de 3MB.";
  }

  return "";
}

function clearMessages(index) {
  slotErrors.value[index] = "";
  slotSuccess.value[index] = "";
  globalSuccessMessage.value = "";
}

function setPendingPhoto(index, file) {
  uploadingIndex.value = index;

  try {
    const previewUrl = URL.createObjectURL(file);
    const previous = photos.value[index];
    if (previous?.pending && previous.photo?.startsWith("blob:")) {
      URL.revokeObjectURL(previous.photo);
    }

    setPhoto(index, {
      photo: previewUrl,
      path: "",
      file,
      pending: true,
      taken_at: new Date().toISOString(),
    });
    slotSuccess.value[index] = "Foto lista. Se subira al guardar.";
    globalSuccessMessage.value = "Las fotos se subiran cuando guardes el cliente.";
  } catch {
    slotErrors.value[index] = "No se pudo preparar la foto. Intenta nuevamente.";
  } finally {
    uploadingIndex.value = null;
  }
}

// ===== Camera =====
const cameraOpen = ref(false);
const cameraIndex = ref(null);
const cameraError = ref("");
const videoEl = ref(null);
let activeStream = null;

async function openCamera(index) {
  clearMessages(index);
  cameraIndex.value = index;
  cameraOpen.value = true;
  cameraError.value = "";
  await nextTick();

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = "Tu navegador no soporta acceso a la cámara.";
    return;
  }

  try {
    activeStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    if (videoEl.value) {
      videoEl.value.srcObject = activeStream;
      await videoEl.value.play().catch(() => {});
    }
  } catch (err) {
    cameraError.value =
      err?.name === "NotAllowedError"
        ? "Permiso de cámara denegado. Habilítalo en el navegador."
        : "No se pudo acceder a la cámara: " + (err?.message || "error desconocido");
  }
}

function stopStream() {
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
  }
  if (videoEl.value) videoEl.value.srcObject = null;
}

function closeCamera() {
  stopStream();
  cameraOpen.value = false;
  cameraIndex.value = null;
  cameraError.value = "";
}

function capturePhoto() {
  if (!videoEl.value || cameraError.value) return;
  const v = videoEl.value;
  const canvas = document.createElement("canvas");
  const w = v.videoWidth || 640;
  const h = v.videoHeight || 480;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(v, 0, 0, w, h);
  canvas.toBlob(async (blob) => {
    if (!blob) {
      slotErrors.value[cameraIndex.value] = "No se pudo capturar la imagen.";
      return;
    }

    const file = new File([blob], `captura-${Date.now()}.jpg`, { type: "image/jpeg" });
    const index = cameraIndex.value;
    closeCamera();
    setPendingPhoto(index, file);
  }, "image/jpeg", 0.85);
}

onBeforeUnmount(() => {
  stopStream();
  photos.value.forEach((photo) => {
    if (photo?.pending && photo.photo?.startsWith("blob:")) {
      URL.revokeObjectURL(photo.photo);
    }
  });
});
</script>

<style scoped>
.photo-slot {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.photo-frame {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--color-surface-soft);
  border: 1px dashed var(--color-border-strong);
}
:global(.dark) .photo-frame {
  background: var(--color-overlay);
  border-color: rgba(255, 255, 255, 0.15);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-subtle);
}

.photo-tag {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: white;
  background: rgba(0, 0, 0, 0.55);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}

.photo-date {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}

.photo-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 9999px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.15s;
}
.photo-remove:hover {
  transform: scale(1.08);
}

.photo-actions {
  display: flex;
  gap: 0.4rem;
}

.photo-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.photo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.photo-btn-primary {
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  border-color: rgba(99, 102, 241, 0.25);
}
.photo-btn-primary:hover {
  background: rgba(99, 102, 241, 0.18);
}
:global(.dark) .photo-btn-primary {
  background: rgba(99, 102, 241, 0.18);
  color: #a5b4fc;
}

.photo-btn-secondary {
  background: var(--color-surface-soft);
  color: var(--color-text-muted);
  border-color: var(--color-border);
}
.photo-btn-secondary:hover {
  background: var(--color-overlay);
  color: var(--color-text);
}

.photo-btn-capture {
  background: #4f46e5;
  color: white;
  padding: 0.55rem 1.2rem;
  font-size: 0.85rem;
}
.photo-btn-capture:hover:not(:disabled) {
  background: #4338ca;
}
.photo-btn-capture:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-feedback {
  font-size: 0.72rem;
  line-height: 1.25;
  margin-top: 0.1rem;
}

.photo-feedback-info {
  color: var(--color-text-muted);
}

.photo-feedback-error {
  color: #b91c1c;
}

.photo-feedback-success {
  color: #166534;
}

.photo-global-success {
  margin-top: 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #166534;
}

/* ===== Camera overlay ===== */
.cam-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.cam-panel {
  width: 100%;
  max-width: 36rem;
  background: var(--modal-panel-bg);
  border: 1px solid var(--modal-panel-border);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.cam-close {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
}
.cam-close:hover {
  background: var(--color-overlay);
  color: var(--color-text);
}

.cam-body {
  position: relative;
  background: black;
  aspect-ratio: 4 / 3;
}

.cam-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.cam-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--color-surface);
  color: var(--color-text);
}

.cam-footer {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-soft);
}
.cam-footer .photo-btn {
  flex: 1;
}

.cam-fade-enter-active,
.cam-fade-leave-active {
  transition: opacity 0.2s ease;
}
.cam-fade-enter-from,
.cam-fade-leave-to {
  opacity: 0;
}
</style>
