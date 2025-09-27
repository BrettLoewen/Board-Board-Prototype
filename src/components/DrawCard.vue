<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, useTemplateRef } from "vue";

const props = defineProps(["drawState"]);

const canvas = useTemplateRef("canvas");
const ctx = ref(null);
const drawing = ref(false);

// Array of strokes, each stroke is { mode, color, size, points:[{x,y}] }
const strokes = reactive([]);

// Drawing settings
const strokeColor = ref("");
const strokeWidth = 8;
const eraseScale = 10;

onMounted(async () => {
  ctx.value = canvas.value.getContext("2d");

  strokeColor.value = getComputedStyle(document.documentElement)
    .getPropertyValue("--ui-color-primary-400")
    .trim();

  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCanvas);
});

function resizeCanvas() {
  const c = canvas.value;
  if (!c) return;

  // Get the displayed size of the canvas
  const rect = c.getBoundingClientRect();

  // Only resize if it actually changed to avoid unnecessary clears
  if (c.width !== rect.width || c.height !== rect.height) {
    c.width = rect.width;
    c.height = rect.height;
    redraw(); // re-paint all strokes at the new resolution
  }
}

function startDrawing(e) {
  if (props.drawState === "none") {
    return;
  }

  drawing.value = true;
  const { x, y } = getMousePos(e);
  strokes.push({
    mode: props.drawState,
    color: strokeColor,
    size: strokeWidth,
    points: [{ x, y }],
  });
}

function draw(e) {
  if (!drawing.value) return;
  const { x, y } = getMousePos(e);
  const stroke = strokes[strokes.length - 1];
  stroke.points.push({ x, y });
  redraw();
}

function stopDrawing() {
  drawing.value = false;
}

function getMousePos(e) {
  const rect = canvas.value.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function redraw() {
  const c = canvas.value;
  const context = ctx.value;
  context.clearRect(0, 0, c.width, c.height);
  strokes.forEach((stroke) => {
    context.lineJoin = "round";
    context.lineCap = "round";

    if (stroke.mode === "erase") {
      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "rgba(0,0,0,1)";
      context.lineWidth = stroke.size * eraseScale;
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.size;
    }

    context.beginPath();
    stroke.points.forEach((p, i) => {
      if (i === 0) context.moveTo(p.x, p.y);
      else context.lineTo(p.x, p.y);
    });
    context.stroke();
  });
}
</script>

<template>
  <canvas
    ref="canvas"
    class="drawing-canvas"
    :class="{ 'drawing-canvas-cursor': props.drawState !== 'none' }"
    @mousedown="startDrawing"
    @mousemove="draw"
    @mouseup="stopDrawing"
    @mouseleave="stopDrawing"
  ></canvas>
</template>

<style>
.drawing-canvas {
  width: 100%;
  height: 100%;
}
.drawing-canvas-cursor {
  cursor: crosshair;
}
</style>
