<template>
  <div>
    <text ref="text2">Hello {{x2}}</text>
  </div>
</template>
<script>
export default {
  props: ['x2'],
  methods: {
    triggerEvent() {
      this.$emit('click')
    }
  }
}
</script>
