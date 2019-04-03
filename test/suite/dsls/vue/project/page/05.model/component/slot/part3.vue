<template>
  <div><slot name="test"></slot></div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'child message'
    }
  }
}
</script>
