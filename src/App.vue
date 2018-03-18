<template id="app">
  <PatternMaker/>
</template>

<script>
import PatternMaker from './components/PatternMaker'

export default {
  name: 'App',
  components: {
    PatternMaker
  }
}
</script>

<style lang="scss">
  @import "~reset-css/_reset";

  html, body {
    height: 100%;
  }

  body {
    background: #fff;
    color: #000;
    font-size: 14px;
  }

  body,
  input,
  button {
    font-family: 'Source Sans Pro', sans-serif;
  }
</style>
