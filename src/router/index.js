import { createRouter, createWebHistory } from "vue-router";
import login from "../views/Login.vue";
import chat from "../views/Chat.vue";
import video from "../views/Video.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/",
      name: "login",
      component: login,
    },
    {
      path: "/chat",
      name: "chat",
      component: chat,
    },
    {
      path: "/video",
      name: "video",
      component: video,
    },
  ],
});

export default router;
