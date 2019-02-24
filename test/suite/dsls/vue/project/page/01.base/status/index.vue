<template>
  <div>
    <part1 ref="vm1Id"></part1>
    <part1 ref="vm2Id" v-if="boolRender"></part1>
  </div>
</template>

<script>
  import part1 from './part1.vue'
  export default {
    data() {
      return {
        boolRender: false
      }
    },
    components: {
      part1
    },
    methods: {
      toggleRender () {
        this.boolRender = !this.boolRender
      }
    }
  }
</script>