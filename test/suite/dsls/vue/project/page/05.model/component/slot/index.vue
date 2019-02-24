<template>
  <div>
    <div ref="ref1">
      <part1></part1>
    </div>
    <div ref="ref2">
      <part2>
        <p>{{ msg }}</p>
      </part2>
    </div>
    <div ref="ref3">
      <part3>
        <p slot="test">{{ msg1 }}</p>
      </part3>
    </div>
    <div ref="ref4">
      <part4></part4>
    </div>
    <div ref="ref5">
      <part5>
        <p slot="b">slot b</p>
      </part5>
    </div>
  </div>
</template>

<script>
import part1 from './part1.vue'
import part2 from './part2.vue'
import part3 from './part3.vue'
import part4 from './part4.vue'
import part5 from './part5.vue'
export default {
  data() {
    return {
      msg: 'parent message',
      msg1: 'parent message'
    }
  },
  components: {
    part1,
    part2,
    part3,
    part4,
    part5
  }
}
</script>
