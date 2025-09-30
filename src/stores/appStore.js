import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    cards: [
      { id: 1, type: "text", x: 400, y: 300, width: 150, height: 150 },
      { id: 2, type: "text", x: 600, y: 400, width: 150, height: 150 },
    ],
    nextCardId: 3,
    drawState: "none", // "none" | "draw" | "erase"
    boardW: 1920,
    boardH: 919,
  }),
  actions: {
    addTextCard() {
      this.cards.push({
        id: this.nextCardId++,
        type: "text",
        x: (window.innerWidth - 150) / 2,
        y: (window.innerHeight - 150) / 2,
        width: 150,
        height: 150,
      });
    },
    addShapeCard() {
      this.cards.push({
        id: this.nextCardId++,
        type: "shape",
        shape: "circle",
        x: (window.innerWidth - 150) / 2,
        y: (window.innerHeight - 150) / 2,
        width: 150,
        height: 150,
      });
    },
    deleteCard(id) {
      this.cards = this.cards.filter((c) => c.id !== id);
    },
    toggleDraw() {
      this.drawState = this.drawState === "draw" ? "none" : "draw";
    },
    toggleErase() {
      this.drawState = this.drawState === "erase" ? "none" : "erase";
    },
    importData(data) {
      Object.assign(this.$state, data);
    },
    exportData() {
      return this.$state;
    },
  },
});
