<template>
  <div>
    <div @click="triggerEvent1" ref="div1">
      <text ref="text1">Hello {{x1}}</text>
    </div>
    <part @click="triggerEvent2" @click.native="triggerEvent3" :x2="x2" ref="sub1"></part>
  </div>
</template>

<script>
import part from './part.vue'
export default {
  data() {
    return {
      x1: 'World',
      x2: 'World'
    }
  },
  methods: {
    triggerEvent1() {
      this.x1 = 'QuickApp'
    },
    triggerEvent2() {
      this.x2 = 'QuickApp'
    },
    triggerEvent3() {
      this.x2 = 'Hap'
    }
  },
  components: {
    part
  }
}
</script>