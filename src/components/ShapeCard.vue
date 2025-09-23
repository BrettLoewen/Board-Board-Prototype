<script setup>
import { reactive, onMounted, useTemplateRef, defineEmits } from "vue";
import interact from "interactjs";

const emit = defineEmits(["deleteCard"]);

// Get the card data from the cards parent
const props = defineProps({ card: Object });

// Create a local copy of the data that can be modified
const card = reactive(props.card);

// Get a reference to the card element for the interaction mapping.
// Cannot use ".card" because it was mapping to the wrong card.
const cardElement = useTemplateRef("card-element");

// Create the body of the card's context menu (right-click menu).
// Clicking any shape option updates the card's shape value, causing it to render with the correct svg shape.
// Clicking the Delete option emits the deleteCard event so the parent can delete this card.
const cardContextMenuItems = [
  [
    {
      label: "Shape",
      children: [
        {
          label: "Circle",
          icon: "i-lucide-circle",
          onSelect() {
            card.shape = "circle";
          },
        },
        {
          label: "Triangle",
          icon: "i-lucide-triangle",
          onSelect() {
            card.shape = "triangle";
          },
        },
        {
          label: "Square",
          icon: "i-lucide-square",
          onSelect() {
            card.shape = "square";
          },
        },
      ],
    },
  ],
  [
    {
      label: "Delete",
      color: "error",
      icon: "i-lucide-trash",
      onSelect() {
        emit("deleteCard", { id: card.id });
      },
    },
  ],
];

// Setup interact.js to drag and resize the card
onMounted(() => {
  interact(cardElement.value)
    .draggable({
      listeners: {
        move(event) {
          if (!card) {
            console.log("No card found");
            return;
          }

          card.x += event.dx;
          card.y += event.dy;
        },
      },
      inertia: false,
    })
    .resizable({
      edges: { top: true, left: true, bottom: true, right: true },
      invert: "reposition",
      listeners: {
        move(event) {
          if (!card) {
            console.log("No card found");
            return;
          }

          card.width = event.rect.width;
          card.height = event.rect.height;
          card.x += event.deltaRect.left;
          card.y += event.deltaRect.top;
        },
      },
    });
});
</script>

<template>
  <UContextMenu :items="cardContextMenuItems">
    <div
      class="shape"
      :style="{
        transform: `translate(${card.x}px, ${card.y}px)`,
        width: card.width + 'px',
        height: card.height + 'px',
      }"
      ref="card-element"
      tabindex="0"
    >
      <!-- -3 offsets are to account for padding issues -->
      <svg
        :width="card.width + 'px'"
        :height="card.height + 'px'"
        :viewBox="card.x + ' ' + card.y + ' ' + card.width + ' ' + card.height"
      >
        <!-- Circle -->
        <ellipse
          v-if="card.shape === 'circle'"
          :cx="card.x + card.width / 2"
          :cy="card.y + card.height / 2 - 3"
          :rx="card.width / 2"
          :ry="card.height / 2"
          fill="var(--ui-color-primary-400)"
        />

        <!-- Triangle -->
        <polygon
          v-if="card.shape === 'triangle'"
          :points="
            /* Top-middle vertex */
            card.x +
            card.width / 2 +
            ',' +
            (card.y - 3) +
            ' ' +
            /* Bottom-right vertex */
            (card.x + card.width) +
            ',' +
            (card.y + card.height - 3) +
            ' ' +
            /* Bottom-left vertex */
            card.x +
            ',' +
            (card.y + card.height - 3)
          "
          fill="var(--ui-color-primary-400)"
        />

        <!-- Square -->
        <rect
          v-if="card.shape === 'square'"
          :x="card.x"
          :y="card.y - 3"
          :width="card.width"
          :height="card.height"
          fill="var(--ui-color-primary-400)"
        />
      </svg>
    </div>
  </UContextMenu>
</template>

<style>
.shape {
  display: flex;
  position: absolute;
  user-select: none;
  border: 3px solid rgba(0, 0, 0, 0);
}
.shape:focus-within {
  border: 3px solid var(--ui-color-primary-400);
  padding: 0px;
}
</style>
