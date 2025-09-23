<script setup>
import { reactive } from "vue";

// Stateful array of card objects that define the starting state of the app
const cards = reactive([
  { id: 1, x: 100, y: 100, width: 150, height: 100 },
  { id: 2, x: 400, y: 200, width: 150, height: 100 },
]);

// A default object used to define new cards that are added to the app
const newCard = { width: 150, height: 100 };

// Add a new card to the array of cards
function addCard() {
  cards.push({
    id: cards.length + 1,
    x: (window.innerWidth - newCard.width) / 2,
    y: (window.innerHeight - newCard.height) / 2,
    ...newCard,
  });
}
</script>

<template>
  <div v-for="card in cards" :key="card.id" :id="card.id">
    <TextCard :card="card" />
  </div>
  <UButton class="add-card-button" type="button" @click="addCard">Add Card</UButton>
</template>

<style>
.add-card-button {
  position: absolute;
  transform: translate(50px, 50px);
}
.add-card-button:hover {
  cursor: pointer;
}
.add-card-button:active {
  background: var(--ui-color-primary-900);
}
</style>
