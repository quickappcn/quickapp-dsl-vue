<template>
  <div>
    <part1 ref="ref1"/>
    <part2 ref="ref2"/>
  </div>
</template>
<script>
import part1 from './part1.vue'
import part2 from './part2.vue'
export default {
  data () {
    return {
      name: 'quickapp'
    }
  },
  components: {
    part1,
    part2
  }
}
</script>
<style>
  #app {
    color: #00ff00;
  }
</style>

