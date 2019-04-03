<template>
  <div>
    <slot name="a"><p>fallback a</p></slot>
    <slot name="b">fallback b</slot>
  </div>
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
