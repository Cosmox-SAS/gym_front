<template>
  <Teleport to="body">
    <Transition name="zoom-fade">
      <div
        v-if="src"
        class="zoom-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="alt || 'Foto ampliada'"
        @keydown.esc="close"
      >
        <div class="zoom-toolbar">
          <span class="zoom-title">{{ alt }}</span>
          <div class="flex items-center gap-1.5">
            <button type="button" class="zoom-btn" aria-label="Alejar" :disabled="scale <= MIN_SCALE" @click="zoomBy(1 / STEP)">
              <ZoomOut class="w-5 h-5" aria-hidden="true" />
            </button>
            <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
            <button type="button" class="zoom-btn" aria-label="Acercar" :disabled="scale >= MAX_SCALE" @click="zoomBy(STEP)">
              <ZoomIn class="w-5 h-5" aria-hidden="true" />
            </button>
            <button type="button" class="zoom-btn" aria-label="Restablecer" @click="reset">
              <RotateCcw class="w-5 h-5" aria-hidden="true" />
            </button>
            <button ref="closeBtn" type="button" class="zoom-btn" aria-label="Cerrar" @click="close">
              <X class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref="stage"
          class="zoom-stage"
          :class="{ 'is-zoomed': scale > 1, 'is-dragging': dragging }"
          @wheel.prevent="onWheel"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @dblclick="toggleZoom"
          @click.self="scale === 1 && close()"
        >
          <img
            :src="src"
            :alt="alt"
            class="zoom-img"
            draggable="false"
            :style="{ transform: `translate(${x}px, ${y}px) scale(${scale})` }"
          />
        </div>

        <p class="zoom-hint">Pellizca, usa la rueda del mouse o toca dos veces para hacer zoom · arrastra para moverte</p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import { ZoomIn, ZoomOut, RotateCcw, X } from "lucide-vue-next";

const props = defineProps({
  // URL de la imagen a mostrar; cuando es vacía el visor está cerrado.
  src: { type: String, default: "" },
  alt: { type: String, default: "" },
});
const emit = defineEmits(["close"]);

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const STEP = 1.5;

const stage = ref(null);
const closeBtn = ref(null);
const scale = ref(1);
const x = ref(0);
const y = ref(0);
const dragging = ref(false);

// Punteros activos (mouse o dedos) para arrastrar y pellizcar.
const pointers = new Map();
let lastPan = null;
let lastPinchDistance = null;
let lastTapTime = 0;

function clampScale(value) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function reset() {
  scale.value = 1;
  x.value = 0;
  y.value = 0;
}

function close() {
  emit("close");
}

// Zoom manteniendo fijo el punto (cx, cy) relativo al centro del visor.
function zoomAt(factor, cx = 0, cy = 0) {
  const next = clampScale(scale.value * factor);
  const ratio = next / scale.value;
  x.value = cx - (cx - x.value) * ratio;
  y.value = cy - (cy - y.value) * ratio;
  scale.value = next;
  if (next === 1) reset();
}

function zoomBy(factor) {
  zoomAt(factor);
}

function pointFromEvent(event) {
  const rect = stage.value.getBoundingClientRect();
  return {
    cx: event.clientX - rect.left - rect.width / 2,
    cy: event.clientY - rect.top - rect.height / 2,
  };
}

function toggleZoom(event) {
  if (scale.value > 1) {
    reset();
  } else {
    const { cx, cy } = pointFromEvent(event);
    zoomAt(2.5, cx, cy);
  }
}

function onWheel(event) {
  const { cx, cy } = pointFromEvent(event);
  zoomAt(event.deltaY < 0 ? 1.15 : 1 / 1.15, cx, cy);
}

function pinchDistance() {
  const [a, b] = [...pointers.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function onPointerDown(event) {
  stage.value.setPointerCapture?.(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (pointers.size === 2) {
    lastPinchDistance = pinchDistance();
    lastPan = null;
  } else if (pointers.size === 1) {
    lastPan = { x: event.clientX, y: event.clientY };

    // Doble toque en pantallas táctiles (el dblclick no siempre llega en móviles).
    if (event.pointerType === "touch") {
      const now = Date.now();
      if (now - lastTapTime < 300) {
        toggleZoom(event);
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    }
  }
}

function onPointerMove(event) {
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (pointers.size === 2 && lastPinchDistance) {
    const distance = pinchDistance();
    const [a, b] = [...pointers.values()];
    const { cx, cy } = pointFromEvent({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
    zoomAt(distance / lastPinchDistance, cx, cy);
    lastPinchDistance = distance;
  } else if (pointers.size === 1 && lastPan && scale.value > 1) {
    dragging.value = true;
    x.value += event.clientX - lastPan.x;
    y.value += event.clientY - lastPan.y;
    lastPan = { x: event.clientX, y: event.clientY };
  }
}

function onPointerUp(event) {
  pointers.delete(event.pointerId);
  if (pointers.size < 2) lastPinchDistance = null;
  if (pointers.size === 1) {
    const [p] = [...pointers.values()];
    lastPan = { x: p.x, y: p.y };
  } else {
    lastPan = null;
    dragging.value = false;
  }
}

function onKeydown(event) {
  if (event.key === "Escape") close();
}

watch(
  () => props.src,
  async (src) => {
    reset();
    pointers.clear();
    if (src) {
      window.addEventListener("keydown", onKeydown);
      await nextTick();
      closeBtn.value?.focus();
    } else {
      window.removeEventListener("keydown", onKeydown);
    }
  },
);

onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
.zoom-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: rgba(2, 6, 23, 0.94);
}

.zoom-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #fff;
}

.zoom-title {
  font-size: 0.875rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zoom-level {
  min-width: 3.25rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

.zoom-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.15s;
}
.zoom-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}
.zoom-btn:disabled {
  opacity: 0.35;
}

.zoom-stage {
  position: relative;
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  cursor: zoom-in;
}
.zoom-stage.is-zoomed {
  cursor: grab;
}
.zoom-stage.is-dragging {
  cursor: grabbing;
}

.zoom-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  transform-origin: center center;
  transition: transform 0.08s ease-out;
}
.zoom-stage.is-dragging .zoom-img {
  transition: none;
}

.zoom-hint {
  padding: 0.6rem 1rem 1rem;
  text-align: center;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.55);
}

.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: opacity 0.2s ease;
}
.zoom-fade-enter-from,
.zoom-fade-leave-to {
  opacity: 0;
}
</style>
