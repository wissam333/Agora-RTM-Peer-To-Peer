<template>
  <div class="login">
    <form>
      <h3>Login Here</h3>

      <label for="username">Username</label>
      <input
        type="text"
        placeholder="Your Name"
        id="username"
        maxlength="9"
        v-model="username"
      />

      <label for="peerNmae">Friend Name</label>
      <input
        type="text"
        placeholder="Friend Name"
        id="Friend"
        maxlength="9"
        v-model="FriendName"
      />

      <router-link
        to="/chat"
        @click="
          trimUsername();
          trimFriendName();
          changeName(username);
          changeFriendName(FriendName);
        "
      >
        <button>Log In</button>
      </router-link>
      <div class="me">Made by Wissam Najjom</div>
    </form>
  </div>
</template>
<script>
import { store } from "../stores/counter";
import { mapActions } from "pinia";
export default {
  name: "login",
  data: function () {
    return {
      username: "",
      FriendName: "",
    };
  },
  methods: {
    ...mapActions(store, ["changeName", "changeFriendName"]),
    trimUsername() {
      this.username = this.username.trim().toLocaleLowerCase();
    },
    trimFriendName() {
      this.FriendName = this.FriendName.trim().toLocaleLowerCase();
    },
  },
};
</script>
<style lang="scss" scoped>
form {
  width: 30%;
  @media (max-width: 768px) {
    width: 80%;
  }
  background-color: rgba(255, 255, 255, 0.03);
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  border-radius: 10px;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
  padding: 50px 35px;
  & * {
    font-family: "Poppins", sans-serif;
    color: #ffffff;
    letter-spacing: 0.5px;
    outline: none;
    border: none;
  }
  h3 {
    @media (max-width: 768px) {
      font-size: 8vw;
    }
    font-size: 4vw;
    font-weight: 700;
    text-align: center;
  }
  label {
    display: block;
    margin-top: 30px;
    font-size: 16px;
    font-weight: 500;
  }
  input {
    display: block;
    height: 50px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    padding: 0 10px;
    margin-top: 8px;
    font-size: 14px;
    font-weight: 300;
  }
  ::placeholder {
    color: #e1e1e1;
  }

  input:hover {
    outline: 2px solid #0001;
  }
  button {
    margin-top: 30px;
    width: 100%;
    background-color: transparent;
    border: 2px solid #fff;
    padding: 15px 0;
    font-size: 18px;
    font-weight: 600;
    transition: all 0.2s ease-in-out;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
      background-color: #ffffff;
      color: #080710;
    }
  }
  .me {
    font-size: 15px;
    text-align: center;
    margin-top: 40px;
  }
}
</style>
