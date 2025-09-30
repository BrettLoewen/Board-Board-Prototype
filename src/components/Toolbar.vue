<script setup>
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/appStore";

const store = useAppStore();
const { drawState } = storeToRefs(store);

// Add a new card to the array of cards.
// Add a text card.
function addTextCard() {
  store.addTextCard();
}
// Add a shape card.
function addShapeCard() {
  store.addShapeCard();
}

function startDraw() {
  store.toggleDraw();
}
function startErase() {
  store.toggleErase();
}
</script>

<template>
  <div class="cards-layout">
    <UButton class="cards-button" type="button" @click="addTextCard">Add Note</UButton>
    <UButton class="cards-button" type="button" :as="'button'" @click="addShapeCard"
      >Add Shape</UButton
    >
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
</template>

<style>
.cards-layout {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  left: 50px;
  top: 50px;
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
