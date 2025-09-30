import "./assets/main.css";

import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import ui from "@nuxt/ui/vue-plugin";
import App from "./App.vue";
import Board from "@/components/Board.vue";

const app = createApp(App);

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/", // root path
      name: "home",
      component: Board, // or App.vue if you want that as your main view
    },
  ],
});

app.use(router);
app.use(createPinia());
app.use(ui);

app.mount("#app");
