<template id="app">
  <router-view></router-view>
</template>

<style lang="scss">
  @import "~reset-css/_reset";

  $black: #414042;
  $white: #fff;

  html, body {
    height: 100%;
  }

  body {
    background: $white;
    color: $black;
    font-size: 14px;
  }

  body,
  input,
  button {
    font-family: 'Source Sans Pro', sans-serif;
  }
</style>
