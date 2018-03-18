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
</style>
