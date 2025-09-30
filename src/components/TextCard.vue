<script setup>
import { reactive, onMounted, useTemplateRef } from "vue";
import interact from "interactjs";
import { useAppStore } from "@/stores/appStore";

const emit = defineEmits(["cardChanged"]);

// Get the card data from the cards parent
const props = defineProps({
  card: { type: Object, required: true },
  boardPos: { type: Object, required: true },
  boardScale: { type: Number, required: true },
});

const store = useAppStore();
const card = props.card;
const offsetPos = reactive(props.boardPos);

// Get a reference to the card element for the interaction mapping.
// Cannot use ".card" because it was mapping to the wrong card.
const cardElement = useTemplateRef("card-element");

// Create the body of the card's context menu (right-click menu).
// Clicking the Delete option emits the deleteCard event so the parent can delete this card.
const cardContextMenuItems = [
  {
    label: "Delete",
    color: "error",
    icon: "i-lucide-trash",
    onSelect() {
      // emit("deleteCard", { id: card.id });
      store.deleteCard(card.id);
    },
  },
];

// Resize the card to fit text (prevent text from overflowing by making the card taller)
function autoResize(event) {
  // Get the card element that is the parent of this textarea element
  const el = event.target;
  if (!card) {
    console.log("No card found");
    return;
  }

  // Get the padding between the textarea and card and the card's border size to make the measurements accurate
  const style = window.getComputedStyle(el.parentElement);
  const padding = parseFloat(style.paddingTop) * 2;
  const borderWidth = parseFloat(style.borderTopWidth) * 2;

  // If the text has made the textarea too tall for the card
  if (el.scrollHeight > card.height - padding) {
    // Calculate the new height for the card using the scroll height, padding, and the border width.
    // The new height will be just enough to prevent the scroll bar from appearing.
    card.height = el.scrollHeight + padding + borderWidth;

    emit("cardChanged");
  }
}

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

          card.x += event.dx / props.boardScale;
          card.y += event.dy / props.boardScale;

          emit("cardChanged");
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

          card.width = event.rect.width / props.boardScale;
          card.height = event.rect.height / props.boardScale;
          card.x += event.deltaRect.left / props.boardScale;
          card.y += event.deltaRect.top / props.boardScale;

          emit("cardChanged");
        },
      },
    });
});
</script>

<template>
  <UContextMenu :items="cardContextMenuItems">
    <div
      class="card board-item"
      :style="{
        transform: `translate(${card.x - offsetPos.x}px, ${card.y - offsetPos.y}px)`,
        width: card.width + 'px',
        height: card.height + 'px',
      }"
      @input="autoResize"
      ref="card-element"
    >
      <textarea class="cardTextarea" placeholder="Type something..."></textarea>
    </div>
  </UContextMenu>
</template>

<style>
.card {
  display: flex;
  position: absolute;
  background: white;
  border: 3px solid white;
  padding: 8px;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.card:active {
  cursor: move;
}
.card:focus-within {
  border-color: var(--ui-color-primary-400);
}

.cardTextarea {
  flex: 1;
  border-radius: 5px;
  color: black;
  resize: none;
}
.cardTextarea:active {
  cursor: move;
}
.cardTextarea:focus {
  outline: none;
}
</style>
