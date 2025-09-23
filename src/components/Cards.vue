<script setup>
import { reactive } from "vue";

// State
const cards = reactive([
  { id: 1, text: "Card A", x: 100, y: 100, width: 150, height: 100 },
  { id: 2, text: "Card B", x: 400, y: 200, width: 150, height: 100 },
]);

function addCard() {
  console.log("Add");
}
</script>

<template>
  <button class="add-card-button" @click="addCard">Add Card</button>
  <div v-for="card in cards" :key="card.id" :id="card.id">
    <TextCard :card="card" />
  </div>
</template>

<style>
.add-card-button {
  background-color: white;
  color: black;
  position: absolute;
  width: 100px;
  height: 50px;
  transform: translate(50px, 50px);
  border-radius: 5px;
}
</style>
