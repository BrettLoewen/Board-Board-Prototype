import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    cards: [],
    nextCardId: 0,
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

      // If you only wanted to import specific values
      // this.$patch((state) => {
      //   if (data.cards) state.cards = [...data.cards];
      //   if (data.nextCardId) state.nextCardId = data.nextCardId;
      // });
    },
    exportData() {
      return {
        cards: this.cards,
        nextCardId: this.nextCardId,
      };
    },
  },
});
