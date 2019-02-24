<template>
  <div>
    <div>
      <text value="Hello World" style="font-size: 100" ref="text1"></text>
    </div>
    <div>
      <text :value="x1" ref="text2"></text>
    </div>
    <div>
      <text :value="x2" ref="text3"></text>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      x1: 'Hello World',
      x2: 'Hello World'
    }
  },
  methods: {
    changeContent1() {
      this.x1 = 'Hello QuickApp'
    },
    changeContent2() {
      this.x2 = ''
    }
  }
}
</script>