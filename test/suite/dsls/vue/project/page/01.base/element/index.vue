<template>
  <div test-key="testKey">
    <input type="text" ref="input">
    <video ref="video"></video>
    <part ref="subComp"></part>
    <div ref="pageComp">main</div>
  </div>
</template>

<script>
import part from './part.vue'
export default {
  data() {
    return {

    }
  },
  mounted() {
    this.inputRefs = this.$refs.input
    this.videoRefs = this.$refs.video
  },
  components: {
    part
  }
}
</script>
