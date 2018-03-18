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
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 14px;
  }
</style>
