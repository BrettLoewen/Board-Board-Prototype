<script setup>
import { ref } from "vue";
import ShapeCard from "./ShapeCard.vue";

const props = defineProps({
  boardPos: { type: Object },
});

// Stateful array of card objects that define the starting state of the app
const cards = ref([
  { id: 1, type: "text", x: 400, y: 300, width: 150, height: 150 },
  { id: 2, type: "text", x: 600, y: 400, width: 150, height: 150 },
]);
let cardIdCounter = cards.value.length;

// A default object used to define new cards that are added to the app
const newCard = { width: 150, height: 150 };

// Add a new card to the array of cards.
// Add a text card.
function addTextCard() {
  cards.value.push({
    id: ++cardIdCounter,
    type: "text",
    x: (window.innerWidth - newCard.width) / 2,
    y: (window.innerHeight - newCard.height) / 2,
    ...newCard,
  });
}
// Add a shape card.
function addShapeCard() {
  cards.value.push({
    id: ++cardIdCounter,
    type: "shape",
    shape: "circle",
    x: (window.innerWidth - newCard.width) / 2,
    y: (window.innerHeight - newCard.height) / 2,
    ...newCard,
  });
}

// Delete the card whose id matches the passed id
function deleteCard(data) {
  cards.value = cards.value.filter((card) => card.id != data.id);
}

const drawState = ref("none"); // "none", "draw", or "erase"

function startDraw() {
  if (drawState.value === "draw") {
    drawState.value = "none";
  } else {
    drawState.value = "draw";
  }
}
function startErase() {
  if (drawState.value === "erase") {
    drawState.value = "none";
  } else {
    drawState.value = "erase";
  }
}
</script>

<template>
  <div v-for="card in cards" :key="card.id" :id="card.id">
    <TextCard
      v-if="card.type === 'text'"
      :card="card"
      @delete-card="deleteCard"
      :board-pos="props.boardPos"
    />
    <ShapeCard
      v-if="card.type === 'shape'"
      :card="card"
      @delete-card="deleteCard"
      :board-pos="props.boardPos"
    />
  </div>
  <div
    class="cards-layout"
    :style="{ transform: `translate(${50 - boardPos.x}px, ${50 - boardPos.y}px)` }"
  >
    <UButton class="cards-button" type="button" @click="addTextCard">Add Note</UButton>
    <UButton class="cards-button" type="button" @click="addShapeCard">Add Shape</UButton>
    <div class="draw-state-layout">
      <UButton
        class="cards-button draw-state-button left"
        type="button"
        @click="startDraw"
        icon="i-lucide-pencil"
        :variant="drawState === 'draw' ? 'soft' : 'solid'"
      />
      <UButton
        class="cards-button draw-state-button right"
        type="button"
        @click="startErase"
        icon="i-lucide-eraser"
        :variant="drawState === 'erase' ? 'soft' : 'solid'"
      />
    </div>
  </div>
  <DrawCard :draw-state="drawState" />
</template>

<style>
.cards-layout {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cards-button:hover {
  cursor: pointer;
}
.cards-button:active {
  background: var(--ui-color-primary-900);
}

.draw-state-layout {
  display: flex;
  flex-direction: row;
}
.draw-state-button {
  width: 50%;
  justify-content: center;
}
.left {
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-right: 1px solid black;
}
.right {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
}
</style>
