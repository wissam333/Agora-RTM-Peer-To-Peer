<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: "App",
};
</script>

<style>
*,
*:before,
*:after {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
#app {
  height: 100vh;
  background-image: url("../src/assets/background.webp");
  background-position: center;
  background-size: cover;
}
</style>
