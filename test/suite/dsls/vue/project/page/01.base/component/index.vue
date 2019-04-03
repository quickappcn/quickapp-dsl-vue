<template>
  <div>
    <part1 ref="vm1Id"></part1>
    <part2 ref="vm2Id" v-if="renderPart2" :obj="person"></part2>
  </div>
</template>

<script>
  import part1 from './part1.vue'
  import part2 from './part2.vue'
  export default {
    data() {
      return {
        renderPart2: true,
        person: {
          name: 'jack'
        }
      }
    },
    components: {
      part1,
      part2
    }
  }
</script>