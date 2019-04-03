<template>
  <div><slot><p>{{msg}}</p></slot></div>
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
