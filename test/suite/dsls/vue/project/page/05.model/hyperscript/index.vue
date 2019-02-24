<template>
  <div>
    <div ref="node1"></div>
    <div ref="node2"></div>
    <div ref="node3"></div>
    <div ref="node4"></div>
  </div>
</template>

<script>
import part from './part.vue'

export default {
  methods: {
    renderNode(element, hyperText) {
      return new Vue({
        render(h) {
          return new Function(`h`, `return ${hyperText}`)(h)
        },
        el: this.$refs[element]
      })
    },
    renderPropsNode(element, optionsText) {
      const options = new Function(`return (${optionsText})`)()
      return new Vue(options).$mount(this.$refs[element])
    },
    renderForIfNode(element, optionsText) {
      const options = new Function(`return (${optionsText})`)()
      options.render = part.render
      return new Vue(options).$mount(this.$refs[element])
    }
  }
}
</script>
