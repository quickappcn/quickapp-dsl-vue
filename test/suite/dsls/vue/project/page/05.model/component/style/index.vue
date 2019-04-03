<template>
  <div>
    <div>
      <text style="font-size: 100" ref="text1">Hello World</text>
    </div>
    <div>
      <text :style="[x1, y1]" ref="text2">Hello {{z1}}</text>
    </div>
    <div>
      <text :style="{ fontSize: x2, color: '#00ff00' }" ref="text3">Hello</text>
      <text :style="y2" ref="text4">{{z2}}</text>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      x1: { fontSize: 100, color: '#00ff00' },
      y1: { color: '#ff0000', fontWeight: 'bold' },
      z1: 'World',
      x2: 100,
      y2: { color: '#ff0000', fontWeight: 'bold' },
      z2: 'World'
    }
  },
  methods: {
    changeStyle1() {
      this.x1.fontSize = 200
      this.x1.color = '#0000ff'
      Vue.delete(this.y1, 'fontWeight')
      this.z1 = 'QuickApp'
    },
    changeStyle2() {
      this.x2 = 200
      this.y2.color = '#0000ff'
      Vue.delete(this.y2, 'fontWeight')
      this.z2 = 'QuickApp'
    }
  }
}
</script>