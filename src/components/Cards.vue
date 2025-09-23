<script setup>
import { reactive } from "vue";

// State
const cards = reactive([
  { id: 1, text: "Card A", x: 100, y: -100, width: 150, height: 100 },
  { id: 2, text: "Card B", x: 400, y: -200, width: 150, height: 100 },
]);
</script>

<template>
  <div v-for="card in cards" :key="card.id" :id="card.id">
    <TextCard :card="card" />
  </div>
</template>

<style></style>
