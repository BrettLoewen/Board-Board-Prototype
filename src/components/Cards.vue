<script setup>
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/appStore";
import ShapeCard from "./ShapeCard.vue";

const emit = defineEmits(["cardsChanged"]);

const props = defineProps({
  growthPan: { type: Object, required: true },
  boardPos: { type: Object, required: true },
  boardScale: { type: Number, required: true },
});

const store = useAppStore();
const { cards, drawState } = storeToRefs(store);

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
      @card-changed="onCardChanged"
    />
    <ShapeCard
      v-if="card.type === 'shape'"
      :card="card"
      :board-pos="props.growthPan"
      :board-scale="props.boardScale"
      @card-changed="onCardChanged"
    />
  </div>
  <DrawCard :draw-state="drawState" />
</template>

<style></style>
