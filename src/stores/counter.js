import { defineStore } from "pinia";

export const nameStore = defineStore({
  id: "name",
  state: () => ({
    name: "",
    friend: "",
  }),
  getters: {},
  actions: {
    changeName(name) {
      this.name = name;
    },
    changeFriendName(friend) {
      this.friend = friend;
    },
  },
});
