<script setup>
import { reactive, computed, useTemplateRef, onMounted, nextTick } from "vue";

const props = defineProps({
  initialZoom: { type: Number, default: 1 },
  // minZoom: { type: Number, default: 0.1 },
  // maxZoom: { type: Number, default: 5 },
  startWidth: { type: Number, default: 1920 },
  startHeight: { type: Number, default: 919 },
  maxBoardSize: { type: Number, default: 20000 },
  edgePadding: { type: Number, default: 300 },
  gridSize: { type: Number, default: 32 },
  // fitToContents: { type: Boolean, default: true },
  // debug helper (temporary only)
  debug: { type: Boolean, default: false },
});

const viewport = useTemplateRef("viewport");
const content = useTemplateRef("content");

const state = reactive({
  pan: { x: 0, y: 0 },
  scale: props.initialZoom,
  boardW: props.startWidth,
  boardH: props.startHeight,
  isPanning: false,
  lastPointer: { x: 0, y: 0 },
});

// const contentStyle = computed(() => ({
//   width: `${state.boardW}px`,
//   height: `${state.boardH}px`,
//   transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.scale})`,
//   transformOrigin: "0 0",
//   "--grid-size": `${props.gridSize}px`,
// }));

function getTransformTranslate(el) {
  const s = window.getComputedStyle(el);
  const t = s.transform;
  if (!t || t === "none") return { tx: 0, ty: 0 };
  // matrix(a, b, c, d, tx, ty)
  const m = t.match(/matrix\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((p) => parseFloat(p));
    return { tx: parts[4] || 0, ty: parts[5] || 0 };
  }
  // matrix3d(...) -> tx is parts[12], ty parts[13]
  const m3 = t.match(/matrix3d\(([^)]+)\)/);
  if (m3) {
    const parts = m3[1].split(",").map((p) => parseFloat(p));
    return { tx: parts[12] || 0, ty: parts[13] || 0 };
  }
  return { tx: 0, ty: 0 };
}

// Calculate the top left and bottom right xy coordinates that will include every element with the board-item class
function computeItemsBounds() {
  if (!content.value) return null;
  const items = content.value.querySelectorAll(".board-item");
  if (!items.length) return null;

  // console.log(items);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  items.forEach((el) => {
    // Prefer explicit left/top if available (absolute positioned children)
    // const cs = window.getComputedStyle(el);
    // const posLeft = parseFloat(cs.left);
    // const posTop = parseFloat(cs.top);
    // console.log(cs);

    // let x, y;
    // if (!Number.isNaN(posLeft) && !Number.isNaN(posTop)) {
    //   // left/top are usually in board coordinates (style on the element)
    //   x = posLeft;
    //   y = posTop;
    // } else {
    //   // fallback: use offsetLeft/offsetTop plus any transform translate
    //   // const { tx, ty } = getTransformTranslate(el);
    //   // x = el.offsetLeft + tx;
    //   // y = el.offsetTop + ty;
    //   console.log("NaN");
    // }

    const { tx, ty } = getTransformTranslate(el);
    const x = el.offsetLeft + tx;
    const y = el.offsetTop + ty;

    const w = el.offsetWidth;
    const h = el.offsetHeight;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  });

  return { minX, minY, maxX, maxY };
}

function expandBoardToIncludeItems() {
  const bounds = computeItemsBounds();
  if (!bounds) return;
  const padding = props.edgePadding;

  // compute required min width/height to include bounds with padding
  const neededLeft = Math.min(0, Math.floor(bounds.minX - padding));
  const neededTop = Math.min(0, Math.floor(bounds.minY - padding));
  const neededRight = Math.ceil(bounds.maxX + padding);
  const neededBottom = Math.ceil(bounds.maxY + padding);

  let newW = Math.max(state.boardW, neededRight);
  let newH = Math.max(state.boardH, neededBottom);
  // If items went negative (left/top < 0) we need to shift them right/down by increasing pan or expanding and keeping origin.
  // Simpler approach: if minX < padding negative area, expand board and shift pan so items remain visible.
  if (neededLeft < 0) {
    // how much we need to expand left
    const growLeft = Math.min(Math.abs(neededLeft), props.maxBoardSize - state.boardW);
    newW = Math.min(props.maxBoardSize, state.boardW + growLeft);
    // shift pan so content appears moved right by growLeft
    state.pan.x -= growLeft * state.scale;
  }
  if (neededTop < 0) {
    const growTop = Math.min(Math.abs(neededTop), props.maxBoardSize - state.boardH);
    newH = Math.min(props.maxBoardSize, state.boardH + growTop);
    state.pan.y -= growTop * state.scale;
  }

  // clamp to maxBoardSize
  newW = Math.min(newW, props.maxBoardSize);
  newH = Math.min(newH, props.maxBoardSize);

  // apply new dimensions
  state.boardW = newW;
  state.boardH = newH;

  console.log(state);
}

function onWheel(e) {
  // if (!viewport.value) return;
  // const isCtrl = e.ctrlKey || e.metaKey;
  // if (isCtrl) {
  //   const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
  //   zoomAroundPoint(zoomFactor, e.clientX, e.clientY);
  //   return;
  // }
  // const factor = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 800 : 1;
  // const dx = (e.shiftKey ? e.deltaY : 0) * -1 * factor;
  // const dy = (e.shiftKey ? 0 : e.deltaY) * -1 * factor;
  // state.pan.x += dx;
  // state.pan.y += dy;
}

function onMouseDown(e) {
  // if (e.button !== 1) return;
  // state.isPanning = true;
  // state.lastPointer.x = e.clientX;
  // state.lastPointer.y = e.clientY;
  // window.addEventListener("mousemove", onMouseMove);
  // window.addEventListener("mouseup", onMouseUp);
  // e.preventDefault();
}
function onMouseMove(e) {
  // if (!state.isPanning) return;
  // const dx = e.clientX - state.lastPointer.x;
  // const dy = e.clientY - state.lastPointer.y;
  // state.pan.x += dx;
  // state.pan.y += dy;
  // state.lastPointer.x = e.clientX;
  // state.lastPointer.y = e.clientY;
}
function onMouseUp() {
  // if (!state.isPanning) return;
  // state.isPanning = false;
  // window.removeEventListener("mousemove", onMouseMove);
  // window.removeEventListener("mouseup", onMouseUp);
  // expandBoardToIncludeItems();
}

onMounted(async () => {
  console.log(computeItemsBounds());

  await nextTick();
  expandBoardToIncludeItems();
});
</script>

<template>
  <div
    ref="viewport"
    class="board-viewport"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @contextmenu.prevent
  >
    <div
      ref="content"
      class="board-content"
      :class="{ 'debug-outline': debug }"
      :style="{
        width: `${state.boardW}px`,
        height: `${state.boardH}px`,
        transform: `scale(${state.scale}) translate(${state.pan.x}px, ${state.pan.y}px)`,
        transformOrigin: '0 0',
        '--grid-size': `${props.gridSize}px`,
      }"
    >
      <!-- <slot /> -->
      <Cards :board-pos="state.pan" />
    </div>
  </div>
</template>

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
  width: 100%;
  height: 100%;
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
</style>
