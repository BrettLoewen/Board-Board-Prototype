<script setup>
import { ref } from "vue";
import ShapeCard from "./ShapeCard.vue";

const emit = defineEmits(["cardsChanged"]);

const props = defineProps({
  growthPan: { type: Object },
  boardPos: { type: Object },
  boardScale: { type: Number },
});

// Expose the card control functions so the external toolbar can call them (in Board.vue)
defineExpose({
  addTextCard,
  addShapeCard,
  startDraw,
  startErase,
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

function onCardChanged() {
  emit("cardsChanged");
}
</script>

<template>
  <div v-for="card in cards" :key="card.id" :id="card.id">
    <TextCard
      v-if="card.type === 'text'"
      :card="card"
      :board-pos="props.growthPan"
      :board-scale="props.boardScale"
      @delete-card="deleteCard"
      @card-changed="onCardChanged"
    />
    <ShapeCard
      v-if="card.type === 'shape'"
      :card="card"
      :board-pos="props.growthPan"
      :board-scale="props.boardScale"
      @delete-card="deleteCard"
      @card-changed="onCardChanged"
    />
  </div>
  <DrawCard :draw-state="drawState" />
</template>

<style></style>
