<template>
  <div><slot></slot></div>
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
