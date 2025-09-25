<template>
  <div
    ref="viewport"
    class="board-viewport"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @contextmenu.prevent
  >
    <div
      class="board-content"
      :style="contentStyle"
      ref="content"
      @pointerdown.stop
      :class="{ 'debug-outline': debug }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  defineProps,
  defineExpose,
} from "vue";

const props = defineProps({
  initialZoom: { type: Number, default: 1 },
  minZoom: { type: Number, default: 0.1 },
  maxZoom: { type: Number, default: 5 },
  startWidth: { type: Number, default: 2000 },
  startHeight: { type: Number, default: 1500 },
  maxBoardSize: { type: Number, default: 20000 },
  edgePadding: { type: Number, default: 300 },
  gridSize: { type: Number, default: 32 },
  fitToContents: { type: Boolean, default: true },
  // debug helper (temporary only)
  debug: { type: Boolean, default: false },
});

const viewport = ref(null);
const content = ref(null);

const state = reactive({
  pan: { x: 0, y: 0 },
  scale: props.initialZoom,
  boardW: props.startWidth,
  boardH: props.startHeight,
  isPanning: false,
  lastPointer: { x: 0, y: 0 },
});

const contentStyle = computed(() => ({
  width: `${state.boardW}px`,
  height: `${state.boardH}px`,
  transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.scale})`,
  transformOrigin: "0 0",
  "--grid-size": `${props.gridSize}px`,
}));

/* ---------- Robust bounds: use bounding rects (accounts for transforms) ---------- */
function computeItemsBounds() {
  if (!content.value) return null;
  const items = content.value.querySelectorAll(".board-item");
  if (!items.length) return null;

  const contentRect = content.value.getBoundingClientRect();
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  items.forEach((el) => {
    const elRect = el.getBoundingClientRect();
    // position relative to content top-left in **board** coordinates:
    const x = (elRect.left - contentRect.left) / state.scale;
    const y = (elRect.top - contentRect.top) / state.scale;
    const w = elRect.width / state.scale;
    const h = elRect.height / state.scale;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  });

  return { minX, minY, maxX, maxY };
}

/* ---------- Expand board only as needed (defensive) ---------- */
function expandBoardToIncludeItems() {
  const bounds = computeItemsBounds();
  if (!bounds) return;
  const pad = props.edgePadding;

  const leftNeeded = Math.floor(bounds.minX - pad);
  const topNeeded = Math.floor(bounds.minY - pad);
  const rightNeeded = Math.ceil(bounds.maxX + pad);
  const bottomNeeded = Math.ceil(bounds.maxY + pad);

  let newW = state.boardW;
  let newH = state.boardH;

  // Grow left (if items near/above left edge) by increasing width and shifting pan
  if (leftNeeded < 0) {
    const growLeft = Math.min(Math.abs(leftNeeded), props.maxBoardSize - newW);
    newW = Math.min(props.maxBoardSize, newW + growLeft);
    // shift pan so current viewport remains stable
    state.pan.x -= growLeft * state.scale;
  }

  // Grow top similarly
  if (topNeeded < 0) {
    const growTop = Math.min(Math.abs(topNeeded), props.maxBoardSize - newH);
    newH = Math.min(props.maxBoardSize, newH + growTop);
    state.pan.y -= growTop * state.scale;
  }

  // Ensure right/bottom are included
  newW = Math.max(newW, Math.min(rightNeeded, props.maxBoardSize));
  newH = Math.max(newH, Math.min(bottomNeeded, props.maxBoardSize));

  // Apply
  state.boardW = Math.min(newW, props.maxBoardSize);
  state.boardH = Math.min(newH, props.maxBoardSize);
}

/* ---------- Fit-to-contents that waits until children are measured ---------- */
function recalcBounds({ fit = false } = {}) {
  expandBoardToIncludeItems();

  if (fit) {
    const bounds = computeItemsBounds();
    if (!bounds) return;
    const vp = viewport.value.getBoundingClientRect();
    const contentBoxW = Math.max(1, bounds.maxX - bounds.minX);
    const contentBoxH = Math.max(1, bounds.maxY - bounds.minY);
    const scaleX = vp.width / contentBoxW;
    const scaleY = vp.height / contentBoxH;
    let targetScale = Math.min(scaleX, scaleY, 1);
    targetScale = Math.max(props.minZoom, Math.min(props.maxZoom, targetScale));
    console.log("Howdy");
    state.scale = targetScale;

    // center the bounding box in viewport
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    state.pan.x = vp.width / 2 - centerX * state.scale;
    state.pan.y = vp.height / 2 - centerY * state.scale;
  }
}

/* ---------- zoom around mouse ---------- */
function zoomAroundPoint(deltaScale, mouseClientX, mouseClientY) {
  const oldScale = state.scale;
  let newScale = oldScale * deltaScale;
  newScale = Math.max(props.minZoom, Math.min(props.maxZoom, newScale));
  if (newScale === oldScale) return;

  const vpRect = viewport.value.getBoundingClientRect();
  const mx = mouseClientX - vpRect.left;
  const my = mouseClientY - vpRect.top;

  const worldX = (mx - state.pan.x) / oldScale;
  const worldY = (my - state.pan.y) / oldScale;

  state.scale = newScale;
  state.pan.x = mx - worldX * newScale;
  state.pan.y = my - worldY * newScale;
}

/* ---------- Wheel (ctrl->zoom, shift->h-scroll, otherwise vertical pan) ---------- */
function onWheel(e) {
  if (!viewport.value) return;
  const isCtrl = e.ctrlKey || e.metaKey;
  if (isCtrl) {
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
    zoomAroundPoint(zoomFactor, e.clientX, e.clientY);
    return;
  }

  const factor = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 800 : 1;
  const dx = (e.shiftKey ? e.deltaY : 0) * -1 * factor;
  const dy = (e.shiftKey ? 0 : e.deltaY) * -1 * factor;
  state.pan.x += dx;
  state.pan.y += dy;
}

/* ---------- Middle-button panning ---------- */
function onMouseDown(e) {
  if (e.button !== 1) return;
  state.isPanning = true;
  state.lastPointer.x = e.clientX;
  state.lastPointer.y = e.clientY;
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  e.preventDefault();
}
function onMouseMove(e) {
  if (!state.isPanning) return;
  const dx = e.clientX - state.lastPointer.x;
  const dy = e.clientY - state.lastPointer.y;
  state.pan.x += dx;
  state.pan.y += dy;
  state.lastPointer.x = e.clientX;
  state.lastPointer.y = e.clientY;
}
function onMouseUp() {
  if (!state.isPanning) return;
  state.isPanning = false;
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
  expandBoardToIncludeItems();
}

/* ---------- Observers & mount ---------- */
let mo = null;
let ro = null;

onMounted(async () => {
  // Wait for slot children to render and paint before measuring
  await nextTick();
  await new Promise((r) => requestAnimationFrame(r));

  // expand and fit if desired
  recalcBounds({ fit: props.fitToContents });

  // observe structural changes & size changes
  mo = new MutationObserver(() => requestAnimationFrame(expandBoardToIncludeItems));
  if (content.value)
    mo.observe(content.value, { childList: true, subtree: true, attributes: true });

  ro = new ResizeObserver(() => requestAnimationFrame(expandBoardToIncludeItems));
  if (content.value) ro.observe(content.value);
});

onBeforeUnmount(() => {
  if (mo) mo.disconnect();
  if (ro) ro.disconnect();
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
});

defineExpose({
  recalcBounds,
  zoomTo(scale) {
    const clamped = Math.max(props.minZoom, Math.min(props.maxZoom, scale));
    state.scale = clamped;
  },
  panTo(x, y) {
    state.pan.x = x;
    state.pan.y = y;
  },
});
</script>

<style scoped>
.board-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f6f7f9;
  cursor: default;
  user-select: none;
  touch-action: none;
}

.board-content {
  position: absolute;
  left: 0;
  top: 0;
  background-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.12) 1px, transparent 1px);
  background-repeat: repeat;
  background-size: var(--grid-size, 32px) var(--grid-size, 32px);
}

/* debug outlines to make visualization easier while debugging */
.debug-outline {
  outline: 1px dashed rgba(128, 0, 0, 0.25);
}
.board-content ::v-deep .board-item {
  position: absolute;
}
</style>
