<template>
  <div>
    <div>
      <text class="a b c" ref="text0">Hello World</text>
    </div>
    <div>
      <text :class="['a', x1]" ref="text1">Hello World</text>
    </div>
    <div>
      <text :class="arr" ref="text2">Hello World</text>
    </div>
    <div>
      <text :class="x2" ref="text3">Hello World</text>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      arr: ['a', 'b'],
      x1: 'b',
      x2: 'a c'
    }
  },
  methods: {
    changeClass1() {
      this.x1 = 'd'
    },
    changeClass2() {
      this.arr.push('c')
    },
    changeClass3() {
      this.x2 = ''
    }
  }
}
</script>