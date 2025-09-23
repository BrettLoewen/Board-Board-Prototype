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
// Clicking the Delete option emits the deleteCard event so the parent can delete this card.
const cardContextMenuItems = [
  {
    label: "Delete",
    color: "error",
    icon: "i-lucide-trash",
    onSelect() {
      emit("deleteCard", { id: card.id });
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

  // Get the padding between the textarea and card to make the measurements accurate
  var padding = parseFloat(window.getComputedStyle(el.parentElement).paddingTop);

  // If the text has made the textarea too tall for the card
  if (el.scrollHeight > card.height - padding * 2) {
    // Calculate the new height for the card using the scroll height, padding, and an extra bit to prevent the scroll bar from appearing
    var newHeight = el.scrollHeight + padding * 2 + 2;

    card.height = newHeight;
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
      class="card"
      :style="{
        transform: `translate(${card.x}px, ${card.y}px)`,
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
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.card:active {
  cursor: grabbing;
}

.cardTextarea {
  flex: 1;
  border-radius: 5px;
  color: black;
  resize: none;
}
.cardTextarea:active {
  cursor: grabbing;
}
</style>
