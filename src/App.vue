<template>
  <div class="app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: "App",
};
</script>

<style lang="scss">
*,
*:before,
*:after {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.app {
  height: 100vh;
  background-image: url("../src/assets/space-stars.webp");
  background-position: center;
  background-size: cover;
}
</style>
