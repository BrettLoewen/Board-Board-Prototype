<script setup>
import { reactive, ref, onMounted } from "vue";
import interact from "interactjs";

// State
const cards = reactive([
  { id: 1, text: "Card A", x: 100, y: 100, width: 150, height: 100 },
  { id: 2, text: "Card B", x: 400, y: 200, width: 150, height: 100 },
]);

// Canvas pan & zoom
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const lastPan = reactive({ x: 0, y: 0 });
const scale = ref(1);

function startPanning(e) {
  // Only pan if clicked on background
  if (e.target.classList.contains("board")) {
    isPanning.value = true;
    lastPan.x = e.clientX;
    lastPan.y = e.clientY;
  }
}

function pan(e) {
  if (!isPanning.value) return;
  panX.value += e.clientX - lastPan.x;
  panY.value += e.clientY - lastPan.y;
  lastPan.x = e.clientX;
  lastPan.y = e.clientY;
}

function stopPanning() {
  isPanning.value = false;
}

function zoom(e) {
  const zoomIntensity = 0.1;
  const wheel = e.deltaY < 0 ? 1 : -1;
  const zoomFactor = 1 + zoomIntensity * wheel;
  const prevScale = scale.value;

  scale.value = Math.min(Math.max(scale.value * zoomFactor, 0.2), 3);

  // Keep zoom centered on cursor
  const rect = e.currentTarget.getBoundingClientRect();
  const offsetX = e.clientX - rect.left - panX.value;
  const offsetY = e.clientY - rect.top - panY.value;

  panX.value -= offsetX * (scale.value / prevScale - 1);
  panY.value -= offsetY * (scale.value / prevScale - 1);
}

// Setup interact.js
onMounted(() => {
  interact(".draggable").draggable({
    listeners: {
      move(event) {
        const el = event.target;
        const card = cards.find((c) => el.textContent.includes(c.text));
        if (!card) return;

        card.x += event.dx / scale.value; // adjust for zoom
        card.y += event.dy / scale.value;
      },
    },
    inertia: true,
    modifiers: [
      interact.modifiers.snap({
        targets: [interact.snappers.grid({ x: 20, y: 20 })], // snap to 20px grid
        range: 20,
      }),
    ],
  });

  interact(".resizable")
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
    })
    .on("resizemove", (event) => {
      const el = event.target;
      const card = cards.find((c) => el.textContent.includes(c.text));
      if (!card) return;

      card.width = event.rect.width / scale.value;
      card.height = event.rect.height / scale.value;
      card.x += event.deltaRect.left / scale.value;
      card.y += event.deltaRect.top / scale.value;
    });
});
</script>

<template>
  <div
    class="board-wrapper"
    @mousedown="startPanning"
    @mousemove="pan"
    @mouseup="stopPanning"
    @mouseleave="stopPanning"
    @wheel.prevent="zoom"
  >
    <!-- Canvas -->
    <div
      class="board"
      :style="{
        transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
        transformOrigin: '0 0',
      }"
    >
      <!-- Cards -->
      <div
        v-for="card in cards"
        :key="card.id"
        class="card draggable resizable"
        :style="{
          transform: `translate(${card.x}px, ${card.y}px)`,
          width: card.width + 'px',
          height: card.height + 'px',
        }"
      >
        {{ card.text }}
      </div>
    </div>
  </div>
</template>

<style>
.board-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f0f0f0;
  cursor: grab;
}

.board {
  width: 5000px; /* "infinite" working area */
  height: 5000px;
  position: relative;
}

.card {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.card:active {
  cursor: grabbing;
}
</style>
