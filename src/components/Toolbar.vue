<script setup>
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/appStore";
import { useJsonFile } from "@/composables/useJsonFile";

const emit = defineEmits(["importedData"]);

const store = useAppStore();
const { drawState } = storeToRefs(store);
const { exportJson, importJson } = useJsonFile();

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

function handleExport() {
  exportJson(store.exportData());
}

function handleImport() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = async (event) => {
    const data = await importJson(event);
    if (data) {
      // Pass raw JSON directly to the store
      store.importData(data);
      emit("importedData");
    }
  };
  input.click();
}
</script>

<template>
  <div class="cards-layout">
    <UButton class="cards-button text-centered" type="button" @click="addTextCard"
      >Add Note</UButton
    >
    <UButton class="cards-button text-centered" type="button" @click="addShapeCard"
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
    <div class="file-buttons-layout">
      <UButton class="cards-button top text-centered" type="button" @click="handleExport"
        >Export</UButton
      ><UButton class="cards-button bottom text-centered" type="button" @click="handleImport"
        >Import</UButton
      >
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

.text-centered {
  justify-content: center;
  color: var(--ui-text-inverted);
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

.file-buttons-layout {
  display: flex;
  flex-direction: column;
}
.top {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom: 1px solid black;
}
.bottom {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}
</style>
