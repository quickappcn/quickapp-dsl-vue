<template>
  <div>
    <div ref="text">{{count}}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mountCount: 0,
      destoryCount: 0,
      count: 0
    }
  },
  mounted() {
    this.mountCount++
  },
  beforeDestroy() {
    this.destoryCount++
    this.reset()
  },
  methods: {
    reset() {
      this.mountCount = 0
    },
    start() {
      this.count++
    }
  }
}
</script>
